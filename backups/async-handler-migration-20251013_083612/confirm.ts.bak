/**
 * API Route: /api/payments/confirm
 * Method: POST (confirm payment after Stripe success)
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { PaymentController } from "../../../src/controllers/payment.controller";
import { PaymentService } from "../../../src/services/payment.service";
import { PaymentRepository } from "../../../src/repositories/payment.repository";
import { createClient } from "@supabase/supabase-js";

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
  return controller.handle(req, res);
}
