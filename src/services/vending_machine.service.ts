// Service para lógica de negocio de Vending Machine
import { BaseService } from "./base.service";
import { VendingMachineRepository } from "../repositories/vending_machine.repository";
import type {
  VendingMachine,
  CreateVendingMachineDto,
  UpdateVendingMachineDto,
} from "../dto/vending_machine.dto";

export class VendingMachineService extends BaseService<VendingMachine> {
  private vendingMachineRepository: VendingMachineRepository;

  constructor(repository?: VendingMachineRepository) {
    const repo = repository || new VendingMachineRepository();
    super(repo);
    this.vendingMachineRepository = repo;
  }

  /**
   * Crear una nueva máquina expendedora
   */
  async createVendingMachine(
    data: CreateVendingMachineDto
  ): Promise<VendingMachine> {
    return this.create(data);
  }

  /**
   * Actualizar una máquina expendedora
   */
  async updateVendingMachine(
    data: UpdateVendingMachineDto
  ): Promise<VendingMachine> {
    const { id, ...updates } = data;
    return this.update(id, updates);
  }

  /**
   * Buscar máquinas por service point
   */
  async findByServicePoint(servicePointId: string): Promise<VendingMachine[]> {
    const { data, error } =
      await this.vendingMachineRepository.findByServicePoint(servicePointId);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Buscar máquinas por estado
   */
  async findByStatus(status: string): Promise<VendingMachine[]> {
    const { data, error } = await this.vendingMachineRepository.findByStatus(
      status
    );

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}
