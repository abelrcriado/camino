import { ServiceRepository } from "@/repositories/service.repository";
import type {
  Service,
  ServiceInsert,
  ServiceUpdate,
  ServiceFilters,
} from "@/repositories/service.repository";

export class ServiceService {
  private repository: ServiceRepository;

  constructor() {
    this.repository = new ServiceRepository();
  }

  async list(filters?: ServiceFilters): Promise<Service[]> {
    return this.repository.findAll(filters);
  }

  async listWithDetails(filters?: ServiceFilters): Promise<any[]> {
    return this.repository.findAllWithDetails(filters);
  }

  async getById(id: string): Promise<Service> {
    const service = await this.repository.findById(id);

    if (!service) {
      throw new Error("Service not found");
    }

    return service;
  }

  async getByServicePoint(servicePointId: string): Promise<Service[]> {
    return this.repository.findByServicePoint(servicePointId);
  }

  async getByServiceType(serviceTypeId: string): Promise<Service[]> {
    return this.repository.findByServiceType(serviceTypeId);
  }




  async create(data: ServiceInsert): Promise<Service> {
    // Validar nombre
    if (!data.name || data.name.length < 2 || data.name.length > 200) {
      throw new Error("Name must be between 2 and 200 characters");
    }

    // Validar code (CRÍTICO - UNIQUE, NOT NULL)
    if (!data.code || data.code.length < 2 || data.code.length > 100) {
      throw new Error("Code must be between 2 and 100 characters");
    }

    // Validar unicidad del code
    const existing = await this.repository.findByCode(data.code);
    if (existing) {
      throw new Error(`Service with code '${data.code}' already exists`);
    }

    // Validar service_type_id (requerido)
    if (!data.service_type_id) {
      throw new Error("Service type ID is required");
    }

    // Validar capacidades
    if (data.max_capacity !== undefined && data.max_capacity < 0) {
      throw new Error("Max capacity cannot be negative");
    }

    if (data.current_capacity !== undefined && data.current_capacity < 0) {
      throw new Error("Current capacity cannot be negative");
    }

    if (
      data.max_capacity &&
      data.current_capacity &&
      data.current_capacity > data.max_capacity
    ) {
      throw new Error("Current capacity cannot exceed max capacity");
    }

    // Validar costos
    if (data.initial_investment !== undefined && data.initial_investment < 0) {
      throw new Error("Initial investment cannot be negative");
    }

    if (
      data.monthly_maintenance_cost !== undefined &&
      data.monthly_maintenance_cost < 0
    ) {
      throw new Error("Monthly maintenance cost cannot be negative");
    }

    if (
      data.electricity_cost_monthly !== undefined &&
      data.electricity_cost_monthly < 0
    ) {
      throw new Error("Electricity cost cannot be negative");
    }

    // Valores por defecto
    if (data.status === undefined) {
      data.status = "active";
    }

    if (data.total_uses === undefined) {
      data.total_uses = 0;
    }

    if (data.total_revenue === undefined) {
      data.total_revenue = 0;
    }

    if (data.requires_inventory === undefined) {
      data.requires_inventory = false;
    }

    return this.repository.create(data);
  }


  async update(id: string, updates: ServiceUpdate): Promise<Service> {
    const service = await this.repository.findById(id);

    if (!service) {
      throw new Error("Service not found");
    }

    // Validar nombre si se actualiza
    if (updates.name !== undefined) {
      if (updates.name.length < 2 || updates.name.length > 200) {
        throw new Error("Name must be between 2 and 200 characters");
      }
    }

    const updated = await this.repository.update(id, updates);

    if (!updated) {
      throw new Error("Service not found");
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const service = await this.repository.findById(id);

    if (!service) {
      throw new Error("Service not found");
    }

    return this.repository.delete(id);
  }

  async updateStatus(
    id: string,
    status: "active" | "inactive" | "maintenance" | "out_of_service"
  ): Promise<Service> {
    const service = await this.repository.findById(id);

    if (!service) {
      throw new Error("Service not found");
    }

    const updated = await this.repository.updateStatus(id, status);

    if (!updated) {
      throw new Error("Service not found");
    }

    return updated;
  }

  async getServicesByStatus(
    status: "active" | "inactive" | "maintenance" | "out_of_service"
  ): Promise<Service[]> {
    return this.repository.getServicesByStatus(status);
  }
}
  async create(data: ServiceInsert): Promise<Service> {
    // Validar nombre
    if (!data.name || data.name.length < 2 || data.name.length > 200) {
      throw new Error("Name must be between 2 and 200 characters");
    }

    // Validar code (CRÍTICO - UNIQUE, NOT NULL)
    if (!data.code || data.code.length < 2 || data.code.length > 100) {
      throw new Error("Code must be between 2 and 100 characters");
    }

    // Validar unicidad del code
    const existing = await this.repository.findByCode(data.code);
    if (existing) {
      throw new Error(`Service with code '${data.code}' already exists`);
    }

    // Validar service_type_id (requerido)
    if (!data.service_type_id) {
      throw new Error("Service type ID is required");
    }

    // Validar capacidades
    if (data.max_capacity !== undefined && data.max_capacity < 0) {
      throw new Error("Max capacity cannot be negative");
    }

    if (data.current_capacity !== undefined && data.current_capacity < 0) {
      throw new Error("Current capacity cannot be negative");
    }

    if (
      data.max_capacity &&
      data.current_capacity &&
      data.current_capacity > data.max_capacity
    ) {
      throw new Error("Current capacity cannot exceed max capacity");
    }

    // Validar costos
    if (data.initial_investment !== undefined && data.initial_investment < 0) {
      throw new Error("Initial investment cannot be negative");
    }

    if (
      data.monthly_maintenance_cost !== undefined &&
      data.monthly_maintenance_cost < 0
    ) {
      throw new Error("Monthly maintenance cost cannot be negative");
    }

    if (
      data.electricity_cost_monthly !== undefined &&
      data.electricity_cost_monthly < 0
    ) {
      throw new Error("Electricity cost cannot be negative");
    }

    // Valores por defecto
    if (data.status === undefined) {
      data.status = "active";
    }

    if (data.total_uses === undefined) {
      data.total_uses = 0;
    }

    if (data.total_revenue === undefined) {
      data.total_revenue = 0;
    }

    if (data.requires_inventory === undefined) {
      data.requires_inventory = false;
    }

    return this.repository.create(data);
  }
