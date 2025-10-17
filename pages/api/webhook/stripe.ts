/**
 * API Route: /api/webhook/stripe
 * Method: POST (receive Stripe webhook events)
 *
 * IMPORTANT: This endpoint must have raw body parsing enabled
 * for Stripe signature verification to work
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { PaymentController } from "@/api/controllers/payment.controller";
import { PaymentService } from "@/api/services/payment.service";
import { PaymentRepository } from "@/api/repositories/payment.repository";
import { createClient } from "@supabase/supabase-js";
import { buffer } from "micro";
import { asyncHandler } from "@/api/middlewares/error-handler";
import { ErrorMessages } from "../../../src/constants/error-messages";

// Disable default body parsing so we can get raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Inicializar Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Inicializar dependencias
const repository = new PaymentRepository(supabase);
const service = new PaymentService(repository);
const controller = new PaymentController(service);

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }

  // Get raw body as buffer for Stripe signature verification
  const buf = await buffer(req);
  const rawBody = buf.toString("utf8");

  // Replace req.body with the raw string
  (req as NextApiRequest & { body: string }).body = rawBody;

  return controller.handle(req, res);
});
