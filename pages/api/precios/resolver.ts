// Endpoint para resolver precio jerárquico según contexto
import type { NextApiRequest, NextApiResponse } from "next";
import { PrecioService } from "@/api/services/precio.service";
import { PrecioRepository } from "@/api/repositories/precio.repository";
import { EntidadTipo } from "@/shared/dto/precio.dto";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "@/shared/constants/error-messages";
import { validateUUID } from "@/api/middlewares/validate-uuid";

/**
 * @swagger
 * /api/precios/resolver:
 *   post:
 *     summary: Resolver precio jerárquico
 *     description: |
 *       Resuelve el precio aplicable para un producto siguiendo la jerarquía:
 *       1. Precio de SERVICE_POINT (si existe)
 *       2. Precio de UBICACION (si existe)
 *       3. Precio BASE (si existe)
 *       4. null (si no hay precio definido)
 *     tags: [Precios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - producto_id
 *             properties:
 *               producto_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del producto
 *               service_point_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del service point (mayor prioridad)
 *               ubicacion_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la ubicación (prioridad media)
 *     responses:
 *       200:
 *         description: Precio resuelto según jerarquía
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 precio:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     entidad_tipo:
 *                       type: string
 *                       enum: [BASE, UBICACION, SERVICE_POINT]
 *                     entidad_id:
 *                       type: string
 *                       format: uuid
 *                     producto_id:
 *                       type: string
 *                     precio:
 *                       type: number
 *                       format: float
 *                     moneda:
 *                       type: string
 *                 resolucion:
 *                   type: object
 *                   properties:
 *                     nivel_aplicado:
 *                       type: string
 *                       enum: [SERVICE_POINT, UBICACION, BASE, NINGUNO]
 *                       description: Nivel de jerarquía del que proviene el precio
 *                     producto_id:
 *                       type: string
 *                     service_point_id:
 *                       type: string
 *                       nullable: true
 *                     ubicacion_id:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Datos inválidos (falta producto_id, UUIDs mal formados, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: producto_id es requerido
 *       404:
 *         description: Producto, service point o ubicación no encontrado
 *       500:
 *         description: Error interno del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }

  const { producto_id, service_point_id, ubicacion_id } = req.body;

  // Validar producto_id (requerido)
  const productoError = validateUUID(producto_id, "producto");
  if (productoError) {
    return res.status(400).json({ error: productoError });
  }

  // Validar service_point_id (opcional)
  if (service_point_id) {
    const servicePointError = validateUUID(service_point_id, "service point");
    if (servicePointError) {
      return res.status(400).json({ error: servicePointError });
    }
  }

  // Validar ubicacion_id (opcional)
  if (ubicacion_id) {
    const ubicacionError = validateUUID(ubicacion_id, "ubicación");
    if (ubicacionError) {
      return res.status(400).json({ error: ubicacionError });
    }
  }

  const repository = new PrecioRepository();
  const service = new PrecioService(repository);

  // Resolver precio jerárquico usando el servicio
  // El servicio ya implementa la lógica de jerarquía
  const precioResuelto = await service.resolverPrecio({
    entidad_tipo: EntidadTipo.PRODUCTO,
    entidad_id: producto_id,
    ubicacion_id: ubicacion_id || undefined,
    service_point_id: service_point_id || undefined,
  });

  // Determinar nivel aplicado desde el resultado
  let nivelAplicado: "SERVICE_POINT" | "UBICACION" | "BASE" | "NINGUNO" =
    "NINGUNO";

  if (precioResuelto) {
    // Mapear NivelPrecio al formato esperado
    type NivelAplicadoType =
      | "SERVICE_POINT"
      | "UBICACION"
      | "BASE"
      | "NINGUNO";
    const nivelMap: Record<string, NivelAplicadoType> = {
      service_point: "SERVICE_POINT",
      ubicacion: "UBICACION",
      base: "BASE",
    };
    nivelAplicado = nivelMap[precioResuelto.nivel] || "NINGUNO";
  }

  return res.status(200).json({
    precio: precioResuelto,
    resolucion: {
      nivel_aplicado: nivelAplicado,
      producto_id,
      service_point_id: service_point_id || null,
      ubicacion_id: ubicacion_id || null,
    },
  });
});
