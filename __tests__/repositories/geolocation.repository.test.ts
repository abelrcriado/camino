import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GeolocationRepository } from '@/repositories/geolocation.repository';
import { SupabaseClient } from '@supabase/supabase-js';
import { generateUUID } from "../helpers/factories";

type MockedFunction = ReturnType<typeof jest.fn>;

// Mock Supabase client
const mockSupabase = {
  rpc: jest.fn() as MockedFunction,
  from: jest.fn() as MockedFunction,
} as unknown as SupabaseClient;

describe('GeolocationRepository', () => {
  let repository: GeolocationRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new GeolocationRepository(mockSupabase);
  });

  describe('findNearby', () => {
    it('should find CSPs within a radius', async () => {
      const mockData = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'CSP Santiago',
          type: 'workshop',
          latitude: 42.8782,
          longitude: -8.5448,
          status: 'online',
          distance_km: 1.5,
        },
      ];

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await repository.findNearby({
        latitude: 42.8782,
        longitude: -8.5448,
        radiusKm: 10,
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('find_nearby_csps', {
        lat: 42.8782,
        lng: -8.5448,
        radius_km: 10,
        service_type: null,
        active_only: null,
        max_results: 50,
      });
      expect(result).toEqual(mockData);
    });

    it('should filter by service type and active status', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      await repository.findNearby({
        latitude: 42.8782,
        longitude: -8.5448,
        radiusKm: 10,
        serviceType: 'workshop',
        isActive: true,
        limit: 20,
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('find_nearby_csps', {
        lat: 42.8782,
        lng: -8.5448,
        radius_km: 10,
        service_type: 'workshop',
        active_only: true,
        max_results: 20,
      });
    });

    it('should throw error on database failure', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(
        repository.findNearby({
          latitude: 42.8782,
          longitude: -8.5448,
          radiusKm: 10,
        })
      ).rejects.toThrow('Failed to find nearby CSPs: Database error');
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: 5.2,
        error: null,
      });

      const result = await repository.calculateDistance(
        { latitude: 42.8782, longitude: -8.5448 },
        { latitude: 42.8800, longitude: -8.5500 }
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith('calculate_distance', {
        lat1: 42.8782,
        lng1: -8.5448,
        lat2: 42.8800,
        lng2: -8.5500,
      });
      expect(result).toBe(5.2);
    });

    it('should throw error on calculation failure', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Calculation error' },
      });

      await expect(
        repository.calculateDistance(
          { latitude: 42.8782, longitude: -8.5448 },
          { latitude: 42.8800, longitude: -8.5500 }
        )
      ).rejects.toThrow('Failed to calculate distance: Calculation error');
    });
  });

  describe('findAlongRoute', () => {
    it('should find CSPs along a route', async () => {
      const mockData = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'CSP on Route',
          type: 'workshop',
          latitude: 42.8782,
          longitude: -8.5448,
          status: 'online',
          distance_from_route: 0.5,
          nearest_point_lat: 42.8780,
          nearest_point_lng: -8.5450,
        },
      ];

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const routePoints = [
        { latitude: 42.8782, longitude: -8.5448, order: 0 },
        { latitude: 42.8800, longitude: -8.5500, order: 1 },
        { latitude: 42.8820, longitude: -8.5550, order: 2 },
      ];

      const result = await repository.findAlongRoute(routePoints, 2);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('find_csps_along_route', {
        route_linestring: 'LINESTRING(-8.5448 42.8782,-8.55 42.88,-8.555 42.882)',
        max_distance_km: 2,
        max_results: 50,
      });
      expect(result).toEqual(mockData);
    });

    it('should throw error on route query failure', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Route error' },
      });

      const routePoints = [
        { latitude: 42.8782, longitude: -8.5448, order: 0 },
        { latitude: 42.8800, longitude: -8.5500, order: 1 },
      ];

      await expect(
        repository.findAlongRoute(routePoints, 2)
      ).rejects.toThrow('Failed to find CSPs along route: Route error');
    });
  });

  describe('getDistanceToCSP', () => {
    it('should get distance from CSP to target point', async () => {
      const mockFrom = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { latitude: 42.8782, longitude: -8.5448 },
        error: null,
      });

      (mockSupabase.from as jest.Mock) = mockFrom;
      mockFrom.mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        single: mockSingle,
      });

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: 3.5,
        error: null,
      });

      const result = await repository.getDistanceToCSP(
        '123e4567-e89b-12d3-a456-426614174000',
        { latitude: 42.8800, longitude: -8.5500 }
      );

      expect(result).toBe(3.5);
    });

    it('should throw error when CSP not found', async () => {
      const mockFrom = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      (mockSupabase.from as jest.Mock) = mockFrom;
      mockFrom.mockReturnValue({
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        eq: mockEq,
      });
      mockEq.mockReturnValue({
        single: mockSingle,
      });

      await expect(
        repository.getDistanceToCSP(
          '123e4567-e89b-12d3-a456-426614174000',
          { latitude: 42.8800, longitude: -8.5500 }
        )
      ).rejects.toThrow('CSP not found: 123e4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('findNearest', () => {
    it('should find the nearest CSP', async () => {
      const mockData = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Nearest CSP',
          type: 'workshop',
          latitude: 42.8782,
          longitude: -8.5448,
          status: 'online',
          distance_km: 0.5,
        },
      ];

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await repository.findNearest(42.8782, -8.5448);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('find_nearby_csps', {
        lat: 42.8782,
        lng: -8.5448,
        radius_km: 100,
        service_type: null,
        active_only: true,
        max_results: 1,
      });
      expect(result).toEqual(mockData[0]);
    });

    it('should return null when no CSP found', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findNearest(42.8782, -8.5448);

      expect(result).toBeNull();
    });
  });

  describe('findInBoundingBox', () => {
    it('should find CSPs within a bounding box', async () => {
      const mockData = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'CSP in Box',
          type: 'workshop',
          latitude: 42.8782,
          longitude: -8.5448,
          status: 'online',
        },
      ];

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await repository.findInBoundingBox(
        { latitude: 43.0, longitude: -8.0 },
        { latitude: 42.0, longitude: -9.0 }
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith('find_csps_in_bbox', {
        ne_lat: 43.0,
        ne_lng: -8.0,
        sw_lat: 42.0,
        sw_lng: -9.0,
        max_results: 100,
      });
      expect(result).toEqual(mockData);
    });

    it('should throw error on bbox query failure', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'BBox error' },
      });

      await expect(
        repository.findInBoundingBox(
          { latitude: 43.0, longitude: -8.0 },
          { latitude: 42.0, longitude: -9.0 }
        )
      ).rejects.toThrow('Failed to find CSPs in bounding box: BBox error');
    });
  });
});
