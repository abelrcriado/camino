// Service para lógica de negocio de Caminos
import { BaseService } from "./base.service";
import { CaminoRepository } from "../repositories/camino.repository";
import type {
  Camino,
  CreateCaminoDto,
  UpdateCaminoDto,
  CaminoStats,
} from "../dto/camino.dto";
import {
  ConflictError,
  DatabaseError,
  NotFoundError,
} from "../errors/custom-errors";

export class CaminoService extends BaseService<Camino> {
  private caminoRepository: CaminoRepository;

  constructor(repository?: CaminoRepository) {
    const repo = repository || new CaminoRepository();
    super(repo);
    this.caminoRepository = repo;
  }

  /**
   * Crea un nuevo camino
   */
  async createCamino(data: CreateCaminoDto): Promise<Camino> {
    // Validar que el código no exista
    const { exists, error: existsError } =
      await this.caminoRepository.codigoExists(data.codigo);

    if (existsError) {
      throw new DatabaseError("Error al validar código de camino", {
        codigo: data.codigo,
      });
    }

    if (exists) {
      throw new ConflictError(`El código '${data.codigo}' ya está registrado`);
    }

    // Validar estado operativo si se proporciona
    if (data.estado_operativo) {
      this.validateEstadoOperativo(data.estado_operativo);
    }

    return this.create(data);
  }

  /**
   * Actualiza un camino
   */
  async updateCamino(data: UpdateCaminoDto): Promise<Camino> {
    const { id, ...updates } = data;

    // Validar que el camino existe
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError("Camino", id);
    }

    // Si se actualiza el código, validar que no exista
    if (updates.codigo) {
      const { exists, error: existsError } =
        await this.caminoRepository.codigoExists(updates.codigo, id);

      if (existsError) {
        throw new DatabaseError("Error al validar código de camino", {
          codigo: updates.codigo,
        });
      }

      if (exists) {
        throw new ConflictError(
          `El código '${updates.codigo}' ya está registrado`
        );
      }
    }

    // Validar estado operativo si se proporciona
    if (updates.estado_operativo) {
      this.validateEstadoOperativo(updates.estado_operativo);
    }

    return this.update(id, updates);
  }

  /**
   * Buscar camino por código
   */
  async findByCodigo(codigo: string): Promise<Camino | null> {
    const { data, error } = await this.caminoRepository.findByCodigo(codigo);

    if (error) {
      // Si el error es "no rows", no es error, simplemente no existe
      if (error.code === "PGRST116") {
        return null;
      }
      throw new DatabaseError("Error al buscar camino por código", {
        codigo,
        error: error.message,
      });
    }

    return data;
  }

  /**
   * Buscar caminos por estado operativo
   */
  async findByEstado(estado: string): Promise<Camino[]> {
    this.validateEstadoOperativo(estado);

    const { data, error } = await this.caminoRepository.findByEstado(estado);

    if (error) {
      throw new DatabaseError("Error al buscar caminos por estado", {
        estado,
        error: error.message,
      });
    }

    return data || [];
  }

  /**
   * Buscar caminos por región
   */
  async findByRegion(region: string): Promise<Camino[]> {
    const { data, error } = await this.caminoRepository.findByRegion(region);

    if (error) {
      throw new DatabaseError("Error al buscar caminos por región", {
        region,
        error: error.message,
      });
    }

    return data || [];
  }

  /**
   * Obtener estadísticas completas de un camino
   */
  async getStats(caminoId: string): Promise<CaminoStats> {
    const { data, error } = await this.caminoRepository.getStats(caminoId);

    if (error) {
      throw new DatabaseError("Error al obtener estadísticas del camino", {
        caminoId,
        error,
      });
    }

    if (!data) {
      throw new NotFoundError("Camino", caminoId);
    }

    return data;
  }

  /**
   * Obtener camino con sus ubicaciones
   */
  async getWithUbicaciones(caminoId: string) {
    const { data, error } = await this.caminoRepository.getWithUbicaciones(
      caminoId
    );

    if (error) {
      throw new DatabaseError("Error al obtener camino con ubicaciones", {
        caminoId,
        error,
      });
    }

    if (!data) {
      throw new NotFoundError("Camino", caminoId);
    }

    return data;
  }

  /**
   * Obtener resumen de todos los caminos
   */
  async getAllSummary() {
    const { data, error } = await this.caminoRepository.getAllSummary();

    if (error) {
      throw new DatabaseError("Error al obtener resumen de caminos", { error });
    }

    return data || [];
  }

  /**
   * Activar un camino
   */
  async activar(caminoId: string): Promise<Camino> {
    return this.update(caminoId, { estado_operativo: "activo" });
  }

  /**
   * Desactivar un camino
   */
  async desactivar(caminoId: string): Promise<Camino> {
    return this.update(caminoId, { estado_operativo: "inactivo" });
  }

  /**
   * Poner camino en mantenimiento
   */
  async ponerEnMantenimiento(caminoId: string): Promise<Camino> {
    return this.update(caminoId, { estado_operativo: "mantenimiento" });
  }

  /**
   * Validación privada de estado operativo
   */
  private validateEstadoOperativo(estado: string): void {
    const estadosValidos = [
      "activo",
      "inactivo",
      "mantenimiento",
      "planificado",
    ];
    if (!estadosValidos.includes(estado)) {
      throw new Error(
        `Estado operativo inválido: ${estado}. Debe ser uno de: ${estadosValidos.join(
          ", "
        )}`
      );
    }
  }
}
