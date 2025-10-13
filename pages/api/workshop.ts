// CRUD endpoints para Workshop - Clean Architecture
import type { NextApiRequest, NextApiResponse } from "next";
import { WorkshopController } from "../../src/controllers/workshop.controller";
import { asyncHandler } from "../../src/middlewares/error-handler";

/**
 * @swagger
 * /api/workshop:
 *   get:
 *     summary: Obtener todos los talleres
 *     tags: [Workshops]
 *     parameters:
 *       - in: query
 *         name: service_point_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar talleres por punto de servicio
 *     responses:
 *       200:
 *         description: Lista de talleres obtenida exitosamente
 *       500:
 *         description: Error del servidor
 *   post:
 *     summary: Crear nuevo taller
 *     tags: [Workshops]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_point_id
 *               - name
 *               - contact_phone
 *             properties:
 *               service_point_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *               contact_phone:
 *                 type: string
 *               contact_email:
 *                 type: string
 *                 format: email
 *               website_url:
 *                 type: string
 *                 format: uri
 *               capacity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Taller creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 *   put:
 *     summary: Actualizar taller existente
 *     tags: [Workshops]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               service_point_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *               contact_phone:
 *                 type: string
 *               contact_email:
 *                 type: string
 *               website_url:
 *                 type: string
 *               capacity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Taller actualizado exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 *   delete:
 *     summary: Eliminar taller
 *     tags: [Workshops]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       204:
 *         description: Taller eliminado exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const controller = new WorkshopController();
  return controller.handle(req, res);
});
