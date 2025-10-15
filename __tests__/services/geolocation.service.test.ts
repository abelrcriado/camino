import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GeolocationServiceImpl } from '@/services/geolocation.service';
import { GeolocationRepository } from '@/repositories/geolocation.repository';
import { CSPWithDistance } from '@/dto/csp.dto';
import { generateUUID } from '../helpers/factories';

// Mock repository
const mockRepository = {
  findNearby: jest.fn(),
  calculateDistance: jest.fn(),
  findAlongRoute: jest.fn(),
  getDistanceToCSP: jest.fn(),
  findNearest: jest.fn(),
  findInBoundingBox: jest.fn(),
} as unknown as GeolocationRepository;

describe('GeolocationService', () => {
  let service: GeolocationServiceImpl;
  
  // Coordenadas de referencia (Santiago de Compostela)
  const refLatitude = 42.8782;
  const refLongitude = -8.5448;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new GeolocationServiceImpl(mockRepository);
  });

  describe('findNearby', () => {
    it('should find nearby CSPs successfully', async () => {
      const mockCSPs: CSPWithDistance[] = [
        {
          id: generateUUID(),
          name: 'CSP Santiago',
          type: 'workshop',
          latitude: refLatitude,
          longitude: refLongitude,
          status: 'online',
          distance_km: 1.5,
        },
      ];

      (mockRepository.findNearby as jest.Mock<typeof mockRepository.findNearby>).mockResolvedValue(mockCSPs);

      const result = await service.findNearby({
        latitude: refLatitude,
        longitude: refLongitude,
        radiusKm: 10,
      });

      expect(result).toEqual(mockCSPs);
      expect(mockRepository.findNearby).toHaveBeenCalledWith({
        latitude: refLatitude,
        longitude: refLongitude,
        radiusKm: 10,
      });
    });

    it('should reject invalid latitude', async () => {
      await expect(
        service.findNearby({
          latitude: 91, // Invalid
          longitude: refLongitude,
          radiusKm: 10,
        })
      ).rejects.toThrow('Invalid latitude: 91. Must be between -90 and 90');
    });

    it('should reject invalid longitude', async () => {
      await expect(
        service.findNearby({
          latitude: refLatitude,
          longitude: 181, // Invalid
          radiusKm: 10,
        })
      ).rejects.toThrow('Invalid longitude: 181. Must be between -180 and 180');
    });

    it('should reject invalid radius (negative)', async () => {
      await expect(
        service.findNearby({
          latitude: refLatitude,
          longitude: refLongitude,
          radiusKm: -5,
        })
      ).rejects.toThrow('Radius must be between 0 and 100 kilometers');
    });

    it('should reject invalid radius (too large)', async () => {
      await expect(
        service.findNearby({
          latitude: refLatitude,
          longitude: refLongitude,
          radiusKm: 101,
        })
      ).rejects.toThrow('Radius must be between 0 and 100 kilometers');
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance successfully', async () => {
      (mockRepository.calculateDistance as jest.Mock<typeof mockRepository.calculateDistance>).mockResolvedValue(5.2);

      const result = await service.calculateDistance(
        { latitude: 42.8782, longitude: -8.5448 },
        { latitude: 42.8800, longitude: -8.5500 }
      );

      expect(result).toBe(5.2);
      expect(mockRepository.calculateDistance).toHaveBeenCalledWith(
        { latitude: 42.8782, longitude: -8.5448 },
        { latitude: 42.8800, longitude: -8.5500 }
      );
    });

    it('should validate both coordinates', async () => {
      await expect(
        service.calculateDistance(
          { latitude: 95, longitude: -8.5448 },
          { latitude: 42.8800, longitude: -8.5500 }
        )
      ).rejects.toThrow('Invalid latitude');

      await expect(
        service.calculateDistance(
          { latitude: 42.8782, longitude: -8.5448 },
          { latitude: 42.8800, longitude: 185 }
        )
      ).rejects.toThrow('Invalid longitude');
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
          status: 'online' as const,
          distance_from_route: 0.5,
          nearest_point_lat: 42.8780,
          nearest_point_lng: -8.5450,
        },
      ];

      (mockRepository.findAlongRoute as jest.Mock<typeof mockRepository.findAlongRoute>).mockResolvedValue(mockCSPs);

      const routePoints = [
        { latitude: 42.8782, longitude: -8.5448, order: 0 },
        { latitude: 42.8800, longitude: -8.5500, order: 1 },
      ];

      const result = await service.findAlongRoute(routePoints, 2);

      expect(result).toEqual(mockCSPs);
      expect(mockRepository.findAlongRoute).toHaveBeenCalledWith(routePoints, 2);
    });

    it('should reject route with less than 2 points', async () => {
      await expect(
        service.findAlongRoute([{ latitude: 42.8782, longitude: -8.5448, order: 0 }])
      ).rejects.toThrow('Route must have at least 2 points');
    });

    it('should validate all route point coordinates', async () => {
      await expect(
        service.findAlongRoute([
          { latitude: 42.8782, longitude: -8.5448, order: 0 },
          { latitude: 95, longitude: -8.5500, order: 1 },
        ])
      ).rejects.toThrow('Invalid latitude');
    });

    it('should reject invalid order', async () => {
      await expect(
        service.findAlongRoute([
          { latitude: 42.8782, longitude: -8.5448, order: 0 },
          { latitude: 42.8800, longitude: -8.5500, order: -1 },
        ])
      ).rejects.toThrow('Invalid order');
    });

    it('should reject invalid max distance', async () => {
      await expect(
        service.findAlongRoute(
          [
            { latitude: 42.8782, longitude: -8.5448, order: 0 },
            { latitude: 42.8800, longitude: -8.5500, order: 1 },
          ],
          11
        )
      ).rejects.toThrow('Max distance from route must be between 0 and 10 kilometers');
    });
  });

  describe('getDistanceToCSP', () => {
    it('should get distance to CSP successfully', async () => {
      (mockRepository.getDistanceToCSP as jest.Mock<typeof mockRepository.getDistanceToCSP>).mockResolvedValue(3.5);

      const result = await service.getDistanceToCSP(
        '123e4567-e89b-12d3-a456-426614174000',
        { latitude: 42.8800, longitude: -8.5500 }
      );

      expect(result).toBe(3.5);
      expect(mockRepository.getDistanceToCSP).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        { latitude: 42.8800, longitude: -8.5500 }
      );
    });

    it('should validate target coordinates', async () => {
      await expect(
        service.getDistanceToCSP(
          '123e4567-e89b-12d3-a456-426614174000',
          { latitude: 95, longitude: -8.5500 }
        )
      ).rejects.toThrow('Invalid latitude');
    });
  });

  describe('findNearest', () => {
    it('should find nearest CSP successfully', async () => {
      const mockCSP: CSPWithDistance = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Nearest CSP',
        type: 'workshop',
        latitude: 42.8782,
        longitude: -8.5448,
        status: 'online',
        distance_km: 0.5,
      };

      (mockRepository.findNearest as jest.Mock<typeof mockRepository.findNearest>).mockResolvedValue(mockCSP);

      const result = await service.findNearest(42.8782, -8.5448);

      expect(result).toEqual(mockCSP);
      expect(mockRepository.findNearest).toHaveBeenCalledWith(42.8782, -8.5448, undefined);
    });

    it('should return null when no CSP found', async () => {
      (mockRepository.findNearest as jest.Mock<typeof mockRepository.findNearest>).mockResolvedValue(null);

      const result = await service.findNearest(42.8782, -8.5448);

      expect(result).toBeNull();
    });

    it('should validate coordinates', async () => {
      await expect(service.findNearest(95, -8.5448)).rejects.toThrow('Invalid latitude');
    });
  });

  describe('findInBoundingBox', () => {
    it('should find CSPs in bounding box successfully', async () => {
      const mockCSPs = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'CSP in Box',
          type: 'workshop',
          latitude: 42.8782,
          longitude: -8.5448,
          status: 'online' as const,
        },
      ];

      (mockRepository.findInBoundingBox as jest.Mock<typeof mockRepository.findInBoundingBox>).mockResolvedValue(mockCSPs);

      const result = await service.findInBoundingBox(
        { latitude: 43.0, longitude: -8.0 },
        { latitude: 42.0, longitude: -9.0 }
      );

      expect(result).toEqual(mockCSPs);
      expect(mockRepository.findInBoundingBox).toHaveBeenCalledWith(
        { latitude: 43.0, longitude: -8.0 },
        { latitude: 42.0, longitude: -9.0 }
      );
    });

    it('should validate all bbox coordinates', async () => {
      await expect(
        service.findInBoundingBox(
          { latitude: 95, longitude: -8.0 },
          { latitude: 42.0, longitude: -9.0 }
        )
      ).rejects.toThrow('Invalid latitude');
    });

    it('should reject invalid bounding box (NE lat <= SW lat)', async () => {
      await expect(
        service.findInBoundingBox(
          { latitude: 42.0, longitude: -8.0 },
          { latitude: 43.0, longitude: -9.0 }
        )
      ).rejects.toThrow('NorthEast latitude must be greater than SouthWest latitude');
    });

    it('should reject invalid bounding box (NE lng <= SW lng)', async () => {
      await expect(
        service.findInBoundingBox(
          { latitude: 43.0, longitude: -9.0 },
          { latitude: 42.0, longitude: -8.0 }
        )
      ).rejects.toThrow('NorthEast longitude must be greater than SouthWest longitude');
    });
  });
});
