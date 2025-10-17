/**
 * API Route: /api/payments/cancel
 * Method: POST (cancel pending payment)
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { PaymentController } from "@/api/controllers/payment.controller";
import { PaymentService } from "@/api/services/payment.service";
import { PaymentRepository } from "@/api/repositories/payment.repository";
import { createClient } from "@supabase/supabase-js";
import { asyncHandler } from "@/api/middlewares/error-handler";

// Inicializar Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Inicializar dependencias
const repository = new PaymentRepository(supabase);
const service = new PaymentService(repository);
const controller = new PaymentController(service);

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return controller.handle(req, res);
});
