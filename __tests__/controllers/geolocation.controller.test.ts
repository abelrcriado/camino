import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GeolocationController } from '@/api/controllers/geolocation.controller';
import { GeolocationService } from '@/api/services/geolocation.service';
import type { NextApiRequest, NextApiResponse } from 'next';

// Mock service
const mockService = {
  findNearby: jest.fn(),
  calculateDistance: jest.fn(),
  findAlongRoute: jest.fn(),
  getDistanceToCSP: jest.fn(),
  findNearest: jest.fn(),
  findInBoundingBox: jest.fn(),
} as unknown as GeolocationService;

// Helper to create mock request/response
function createMockRequestResponse(
  method: string,
  query: Record<string, unknown> = {},
  body: Record<string, unknown> = {}
) {
  const req = {
    method,
    query,
    body,
  } as NextApiRequest;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  } as unknown as NextApiResponse;

  return { req, res };
}

describe('GeolocationController', () => {
  let controller: GeolocationController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new GeolocationController(mockService);
  });

  describe('getNearby', () => {
    it('should return nearby CSPs successfully', async () => {
      const mockCSPs = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'CSP Santiago',
          type: 'workshop',
          latitude: 42.8782,
          longitude: -8.5448,
          city: 'Santiago',
          country: 'Spain',
          status: 'online' as const,
          distance_km: 1.5,
        },
      ];

      (mockService.findNearby as jest.Mock<typeof mockService.findNearby>).mockResolvedValue(mockCSPs);

      const { req, res } = createMockRequestResponse('GET', {
        lat: '42.8782',
        lng: '-8.5448',
        radius: '10',
      });

      await controller.getNearby(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCSPs,
        count: 1,
        params: {
          center: { lat: 42.8782, lng: -8.5448 },
          radiusKm: 10,
        },
      });
    });

    it('should use default radius and limit', async () => {
      (mockService.findNearby as jest.Mock<typeof mockService.findNearby>).mockResolvedValue([]);

      const { req, res } = createMockRequestResponse('GET', {
        lat: '42.8782',
        lng: '-8.5448',
      });

      await controller.getNearby(req, res);

      expect(mockService.findNearby).toHaveBeenCalledWith({
        latitude: 42.8782,
        longitude: -8.5448,
        radiusKm: expect.any(Number),
        serviceType: undefined,
        isActive: undefined,
        limit: expect.any(Number),
      });
    });

    it('should return 400 for invalid query parameters', async () => {
      const { req, res } = createMockRequestResponse('GET', {
        // Missing required lat parameter
        lng: '-8.5448',
      });

      await controller.getNearby(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    it('should return 400 for service validation error', async () => {
      (mockService.findNearby as jest.Mock<typeof mockService.findNearby>).mockRejectedValue(
        new Error('Invalid coordinates')
      );

      const { req, res } = createMockRequestResponse('GET', {
        lat: '42.8782',
        lng: '-8.5448',
      });

      await controller.getNearby(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid coordinates',
      });
    });
  });

  describe('getDistance', () => {
    it('should calculate distance successfully', async () => {
      (mockService.calculateDistance as jest.Mock<typeof mockService.calculateDistance>).mockResolvedValue(5.2);

      const { req, res } = createMockRequestResponse('GET', {
        lat1: '42.8782',
        lng1: '-8.5448',
        lat2: '42.8800',
        lng2: '-8.5500',
      });

      await controller.getDistance(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          distanceKm: 5.2,
          point1: { lat: 42.8782, lng: -8.5448 },
          point2: { lat: 42.8800, lng: -8.5500 },
        },
      });
    });

    it('should return 400 for missing parameters', async () => {
      const { req, res } = createMockRequestResponse('GET', {
        lat1: '42.8782',
        lng1: '-8.5448',
      });

      await controller.getDistance(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('findAlongRoute', () => {
    it('should find CSPs along route successfully', async () => {
      const mockCSPs = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'CSP on Route',
          type: 'workshop',
          latitude: 42.8782,
          longitude: -8.5448,
          city: 'Santiago',
          country: 'Spain',
          status: 'online' as const,
          distance_from_route: 0.5,
          nearest_point_lat: 42.8780,
          nearest_point_lng: -8.5450,
        },
      ];

      (mockService.findAlongRoute as jest.Mock<typeof mockService.findAlongRoute>).mockResolvedValue(mockCSPs);

      const { req, res } = createMockRequestResponse(
        'POST',
        {},
        {
          points: [
            { latitude: 42.8782, longitude: -8.5448, order: 0 },
            { latitude: 42.8800, longitude: -8.5500, order: 1 },
          ],
          maxDistanceKm: 2,
        }
      );

      await controller.findAlongRoute(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCSPs,
        count: 1,
        params: {
          pointCount: 2,
          maxDistanceKm: 2,
        },
      });
    });

    it('should return 400 for invalid body', async () => {
      (mockService.findAlongRoute as jest.Mock<typeof mockService.findAlongRoute>).mockRejectedValue(
        new Error('Route must have at least 2 points')
      );

      const { req, res } = createMockRequestResponse('POST', {}, { points: [] });

      await controller.findAlongRoute(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('findInBoundingBox', () => {
    it('should find CSPs in bbox successfully', async () => {
      const mockCSPs = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'CSP in Box',
          type: 'workshop',
          latitude: 42.8782,
          longitude: -8.5448,
          city: 'Santiago',
          country: 'Spain',
          status: 'online' as const,
        },
      ];

      (mockService.findInBoundingBox as jest.Mock<typeof mockService.findInBoundingBox>).mockResolvedValue(mockCSPs);

      const { req, res } = createMockRequestResponse('GET', {
        neLat: '43',
        neLng: '-8',
        swLat: '42',
        swLng: '-9',
      });

      await controller.findInBoundingBox(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCSPs,
        count: 1,
        params: {
          northEast: { lat: 43, lng: -8 },
          southWest: { lat: 42, lng: -9 },
        },
      });
    });
  });

  describe('findNearest', () => {
    it('should find nearest CSP successfully', async () => {
      const mockCSP = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Nearest CSP',
        type: 'workshop',
        latitude: 42.8782,
        longitude: -8.5448,
        city: 'Santiago',
        country: 'Spain',
        status: 'online' as const,
        distance_km: 0.5,
      };

      (mockService.findNearest as jest.Mock<typeof mockService.findNearest>).mockResolvedValue(mockCSP);

      const { req, res } = createMockRequestResponse('GET', {
        lat: '42.8782',
        lng: '-8.5448',
      });

      await controller.findNearest(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCSP,
      });
    });

    it('should return 404 when no CSP found', async () => {
      (mockService.findNearest as jest.Mock<typeof mockService.findNearest>).mockResolvedValue(null);

      const { req, res } = createMockRequestResponse('GET', {
        lat: '42.8782',
        lng: '-8.5448',
      });

      await controller.findNearest(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'No CSP found within search radius',
      });
    });
  });

  describe('getDistanceToCSP', () => {
    it('should get distance to CSP successfully', async () => {
      (mockService.getDistanceToCSP as jest.Mock<typeof mockService.getDistanceToCSP>).mockResolvedValue(3.5);

      const { req, res } = createMockRequestResponse('GET', {
        id: '123e4567-e89b-12d3-a456-426614174000',
        lat: '42.8800',
        lng: '-8.5500',
      });

      await controller.getDistanceToCSP(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          cspId: '123e4567-e89b-12d3-a456-426614174000',
          targetPoint: { lat: 42.8800, lng: -8.5500 },
          distanceKm: 3.5,
        },
      });
    });

    it('should return 400 for invalid CSP ID', async () => {
      const { req, res } = createMockRequestResponse('GET', {
        id: ['invalid', 'array'],
        lat: '42.8800',
        lng: '-8.5500',
      });

      await controller.getDistanceToCSP(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid CSP ID',
      });
    });
  });

  describe('handleRequest', () => {
    it('should route to getNearby for nearby path', async () => {
      (mockService.findNearby as jest.Mock<typeof mockService.findNearby>).mockResolvedValue([]);

      const { req, res } = createMockRequestResponse('GET', {
        path: 'nearby',
        lat: '42.8782',
        lng: '-8.5448',
      });

      await controller.handleRequest(req, res);

      expect(mockService.findNearby).toHaveBeenCalled();
    });

    it('should route to getDistance for distance path', async () => {
      (mockService.calculateDistance as jest.Mock<typeof mockService.calculateDistance>).mockResolvedValue(5.2);

      const { req, res } = createMockRequestResponse('GET', {
        path: 'distance',
        lat1: '42.8782',
        lng1: '-8.5448',
        lat2: '42.8800',
        lng2: '-8.5500',
      });

      await controller.handleRequest(req, res);

      expect(mockService.calculateDistance).toHaveBeenCalled();
    });

    it('should route to findAlongRoute for route path', async () => {
      (mockService.findAlongRoute as jest.Mock<typeof mockService.findAlongRoute>).mockResolvedValue([]);

      const { req, res } = createMockRequestResponse(
        'POST',
        { path: 'route' },
        {
          points: [
            { latitude: 42.8782, longitude: -8.5448, order: 0 },
            { latitude: 42.8800, longitude: -8.5500, order: 1 },
          ],
        }
      );

      await controller.handleRequest(req, res);

      expect(mockService.findAlongRoute).toHaveBeenCalled();
    });

    it('should return 404 for unknown path', async () => {
      const { req, res } = createMockRequestResponse('GET', { path: 'unknown' });

      await controller.handleRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Endpoint not found',
      });
    });

    it('should return 405 for unsupported method', async () => {
      const { req, res } = createMockRequestResponse('DELETE', { path: 'nearby' });

      await controller.handleRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Method DELETE not allowed',
      });
    });
  });
});
