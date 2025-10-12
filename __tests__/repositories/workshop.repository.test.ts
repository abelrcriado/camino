/**
 * @file __tests__/repositories/workshop.repository.test.ts
 * @description Test unitarios para WorkshopRepository usando patrón de inyección de dependencias
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { WorkshopRepository } from "../../src/repositories/workshop.repository";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Workshop } from "../../src/dto/workshop.dto";

describe("WorkshopRepository", () => {
  let repository: WorkshopRepository;
  let mockSupabase: any;

  beforeEach(() => {
    // Mock del cliente Supabase usando el patrón de inyección de dependencias
    mockSupabase = {
      from: jest.fn(),
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      eq: jest.fn(),
      single: jest.fn(),
      order: jest.fn(),
      range: jest.fn(),
    } as any as SupabaseClient;

    // Configurar comportamiento de cadena para todas las operaciones
    (mockSupabase.from as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.select as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.insert as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.update as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.delete as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.eq as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.single as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.order as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.range as jest.Mock).mockReturnValue(mockSupabase);

    // Crear repositorio con dependencia inyectada
    repository = new WorkshopRepository(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Constructor", () => {
    it("debería aceptar cliente Supabase inyectado", () => {
      expect(repository).toBeInstanceOf(WorkshopRepository);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("debería usar cliente por defecto si no se proporciona", () => {
      const defaultRepository = new WorkshopRepository();
      expect(defaultRepository).toBeInstanceOf(WorkshopRepository);
    });
  });

  describe("findByServicePoint", () => {
    const servicePointId = "123e4567-e89b-12d3-a456-426614174000";
    const mockWorkshops: Workshop[] = [
      {
        id: "workshop-1",
        service_point_id: servicePointId,
        name: "Taller Test",
        contact_phone: "+34 123 456 789",
        description: "Descripción del taller",
        specialties: ["bike_repair", "maintenance"],
        contact_email: "test@workshop.com",
        website_url: "https://workshop.com",
        capacity: 5,
        equipment: { tools: ["wrench", "pump"] },
        certifications: ["ISO 9001"],
        average_rating: 4.5,
        total_reviews: 10,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
    ];

    it("debería buscar workshops por service point ID exitosamente", async () => {
      // Configurar mock para éxito
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockWorkshops,
        error: null,
      });

      const result = await repository.findByServicePoint(servicePointId);

      expect(mockSupabase.from).toHaveBeenCalledWith("workshops");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "service_point_id",
        servicePointId
      );
      expect(result).toEqual({
        data: mockWorkshops,
        error: null,
      });
    });

    it("debería manejar errores en la búsqueda por service point", async () => {
      const mockError = { message: "Database error" };

      // Configurar mock para error
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const result = await repository.findByServicePoint(servicePointId);

      expect(result).toEqual({
        data: null,
        error: mockError,
      });
    });

    it("debería retornar array vacío cuando no encuentra workshops", async () => {
      // Configurar mock para caso sin resultados
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByServicePoint(servicePointId);

      expect(result).toEqual({
        data: [],
        error: null,
      });
    });
  });

  describe("Herencia de BaseRepository", () => {
    it("debería tener acceso a métodos de BaseRepository", () => {
      expect(typeof repository.findAll).toBe("function");
      expect(typeof repository.findById).toBe("function");
      expect(typeof repository.create).toBe("function");
      expect(typeof repository.update).toBe("function");
      expect(typeof repository.delete).toBe("function");
    });

    it("debería usar tabla 'workshops' correctamente", async () => {
      // Configurar mock para findAll heredado
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      await repository.findAll();

      expect(mockSupabase.from).toHaveBeenCalledWith("workshops");
    });
  });
});
