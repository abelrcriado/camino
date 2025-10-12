// Base Service para lógica de negocio común
import type {
  PaginationParams,
  PaginationMeta,
  PaginatedResponse,
  QueryFilters,
  SortParams,
} from "../types/common.types";
import { BaseRepository } from "../repositories/base.repository";
import { NotFoundError, DatabaseError } from "../errors/custom-errors";

export abstract class BaseService<T> {
  constructor(protected repository: BaseRepository<T>) {}

  /**
   * Obtiene todos los registros con paginación
   */
  async findAll(
    filters?: QueryFilters,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<PaginatedResponse<T>> {
    const { data, error, count } = await this.repository.findAll(
      filters,
      pagination,
      sort
    );

    if (error) {
      throw new DatabaseError(error.message, { filters, pagination });
    }

    // Calcular metadata de paginación
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const paginationMeta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    };

    return {
      data: data || [],
      pagination: paginationMeta,
    };
  }

  /**
   * Obtiene un registro por ID
   */
  async findById(id: string): Promise<T> {
    const { data, error } = await this.repository.findById(id);

    if (error) {
      throw new DatabaseError(error.message, { id });
    }

    if (!data) {
      throw new NotFoundError("Registro", id);
    }

    return data as T;
  }

  /**
   * Crea un nuevo registro
   */
  async create(data: Partial<T>): Promise<T> {
    const { data: created, error } = await this.repository.create(data);

    if (error) {
      throw new DatabaseError(error.message, { data });
    }

    if (!created || created.length === 0) {
      throw new DatabaseError("No se pudo crear el registro", { data });
    }

    return created[0] as T;
  }

  /**
   * Actualiza un registro
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const { data: updated, error } = await this.repository.update(id, data);

    if (error) {
      throw new DatabaseError(error.message, { id, data });
    }

    if (!updated || updated.length === 0) {
      throw new NotFoundError("Registro", id);
    }

    return updated[0] as T;
  }

  /**
   * Elimina un registro
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.repository.delete(id);

    if (error) {
      throw new DatabaseError(error.message, { id });
    }
  }
}
