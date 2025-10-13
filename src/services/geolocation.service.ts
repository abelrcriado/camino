import { GeolocationRepository, NearbySearchParams, RoutePoint, CSPOnRoute } from '@/repositories/geolocation.repository';
import { CSP, CSPWithDistance } from '@/dto/csp.dto';
import { ValidationError } from '@/errors/custom-errors';
import logger from '@/config/logger';

export interface GeolocationService {
  findNearby(params: NearbySearchParams): Promise<CSPWithDistance[]>;
  calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): Promise<number>;
  findAlongRoute(routePoints: RoutePoint[], maxDistanceKm?: number): Promise<CSPOnRoute[]>;
  getDistanceToCSP(cspId: string, targetPoint: { latitude: number; longitude: number }): Promise<number>;
  findNearest(latitude: number, longitude: number, serviceType?: string): Promise<CSPWithDistance | null>;
  findInBoundingBox(
    northEast: { latitude: number; longitude: number },
    southWest: { latitude: number; longitude: number }
  ): Promise<CSP[]>;
}

export class GeolocationServiceImpl implements GeolocationService {
  constructor(private repository: GeolocationRepository) {}

  /**
   * Find CSPs within a radius of a given point
   * Business logic: Filters, validation, and logging
   */
  async findNearby(params: NearbySearchParams): Promise<CSPWithDistance[]> {
    logger.info('Finding nearby CSPs', { params });

    // Validate coordinates
    this.validateCoordinates(params.latitude, params.longitude);

    // Validate radius (max 100km for reasonable queries)
    if (params.radiusKm <= 0 || params.radiusKm > 100) {
      throw new ValidationError('Radius must be between 0 and 100 kilometers');
    }

    try {
      const csps = await this.repository.findNearby(params);
      logger.info(`Found ${csps.length} CSPs nearby`, {
        count: csps.length,
        radiusKm: params.radiusKm,
      });
      return csps;
    } catch (error) {
      logger.error('Failed to find nearby CSPs', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two points
   */
  async calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): Promise<number> {
    this.validateCoordinates(point1.latitude, point1.longitude);
    this.validateCoordinates(point2.latitude, point2.longitude);

    try {
      const distance = await this.repository.calculateDistance(point1, point2);
      logger.debug('Calculated distance', { point1, point2, distance });
      return distance;
    } catch (error) {
      logger.error('Failed to calculate distance', error);
      throw error;
    }
  }

  /**
   * Find CSPs along a route (for Camino planning)
   * Business logic: Route validation, reasonable distance limits
   */
  async findAlongRoute(
    routePoints: RoutePoint[],
    maxDistanceKm: number = 2
  ): Promise<CSPOnRoute[]> {
    logger.info('Finding CSPs along route', {
      pointCount: routePoints.length,
      maxDistanceKm,
    });

    // Validate route has at least 2 points
    if (routePoints.length < 2) {
      throw new ValidationError('Route must have at least 2 points');
    }

    // Validate all coordinates
    routePoints.forEach((point, index) => {
      this.validateCoordinates(point.latitude, point.longitude);
      if (point.order < 0) {
        throw new ValidationError(`Invalid order for point ${index}: ${point.order}`);
      }
    });

    // Validate distance limit (max 10km for reasonable queries)
    if (maxDistanceKm <= 0 || maxDistanceKm > 10) {
      throw new ValidationError('Max distance from route must be between 0 and 10 kilometers');
    }

    try {
      const csps = await this.repository.findAlongRoute(routePoints, maxDistanceKm);
      logger.info(`Found ${csps.length} CSPs along route`, {
        count: csps.length,
      });
      return csps;
    } catch (error) {
      logger.error('Failed to find CSPs along route', error);
      throw error;
    }
  }

  /**
   * Get distance from a CSP to a target point
   */
  async getDistanceToCSP(
    cspId: string,
    targetPoint: { latitude: number; longitude: number }
  ): Promise<number> {
    this.validateCoordinates(targetPoint.latitude, targetPoint.longitude);

    try {
      const distance = await this.repository.getDistanceToCSP(cspId, targetPoint);
      logger.debug('Got distance to CSP', { cspId, targetPoint, distance });
      return distance;
    } catch (error) {
      logger.error('Failed to get distance to CSP', error);
      throw error;
    }
  }

  /**
   * Find the nearest CSP to a point
   */
  async findNearest(
    latitude: number,
    longitude: number,
    serviceType?: string
  ): Promise<CSPWithDistance | null> {
    logger.info('Finding nearest CSP', { latitude, longitude, serviceType });

    this.validateCoordinates(latitude, longitude);

    try {
      const csp = await this.repository.findNearest(latitude, longitude, serviceType);
      if (csp) {
        logger.info('Found nearest CSP', { cspId: csp.id, distance: csp.distance_km });
      } else {
        logger.info('No CSP found within search radius');
      }
      return csp;
    } catch (error) {
      logger.error('Failed to find nearest CSP', error);
      throw error;
    }
  }

  /**
   * Find CSPs within a bounding box (for map views)
   */
  async findInBoundingBox(
    northEast: { latitude: number; longitude: number },
    southWest: { latitude: number; longitude: number }
  ): Promise<CSP[]> {
    logger.info('Finding CSPs in bounding box', { northEast, southWest });

    this.validateCoordinates(northEast.latitude, northEast.longitude);
    this.validateCoordinates(southWest.latitude, southWest.longitude);

    // Validate bounding box is correct
    if (northEast.latitude <= southWest.latitude) {
      throw new ValidationError('NorthEast latitude must be greater than SouthWest latitude');
    }
    if (northEast.longitude <= southWest.longitude) {
      throw new ValidationError('NorthEast longitude must be greater than SouthWest longitude');
    }

    try {
      const csps = await this.repository.findInBoundingBox(northEast, southWest);
      logger.info(`Found ${csps.length} CSPs in bounding box`, {
        count: csps.length,
      });
      return csps;
    } catch (error) {
      logger.error('Failed to find CSPs in bounding box', error);
      throw error;
    }
  }

  /**
   * Validate latitude and longitude coordinates
   */
  private validateCoordinates(latitude: number, longitude: number): void {
    if (latitude < -90 || latitude > 90) {
      throw new ValidationError(`Invalid latitude: ${latitude}. Must be between -90 and 90`);
    }
    if (longitude < -180 || longitude > 180) {
      throw new ValidationError(`Invalid longitude: ${longitude}. Must be between -180 and 180`);
    }
  }
}
