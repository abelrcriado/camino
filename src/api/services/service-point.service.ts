/**
 * Service Point Service
 * Lógica de negocio para CSP, CSS, CSH
 */

import { ServicePointRepository } from "../repositories/service-point.repository";
import {
  CreateServicePointDTO,
  UpdateServicePointDTO,
  ServicePointDTO,
  ServicePointFilters,
  ServicePointType,
  RevenueStreamType,
  ServicePointRevenueStats,
  NetworkDashboardStats,
  CommissionModel,
} from "@/shared/dto/service-point.dto";

export class ServicePointService {
  constructor(private repository: ServicePointRepository) {}

  /**
   * Listar service points con filtros
   */
  async list(filters: ServicePointFilters): Promise<ServicePointDTO[]> {
    return await this.repository.findAll(filters);
  }

  /**
   * Obtener por ID
   */
  async getById(id: string): Promise<ServicePointDTO | null> {
    return await this.repository.findById(id);
  }

  /**
   * Crear service point
   */
  async create(data: CreateServicePointDTO): Promise<ServicePointDTO> {
    // Asignar commission model por defecto según tipo
    if (!data.commission_model) {
      data.commission_model = this.getDefaultCommissionModel(data.type);
    }

    return await this.repository.create(data);
  }

  /**
   * Actualizar service point
   */
  async update(
    id: string,
    data: UpdateServicePointDTO
  ): Promise<ServicePointDTO | null> {
    return await this.repository.update(id, data);
  }

  /**
   * Eliminar service point
   */
  async delete(id: string): Promise<boolean> {
    return await this.repository.delete(id);
  }

  /**
   * Obtener revenue de un service point
   */
  async getServicePointRevenue(
    id: string,
    startDate?: string,
    endDate?: string
  ): Promise<ServicePointRevenueStats> {
    const servicePoint = await this.repository.findById(id);

    if (!servicePoint) {
      // Use centralized NotFoundError for consistency
      const { NotFoundError } = await import("../errors/custom-errors");
      throw new NotFoundError("Service Point", id);
    }

    return await this.repository.getRevenueStats(id, startDate, endDate);
  }

  /**
   * Obtener estadísticas de toda la red
   */
  async getNetworkStats(
    startDate?: string,
    endDate?: string
  ): Promise<NetworkDashboardStats> {
    return await this.repository.getNetworkStats(startDate, endDate);
  }

  /**
   * Calcular comisión según tipo de service point y stream
   */
  calculateCommission(
    servicePoint: ServicePointDTO,
    grossAmount: number,
    streamType: RevenueStreamType
  ): {
    partnerCommission: number;
    networkRevenue: number;
  } {
    const commissionModel = servicePoint.commission_model || {};

    let partnerRate = 0;

    switch (servicePoint.type) {
      case ServicePointType.CSP:
        // CSP: Partner se lleva % según servicio
        if (streamType === RevenueStreamType.VENDING) {
          partnerRate = commissionModel.vending || 0.1; // 10% default
        } else if (streamType === RevenueStreamType.WORKSHOP_RENTAL) {
          partnerRate = commissionModel.workshop || 0.3; // 30% default
        } else if (streamType === RevenueStreamType.BIKE_WASH) {
          partnerRate = commissionModel.wash || 0.2; // 20% default
        } else if (streamType === RevenueStreamType.EBIKE_CHARGING) {
          partnerRate = commissionModel.charging || 0.15; // 15% default
        } else if (streamType === RevenueStreamType.ADVERTISING) {
          partnerRate = commissionModel.advertising || 0.5; // 50% default
        }
        break;

      case ServicePointType.CSS:
        // CSS: 100% para Camino
        partnerRate = 0;
        break;

      case ServicePointType.CSH:
        // CSH: Taller se lleva comisión por servicios profesionales
        if (streamType === RevenueStreamType.WORKSHOP_COMMISSION) {
          partnerRate = commissionModel.service_commission || 0.175; // 17.5% default
        } else {
          partnerRate = 0; // Otros ingresos son 100% Camino
        }
        break;
    }

    const partnerCommission = grossAmount * partnerRate;
    const networkRevenue = grossAmount - partnerCommission;

    return {
      partnerCommission: Number(partnerCommission.toFixed(2)),
      networkRevenue: Number(networkRevenue.toFixed(2)),
    };
  }

  /**
   * Obtener modelo de comisión por defecto según tipo
   */
  private getDefaultCommissionModel(type: ServicePointType): CommissionModel {
    switch (type) {
      case ServicePointType.CSP:
        return {
          vending: 0.1, // 10% partner
          workshop: 0.3, // 30% partner
          wash: 0.2, // 20% partner
          charging: 0.15, // 15% partner
          advertising: 0.5, // 50% partner
        };

      case ServicePointType.CSS:
        return {
          vending: 0, // 100% Camino
          workshop: 0, // 100% Camino
          wash: 0,
          charging: 0,
        };

      case ServicePointType.CSH:
        return {
          service_commission: 0.175, // 17.5% taller, 82.5% Camino
        };

      default:
        return {};
    }
  }

  /**
   * Validar que un service point puede ofrecer un servicio
   */
  canProvideService(
    servicePoint: ServicePointDTO,
    streamType: RevenueStreamType
  ): boolean {
    switch (streamType) {
      case RevenueStreamType.VENDING:
        return servicePoint.has_vending || false;

      case RevenueStreamType.WORKSHOP_RENTAL:
        return servicePoint.has_workshop_space || false;

      case RevenueStreamType.BIKE_WASH:
        return servicePoint.has_bike_wash || false;

      case RevenueStreamType.EBIKE_CHARGING:
        return servicePoint.has_ebike_charging || false;

      case RevenueStreamType.WORKSHOP_COMMISSION:
        return servicePoint.has_professional_service || false;

      case RevenueStreamType.ADVERTISING:
        // Todos pueden tener publicidad si tienen pantalla
        return servicePoint.has_digital_screen || false;

      case RevenueStreamType.SUBSCRIPTIONS:
      case RevenueStreamType.LUGGAGE_TRANSPORT:
      case RevenueStreamType.ACCOMMODATION_COMMISSION:
      case RevenueStreamType.SPARE_PARTS:
      case RevenueStreamType.LICENSING:
        // Estos servicios son a nivel de red, no por punto específico
        return true;

      default:
        return false;
    }
  }

  /**
   * Obtener service points por tipo
   */
  async getByType(type: ServicePointType): Promise<ServicePointDTO[]> {
    return await this.repository.findAll({ type });
  }

  /**
   * Obtener service points por ubicación
   */
  async getByLocation(locationId: string): Promise<ServicePointDTO[]> {
    return await this.repository.findAll({ location_id: locationId });
  }

  /**
   * Buscar service points
   */
  async search(query: string): Promise<ServicePointDTO[]> {
    return await this.repository.findAll({ search: query });
  }
}
