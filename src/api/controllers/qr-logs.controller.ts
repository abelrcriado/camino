// Controller para consulta de logs de acceso (auditoría)

import { NextApiRequest, NextApiResponse } from 'next';
import { asyncHandler } from '@/api/middlewares/error-handler';
import { logger } from '@/config/logger';
import { queryAccessLogsSchema } from '@/api/schemas/qr.schema';
import type { AccessLog } from '@/api/dto/qr.dto';
import { AccessLogRepository } from '@/api/repositories/access_log.repository';

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
  private accessLogRepo: AccessLogRepository;

  constructor(accessLogRepo?: AccessLogRepository) {
    this.accessLogRepo = accessLogRepo || new AccessLogRepository();
  }
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

      // 2. Usar repositorio para obtener logs con filtros
      const { data: logs, count } = await this.accessLogRepo.findWithFilters({
        user_id,
        location_id,
        transaction_id,
        validation_result,
        from,
        to,
        page,
        limit,
      });

      // 3. Calcular metadata de paginación
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
