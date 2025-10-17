// CRUD endpoints para Partner - Clean Architecture
import type { NextApiRequest, NextApiResponse } from "next";
import { PartnerController } from "@/api/controllers/partner.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

/**
 * @swagger
 * /api/partner:
 *   get:
 *     summary: Obtener todos los partners
 *     tags: [Partners]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sponsor, collaborator, supplier, service_provider, other]
 *         description: Filtrar partners por tipo
 *     responses:
 *       200:
 *         description: Lista de partners obtenida exitosamente
 *       500:
 *         description: Error del servidor
 *   post:
 *     summary: Crear nuevo partner
 *     tags: [Partners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - contact_phone
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo_url:
 *                 type: string
 *                 format: uri
 *               website_url:
 *                 type: string
 *                 format: uri
 *               contact_email:
 *                 type: string
 *                 format: email
 *               contact_phone:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [sponsor, collaborator, supplier, service_provider, other]
 *     responses:
 *       201:
 *         description: Partner creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 *   put:
 *     summary: Actualizar partner existente
 *     tags: [Partners]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               logo_url:
 *                 type: string
 *               website_url:
 *                 type: string
 *               contact_email:
 *                 type: string
 *               contact_phone:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [sponsor, collaborator, supplier, service_provider, other]
 *     responses:
 *       200:
 *         description: Partner actualizado exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 *   delete:
 *     summary: Eliminar partner
 *     tags: [Partners]
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
 *         description: Partner eliminado exitosamente
 *       400:
 *         description: ID no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const controller = new PartnerController();
  return controller.handle(req, res);
});
