/**
 * Service para lógica de negocio de ServiceAssignment
 * Gestiona la relación N:M entre Services y Service Points
 */

import { BaseService } from "./base.service";
import { ServiceAssignmentRepository } from "../repositories/service_assignment.repository";
import {
  NotFoundError,
  ConflictError,
  DatabaseError,
} from "@/errors/custom-errors";
import type {
  ServiceAssignment,
  ServiceAssignmentFilters,
  CreateServiceAssignmentDto,
  UpdateServiceAssignmentDto,
} from "../dto/service_assignment.dto";
import type {
  PaginationParams,
  PaginatedResponse,
  SortParams,
} from "../types/common.types";

export class ServiceAssignmentService extends BaseService<ServiceAssignment> {
  private assignmentRepository: ServiceAssignmentRepository;

  constructor(repository?: ServiceAssignmentRepository) {
    const repo = repository || new ServiceAssignmentRepository();
    super(repo);
    this.assignmentRepository = repo;
  }

  /**
   * Obtiene asignaciones con filtros, paginación y ordenamiento
   */
  async findAllAssignments(
    filters?: ServiceAssignmentFilters,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<PaginatedResponse<ServiceAssignment>> {
    const { data, error, count } = await this.assignmentRepository.findAll(
      filters,
      pagination,
      sort
    );

    if (error) {
      throw new DatabaseError("Error al obtener asignaciones", {
        originalError: error.message,
      });
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  /**
   * Obtiene vista completa con información relacionada
   */
  async findFullAssignments(
    filters?: ServiceAssignmentFilters,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<PaginatedResponse<unknown>> {
    const { data, error, count } =
      await this.assignmentRepository.findFullAssignments(
        filters,
        pagination,
        sort
      );

    if (error) {
      throw new DatabaseError("Error al obtener asignaciones completas", {
        originalError: error.message,
      });
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  /**
   * Crea una nueva asignación validando que no exista previamente
   */
  async createAssignment(
    data: CreateServiceAssignmentDto
  ): Promise<ServiceAssignment> {
    // Verificar que no exista ya la asignación
    const exists = await this.assignmentRepository.assignmentExists(
      data.service_id,
      data.service_point_id
    );

    if (exists) {
      throw new ConflictError(
        `Ya existe una asignación entre el servicio ${data.service_id} y el service point ${data.service_point_id}`
      );
    }

    // Crear la asignación
    const { data: created, error } = await this.assignmentRepository.create(
      data
    );

    if (error) {
      throw new DatabaseError("Error al crear asignación", {
        originalError: error.message,
      });
    }

    if (!created || created.length === 0) {
      throw new DatabaseError("No se pudo crear la asignación");
    }

    return created[0];
  }

  /**
   * Actualiza una asignación existente
   */
  async updateAssignment(
    data: UpdateServiceAssignmentDto
  ): Promise<ServiceAssignment> {
    // Verificar que existe
    const { data: existing, error: findError } =
      await this.assignmentRepository.findById(data.id);
    if (findError || !existing) {
      throw new NotFoundError("Asignación", data.id);
    }

    // Si se está cambiando service_id o service_point_id, verificar que no genere duplicado
    if (data.service_id || data.service_point_id) {
      const newServiceId = data.service_id || existing.service_id;
      const newServicePointId =
        data.service_point_id || existing.service_point_id;

      // Solo verificar si realmente cambió
      if (
        newServiceId !== existing.service_id ||
        newServicePointId !== existing.service_point_id
      ) {
        const exists = await this.assignmentRepository.assignmentExists(
          newServiceId,
          newServicePointId
        );

        if (exists) {
          throw new ConflictError(
            `Ya existe una asignación entre el servicio ${newServiceId} y el service point ${newServicePointId}`
          );
        }
      }
    }

    // Actualizar
    const { data: updated, error } = await this.assignmentRepository.update(
      data.id,
      data
    );

    if (error) {
      throw new DatabaseError("Error al actualizar asignación", {
        originalError: error.message,
      });
    }

    if (!updated || updated.length === 0) {
      throw new DatabaseError("No se pudo actualizar la asignación");
    }

    return updated[0];
  }

  /**
   * Obtiene asignaciones por servicio
   */
  async findByService(service_id: string): Promise<ServiceAssignment[]> {
    return this.assignmentRepository.findByService(service_id);
  }

  /**
   * Obtiene asignaciones por service point
   */
  async findByServicePoint(
    service_point_id: string
  ): Promise<ServiceAssignment[]> {
    return this.assignmentRepository.findByServicePoint(service_point_id);
  }

  /**
   * Verifica si existe asignación entre service y service_point
   */
  async checkAssignment(
    service_id: string,
    service_point_id: string
  ): Promise<boolean> {
    return this.assignmentRepository.assignmentExists(
      service_id,
      service_point_id
    );
  }

  /**
   * Elimina (soft delete) una asignación
   */
  async deleteAssignment(id: string): Promise<void> {
    const { data: existing, error: findError } =
      await this.assignmentRepository.findById(id);
    if (findError || !existing) {
      throw new NotFoundError("Asignación", id);
    }

    // Soft delete: marcar como inactivo
    const { data, error } = await this.assignmentRepository.update(id, {
      is_active: false,
    });

    if (error) {
      throw new DatabaseError("Error al eliminar asignación", {
        originalError: error.message,
      });
    }

    if (!data || data.length === 0) {
      throw new DatabaseError("No se pudo eliminar la asignación");
    }
  }

  /**
   * Obtiene estadísticas de asignaciones
   */
  async getStats(): Promise<unknown> {
    try {
      return await this.assignmentRepository.getStats();
    } catch (error) {
      throw new DatabaseError("Error al obtener estadísticas", {
        originalError: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
