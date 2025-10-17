/**
 * Service Layer: VentaApp
 * Business logic for ventas from mobile app
 */

import { VentaAppRepository } from "../repositories/venta_app.repository";
import { BaseService } from "./base.service";
import {
  VentaApp,
  CreateVentaAppDto,
  UpdateVentaAppDto,
  VentaAppFilters,
  ReservarStockDto,
  ConfirmarPagoDto,
  ConfirmarRetiroDto,
  CancelarVentaDto,
  CrearYPagarVentaDto,
  ReservarStockResponse,
  ConfirmarPagoResponse,
  ConfirmarRetiroResponse,
  CancelarVentaResponse,
  VentaActiva,
  VentaPorExpirar,
  EstadisticasVentas,
  LiberarStockExpiradoResponse,
  NotificacionVentaPorExpirar,
  VentaAppFull,
  EstadoVenta,
} from "@/shared/dto/venta_app.dto";
import {
  ValidationError,
  NotFoundError,
  BusinessRuleError,
  DatabaseError,
} from "../errors/custom-errors";

export class VentaAppService extends BaseService<VentaApp> {
  constructor(private ventaRepository: VentaAppRepository) {
    super(ventaRepository);
  }

  /**
   * Validar transición de estado
   */
  private validateEstadoTransition(
    currentEstado: EstadoVenta,
    newEstado: EstadoVenta
  ): void {
    const validTransitions: Record<EstadoVenta, EstadoVenta[]> = {
      borrador: ["reservado", "cancelado"],
      reservado: ["pagado", "cancelado", "expirado"],
      pagado: ["completado", "cancelado", "expirado"],
      completado: [],
      cancelado: [],
      expirado: [],
    };

    const allowedTransitions = validTransitions[currentEstado] || [];

    if (!allowedTransitions.includes(newEstado)) {
      throw new BusinessRuleError(
        `Transición de estado inválida: ${currentEstado} → ${newEstado}`
      );
    }
  }

  /**
   * Validar que venta existe y retornar
   */
  private async getVentaOrThrow(ventaId: string): Promise<VentaApp> {
    const result = await this.ventaRepository.findById(ventaId);

    if (result.error || !result.data) {
      throw new NotFoundError("Venta", ventaId);
    }

    return result.data;
  }

