// Service para lógica de negocio de Workshop
import { BaseService } from "./base.service";
import { WorkshopRepository } from "../repositories/workshop.repository";
import type {
  Workshop,
  CreateWorkshopDto,
  UpdateWorkshopDto,
} from "@/shared/dto/workshop.dto";
import { DatabaseError } from "../errors/custom-errors";

export class WorkshopService extends BaseService<Workshop> {
  private workshopRepository: WorkshopRepository;

  constructor(repository?: WorkshopRepository) {
    const repo = repository || new WorkshopRepository();
    super(repo);
    this.workshopRepository = repo;
  }

  /**
   * Crear un nuevo workshop
   */
  async createWorkshop(data: CreateWorkshopDto): Promise<Workshop> {
    return this.create(data);
  }

  /**
   * Actualizar un workshop
   */
  async updateWorkshop(data: UpdateWorkshopDto): Promise<Workshop> {
    const { id, ...updates } = data;
    return this.update(id, updates);
  }

  /**
   * Buscar workshops por service point
   */
  async findByServicePoint(servicePointId: string): Promise<Workshop[]> {
    const { data, error } = await this.workshopRepository.findByServicePoint(
      servicePointId
    );

    if (error) {
      throw new DatabaseError("Error al obtener workshops por service point", {
        originalError: error.message,
      });
    }

    return data || [];
  }
}
