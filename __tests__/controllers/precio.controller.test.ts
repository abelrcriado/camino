import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { PrecioController } from "@/api/controllers/precio.controller";
import { PrecioService } from "@/api/services/precio.service";
import type { NextApiRequest, NextApiResponse } from "next";
import { NivelPrecio, EntidadTipo, type Precio } from "@/shared/dto/precio.dto";

describe("PrecioController", () => {
  let controller: PrecioController;
  let mockService: jest.Mocked<PrecioService>;
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  const validUUID = "550e8400-e29b-41d4-a716-446655440000";
  const validUUID2 = "650e8400-e29b-41d4-a716-446655440001";

  const mockPrecioBase: Precio = {
    id: validUUID,
    nivel: NivelPrecio.BASE,
    entidad_tipo: EntidadTipo.PRODUCTO,
    entidad_id: validUUID2,
    precio: 250,
    ubicacion_id: null,
    service_point_id: null,
    fecha_inicio: "2025-01-01",
    fecha_fin: null,
    notas: "Precio base",
    created_at: "2025-10-11T10:00:00Z",
    updated_at: "2025-10-11T10:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      hardDelete: jest.fn(),
      findById: jest.fn(),
      findAllWithFilters: jest.fn(),
      getPreciosVigentes: jest.fn(),
      resolverPrecio: jest.fn(),
      getPrecioAplicable: jest.fn(),
      getPreciosByNivel: jest.fn(),
      getPreciosByEntidad: jest.fn(),
      getStats: jest.fn(),
      getHistorial: jest.fn(),
    } as unknown as jest.Mocked<PrecioService>;

    controller = new PrecioController(mockService);

    mockReq = {
      method: "GET",
      query: {},
      body: {},
    };

    mockRes = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: jest.fn().mockReturnThis() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      json: jest.fn().mockReturnThis() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      end: jest.fn().mockReturnThis() as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setHeader: jest.fn().mockReturnThis() as any,
    };
  });

  // ===== METHOD ROUTING =====
  describe("handleRequest - Method Routing", () => {
    it("debería rutear GET a handleGet", async () => {
      mockReq.method = "GET";
      mockService.findAllWithFilters.mockResolvedValue({
        data: [mockPrecioBase],
        total: 1,
      });

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("debería rutear POST a handlePost", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        nivel: NivelPrecio.BASE,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
        precio: 250,
      };

      mockService.create.mockResolvedValue(mockPrecioBase);

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("debería rutear PUT a handlePut", async () => {
      mockReq.method = "PUT";
      mockReq.body = {
        id: validUUID,
        precio: 275,
      };

      mockService.update.mockResolvedValue({
        ...mockPrecioBase,
        precio: 275,
      });

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("debería rutear DELETE a handleDelete", async () => {
      mockReq.method = "DELETE";
      mockReq.query = { id: validUUID };

      mockService.softDelete.mockResolvedValue({
        ...mockPrecioBase,
        fecha_fin: "2025-10-11",
      });

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.stringContaining("eliminado"),
      });
    });

    it("debería retornar 405 para métodos no soportados", async () => {
      mockReq.method = "PATCH";

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Método no permitido",
      });
    });
  });

  // ===== GET - FIND ALL =====
  describe("GET - Find All Precios", () => {
    it("debería obtener todos los precios sin filtros", async () => {
      mockReq.method = "GET";
      mockService.findAllWithFilters.mockResolvedValue({
        data: [mockPrecioBase],
        total: 1,
      });

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findAllWithFilters).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array),
          pagination: expect.any(Object),
        })
      );
    });

    it("debería filtrar por nivel", async () => {
      mockReq.method = "GET";
      mockReq.query = { nivel: NivelPrecio.BASE };

      mockService.findAllWithFilters.mockResolvedValue({
        data: [mockPrecioBase],
        total: 1,
      });

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findAllWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          nivel: NivelPrecio.BASE,
        })
      );
    });

    it("debería obtener precios vigentes con action=vigentes", async () => {
      mockReq.method = "GET";
      mockReq.query = { action: "vigentes" };

      mockService.getPreciosVigentes.mockResolvedValue({
        data: [
          {
            ...mockPrecioBase,
            precio_euros: 2.5,
            ubicacion_nombre: null,
            service_point_nombre: null,
            dias_restantes: null,
            activo_hoy: true,
          },
        ],
        total: 1,
      });

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.getPreciosVigentes).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("debería resolver precio aplicable con action=aplicable", async () => {
      mockReq.method = "GET";
      mockReq.query = {
        action: "aplicable",
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
      };

      mockService.resolverPrecio.mockResolvedValue({
        precio_id: validUUID,
        precio: 250,
        precio_euros: 2.5,
        nivel: NivelPrecio.BASE,
        ubicacion_id: null,
        service_point_id: null,
        fecha_inicio: "2025-01-01",
        fecha_fin: null,
        activo_hoy: true,
      });

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.resolverPrecio).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("debería obtener estadísticas con action=stats", async () => {
      mockReq.method = "GET";
      mockReq.query = { action: "stats" };

      mockService.getStats.mockResolvedValue({
        total_precios: 100,
        precios_vigentes: 75,
        precios_expirados: 25,
        precios_base: 50,
        precios_ubicacion: 30,
        precios_service_point: 20,
        precios_productos: 80,
        precios_servicios: 20,
        precio_min: 100,
        precio_max: 500,
        precio_promedio: 250,
      });

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.getStats).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  // ===== POST - CREATE =====
  describe("POST - Create Precio", () => {
    it("debería crear precio BASE correctamente", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        nivel: NivelPrecio.BASE,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
        precio: 250,
      };

      mockService.create.mockResolvedValue(mockPrecioBase);

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.create).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ data: [mockPrecioBase] });
    });

    it("debería rechazar precio sin nivel", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
        precio: 250,
      };

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Datos de entrada inválidos",
        })
      );
    });

    it("debería rechazar precio negativo", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        nivel: NivelPrecio.BASE,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
        precio: -100,
      };

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("debería rechazar UUID inválido", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        nivel: NivelPrecio.BASE,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: "invalid-uuid",
        precio: 250,
      };

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("debería crear precio UBICACION con ubicacion_id", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        nivel: NivelPrecio.UBICACION,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
        ubicacion_id: validUUID,
        precio: 300,
      };

      const precioUbicacion = {
        ...mockPrecioBase,
        nivel: NivelPrecio.UBICACION,
        ubicacion_id: validUUID,
        precio: 300,
      };

      mockService.create.mockResolvedValue(precioUbicacion);

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ data: [precioUbicacion] });
    });
  });

  // ===== PUT - UPDATE =====
  describe("PUT - Update Precio", () => {
    it("debería actualizar precio correctamente", async () => {
      mockReq.method = "PUT";
      mockReq.body = {
        id: validUUID,
        precio: 275,
        notas: "Precio actualizado",
      };

      const precioActualizado = {
        ...mockPrecioBase,
        precio: 275,
        notas: "Precio actualizado",
      };

      mockService.update.mockResolvedValue(precioActualizado);

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.update).toHaveBeenCalledWith(validUUID, mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ data: [precioActualizado] });
    });

    it("debería rechazar update sin id", async () => {
      mockReq.method = "PUT";
      mockReq.body = {
        precio: 275,
      };

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("debería rechazar update sin campos", async () => {
      mockReq.method = "PUT";
      mockReq.body = {
        id: validUUID,
      };

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Datos de entrada inválidos",
        })
      );
    });

    it("debería rechazar UUID inválido en update", async () => {
      mockReq.method = "PUT";
      mockReq.body = {
        id: "invalid-uuid",
        precio: 275,
      };

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  // ===== DELETE =====
  describe("DELETE - Delete Precio", () => {
    it("debería hacer soft delete por defecto", async () => {
      mockReq.method = "DELETE";
      mockReq.query = { id: validUUID };

      mockService.softDelete.mockResolvedValue({
        ...mockPrecioBase,
        fecha_fin: "2025-10-11",
      });

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.softDelete).toHaveBeenCalledWith(validUUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.stringContaining("eliminado"),
      });
    });

    it("debería hacer hard delete con soft=false en query", async () => {
      mockReq.method = "DELETE";
      mockReq.query = { id: validUUID, soft: "false" };

      mockService.hardDelete.mockResolvedValue(undefined);

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.hardDelete).toHaveBeenCalledWith(validUUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: expect.stringContaining("eliminado"),
      });
    });

    it("debería rechazar delete sin id", async () => {
      mockReq.method = "DELETE";
      mockReq.query = {};

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("debería rechazar UUID inválido en delete", async () => {
      mockReq.method = "DELETE";
      mockReq.query = {
        id: "invalid-uuid",
      };

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  // ===== ERROR HANDLING =====
  describe("Error Handling", () => {
    it("debería manejar errores del service como 500", async () => {
      mockReq.method = "GET";
      mockService.findAllWithFilters.mockRejectedValue(
        new Error("Error de base de datos")
      );

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Error interno del servidor",
        })
      );
    });

    it("debería manejar errores de validación como 400", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        nivel: "INVALID_NIVEL",
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
        precio: 250,
      };

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  // ===== PAGINATION =====
  describe("Pagination", () => {
    it("debería usar valores por defecto de paginación", async () => {
      mockReq.method = "GET";
      mockService.findAllWithFilters.mockResolvedValue({
        data: [mockPrecioBase],
        total: 1,
      });

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findAllWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
        })
      );
    });

    it("debería aceptar parámetros de paginación personalizados", async () => {
      mockReq.method = "GET";
      mockReq.query = { page: "2", limit: "50" };

      mockService.findAllWithFilters.mockResolvedValue({
        data: [mockPrecioBase],
        total: 100,
      });

      await controller.handleRequest(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findAllWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 50,
        })
      );
    });
  });
});