  /**
   * Crear nueva venta (RPC)
   */
  async createVenta(dto: CreateVentaAppDto): Promise<VentaApp> {
    try {
      // Validación: cantidad > 0
      if (dto.cantidad && dto.cantidad <= 0) {
        throw new ValidationError("La cantidad debe ser mayor a 0");
      }

      const venta = await this.ventaRepository.crearVenta(dto);
      return venta;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof BusinessRuleError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al crear venta",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Reservar stock (RPC: borrador → reservado)
   */
  async reservarStock(dto: ReservarStockDto): Promise<ReservarStockResponse> {
    try {
      // Validar que venta existe
      const venta = await this.getVentaOrThrow(dto.venta_id);

      // Validar transición de estado
      this.validateEstadoTransition(venta.estado, "reservado");

      const result = await this.ventaRepository.reservarStock(dto.venta_id);
      return result;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BusinessRuleError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al reservar stock",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Confirmar pago (RPC: reservado → pagado)
   */
  async confirmarPago(dto: ConfirmarPagoDto): Promise<ConfirmarPagoResponse> {
    try {
      // Validar que venta existe
      const venta = await this.getVentaOrThrow(dto.venta_id);

      // Validar transición de estado
      this.validateEstadoTransition(venta.estado, "pagado");

      // Validar tiempo de expiración
      const tiempoExpiracion = dto.tiempo_expiracion_minutos || 60;
      if (tiempoExpiracion < 1 || tiempoExpiracion > 1440) {
        throw new ValidationError(
          "Tiempo de expiración debe estar entre 1 y 1440 minutos"
        );
      }

      const result = await this.ventaRepository.confirmarPago(
        dto.venta_id,
        dto.payment_id,
        tiempoExpiracion
      );
      return result;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError || error instanceof BusinessRuleError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al confirmar pago",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Confirmar retiro (RPC: pagado → completado)
   */
  async confirmarRetiro(
    dto: ConfirmarRetiroDto
  ): Promise<ConfirmarRetiroResponse> {
    try {
      // Validar que venta existe
      const venta = await this.getVentaOrThrow(dto.venta_id);

      // Validar transición de estado
      this.validateEstadoTransition(venta.estado, "completado");

      // Validar que tiene código de retiro
      if (!venta.codigo_retiro) {
        throw new ValidationError(
          "La venta no tiene código de retiro generado"
        );
      }

      const result = await this.ventaRepository.confirmarRetiro(
        dto.venta_id,
        dto.codigo_retiro
      );
      return result;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError || error instanceof BusinessRuleError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al confirmar retiro",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Cancelar venta (RPC: cualquier estado → cancelado)
   */
  async cancelarVenta(dto: CancelarVentaDto): Promise<CancelarVentaResponse> {
    try {
      // Validar que venta existe
      const venta = await this.getVentaOrThrow(dto.venta_id);

      // Validar que no esté ya en estado terminal
      if (["completado", "cancelado", "expirado"].includes(venta.estado)) {
        throw new ValidationError(
          `No se puede cancelar una venta en estado ${venta.estado}`
        );
      }

      // Validar motivo (opcional pero recomendado)
      const motivo = dto.motivo || "Cancelado por usuario";

      const result = await this.ventaRepository.cancelarVenta(
        dto.venta_id,
        motivo
      );
      return result;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError || error instanceof BusinessRuleError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al cancelar venta",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Crear y pagar venta en una operación (combina crear + reservar + pagar)
   */
  async crearYPagarVenta(
    dto: CrearYPagarVentaDto
  ): Promise<ConfirmarPagoResponse> {
    try {
      // 1. Crear venta
      const venta = await this.createVenta({
        slot_id: dto.slot_id,
        user_id: dto.user_id,
        producto_id: dto.producto_id,
        cantidad: dto.cantidad,
        metadata: dto.metadata,
      });

      // 2. Reservar stock
      await this.reservarStock({ venta_id: venta.id });

      // 3. Confirmar pago
      const pagoResult = await this.confirmarPago({
        venta_id: venta.id,
        payment_id: dto.payment_id,
        tiempo_expiracion_minutos: dto.tiempo_expiracion_minutos,
      });

      return pagoResult;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError || error instanceof BusinessRuleError) {
        throw error;
      }
      throw new DatabaseError(
        "Error en crear y pagar venta",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtener ventas con filtros y paginación
   */
  async getVentas(
    filters?: VentaAppFilters
  ): Promise<{ data: VentaApp[]; count: number }> {
    try {
      // Convertir VentaAppFilters a QueryFilters para BaseRepository
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await this.ventaRepository.findAll(filters as any);

      if (result.error) {
        throw new DatabaseError(
          "Error al obtener ventas",
          { originalError: result.error instanceof Error ? result.error.message : String(result.error) }
        );
      }

      return {
        data: result.data || [],
        count: result.count || 0,
      };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al obtener ventas",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtener ventas full (con JOINs) desde view
   */
  async getVentasFull(
    filters?: VentaAppFilters
  ): Promise<{ data: VentaAppFull[]; count: number }> {
    try {
      const result = await this.ventaRepository.findFullVentas(filters);

      return {
        data: result || [],
        count: result?.length || 0,
      };
    } catch (error) {
      throw new DatabaseError(
        "Error al obtener ventas full",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtener ventas activas de un usuario (RPC)
   */
  async getVentasActivas(userId: string): Promise<VentaActiva[]> {
    try {
      const ventas = await this.ventaRepository.getVentasActivasUsuario(userId);
      return ventas;
    } catch (error) {
      throw new DatabaseError(
        "Error al obtener ventas activas",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtener ventas por expirar (view)
   */
  async getVentasPorExpirar(minutos: number = 10): Promise<VentaPorExpirar[]> {
    try {
      if (minutos < 1 || minutos > 1440) {
        throw new ValidationError("Minutos debe estar entre 1 y 1440");
      }

      // El repository no acepta parámetro, filtramos después
      const allVentas = await this.ventaRepository.getVentasPorExpirar();

      // Filtrar por minutos restantes
      const now = new Date();
      const filtered = allVentas.filter((venta) => {
        if (!venta.fecha_expiracion) return false;
        const expirationDate = new Date(venta.fecha_expiracion);
        const minutesLeft =
          (expirationDate.getTime() - now.getTime()) / (1000 * 60);
        return minutesLeft <= minutos;
      });

      return filtered;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al obtener ventas por expirar",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtener estadísticas (view)
   */
  async getEstadisticas(): Promise<EstadisticasVentas> {
    try {
      const result = await this.ventaRepository.getEstadisticas();
      return result;
    } catch (error) {
      throw new DatabaseError(
        "Error al obtener estadísticas de ventas",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Liberar stock expirado (admin RPC)
   */
  async liberarStockExpirado(): Promise<LiberarStockExpiradoResponse> {
    try {
      const result = await this.ventaRepository.liberarStockExpirado();
      return result;
    } catch (error) {
      throw new DatabaseError(
        "Error al liberar stock expirado",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtener notificaciones de ventas por expirar (RPC)
   */
  async getNotificacionesVentasPorExpirar(
    minutos: number = 5
  ): Promise<NotificacionVentaPorExpirar[]> {
    try {
      if (minutos < 1 || minutos > 60) {
        throw new ValidationError("Minutos debe estar entre 1 y 60");
      }

      // El repository no acepta parámetros, filtramos después
      const allNotif =
        await this.ventaRepository.getNotificacionesVentasPorExpirar();

      // Filtrar por minutos restantes
      const filtered = allNotif.filter(
        (notif) => notif.minutos_restantes <= minutos
      );

      return filtered;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al obtener notificaciones",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Buscar venta por código de retiro
   */
  async findByCodigoRetiro(codigo: string): Promise<VentaApp | null> {
    try {
      // Validar formato de código
      const codigoRegex = /^[A-Z0-9]{6,10}$/;
      if (!codigoRegex.test(codigo)) {
        throw new ValidationError(
          "Formato de código de retiro inválido (debe ser 6-10 caracteres alfanuméricos en mayúsculas)"
        );
      }

      const result = await this.ventaRepository.findByCodigoRetiro(codigo);

      if (result.error) {
        throw new DatabaseError(
          "Error al buscar venta",
          { originalError: result.error instanceof Error ? result.error.message : String(result.error) }
        );
      }

      return result.data;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al buscar venta por código",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Actualizar venta (solo metadata y notas)
   */
  async updateVenta(id: string, dto: UpdateVentaAppDto): Promise<VentaApp> {
    try {
      // Validar que venta existe
      await this.getVentaOrThrow(id);

      // Solo permitir actualización de metadata y notas
      const updateData: Partial<VentaApp> = {};

      if (dto.metadata !== undefined) {
        updateData.metadata = dto.metadata;
      }

      if (dto.notas !== undefined) {
        updateData.notas = dto.notas;
      }

      // Si no hay campos para actualizar, retornar error
      if (Object.keys(updateData).length === 0) {
        throw new ValidationError(
          "No hay campos válidos para actualizar (solo metadata y notas)"
        );
      }

      const result = await this.ventaRepository.update(id, updateData);

      if (result.error || !result.data) {
        throw new DatabaseError(
          "Error al actualizar venta",
          { originalError: result.error instanceof Error ? result.error.message : String(result.error) }
        );
      }

      // result.data es un array, necesitamos el primer elemento
      return Array.isArray(result.data) ? result.data[0] : result.data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al actualizar venta",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Eliminar venta (solo borradores sin stock reservado)
   */
  async deleteVenta(id: string): Promise<boolean> {
    try {
      // Validar que venta existe
      const venta = await this.getVentaOrThrow(id);

      // Solo permitir eliminar ventas en estado borrador
      if (venta.estado !== "borrador") {
        throw new ValidationError(
          `No se puede eliminar una venta en estado ${venta.estado}. Use cancelarVenta() para estados avanzados.`
        );
      }

      const result = await this.ventaRepository.delete(id);

      if (result.error) {
        throw new DatabaseError(
          "Error al eliminar venta",
          { originalError: result.error instanceof Error ? result.error.message : String(result.error) }
        );
      }

      return true;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al eliminar venta",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Verificar si venta existe
   */
  async exists(id: string): Promise<boolean> {
    try {
      const result = await this.ventaRepository.exists(id);
      return result;
    } catch {
      return false;
    }
  }

  /**
   * Contar ventas por estado
   */
  async countByEstado(estado: EstadoVenta): Promise<number> {
    try {
      const result = await this.ventaRepository.countByEstado(estado);
      return result;
    } catch (error) {
      throw new DatabaseError(
        "Error al contar ventas",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Contar ventas de un usuario
   */
  async countByUser(userId: string): Promise<number> {
    try {
      const result = await this.ventaRepository.countByUser(userId);
      return result;
    } catch (error) {
      throw new DatabaseError(
        "Error al contar ventas de usuario",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtener ingresos por estado
   */
  async getIngresosByEstado(estado: EstadoVenta): Promise<number> {
    try {
      const result = await this.ventaRepository.getIngresosByEstado(estado);
      return result;
    } catch (error) {
      throw new DatabaseError(
        "Error al obtener ingresos",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }
}
