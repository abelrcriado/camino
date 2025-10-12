import {
  VendingMachineRepository,
  CreateVendingMachineDTO,
  UpdateVendingMachineDTO,
} from "../repositories/vending-machine.repository";

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
      throw new Error("Vending machine not found");
    }
    return machine;
  }

  async create(machineData: CreateVendingMachineDTO) {
    // Validaciones
    if (!machineData.service_point_id) {
      throw new Error("Service point ID is required");
    }

    if (!machineData.machine_code) {
      throw new Error("Machine code is required");
    }

    if (!machineData.name) {
      throw new Error("Machine name is required");
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
