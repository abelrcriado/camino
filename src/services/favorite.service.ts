// Service para lógica de negocio de Favorite
import { BaseService } from "./base.service";
import { FavoriteRepository } from "../repositories/favorite.repository";
import type {
  Favorite,
  CreateFavoriteDto,
  UpdateFavoriteDto,
} from "../dto/favorite.dto";
import { ConflictError, DatabaseError } from "../errors/custom-errors";

export class FavoriteService extends BaseService<Favorite> {
  private favoriteRepository: FavoriteRepository;

  constructor(repository?: FavoriteRepository) {
    const repo = repository || new FavoriteRepository();
    super(repo);
    this.favoriteRepository = repo;
  }

  /**
   * Crea un nuevo favorito
   */
  async createFavorite(data: CreateFavoriteDto): Promise<Favorite> {
    // Validar que no exista duplicado
    const { data: existing } = await this.favoriteRepository.findDuplicate(
      data.user_id,
      data.service_point_id
    );

    if (existing) {
      throw new ConflictError("El favorito ya existe");
    }

    return this.create(data);
  }

  /**
   * Actualiza un favorito
   */
  async updateFavorite(data: UpdateFavoriteDto): Promise<Favorite> {
    const { id, ...updates } = data;
    return this.update(id, updates);
  }

  /**
   * Buscar favoritos por usuario
   */
  async findByUser(userId: string): Promise<Favorite[]> {
    const { data, error } = await this.favoriteRepository.findByUser(userId);

    if (error) {
      throw new DatabaseError(error.message, { userId });
    }

    return data || [];
  }

  /**
   * Buscar favoritos por service point
   */
  async findByServicePoint(servicePointId: string): Promise<Favorite[]> {
    const { data, error } = await this.favoriteRepository.findByServicePoint(
      servicePointId
    );

    if (error) {
      throw new DatabaseError(error.message, { servicePointId });
    }

    return data || [];
  }
}
