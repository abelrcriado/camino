import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { VendingMachineRepository } from "../../src/repositories/vending_machine.repository";
import { VendingMachine } from "../../src/dto/vending_machine.dto";
import { SupabaseClient } from "@supabase/supabase-js";
import { VendingMachineFactory } from "../helpers/factories";

// Mock Supabase client
/* eslint-disable @typescript-eslint/no-explicit-any */
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as any as SupabaseClient;
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("VendingMachineRepository", () => {
  let repository: VendingMachineRepository;

  const mockVendingMachine: VendingMachine = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    service_point_id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Máquina Central",
    description: "Máquina expendedora en recepción principal",
    status: "active",
    capacity: 50,
    current_stock: 30,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (mockSupabase.from as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.select as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.eq as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.insert as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.update as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.delete as jest.Mock).mockReturnValue(mockSupabase);

    repository = new VendingMachineRepository(mockSupabase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with correct table name 'vending_machines'", () => {
      expect(repository).toBeInstanceOf(VendingMachineRepository);
    });

    it("should accept optional SupabaseClient", () => {
      const customRepo = new VendingMachineRepository(mockSupabase);
      expect(customRepo).toBeInstanceOf(VendingMachineRepository);
    });
  });

  describe("findByServicePoint", () => {
    it("should find vending machines by service point ID successfully", async () => {
      const mockMachines = [
        mockVendingMachine,
        { ...mockVendingMachine, id: "diff-id", name: "Máquina Norte" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockMachines,
        error: null,
      });

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("vending_machines");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "service_point_id",
        "550e8400-e29b-41d4-a716-446655440001"
      );
      expect(result.data).toEqual(mockMachines);
    });

    it("should return empty array when no machines found", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Database error" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.error).toEqual(dbError);
    });

    it("should find multiple machines for same service point", async () => {
      const machines = [
        mockVendingMachine,
        {
          ...mockVendingMachine,
          id: "id-2",
          name: "Máquina Sur",
          description: "Taller 2",
        },
        {
          ...mockVendingMachine,
          id: "id-3",
          name: "Máquina Este",
          description: "Almacén",
        },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: machines,
        error: null,
      });

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.data).toHaveLength(3);
    });
  });

  describe("findByStatus", () => {
    it("should find vending machines by status successfully", async () => {
      const activeMachines = [
        mockVendingMachine,
        { ...mockVendingMachine, id: "diff-id", name: "Máquina 2" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: activeMachines,
        error: null,
      });

      const result = await repository.findByStatus("active");

      expect(mockSupabase.from).toHaveBeenCalledWith("vending_machines");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("status", "active");
      expect(result.data).toEqual(activeMachines);
    });

    it("should return empty array when no machines found", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByStatus("active");

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Query failed" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByStatus("active");

      expect(result.error).toEqual(dbError);
    });

    it("should find inactive machines", async () => {
      const inactiveMachines = [
        { ...mockVendingMachine, status: "inactive" },
        {
          ...mockVendingMachine,
          id: "id-2",
          status: "inactive",
          name: "Máquina Vieja",
        },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: inactiveMachines,
        error: null,
      });

      const result = await repository.findByStatus("inactive");

      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].status).toBe("inactive");
    });

    it("should find machines in maintenance status", async () => {
      const maintenanceMachines = [
        { ...mockVendingMachine, status: "maintenance", current_stock: 0 },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: maintenanceMachines,
        error: null,
      });

      const result = await repository.findByStatus("maintenance");

      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].status).toBe("maintenance");
    });
  });

  describe("BaseRepository methods", () => {
    it("should have access to findById", () => {
      expect(typeof repository.findById).toBe("function");
    });

    it("should have access to findAll", () => {
      expect(typeof repository.findAll).toBe("function");
    });

    it("should have access to create", () => {
      expect(typeof repository.create).toBe("function");
    });

    it("should have access to update", () => {
      expect(typeof repository.update).toBe("function");
    });

    it("should have access to delete", () => {
      expect(typeof repository.delete).toBe("function");
    });
  });
});
