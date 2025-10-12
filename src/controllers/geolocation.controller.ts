import { NextApiRequest, NextApiResponse } from 'next';
import { GeolocationService } from '@/services/geolocation.service';
import { z } from 'zod';
import logger from '@/config/logger';

// Validation schemas
const nearbyQuerySchema = z.object({
  lat: z.string().transform((val) => parseFloat(val)),
  lng: z.string().transform((val) => parseFloat(val)),
  radius: z.string().transform((val) => parseFloat(val)).optional().default(() => 10),
  serviceType: z.string().optional(),
  activeOnly: z.string().transform((val) => val === 'true').optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).optional().default(() => 50),
});

const distanceQuerySchema = z.object({
  lat1: z.string().transform((val) => parseFloat(val)),
  lng1: z.string().transform((val) => parseFloat(val)),
  lat2: z.string().transform((val) => parseFloat(val)),
  lng2: z.string().transform((val) => parseFloat(val)),
});

const routeBodySchema = z.object({
  points: z.array(
    z.object({
      latitude: z.number(),
      longitude: z.number(),
      order: z.number(),
    })
  ),
  maxDistanceKm: z.number().optional().default(2),
});

const bboxQuerySchema = z.object({
  neLat: z.string().transform((val) => parseFloat(val)),
  neLng: z.string().transform((val) => parseFloat(val)),
  swLat: z.string().transform((val) => parseFloat(val)),
  swLng: z.string().transform((val) => parseFloat(val)),
  limit: z.string().transform((val) => parseInt(val, 10)).optional().default(() => 100),
});

const nearestQuerySchema = z.object({
  lat: z.string().transform((val) => parseFloat(val)),
  lng: z.string().transform((val) => parseFloat(val)),
  serviceType: z.string().optional(),
});

const distanceToCspQuerySchema = z.object({
  lat: z.string().transform((val) => parseFloat(val)),
  lng: z.string().transform((val) => parseFloat(val)),
});

export class GeolocationController {
  constructor(private geolocationService: GeolocationService) {}

  /**
   * GET /api/geolocation/nearby?lat=42.8782&lng=-8.5448&radius=10
   * Find CSPs within a radius
   */
  async getNearby(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      const query = nearbyQuerySchema.parse(req.query);

      const csps = await this.geolocationService.findNearby({
        latitude: query.lat,
        longitude: query.lng,
        radiusKm: query.radius,
        serviceType: query.serviceType,
        isActive: query.activeOnly,
        limit: query.limit,
      });

      res.status(200).json({
        success: true,
        data: csps,
        count: csps.length,
        params: {
          center: { lat: query.lat, lng: query.lng },
          radiusKm: query.radius,
        },
      });
    } catch (error) {
      logger.error('Error finding nearby CSPs', { error });
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: error.issues,
        });
      } else if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  }

  /**
   * GET /api/geolocation/distance?lat1=42.8782&lng1=-8.5448&lat2=42.8800&lng2=-8.5500
   * Calculate distance between two points
   */
  async getDistance(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      const query = distanceQuerySchema.parse(req.query);

      const distance = await this.geolocationService.calculateDistance(
        { latitude: query.lat1, longitude: query.lng1 },
        { latitude: query.lat2, longitude: query.lng2 }
      );

      res.status(200).json({
        success: true,
        data: {
          distanceKm: distance,
          point1: { lat: query.lat1, lng: query.lng1 },
          point2: { lat: query.lat2, lng: query.lng2 },
        },
      });
    } catch (error) {
      logger.error('Error calculating distance', { error });
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: error.issues,
        });
      } else if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  }

  /**
   * POST /api/geolocation/route
   * Find CSPs along a route
   * Body: { points: [{latitude, longitude, order}], maxDistanceKm: 2 }
   */
  async findAlongRoute(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      const body = routeBodySchema.parse(req.body);

      const csps = await this.geolocationService.findAlongRoute(
        body.points,
        body.maxDistanceKm
      );

      res.status(200).json({
        success: true,
        data: csps,
        count: csps.length,
        params: {
          pointCount: body.points.length,
          maxDistanceKm: body.maxDistanceKm,
        },
      });
    } catch (error) {
      logger.error('Error finding CSPs along route', { error });
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid request body',
          details: error.issues,
        });
      } else if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  }

  /**
   * GET /api/geolocation/bbox?neLat=43&neLng=-8&swLat=42&swLng=-9
   * Find CSPs within a bounding box
   */
  async findInBoundingBox(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      const query = bboxQuerySchema.parse(req.query);

      const csps = await this.geolocationService.findInBoundingBox(
        { latitude: query.neLat, longitude: query.neLng },
        { latitude: query.swLat, longitude: query.swLng }
      );

      res.status(200).json({
        success: true,
        data: csps,
        count: csps.length,
        params: {
          northEast: { lat: query.neLat, lng: query.neLng },
          southWest: { lat: query.swLat, lng: query.swLng },
        },
      });
    } catch (error) {
      logger.error('Error finding CSPs in bounding box', { error });
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: error.issues,
        });
      } else if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  }

  /**
   * GET /api/geolocation/nearest?lat=42.8782&lng=-8.5448&serviceType=workshop
   * Find nearest CSP to a point
   */
  async findNearest(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      const query = nearestQuerySchema.parse(req.query);

      const csp = await this.geolocationService.findNearest(
        query.lat,
        query.lng,
        query.serviceType
      );

      if (!csp) {
        res.status(404).json({
          success: false,
          error: 'No CSP found within search radius',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: csp,
      });
    } catch (error) {
      logger.error('Error finding nearest CSP', { error });
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: error.issues,
        });
      } else if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  }

  /**
   * GET /api/geolocation/csp/:id/distance?lat=42.8782&lng=-8.5448
   * Get distance from a CSP to a target point
   */
  async getDistanceToCSP(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    try {
      const { id } = req.query;
      if (typeof id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid CSP ID',
        });
        return;
      }

      const query = distanceToCspQuerySchema.parse(req.query);

      const distance = await this.geolocationService.getDistanceToCSP(id, {
        latitude: query.lat,
        longitude: query.lng,
      });

      res.status(200).json({
        success: true,
        data: {
          cspId: id,
          targetPoint: { lat: query.lat, lng: query.lng },
          distanceKm: distance,
        },
      });
    } catch (error) {
      logger.error('Error getting distance to CSP', { error });
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: error.issues,
        });
      } else if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  }

  /**
   * Route handler for the controller
   */
  async handleRequest(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { method, query } = req;
    const path = Array.isArray(query.path) ? query.path.join('/') : query.path || '';

    try {
      if (method === 'GET') {
        if (path === 'nearby') {
          await this.getNearby(req, res);
        } else if (path === 'distance') {
          await this.getDistance(req, res);
        } else if (path === 'bbox') {
          await this.findInBoundingBox(req, res);
        } else if (path === 'nearest') {
          await this.findNearest(req, res);
        } else if (path.startsWith('csp/') && path.endsWith('/distance')) {
          await this.getDistanceToCSP(req, res);
        } else {
          res.status(404).json({
            success: false,
            error: 'Endpoint not found',
          });
        }
      } else if (method === 'POST') {
        if (path === 'route') {
          await this.findAlongRoute(req, res);
        } else {
          res.status(404).json({
            success: false,
            error: 'Endpoint not found',
          });
        }
      } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({
          success: false,
          error: `Method ${method} not allowed`,
        });
      }
    } catch (error) {
      logger.error('Unhandled error in geolocation controller', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
