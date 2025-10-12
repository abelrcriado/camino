/**
 * SPRINT 4.2: SISTEMA DE PRECIOS JERÁRQUICO
 * Controller Layer - Manejo de peticiones HTTP para el sistema de precios
 *
 * Responsabilidades:
 * - Validar requests con Zod schemas
 * - Delegar lógica de negocio al service
 * - Formatear responses según estándares
 * - Manejo de errores HTTP
 */

import { NextApiRequest, NextApiResponse } from "next";
import { PrecioService } from "@/services/precio.service";
import {
  createPrecioSchema,
  updatePrecioSchema,
  deletePrecioSchema,
  queryPreciosSchema,
  getPrecioAplicableSchema,
  queryPreciosVigentesSchema,
} from "@/schemas/precio.schema";
import type { NivelPrecio, EntidadTipo } from "@/dto/precio.dto";

export class PrecioController {
  private service: PrecioService;

  constructor(service?: PrecioService) {
    this.service = service || new PrecioService();
  }

  /**
   * Maneja todas las peticiones del endpoint /api/precios
   */
  async handleRequest(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      const { method } = req;

      switch (method) {
        case "GET":
          await this.handleGet(req, res);
          break;
        case "POST":
          await this.handlePost(req, res);
          break;
        case "PUT":
          await this.handlePut(req, res);
          break;
        case "DELETE":
          await this.handleDelete(req, res);
          break;
        default:
          res.status(405).json({ error: "Método no permitido" });
      }
    } catch (error) {
      console.error("Error en PrecioController:", error);
      res.status(500).json({
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  /**
   * Maneja peticiones GET
   * - GET /api/precios?action=vigentes - Lista precios vigentes
   * - GET /api/precios?action=aplicable - Resuelve precio aplicable
   * - GET /api/precios?action=stats - Obtiene estadísticas
   * - GET /api/precios - Lista todos los precios con filtros
   */
  private async handleGet(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      const { action } = req.query;

      if (action === "vigentes") {
        await this.getPreciosVigentes(req, res);
      } else if (action === "aplicable") {
        await this.getPrecioAplicable(req, res);
      } else if (action === "stats") {
        await this.getStats(req, res);
      } else {
        await this.getPrecios(req, res);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene precios con filtros y paginación
   */
  private async getPrecios(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      // Validar query params
      const validation = queryPreciosSchema.safeParse(req.query);

      if (!validation.success) {
        res.status(400).json({
          error: "Parámetros de consulta inválidos",
          details: validation.error.issues,
        });
        return;
      }

      const filters = validation.data;

      // Obtener precios del servicio
      const { data, total } = await this.service.findAllWithFilters(filters);

      // Calcular metadata de paginación
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      throw new Error(
        `Error al obtener precios: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Obtiene precios vigentes con datos desnormalizados
   */
  private async getPreciosVigentes(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      // Validar query params
      const validation = queryPreciosVigentesSchema.safeParse(req.query);

      if (!validation.success) {
        res.status(400).json({
          error: "Parámetros de consulta inválidos",
          details: validation.error.issues,
        });
        return;
      }

      const filters = validation.data;

      // Obtener precios vigentes del servicio
      // Nota: order_by puede tener 'dias_restantes' que no está en PrecioFilters
       
      const { data, total } = await this.service.getPreciosVigentes(
        filters as any
      );

      // Calcular metadata de paginación
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      throw new Error(
        `Error al obtener precios vigentes: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Resuelve el precio aplicable según jerarquía
   */
  private async getPrecioAplicable(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      // Validar query params
      const validation = getPrecioAplicableSchema.safeParse(req.query);

      if (!validation.success) {
        res.status(400).json({
          error: "Parámetros de consulta inválidos",
          details: validation.error.issues,
        });
        return;
      }

      const params = validation.data;

      // Resolver precio
      const precio = await this.service.resolverPrecio(params);

      if (!precio) {
        res.status(404).json({
          error: "No se encontró un precio aplicable para esta entidad",
        });
        return;
      }

      res.status(200).json({ data: precio });
    } catch (error) {
      throw new Error(
        `Error al resolver precio: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Obtiene estadísticas de precios
   */
  private async getStats(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      const stats = await this.service.getStats();
      res.status(200).json({ data: stats });
    } catch (error) {
      throw new Error(
        `Error al obtener estadísticas: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Maneja peticiones POST
   */
  private async handlePost(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      // Validar body
      const validation = createPrecioSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          error: "Datos de entrada inválidos",
          details: validation.error.issues,
        });
        return;
      }

      const data = validation.data;

      // Crear precio
      const precio = await this.service.create(data);

      // Retornar en formato array (estándar de la aplicación)
      res.status(201).json({ data: [precio] });
    } catch (error) {
      // Errores de negocio (duplicados, jerarquía) retornan 400
      if (
        error instanceof Error &&
        (error.message.includes("Ya existe") ||
          error.message.includes("requiere") ||
          error.message.includes("no puede tener"))
      ) {
        res.status(400).json({
          error: error.message,
        });
        return;
      }

      throw new Error(
        `Error al crear precio: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Maneja peticiones PUT
   */
  private async handlePut(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      // Validar body
      const validation = updatePrecioSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          error: "Datos de entrada inválidos",
          details: validation.error.issues,
        });
        return;
      }

      const { id, ...updateData } = validation.data;

      // Actualizar precio
      const precio = await this.service.update(id, { id, ...updateData });

      // Retornar en formato array (estándar de la aplicación)
      res.status(200).json({ data: [precio] });
    } catch (error) {
      // Error de no encontrado retorna 404
      if (error instanceof Error && error.message.includes("no encontrado")) {
        res.status(404).json({
          error: "Precio no encontrado",
        });
        return;
      }

      throw new Error(
        `Error al actualizar precio: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Maneja peticiones DELETE
   */
  private async handleDelete(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      // Validar query params
      const validation = deletePrecioSchema.safeParse(req.query);

      if (!validation.success) {
        res.status(400).json({
          error: "Parámetros inválidos",
          details: validation.error.issues,
        });
        return;
      }

      const { id } = validation.data;

      // Por defecto hacer soft delete (mejor práctica)
      const { soft } = req.query;

      if (soft === "false") {
        // Hard delete (eliminar físicamente)
        await this.service.hardDelete(id);
      } else {
        // Soft delete (establecer fecha_fin)
        await this.service.softDelete(id);
      }

      res.status(200).json({
        message: "Precio eliminado exitosamente",
      });
    } catch (error) {
      // Error de no encontrado retorna 404
      if (error instanceof Error && error.message.includes("no encontrado")) {
        res.status(404).json({
          error: "Precio no encontrado",
        });
        return;
      }

      throw new Error(
        `Error al eliminar precio: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  }

  /**
   * Obtiene un precio por ID
   * Endpoint adicional: GET /api/precios/:id
   */
  async getPrecioById(id: string, res: NextApiResponse): Promise<void> {
    try {
      const precio = await this.service.findById(id);
      res.status(200).json({ data: precio });
    } catch (error) {
      if (error instanceof Error && error.message.includes("no encontrado")) {
        res.status(404).json({
          error: "Precio no encontrado",
        });
        return;
      }

      res.status(500).json({
        error: "Error al obtener precio",
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  /**
   * Obtiene precios por nivel
   * Endpoint adicional: GET /api/precios/nivel/:nivel
   */
  async getPreciosByNivel(
    nivel: NivelPrecio,
    vigente: boolean | undefined,
    res: NextApiResponse
  ): Promise<void> {
    try {
      const precios = await this.service.getPreciosByNivel(nivel, vigente);
      res.status(200).json({ data: precios });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener precios por nivel",
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  /**
   * Obtiene precios por entidad
   * Endpoint adicional: GET /api/precios/entidad/:tipo/:id
   */
  async getPreciosByEntidad(
    entidadTipo: EntidadTipo,
    entidadId: string,
    vigente: boolean | undefined,
    res: NextApiResponse
  ): Promise<void> {
    try {
      const precios = await this.service.getPreciosByEntidad(
        entidadTipo,
        entidadId,
        vigente
      );
      res.status(200).json({ data: precios });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener precios por entidad",
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  /**
   * Obtiene historial de precios de una entidad
   * Endpoint adicional: GET /api/precios/historial/:tipo/:id
   */
  async getHistorial(
    entidadTipo: EntidadTipo,
    entidadId: string,
    nivel: NivelPrecio | undefined,
    res: NextApiResponse
  ): Promise<void> {
    try {
      const historial = await this.service.getHistorial(
        entidadTipo,
        entidadId,
        nivel
      );
      res.status(200).json({ data: historial });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener historial de precios",
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
}
