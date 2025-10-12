import {
  LocationRepository,
  CreateLocationDTO,
  UpdateLocationDTO,
} from "../repositories/location.repository";

export class LocationService {
  private locationRepository: LocationRepository;

  constructor() {
    this.locationRepository = new LocationRepository();
  }

  async list(filters?: {
    city?: string;
    province?: string;
    is_active?: boolean;
  }) {
    return this.locationRepository.findAll(filters);
  }

  async getById(id: string) {
    const location = await this.locationRepository.findById(id);
    if (!location) {
      throw new Error("Location not found");
    }
    return location;
  }

  async create(locationData: CreateLocationDTO) {
    // Validaciones de negocio si es necesario
    if (!locationData.city || !locationData.province) {
      throw new Error("City and province are required");
    }

    return this.locationRepository.create(locationData);
  }

  async update(id: string, locationData: UpdateLocationDTO) {
    // Verificar que existe
    await this.getById(id);

    return this.locationRepository.update(id, locationData);
  }

  async delete(id: string) {
    // Verificar que existe
    await this.getById(id);

    return this.locationRepository.delete(id);
  }
}
