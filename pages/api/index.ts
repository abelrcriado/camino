// API entrypoint (Next.js API Route example)
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Health Check
 *     description: Endpoint raíz para verificar que la API está funcionando
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: API working!
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: "API working!" });
}
