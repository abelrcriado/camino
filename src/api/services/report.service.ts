// Service para Report
import { BaseService } from "./base.service";
import { ReportRepository } from "../repositories/report.repository";
import type {
  Report,
  CreateReportDto,
  UpdateReportDto,
} from "@/shared/dto/report.dto";

export class ReportService extends BaseService<Report> {
  private reportRepository: ReportRepository;

  constructor() {
    const repository = new ReportRepository();
    super(repository);
    this.reportRepository = repository;
  }

  /**
   * Crear un reporte
   */
  async createReport(data: CreateReportDto) {
    return this.create(data);
  }

  /**
   * Actualizar un reporte
   */
  async updateReport(id: string, data: UpdateReportDto) {
    return this.update(id, data);
  }

  /**
   * Obtener reportes por tipo
   */
  async findByType(type: string) {
    const { data, error } = await this.reportRepository.findByType(type);
    if (error) throw error;
    return data || [];
  }

  /**
   * Obtener reportes por estado
   */
  async findByStatus(status: string) {
    const { data, error } = await this.reportRepository.findByStatus(status);
    if (error) throw error;
    return data || [];
  }

  /**
   * Obtener reportes por usuario
   */
  async findByUser(userId: string) {
    const { data, error } = await this.reportRepository.findByUser(userId);
    if (error) throw error;
    return data || [];
  }

  /**
   * Obtener reportes por service point
   */
  async findByServicePoint(servicePointId: string) {
    const { data, error } = await this.reportRepository.findByServicePoint(
      servicePointId
    );
    if (error) throw error;
    return data || [];
  }
}
