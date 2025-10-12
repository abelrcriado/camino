// Service para lógica de negocio de CSP
import { BaseService } from "./base.service";
import { CSPRepository } from "../repositories/csp.repository";
import type {
  CSP,
  CSPFilters,
  CreateCSPDto,
  UpdateCSPDto,
} from "../dto/csp.dto";
import type {
  PaginationParams,
  PaginatedResponse,
} from "../types/common.types";

export class CSPService extends BaseService<CSP> {
  private cspRepository: CSPRepository;

  constructor(repository?: CSPRepository) {
    const repo = repository || new CSPRepository();
    super(repo);
    this.cspRepository = repo;
  }

  /**
   * Obtiene CSPs con filtros específicos
   */
  async findAllCSPs(
    filters?: CSPFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<CSP>> {
    return this.findAll(filters, pagination, {
      field: "created_at",
      order: "desc",
    });
  }

  /**
   * Crea un nuevo CSP
   */
  async createCSP(data: CreateCSPDto): Promise<CSP> {
    // Validaciones de negocio adicionales aquí si es necesario
    // Por ejemplo: verificar que no exista otro CSP con el mismo nombre en la misma ubicación

    const cspData = {
      ...data,
      status: (data.status || "online") as "online" | "offline" | "maintenance",
    };

    return this.create(cspData);
  }

  /**
   * Actualiza un CSP
   */
  async updateCSP(data: UpdateCSPDto): Promise<CSP> {
    const { id, ...updates } = data;
    return this.update(id, updates);
  }

  /**
   * Elimina un CSP
   */
  async deleteCSP(id: string): Promise<void> {
    // Validaciones de negocio antes de eliminar
    // Por ejemplo: verificar que no tenga bookings activos
    return this.delete(id);
  }

  /**
   * Obtiene CSPs por tipo
   */
  async findByType(type: string): Promise<CSP[]> {
    const { data, error } = await this.cspRepository.findByType(type);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Obtiene CSPs activos
   */
  async findActiveCSPs(): Promise<CSP[]> {
    const { data, error } = await this.cspRepository.findActive();

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}
