import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { AlertRepository } from "../../src/repositories/alert.repository";
import { Alert, AlertFilters } from "../../src/dto/alert.dto";
import { SupabaseClient } from "@supabase/supabase-js";

// Mock Supabase client con métodos de query builder
/* eslint-disable @typescript-eslint/no-explicit-any */
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  range: jest.fn(),
  order: jest.fn(),
  lt: jest.fn(),
} as any as SupabaseClient;
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("AlertRepository", () => {
  let repository: AlertRepository;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();

    // Configurar el query builder chain
    (mockSupabase.from as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.select as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.eq as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.insert as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.update as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.delete as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.range as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.order as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.single as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.lt as jest.Mock).mockReturnValue(mockSupabase);

    repository = new AlertRepository(mockSupabase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with correct table name 'alerts'", () => {
      expect(repository).toBeInstanceOf(AlertRepository);
    });
  });

  describe("countUnread", () => {
    it("should count unread alerts", async () => {
      (mockSupabase.select as jest.Mock).mockResolvedValueOnce({
        count: 5,
        error: null,
      });

      const count = await repository.countUnread();

      expect(count).toBe(5);
      expect(mockSupabase.from).toHaveBeenCalledWith("alerts");
      expect(mockSupabase.select).toHaveBeenCalledWith("*", {
        count: "exact",
        head: true,
      });
      expect(mockSupabase.eq).toHaveBeenCalledWith("leida", false);
    });

    it("should return 0 when count is null", async () => {
      (mockSupabase.select as jest.Mock).mockResolvedValueOnce({
        count: null,
        error: null,
      });

      const count = await repository.countUnread();

      expect(count).toBe(0);
    });
  });

  describe("getStats", () => {
    it("should return alert statistics", async () => {
      // Mock total count
      (mockSupabase.select as jest.Mock)
        .mockResolvedValueOnce({ count: 10, error: null })
        .mockResolvedValueOnce({ count: 5, error: null })
        .mockResolvedValueOnce({
          data: [
            { severidad: "critical" },
            { severidad: "warning" },
            { severidad: "info" },
          ],
          error: null,
        })
        .mockResolvedValueOnce({
          data: [
            { tipo: "low_stock_vending" },
            { tipo: "low_stock_warehouse" },
          ],
          error: null,
        });

      const stats = await repository.getStats();

      expect(stats.total).toBe(10);
      expect(stats.no_leidas).toBe(5);
      expect(stats.por_severidad).toBeDefined();
      expect(stats.por_tipo).toBeDefined();
    });
  });

  describe("marcarLeida", () => {
    it("should mark alert as read", async () => {
      const mockAlert: Alert = {
        id: "alert-123",
        tipo: "low_stock_vending",
        severidad: "warning",
        mensaje: "Stock bajo",
        entidad_tipo: "vending_slot",
        entidad_id: "slot-123",
        leida: true,
        accion_requerida: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: mockAlert,
        error: null,
      });

      const result = await repository.marcarLeida("alert-123", true);

      expect(result).toEqual(mockAlert);
      expect(mockSupabase.update).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith("id", "alert-123");
    });
  });

  describe("marcarTodasLeidas", () => {
    it("should mark all unread alerts as read", async () => {
      (mockSupabase.select as jest.Mock).mockResolvedValueOnce({
        count: 3,
        error: null,
      });

      const count = await repository.marcarTodasLeidas();

      expect(count).toBe(3);
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({ leida: true })
      );
      expect(mockSupabase.eq).toHaveBeenCalledWith("leida", false);
    });
  });

  describe("findByEntidad", () => {
    it("should find alerts by entity", async () => {
      const mockAlerts: Alert[] = [
        {
          id: "alert-1",
          tipo: "low_stock_vending",
          severidad: "warning",
          mensaje: "Stock bajo",
          entidad_tipo: "vending_slot",
          entidad_id: "slot-123",
          leida: false,
          accion_requerida: true,
        },
      ];

      (mockSupabase.order as jest.Mock).mockResolvedValueOnce({
        data: mockAlerts,
        error: null,
      });

      const result = await repository.findByEntidad(
        "vending_slot",
        "slot-123"
      );

      expect(result).toEqual(mockAlerts);
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "entidad_tipo",
        "vending_slot"
      );
      expect(mockSupabase.eq).toHaveBeenCalledWith("entidad_id", "slot-123");
    });
  });

  describe("deleteOldAlerts", () => {
    it("should delete old read alerts", async () => {
      (mockSupabase.select as jest.Mock).mockResolvedValueOnce({
        count: 2,
        error: null,
      });

      const count = await repository.deleteOldAlerts(30);

      expect(count).toBe(2);
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith("leida", true);
    });
  });
});
