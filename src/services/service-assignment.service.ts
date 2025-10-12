import {
  serviceAssignmentRepository,
  ServiceAssignmentDetail,
  CreateServiceAssignmentDTO,
  ServiceAssignmentFilters,
  ServiceAssignment,
} from "@/repositories/service-assignment.repository";

export class ServiceAssignmentService {
  /**
   * Get all service assignments with optional filters
   */
  async list(
    filters?: ServiceAssignmentFilters
  ): Promise<ServiceAssignmentDetail[]> {
    return serviceAssignmentRepository.findAllWithDetails(filters);
  }

  /**
   * Get a single service assignment by ID
   */
  async getById(id: string): Promise<ServiceAssignment | null> {
    return serviceAssignmentRepository.findById(id);
  }

  /**
   * Assign a service to a location
   */
  async assign(dto: CreateServiceAssignmentDTO): Promise<string> {
    // Validate that the assignment doesn't already exist (active)
    const exists = await serviceAssignmentRepository.exists(
      dto.service_id,
      dto.location_id,
      dto.service_point_id
    );

    if (exists) {
      throw new Error("Service is already assigned to this location");
    }

    return serviceAssignmentRepository.create(dto);
  }

  /**
   * Update an existing service assignment
   */
  async update(
    id: string,
    updates: Partial<ServiceAssignment>
  ): Promise<ServiceAssignment> {
    const existing = await serviceAssignmentRepository.findById(id);
    if (!existing) {
      throw new Error("Service assignment not found");
    }

    return serviceAssignmentRepository.update(id, updates);
  }

  /**
   * Unassign a service from a location (soft delete - marks as removed)
   */
  async unassign(
    service_id: string,
    location_id: string,
    service_point_id?: string | null
  ): Promise<boolean> {
    return serviceAssignmentRepository.unassign(
      service_id,
      location_id,
      service_point_id
    );
  }

  /**
   * Delete a service assignment permanently
   */
  async delete(id: string): Promise<void> {
    const existing = await serviceAssignmentRepository.findById(id);
    if (!existing) {
      throw new Error("Service assignment not found");
    }

    return serviceAssignmentRepository.delete(id);
  }

  /**
   * Get all assignments for a specific location
   */
  async getByLocation(location_id: string): Promise<ServiceAssignmentDetail[]> {
    return serviceAssignmentRepository.findByLocation(location_id);
  }

  /**
   * Get all locations where a service is assigned
   */
  async getByService(service_id: string): Promise<ServiceAssignmentDetail[]> {
    return serviceAssignmentRepository.findByService(service_id);
  }

  /**
   * Get all assignments for a specific service point
   */
  async getByServicePoint(
    service_point_id: string
  ): Promise<ServiceAssignmentDetail[]> {
    return serviceAssignmentRepository.findByServicePoint(service_point_id);
  }

  /**
   * Reactivate a removed assignment
   */
  async reactivate(id: string): Promise<ServiceAssignment> {
    return this.update(id, { status: "active" });
  }

  /**
   * Set assignment to maintenance mode
   */
  async setMaintenance(id: string): Promise<ServiceAssignment> {
    return this.update(id, { status: "maintenance" });
  }
}

export const serviceAssignmentService = new ServiceAssignmentService();
