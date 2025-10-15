import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { PrecioService } from "@/services/precio.service";
import { PrecioRepository } from "@/repositories/precio.repository";
import {
  NivelPrecio,
  EntidadTipo,
} from "@/dto/precio.dto";
import { PrecioFactory, generateUUID } from "../helpers/factories";

/* eslint-disable @typescript-eslint/no-explicit-any */

describe("PrecioService", () => {
  let service: PrecioService;
  let mockRepository: any;

  const validUUID = generateUUID();
  const validUUID2 = generateUUID();

  const mockPrecioBase = PrecioFactory.create({
    nivel: NivelPrecio.BASE,
    entidad_tipo: EntidadTipo.PRODUCTO,
    entidad_id: validUUID2,
    precio: 250,
    ubicacion_id: null,
    service_point_id: null,
    fecha_inicio: "2025-01-01",
    fecha_fin: null,
    notas: "Precio base",
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      resolverPrecio: jest.fn(),
      getPrecioAplicable: jest.fn(),
      getPreciosVigentes: jest.fn(),
      getPreciosByNivel: jest.fn(),
      getPreciosByEntidad: jest.fn(),
      getPreciosWithFilters: jest.fn(),
      existsPrecioVigente: jest.fn(),
      getStats: jest.fn(),
      getHistorial: jest.fn(),
    };

    service = new PrecioService(mockRepository as PrecioRepository);
  });

  // ===== CREATE =====
  describe("create", () => {
    it("debería crear precio BASE correctamente", async () => {
      const createDto: CreatePrecioDto = {
        nivel: NivelPrecio.BASE,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
        precio: 250,
      };

      mockRepository.existsPrecioVigente.mockResolvedValue(false);
      mockRepository.existsPrecioVigente.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue({
        data: [mockPrecioBase],
        error: undefined,
      });

      const result = await service.create(createDto);

      expect(mockRepository.existsPrecioVigente).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockPrecioBase);
    });

    it("debería rechazar BASE con ubicacion_id", async () => {
      const createDto: CreatePrecioDto = {
        nivel: NivelPrecio.BASE,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
        precio: 250,
        ubicacion_id: validUUID,
      };

      await expect(service.create(createDto)).rejects.toThrow(
        "El nivel BASE no puede tener ubicacion_id ni service_point_id"
      );
    });

    it("debería rechazar UBICACION sin ubicacion_id", async () => {
      const createDto: CreatePrecioDto = {
        nivel: NivelPrecio.UBICACION,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
        precio: 300,
      };

      await expect(service.create(createDto)).rejects.toThrow(
        "El nivel UBICACION requiere ubicacion_id"
      );
    });

    it("debería rechazar SERVICE_POINT sin service_point_id", async () => {
      const createDto: CreatePrecioDto = {
        nivel: NivelPrecio.SERVICE_POINT,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
        precio: 350,
        ubicacion_id: validUUID,
      };

      await expect(service.create(createDto)).rejects.toThrow(
        "El nivel SERVICE_POINT requiere ubicacion_id y service_point_id"
      );
    });

    it("debería rechazar precio duplicado vigente", async () => {
      const createDto: CreatePrecioDto = {
        nivel: NivelPrecio.BASE,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
        precio: 250,
      };

      mockRepository.existsPrecioVigente.mockResolvedValue(true);

      await expect(service.create(createDto)).rejects.toThrow(
        "Ya existe un precio vigente para esta entidad en el nivel global (BASE)"
      );
    });

    it("debería crear precio UBICACION correctamente", async () => {
      const precioUbicacion: Precio = {
        ...mockPrecioBase,
        nivel: NivelPrecio.UBICACION,
        ubicacion_id: validUUID,
        precio: 300,
      };

      const createDto: CreatePrecioDto = {
        nivel: NivelPrecio.UBICACION,
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
        precio: 300,
        ubicacion_id: validUUID,
      };

      mockRepository.existsPrecioVigente.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue({
        data: [precioUbicacion],
        error: undefined,
      });

      const result = await service.create(createDto);

      expect(result).toEqual(precioUbicacion);
    });
  });

  // ===== UPDATE =====
  describe("update", () => {
    it("debería actualizar precio correctamente", async () => {
      const updateDto = {
        id: validUUID,
        precio: 275,
        notas: "Precio actualizado",
      };

      const precioActualizado = {
        ...mockPrecioBase,
        precio: 275,
        notas: "Precio actualizado",
      };

      mockRepository.findById.mockResolvedValue({
        data: mockPrecioBase,
        error: undefined,
      });
      mockRepository.update.mockResolvedValue({
        data: [precioActualizado],
        error: undefined,
      });

      const result = await service.update(validUUID, updateDto);

      expect(mockRepository.findById).toHaveBeenCalledWith(validUUID);
      expect(mockRepository.update).toHaveBeenCalledWith(validUUID, updateDto);
      expect(result).toEqual(precioActualizado);
    });

    it("debería lanzar error si precio no existe", async () => {
      const updateDto = {
        id: validUUID,
        precio: 275,
      };

      mockRepository.findById.mockResolvedValue({
        data: undefined,
        error: undefined,
      });

      await expect(service.update(validUUID, updateDto)).rejects.toThrow(
        `Precio con ID ${validUUID} no encontrado`
      );
    });

    it("debería rechazar cambio de nivel", async () => {
      const updateDto = {
        id: validUUID,
        nivel: NivelPrecio.UBICACION,
      };

      mockRepository.findById.mockResolvedValue({
        data: mockPrecioBase,
        error: undefined,
      });
      mockRepository.update.mockResolvedValue({
        data: [mockPrecioBase],
        error: undefined,
      });

      await expect(service.update(validUUID, updateDto)).rejects.toThrow(
        "No se puede cambiar el nivel de un precio existente"
      );
    });

    it("debería rechazar cambio de entidad_tipo", async () => {
      const updateDto = {
        id: validUUID,
        entidad_tipo: EntidadTipo.SERVICIO,
      };

      mockRepository.findById.mockResolvedValue({
        data: mockPrecioBase,
        error: undefined,
      });
      mockRepository.update.mockResolvedValue({
        data: [mockPrecioBase],
        error: undefined,
      });

      await expect(service.update(validUUID, updateDto)).rejects.toThrow(
        "No se puede cambiar el tipo de entidad de un precio existente"
      );
    });
  });

  // ===== SOFT DELETE =====
  describe("softDelete", () => {
    it("debería hacer soft delete estableciendo fecha_fin", async () => {
      const precioEliminado = {
        ...mockPrecioBase,
        fecha_fin: expect.any(String),
      };

      mockRepository.findById.mockResolvedValue({
        data: mockPrecioBase,
        error: undefined,
      });
      mockRepository.update.mockResolvedValue({
        data: [precioEliminado],
        error: undefined,
      });

      const result = await service.softDelete(validUUID);

      expect(mockRepository.findById).toHaveBeenCalledWith(validUUID);
      expect(mockRepository.update).toHaveBeenCalledWith(validUUID, {
        id: validUUID,
        fecha_fin: expect.any(String),
      });
      expect(result).toEqual(precioEliminado);
    });

    it("debería lanzar error si precio no existe", async () => {
      mockRepository.findById.mockResolvedValue({
        data: undefined,
        error: undefined,
      });

      await expect(service.softDelete(validUUID)).rejects.toThrow(
        `Precio con ID ${validUUID} no encontrado`
      );
    });
  });

  // ===== HARD DELETE =====
  describe("hardDelete", () => {
    it("debería hacer hard delete físico", async () => {
      mockRepository.delete.mockResolvedValue({
        data: undefined,
        error: undefined,
      });

      await service.hardDelete(validUUID);

      expect(mockRepository.delete).toHaveBeenCalledWith(validUUID);
    });
  });

  // ===== FIND BY ID =====
  describe("findById", () => {
    it("debería retornar precio cuando existe", async () => {
      mockRepository.findById.mockResolvedValue({
        data: mockPrecioBase,
        error: undefined,
      });

      const result = await service.findById(validUUID);

      expect(result).toEqual(mockPrecioBase);
    });

    it("debería lanzar error cuando no existe", async () => {
      mockRepository.findById.mockResolvedValue({
        data: undefined,
        error: undefined,
      });

      await expect(service.findById(validUUID)).rejects.toThrow(
        `Precio con ID ${validUUID} no encontrado`
      );
    });
  });

  // ===== FIND ALL WITH FILTERS =====
  describe("findAllWithFilters", () => {
    it("debería obtener precios con filtros", async () => {
      const filters = {
        nivel: NivelPrecio.BASE,
        page: 1,
        limit: 20,
      };

      const mockResponse = {
        data: [mockPrecioBase],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      mockRepository.getPreciosWithFilters.mockResolvedValue(mockResponse);

      const result = await service.findAllWithFilters(filters);

      expect(mockRepository.getPreciosWithFilters).toHaveBeenCalledWith(
        filters
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ===== GET PRECIOS VIGENTES =====
  describe("getPreciosVigentes", () => {
    it("debería obtener precios vigentes", async () => {
      const filters = { page: 1, limit: 20 };

      const mockVigentes = [
        {
          id: validUUID,
          nivel: NivelPrecio.BASE,
          entidad_tipo: EntidadTipo.PRODUCTO,
          entidad_id: validUUID2,
          precio: 250,
          precio_euros: 2.5,
          ubicacion_id: null,
          service_point_id: null,
          fecha_inicio: "2025-01-01",
          fecha_fin: null,
          ubicacion_nombre: null,
          service_point_nombre: null,
          dias_restantes: null,
          activo_hoy: true,
        },
      ];

      mockRepository.getPreciosVigentes.mockResolvedValue({
        data: mockVigentes,
        total: 1,
      });

      const result = await service.getPreciosVigentes(filters);

      expect(mockRepository.getPreciosVigentes).toHaveBeenCalledWith(filters);
      expect(result.data).toEqual(mockVigentes);
      expect(result.total).toBe(1);
    });
  });

  // ===== RESOLVER PRECIO =====
  describe("resolverPrecio", () => {
    it("debería resolver precio usando repository", async () => {
      const mockResuelto = {
        precio_id: validUUID,
        precio: 250,
        precio_euros: 2.5,
        nivel: NivelPrecio.BASE,
        ubicacion_id: null,
        service_point_id: null,
        fecha_inicio: "2025-01-01",
        fecha_fin: null,
        activo_hoy: true,
      };

      const params = {
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
      };

      mockRepository.resolverPrecio.mockResolvedValue(mockResuelto);

      const result = await service.resolverPrecio(params);

      expect(mockRepository.resolverPrecio).toHaveBeenCalledWith(
        EntidadTipo.PRODUCTO,
        validUUID2,
        undefined,
        undefined,
        undefined
      );
      expect(result).toEqual(mockResuelto);
    });
  });

  // ===== GET PRECIO APLICABLE =====
  describe("getPrecioAplicable", () => {
    it("debería obtener precio aplicable", async () => {
      const params = {
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
      };

      mockRepository.getPrecioAplicable.mockResolvedValue(250);

      const result = await service.getPrecioAplicable(params);

      expect(mockRepository.getPrecioAplicable).toHaveBeenCalledWith(
        EntidadTipo.PRODUCTO,
        validUUID2,
        undefined,
        undefined,
        undefined
      );
      expect(result).toBe(250);
    });

    it("debería retornar null si no hay precio", async () => {
      const params = {
        entidad_tipo: EntidadTipo.PRODUCTO,
        entidad_id: validUUID2,
      };

      mockRepository.getPrecioAplicable.mockResolvedValue(null);

      const result = await service.getPrecioAplicable(params);

      expect(result).toBeNull();
    });
  });

  // ===== GET PRECIOS BY NIVEL =====
  describe("getPreciosByNivel", () => {
    it("debería obtener precios por nivel", async () => {
      mockRepository.getPreciosByNivel.mockResolvedValue([mockPrecioBase]);

      const result = await service.getPreciosByNivel(NivelPrecio.BASE);

      expect(mockRepository.getPreciosByNivel).toHaveBeenCalledWith(
        NivelPrecio.BASE,
        undefined
      );
      expect(result).toEqual([mockPrecioBase]);
    });

    it("debería obtener solo precios vigentes", async () => {
      mockRepository.getPreciosByNivel.mockResolvedValue([mockPrecioBase]);

      const result = await service.getPreciosByNivel(NivelPrecio.BASE, true);

      expect(mockRepository.getPreciosByNivel).toHaveBeenCalledWith(
        NivelPrecio.BASE,
        true
      );
      expect(result).toEqual([mockPrecioBase]);
    });
  });

  // ===== GET PRECIOS BY ENTIDAD =====
  describe("getPreciosByEntidad", () => {
    it("debería obtener precios por entidad", async () => {
      mockRepository.getPreciosByEntidad.mockResolvedValue([mockPrecioBase]);

      const result = await service.getPreciosByEntidad(
        EntidadTipo.PRODUCTO,
        validUUID2
      );

      expect(mockRepository.getPreciosByEntidad).toHaveBeenCalledWith(
        EntidadTipo.PRODUCTO,
        validUUID2,
        undefined
      );
      expect(result).toEqual([mockPrecioBase]);
    });
  });

  // ===== GET STATS =====
  describe("getStats", () => {
    it("debería obtener estadísticas", async () => {
      const mockStats = {
        total: 100,
        vigentes: 75,
        por_nivel: [
          { nivel: NivelPrecio.BASE, count: 50 },
          { nivel: NivelPrecio.UBICACION, count: 30 },
          { nivel: NivelPrecio.SERVICE_POINT, count: 20 },
        ],
        por_entidad: [
          { entidad_tipo: EntidadTipo.PRODUCTO, count: 80 },
          { entidad_tipo: EntidadTipo.SERVICIO, count: 20 },
        ],
        rangos_precio: {
          min: 100,
          max: 500,
          avg: 250,
        },
      };

      mockRepository.getStats.mockResolvedValue(mockStats);

      const result = await service.getStats();

      expect(mockRepository.getStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  // ===== GET HISTORIAL =====
  describe("getHistorial", () => {
    it("debería obtener historial de precios", async () => {
      const mockHistorial = [
        mockPrecioBase,
        {
          ...mockPrecioBase,
          id: validUUID2,
          fecha_inicio: "2024-01-01",
          fecha_fin: "2024-12-31",
        },
      ];

      mockRepository.getHistorial.mockResolvedValue(mockHistorial);

      const result = await service.getHistorial(
        EntidadTipo.PRODUCTO,
        validUUID2,
        undefined
      );

      expect(mockRepository.getHistorial).toHaveBeenCalledWith(
        EntidadTipo.PRODUCTO,
        validUUID2,
        undefined
      );
      expect(result).toEqual(mockHistorial);
    });
  });

  // ===== HELPERS =====
  describe("Helper methods", () => {
    it("crearPrecioBase debería crear precio base", async () => {
      mockRepository.existsPrecioVigente.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue({
        data: [mockPrecioBase],
        error: undefined,
      });

      const result = await service.crearPrecioBase(
        EntidadTipo.PRODUCTO,
        validUUID2,
        250,
        "Precio base"
      );

      expect(result).toEqual(mockPrecioBase);
    });

    it("crearPrecioUbicacion debería crear precio de ubicación", async () => {
      const precioUbicacion = {
        ...mockPrecioBase,
        nivel: NivelPrecio.UBICACION,
        ubicacion_id: validUUID,
        precio: 300,
      };

      mockRepository.existsPrecioVigente.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue({
        data: [precioUbicacion],
        error: undefined,
      });

      const result = await service.crearPrecioUbicacion(
        EntidadTipo.PRODUCTO,
        validUUID2,
        validUUID,
        300
      );

      expect(result.nivel).toBe(NivelPrecio.UBICACION);
      expect(result.ubicacion_id).toBe(validUUID);
    });

    it("crearPrecioServicePoint debería crear precio de service point", async () => {
      const precioSP = {
        ...mockPrecioBase,
        nivel: NivelPrecio.SERVICE_POINT,
        ubicacion_id: validUUID,
        service_point_id: validUUID2,
        precio: 350,
      };

      mockRepository.existsPrecioVigente.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue({
        data: [precioSP],
        error: undefined,
      });

      const result = await service.crearPrecioServicePoint(
        EntidadTipo.PRODUCTO,
        validUUID2,
        validUUID,
        validUUID2,
        350
      );

      expect(result.nivel).toBe(NivelPrecio.SERVICE_POINT);
      expect(result.service_point_id).toBe(validUUID2);
    });
  });
});
