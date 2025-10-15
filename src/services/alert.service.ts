// ============================================================================
// Sprint 7: Alerts System - Service Layer
// ============================================================================

import { BaseService } from "./base.service";
import { AlertRepository } from "@/repositories/alert.repository";
import { Alert, CreateAlertDto, AlertCountResponse } from "@/dto/alert.dto";

export class AlertService extends BaseService<Alert> {
  protected alertRepository: AlertRepository;

  constructor(repository?: AlertRepository) {
    const repo = repository || new AlertRepository();
    super(repo);
    this.alertRepository = repo;
  }

  /**
   * Crear una nueva alerta
   */
  async createAlert(data: CreateAlertDto): Promise<Alert> {
    return this.create(data);
  }

  /**
   * Contar alertas no leídas
   */
  async countUnread(): Promise<number> {
    return this.alertRepository.countUnread();
  }

  /**
   * Obtener estadísticas de alertas
   */
  async getStats(): Promise<AlertCountResponse> {
    return this.alertRepository.getStats();
  }

  /**
   * Marcar alerta como leída/no leída
   */
  async marcarLeida(id: string, leida: boolean): Promise<Alert> {
    return this.alertRepository.marcarLeida(id, leida);
  }

  /**
   * Marcar todas las alertas como leídas
   */
  async marcarTodasLeidas(): Promise<number> {
    return this.alertRepository.marcarTodasLeidas();
  }

  /**
   * Buscar alertas por entidad
   */
  async findByEntidad(
    entidadTipo: string,
    entidadId: string
  ): Promise<Alert[]> {
    return this.alertRepository.findByEntidad(entidadTipo, entidadId);
  }

  /**
   * Eliminar alertas antiguas
   */
  async deleteOldAlerts(days: number = 30): Promise<number> {
    return this.alertRepository.deleteOldAlerts(days);
  }
}
