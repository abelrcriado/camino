// Service para lógica de negocio de Taller Manager
import { BaseService } from "./base.service";
import { TallerManagerRepository } from "../repositories/taller_manager.repository";
import type {
  TallerManager,
  CreateTallerManagerDto,
  UpdateTallerManagerDto,
} from "../dto/taller_manager.dto";
import { DatabaseError } from "../errors/custom-errors";

export class TallerManagerService extends BaseService<TallerManager> {
  private tallerManagerRepository: TallerManagerRepository;

  constructor(repository?: TallerManagerRepository) {
    const repo = repository || new TallerManagerRepository();
    super(repo);
    this.tallerManagerRepository = repo;
  }

  /**
   * Crear un nuevo gestor de taller
   */
  async createTallerManager(
    data: CreateTallerManagerDto
  ): Promise<TallerManager> {
    return this.create(data);
  }

  /**
   * Actualizar un gestor de taller
   */
  async updateTallerManager(
    data: UpdateTallerManagerDto
  ): Promise<TallerManager> {
    const { id, ...updates } = data;
    return this.update(id, updates);
  }

  /**
   * Buscar gestores por workshop
   */
  async findByWorkshop(workshopId: string): Promise<TallerManager[]> {
    const { data, error } = await this.tallerManagerRepository.findByWorkshop(
      workshopId
    );

    if (error) {
      throw new DatabaseError("Error al obtener gestores por workshop", {
        originalError: error.message,
      });
    }

    return data || [];
  }

  /**
   * Buscar gestores por usuario
   */
  async findByUser(userId: string): Promise<TallerManager[]> {
    const { data, error } = await this.tallerManagerRepository.findByUser(
      userId
    );

    if (error) {
      throw new DatabaseError("Error al obtener gestores por usuario", {
        originalError: error.message,
      });
    }

    return data || [];
  }
}
