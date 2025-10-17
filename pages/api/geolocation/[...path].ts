import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { GeolocationController } from "@/api/controllers/geolocation.controller";
import { GeolocationRepository } from "@/api/repositories/geolocation.repository";
import { GeolocationServiceImpl } from "@/api/services/geolocation.service";
import { asyncHandler } from "@/api/middlewares/error-handler";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize dependencies
const repository = new GeolocationRepository(supabase);
const service = new GeolocationServiceImpl(repository);
const controller = new GeolocationController(service);

/**
 * @swagger
 * /api/geolocation/nearby:
 *   get:
 *     tags:
 *       - Geolocation
 *     summary: Buscar CSPs cercanos a un punto
 *     description: Encuentra todos los CSPs dentro de un radio específico desde una coordenada geográfica
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -90
 *           maximum: 90
 *         description: Latitud del punto de referencia
 *         example: 42.8782
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *           minimum: -180
 *           maximum: 180
 *         description: Longitud del punto de referencia
 *         example: -8.5448
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           format: double
 *           minimum: 0
 *           maximum: 100
 *           default: 10
 *         description: Radio de búsqueda en kilómetros
 *         example: 10
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de servicio
 *         example: workshop
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Filtrar solo CSPs activos
 *         example: true
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 50
 *         description: Número máximo de resultados
 *         example: 50
 *     responses:
 *       200:
 *         description: Lista de CSPs cercanos ordenados por distancia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CSPWithDistance'
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 params:
 *                   type: object
 *                   properties:
 *                     center:
 *                       $ref: '#/components/schemas/Coordinates'
 *                     radiusKm:
 *                       type: number
 *                       example: 10
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *
 * /api/geolocation/distance:
 *   get:
 *     tags:
 *       - Geolocation
 *     summary: Calcular distancia entre dos puntos
 *     description: Calcula la distancia geodésica entre dos coordenadas geográficas usando PostGIS
 *     parameters:
 *       - in: query
 *         name: lat1
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: Latitud del primer punto
 *         example: 42.8782
 *       - in: query
 *         name: lng1
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: Longitud del primer punto
 *         example: -8.5448
 *       - in: query
 *         name: lat2
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: Latitud del segundo punto
 *         example: 42.8800
 *       - in: query
 *         name: lng2
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: Longitud del segundo punto
 *         example: -8.5500
 *     responses:
 *       200:
 *         description: Distancia calculada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     distanceKm:
 *                       type: number
 *                       format: double
 *                       description: Distancia en kilómetros
 *                       example: 2.45
 *                     point1:
 *                       $ref: '#/components/schemas/Coordinates'
 *                     point2:
 *                       $ref: '#/components/schemas/Coordinates'
 *       400:
 *         description: Coordenadas inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/geolocation/route:
 *   post:
 *     tags:
 *       - Geolocation
 *     summary: Buscar CSPs a lo largo de una ruta
 *     description: Encuentra CSPs cercanos a una ruta definida por múltiples puntos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - points
 *             properties:
 *               points:
 *                 type: array
 *                 minItems: 2
 *                 items:
 *                   $ref: '#/components/schemas/RoutePoint'
 *                 description: Puntos que definen la ruta (mínimo 2)
 *               maxDistanceKm:
 *                 type: number
 *                 format: double
 *                 minimum: 0
 *                 maximum: 50
 *                 default: 2
 *                 description: Distancia máxima en km desde la ruta
 *                 example: 2
 *     responses:
 *       200:
 *         description: CSPs encontrados a lo largo de la ruta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CSPWithDistance'
 *                 count:
 *                   type: integer
 *                   example: 12
 *                 params:
 *                   type: object
 *                   properties:
 *                     pointCount:
 *                       type: integer
 *                       example: 5
 *                     maxDistanceKm:
 *                       type: number
 *                       example: 2
 *       400:
 *         description: Datos de ruta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/geolocation/bbox:
 *   get:
 *     tags:
 *       - Geolocation
 *     summary: Buscar CSPs en un área rectangular
 *     description: Encuentra todos los CSPs dentro de un bounding box definido por coordenadas NE y SW
 *     parameters:
 *       - in: query
 *         name: neLat
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: Latitud de la esquina noreste
 *         example: 43
 *       - in: query
 *         name: neLng
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: Longitud de la esquina noreste
 *         example: -8
 *       - in: query
 *         name: swLat
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: Latitud de la esquina suroeste
 *         example: 42
 *       - in: query
 *         name: swLng
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: Longitud de la esquina suroeste
 *         example: -9
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Número máximo de resultados
 *         example: 100
 *     responses:
 *       200:
 *         description: CSPs encontrados en el área
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CSP'
 *                 count:
 *                   type: integer
 *                   example: 25
 *                 params:
 *                   type: object
 *                   properties:
 *                     northEast:
 *                       $ref: '#/components/schemas/Coordinates'
 *                     southWest:
 *                       $ref: '#/components/schemas/Coordinates'
 *       400:
 *         description: Coordenadas de bounding box inválidas
 *
 * /api/geolocation/nearest:
 *   get:
 *     tags:
 *       - Geolocation
 *     summary: Buscar el CSP más cercano
 *     description: Encuentra el CSP más cercano a una coordenada específica
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: Latitud del punto de referencia
 *         example: 42.8782
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: Longitud del punto de referencia
 *         example: -8.5448
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de servicio
 *         example: workshop
 *     responses:
 *       200:
 *         description: CSP más cercano encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CSPWithDistance'
 *       404:
 *         description: No se encontró ningún CSP en el radio de búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: No CSP found within search radius
 *
 * /api/geolocation/csp/{id}/distance:
 *   get:
 *     tags:
 *       - Geolocation
 *     summary: Calcular distancia a un CSP específico
 *     description: Calcula la distancia desde una coordenada hasta un CSP específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del CSP
 *         example: 00000000-0000-0000-0000-000000000100
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: Latitud del punto de referencia
 *         example: 42.8782
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *         description: Longitud del punto de referencia
 *         example: -8.5448
 *     responses:
 *       200:
 *         description: Distancia calculada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     cspId:
 *                       type: string
 *                       format: uuid
 *                       example: 00000000-0000-0000-0000-000000000100
 *                     targetPoint:
 *                       $ref: '#/components/schemas/Coordinates'
 *                     distanceKm:
 *                       type: number
 *                       format: double
 *                       example: 3.42
 *       400:
 *         description: ID de CSP o coordenadas inválidas
 *       404:
 *         description: CSP no encontrado
 */

/**
 * Geolocation API endpoint
 * Handles all geolocation-related requests
 *
 * GET /api/geolocation/nearby?lat=42.8782&lng=-8.5448&radius=10
 * GET /api/geolocation/distance?lat1=42.8782&lng1=-8.5448&lat2=42.8800&lng2=-8.5500
 * GET /api/geolocation/bbox?neLat=43&neLng=-8&swLat=42&swLng=-9
 * GET /api/geolocation/nearest?lat=42.8782&lng=-8.5448
 * GET /api/geolocation/csp/:id/distance?lat=42.8782&lng=-8.5448
 * POST /api/geolocation/route
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return controller.handleRequest(req, res);
});
