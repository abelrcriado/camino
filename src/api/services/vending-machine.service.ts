import {
  VendingMachineRepository,
  CreateVendingMachineDTO,
  UpdateVendingMachineDTO,
} from "../repositories/vending-machine.repository";
import { NotFoundError, ValidationError } from "../errors/custom-errors";

export class VendingMachineService {
  private vendingMachineRepository: VendingMachineRepository;

  constructor() {
    this.vendingMachineRepository = new VendingMachineRepository();
  }

  async list(filters?: { status?: string; service_point_id?: string }) {
    return this.vendingMachineRepository.findAll(filters);
  }

  async getById(id: string) {
    const machine = await this.vendingMachineRepository.findById(id);
    if (!machine) {
      throw new NotFoundError("Vending Machine", id);
    }
    return machine;
  }

  async create(machineData: CreateVendingMachineDTO) {
    // Validaciones
    if (!machineData.service_point_id) {
      throw new ValidationError("Service point ID is required");
    }

    if (!machineData.machine_code) {
      throw new ValidationError("Machine code is required");
    }

    if (!machineData.name) {
      throw new ValidationError("Machine name is required");
    }

    return this.vendingMachineRepository.create(machineData);
  }

  async update(id: string, machineData: UpdateVendingMachineDTO) {
    // Verificar que existe
    await this.getById(id);

    return this.vendingMachineRepository.update(id, machineData);
  }

  async delete(id: string) {
    // Verificar que existe
    await this.getById(id);

    return this.vendingMachineRepository.delete(id);
  }
}
