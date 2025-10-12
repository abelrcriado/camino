/**
 * API Route: /api/webhook/stripe
 * Method: POST (receive Stripe webhook events)
 *
 * IMPORTANT: This endpoint must have raw body parsing enabled
 * for Stripe signature verification to work
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { PaymentController } from "../../../src/controllers/payment.controller";
import { PaymentService } from "../../../src/services/payment.service";
import { PaymentRepository } from "../../../src/repositories/payment.repository";
import { createClient } from "@supabase/supabase-js";
import { buffer } from "micro";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Get raw body as buffer for Stripe signature verification
    const buf = await buffer(req);
    const rawBody = buf.toString("utf8");

    // Replace req.body with the raw string
    (req as NextApiRequest & { body: string }).body = rawBody;

    return controller.handle(req, res);
  } catch (error) {
    console.error("[Webhook Error]:", error);
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Webhook error",
    });
  }
}
