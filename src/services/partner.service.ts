// Service para lógica de negocio de Partner
import { BaseService } from "./base.service";
import { PartnerRepository } from "../repositories/partner.repository";
import type {
  Partner,
  CreatePartnerDto,
  UpdatePartnerDto,
} from "../dto/partner.dto";

export class PartnerService extends BaseService<Partner> {
  private partnerRepository: PartnerRepository;

  constructor(repository?: PartnerRepository) {
    const repo = repository || new PartnerRepository();
    super(repo);
    this.partnerRepository = repo;
  }

  /**
   * Crear un nuevo partner
   */
  async createPartner(data: CreatePartnerDto): Promise<Partner> {
    return this.create(data);
  }

  /**
   * Actualizar un partner
   */
  async updatePartner(data: UpdatePartnerDto): Promise<Partner> {
    const { id, ...updates } = data;
    return this.update(id, updates);
  }

  /**
   * Buscar partners por tipo
   */
  async findByType(type: string): Promise<Partner[]> {
    const { data, error } = await this.partnerRepository.findByType(type);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}
