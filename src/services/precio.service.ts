/**
 * SPRINT 4.2: SISTEMA DE PRECIOS JERÁRQUICO
 * Service Layer - Lógica de negocio para el sistema de precios
 *
 * Responsabilidades:
 * - Validar jerarquía de precios (BASE, UBICACION, SERVICE_POINT)
 * - Validar vigencia y prevenir overlaps
 * - Aplicar reglas de negocio específicas
 * - Coordinar entre repository y controller
 */

import { BaseService } from "./base.service";
import { PrecioRepository } from "@/repositories/precio.repository";
import {
  NotFoundError,
  BusinessRuleError,
  DatabaseError,
} from "@/errors/custom-errors";
import {
  Precio,
  CreatePrecioDto,
  UpdatePrecioDto,
  PrecioFilters,
  PrecioResuelto,
  PrecioVigente,
  NivelPrecio,
  EntidadTipo,
  PrecioStats,
  GetPrecioAplicableParams,
} from "@/dto/precio.dto";

export class PrecioService extends BaseService<Precio> {
  protected repository: PrecioRepository;

  constructor(repository?: PrecioRepository) {
    super(repository || new PrecioRepository());
    this.repository = repository || new PrecioRepository();
  }

  /**
   * Crea un nuevo precio con validaciones de negocio
   */
  async create(data: CreatePrecioDto): Promise<Precio> {
    try {
      // Validación 1: Jerarquía correcta según nivel
      this.validateJerarquia(
        data.nivel,
        data.ubicacion_id,
        data.service_point_id
      );

      // Validación 2: No debe existir precio vigente en el mismo nivel/contexto
      await this.validateNoDuplicadoVigente(
        data.entidad_tipo,
        data.entidad_id,
        data.nivel,
        data.ubicacion_id,
        data.service_point_id
      );

      // Validación 3: Fecha inicio no puede ser futura (opcional, depende de política)
      // Validación 4: Fecha fin debe ser posterior a fecha inicio (ya validado en schema)

      // Crear precio
      const result = await this.repository.create(data);

      if (!result.data || result.data.length === 0) {
        throw new DatabaseError("Error al crear el precio");
      }

      return result.data[0] as Precio;
    } catch (error) {
      if (error instanceof BusinessRuleError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al crear precio",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Actualiza un precio existente con validaciones
   */
  async update(id: string, data: UpdatePrecioDto): Promise<Precio> {
    try {
      // Verificar que el precio existe
      const existing = await this.findById(id);
      if (!existing) {
        throw new NotFoundError("Precio", id);
      }

      // Validación: No se pueden modificar campos estructurales
      // (nivel, entidad_tipo, entidad_id, ubicacion_id, service_point_id)
      // Para cambiarlos, se debe crear un nuevo precio
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dataAny = data as any;
      if (dataAny.nivel !== undefined) {
        throw new BusinessRuleError("No se puede cambiar el nivel de un precio existente");
      }
      if (dataAny.entidad_tipo !== undefined) {
        throw new BusinessRuleError(
          "No se puede cambiar el tipo de entidad de un precio existente"
        );
      }
      if (dataAny.entidad_id !== undefined) {
        throw new BusinessRuleError("No se puede cambiar la entidad de un precio existente");
      }
      if (dataAny.ubicacion_id !== undefined) {
        throw new BusinessRuleError(
          "No se puede cambiar la ubicación de un precio existente"
        );
      }
      if (dataAny.service_point_id !== undefined) {
        throw new BusinessRuleError(
          "No se puede cambiar el service point de un precio existente"
        );
      }

      // Validación: Si se actualiza fecha_fin, validar que no genere overlaps
      if (data.fecha_fin) {
        // TODO: Implementar validación de overlaps si es necesario
      }

      const result = await this.repository.update(id, data);

      if (!result.data || result.data.length === 0) {
        throw new DatabaseError("Error al actualizar el precio");
      }

      return result.data[0] as Precio;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BusinessRuleError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al actualizar precio",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Elimina un precio (soft delete estableciendo fecha_fin)
   * Mejor práctica: No eliminar físicamente precios por trazabilidad
   */
  async softDelete(id: string): Promise<Precio> {
    try {
      const hoy = new Date().toISOString().split("T")[0];
      return this.update(id, {
        id,
        fecha_fin: hoy,
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BusinessRuleError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al desactivar precio",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Elimina físicamente un precio
   * Solo usar en casos excepcionales (errores de carga, testing)
   */
  async hardDelete(id: string): Promise<void> {
    try {
      const result = await this.repository.delete(id);
      if (result.error) {
        throw new DatabaseError(
          "Error al eliminar precio",
          { originalError: result.error.message }
        );
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al eliminar precio",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtiene un precio por ID (sobrescribe método base)
   */
  async findById(id: string): Promise<Precio> {
    try {
      const result = await this.repository.findById(id);
      if (result.error) {
        throw new DatabaseError(
          "Error al buscar precio",
          { originalError: result.error.message }
        );
      }
      if (!result.data) {
        throw new NotFoundError("Precio", id);
      }
      return result.data as Precio;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(
        "Error al buscar precio",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtiene precios con filtros y paginación custom
   */
  async findAllWithFilters(
    filters?: PrecioFilters
  ): Promise<{ data: Precio[]; total: number }> {
    try {
      return await this.repository.getPreciosWithFilters(filters);
    } catch (error) {
      throw new DatabaseError(
        "Error al obtener precios",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtiene precios vigentes con datos desnormalizados
   */
  async getPreciosVigentes(
    filters?: Partial<PrecioFilters>
  ): Promise<{ data: PrecioVigente[]; total: number }> {
    try {
      return await this.repository.getPreciosVigentes(filters);
    } catch (error) {
      throw new DatabaseError(
        "Error al obtener precios vigentes",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Resuelve el precio aplicable según jerarquía
   * Esta es la función principal para obtener el precio correcto
   */
  async resolverPrecio(
    params: GetPrecioAplicableParams
  ): Promise<PrecioResuelto | null> {
    try {
      return await this.repository.resolverPrecio(
        params.entidad_tipo,
        params.entidad_id,
        params.ubicacion_id,
        params.service_point_id,
        params.fecha
      );
    } catch (error) {
      throw new DatabaseError(
        "Error al resolver precio",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtiene solo el monto del precio aplicable (céntimos)
   */
  async getPrecioAplicable(
    params: GetPrecioAplicableParams
  ): Promise<number | null> {
    try {
      return await this.repository.getPrecioAplicable(
        params.entidad_tipo,
        params.entidad_id,
        params.ubicacion_id,
        params.service_point_id,
        params.fecha
      );
    } catch (error) {
      throw new DatabaseError(
        "Error al obtener precio aplicable",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtiene precios por nivel
   */
  async getPreciosByNivel(
    nivel: NivelPrecio,
    vigente?: boolean
  ): Promise<Precio[]> {
    try {
      return await this.repository.getPreciosByNivel(nivel, vigente);
    } catch (error) {
      throw new DatabaseError(
        "Error al obtener precios por nivel",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtiene precios de una entidad específica
   */
  async getPreciosByEntidad(
    entidadTipo: EntidadTipo,
    entidadId: string,
    vigente?: boolean
  ): Promise<Precio[]> {
    try {
      return await this.repository.getPreciosByEntidad(
        entidadTipo,
        entidadId,
        vigente
      );
    } catch (error) {
      throw new DatabaseError(
        "Error al obtener precios por entidad",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtiene estadísticas de precios
   */
  async getStats(): Promise<PrecioStats> {
    try {
      return await this.repository.getStats();
    } catch (error) {
      throw new DatabaseError(
        "Error al obtener estadísticas",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Obtiene el historial de precios de una entidad
   */
  async getHistorial(
    entidadTipo: EntidadTipo,
    entidadId: string,
    nivel?: NivelPrecio
  ): Promise<Precio[]> {
    try {
      return await this.repository.getHistorial(entidadTipo, entidadId, nivel);
    } catch (error) {
      throw new DatabaseError(
        "Error al obtener historial",
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  // =====================================================
  // MÉTODOS PRIVADOS DE VALIDACIÓN
  // =====================================================

  /**
   * Valida que la jerarquía sea correcta según el nivel
   */
  private validateJerarquia(
    nivel: NivelPrecio,
    ubicacionId?: string | null,
    servicePointId?: string | null
  ): void {
    switch (nivel) {
      case NivelPrecio.BASE:
        if (ubicacionId || servicePointId) {
          throw new BusinessRuleError(
            "El nivel BASE no puede tener ubicacion_id ni service_point_id"
          );
        }
        break;

      case NivelPrecio.UBICACION:
        if (!ubicacionId) {
          throw new BusinessRuleError("El nivel UBICACION requiere ubicacion_id");
        }
        if (servicePointId) {
          throw new BusinessRuleError("El nivel UBICACION no puede tener service_point_id");
        }
        break;

      case NivelPrecio.SERVICE_POINT:
        if (!ubicacionId || !servicePointId) {
          throw new BusinessRuleError(
            "El nivel SERVICE_POINT requiere ubicacion_id y service_point_id"
          );
        }
        break;

      default:
        throw new BusinessRuleError(`Nivel de precio no válido: ${nivel}`);
    }
  }

  /**
   * Valida que no exista un precio vigente duplicado
   */
  private async validateNoDuplicadoVigente(
    entidadTipo: EntidadTipo,
    entidadId: string,
    nivel: NivelPrecio,
    ubicacionId?: string | null,
    servicePointId?: string | null,
    excludeId?: string
  ): Promise<void> {
    const exists = await this.repository.existsPrecioVigente(
      entidadTipo,
      entidadId,
      nivel,
      ubicacionId || undefined,
      servicePointId || undefined,
      excludeId
    );

    if (exists) {
      let contexto = "";
      switch (nivel) {
        case NivelPrecio.BASE:
          contexto = "global (BASE)";
          break;
        case NivelPrecio.UBICACION:
          contexto = `ubicación ${ubicacionId}`;
          break;
        case NivelPrecio.SERVICE_POINT:
          contexto = `service point ${servicePointId}`;
          break;
      }

      throw new BusinessRuleError(
        `Ya existe un precio vigente para esta entidad en el nivel ${contexto}. ` +
          `Desactiva el precio anterior antes de crear uno nuevo.`
      );
    }
  }

  /**
   * Crea un precio base para un producto
   * Helper method para facilitar operaciones comunes
   */
  async crearPrecioBase(
    entidadTipo: EntidadTipo,
    entidadId: string,
    precio: number,
    notas?: string
  ): Promise<Precio> {
    return this.create({
      nivel: NivelPrecio.BASE,
      entidad_tipo: entidadTipo,
      entidad_id: entidadId,
      precio,
      notas,
    });
  }

  /**
   * Crea un precio override para una ubicación
   */
  async crearPrecioUbicacion(
    entidadTipo: EntidadTipo,
    entidadId: string,
    ubicacionId: string,
    precio: number,
    notas?: string
  ): Promise<Precio> {
    return this.create({
      nivel: NivelPrecio.UBICACION,
      entidad_tipo: entidadTipo,
      entidad_id: entidadId,
      ubicacion_id: ubicacionId,
      precio,
      notas,
    });
  }

  /**
   * Crea un precio override para un service point
   */
  async crearPrecioServicePoint(
    entidadTipo: EntidadTipo,
    entidadId: string,
    ubicacionId: string,
    servicePointId: string,
    precio: number,
    notas?: string
  ): Promise<Precio> {
    return this.create({
      nivel: NivelPrecio.SERVICE_POINT,
      entidad_tipo: entidadTipo,
      entidad_id: entidadId,
      ubicacion_id: ubicacionId,
      service_point_id: servicePointId,
      precio,
      notas,
    });
  }
}
