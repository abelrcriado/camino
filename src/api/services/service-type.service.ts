import {
  ServiceTypeRepository,
  ServiceType,
} from "@/api/repositories/service-type.repository";

export class ServiceTypeService {
  private repository: ServiceTypeRepository;

  constructor() {
    this.repository = new ServiceTypeRepository();
  }

  async list(isActiveOnly: boolean = true): Promise<ServiceType[]> {
    return this.repository.findAll(isActiveOnly);
  }

  async getById(id: string): Promise<ServiceType | null> {
    return this.repository.findById(id);
  }

  async getByCode(code: string): Promise<ServiceType | null> {
    return this.repository.findByCode(code);
  }
}
