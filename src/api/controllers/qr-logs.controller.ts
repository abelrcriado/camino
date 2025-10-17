// Controller para consulta de logs de acceso (auditoría)

import { NextApiRequest, NextApiResponse } from 'next';
import { asyncHandler } from '@/api/middlewares/error-handler';
import { AppError } from '@/api/errors/custom-errors';
import { supabase } from '@/api/services/supabase';
import { logger } from '@/config/logger';
import { queryAccessLogsSchema } from '@/api/schemas/qr.schema';
import type { AccessLog } from '@/api/dto/qr.dto';

interface PaginatedResponse {
  data: AccessLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Controller para consulta de logs de acceso (auditoría de escaneos QR)
 */
export class QRLogsController {
  /**
   * GET /api/access/logs
   * Consulta logs de acceso con filtros y paginación
   */
  getLogs = asyncHandler(
    async (req: NextApiRequest, res: NextApiResponse<PaginatedResponse | { error: string }>) => {
      // 1. Validar y parsear query params
      const validatedQuery = queryAccessLogsSchema.parse(req.query);
      const {
        page = 1,
        limit = 20,
        user_id,
        location_id,
        transaction_id,
        validation_result,
        from,
        to,
      } = validatedQuery;

      logger.info('Consultando logs de acceso', {
        page,
        limit,
        filters: { user_id, location_id, transaction_id, validation_result },
      });

      // 2. Construir query base
      let query = supabase
        .from('access_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false });

      // 3. Aplicar filtros opcionales
      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      if (location_id) {
        query = query.eq('location_id', location_id);
      }

      if (transaction_id) {
        query = query.eq('transaction_id', transaction_id);
      }

      if (validation_result) {
        query = query.eq('validation_result', validation_result);
      }

      if (from) {
        query = query.gte('timestamp', from);
      }

      if (to) {
        query = query.lte('timestamp', to);
      }

      // 4. Aplicar paginación
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // 5. Ejecutar query
      const { data: logs, error: logsError, count } = await query;

      if (logsError) {
        logger.error('Error al consultar logs de acceso', { error: logsError });
        throw new AppError('Error al consultar logs', 500);
      }

      // 6. Calcular metadata de paginación
      const total = count ?? 0;
      const totalPages = Math.ceil(total / limit);

      logger.info('Logs consultados exitosamente', {
        total,
        page,
        limit,
        results: logs?.length ?? 0,
      });

      return res.status(200).json({
        data: (logs as AccessLog[]) ?? [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    }
  );
}
