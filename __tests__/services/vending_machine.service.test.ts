import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { VendingMachineService } from "../../src/services/vending_machine.service";
import { VendingMachineRepository } from "../../src/repositories/vending_machine.repository";
import type {
  CreateVendingMachineDto,
  UpdateVendingMachineDto,
  VendingMachine,
} from "../../src/dto/vending_machine.dto";
import { DatabaseError } from "../../src/errors/custom-errors";

describe("VendingMachineService", () => {
  let service: VendingMachineService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = {
      findAll: jest.fn() as jest.Mock,
      findById: jest.fn() as jest.Mock,
      create: jest.fn() as jest.Mock,
      update: jest.fn() as jest.Mock,
      delete: jest.fn() as jest.Mock,
      findByServicePoint: jest.fn() as jest.Mock,
      findByStatus: jest.fn() as jest.Mock,
    };

    service = new VendingMachineService(
      mockRepository as VendingMachineRepository
    );
  });

  describe("createVendingMachine", () => {
    it("should create vending machine successfully", async () => {
      const createData: CreateVendingMachineDto = {
        service_point_id: "sp-123",
        name: "Bike Parts Vending #1",
        description: "Automated vending machine for bike parts",
        model: "BVM-2000",
        serial_number: "SN-2024-001",
        status: "operational",
        capacity: 100,
        current_stock: 75,
      };

      const createdMachine: VendingMachine = {
        id: "vm-123",
        service_point_id: "sp-123",
        name: "Bike Parts Vending #1",
        description: "Automated vending machine for bike parts",
        model: "BVM-2000",
        serial_number: "SN-2024-001",
        status: "operational",
        capacity: 100,
        current_stock: 75,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.create.mockResolvedValue({
        data: [createdMachine],
        error: null,
      });

      const result = await service.createVendingMachine(createData);

      expect(result).toEqual(createdMachine);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe("updateVendingMachine", () => {
    it("should update vending machine successfully", async () => {
      const updateData: UpdateVendingMachineDto = {
        id: "vm-1",
        current_stock: 50,
        status: "maintenance",
      };

      const updatedMachine: VendingMachine = {
        id: "vm-1",
        service_point_id: "sp-123",
        name: "Bike Parts Vending #1",
        description: "Automated vending machine for bike parts",
        model: "BVM-2000",
        serial_number: "SN-2024-001",
        status: "maintenance",
        capacity: 100,
        current_stock: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.update.mockResolvedValue({
        data: [updatedMachine],
        error: null,
      });

      const result = await service.updateVendingMachine(updateData);

      expect(result).toEqual(updatedMachine);
      expect(mockRepository.update).toHaveBeenCalledWith("vm-1", {
        current_stock: 50,
        status: "maintenance",
      });
    });
  });

  describe("findByServicePoint", () => {
    it("should return vending machines for service point", async () => {
      const mockMachines: VendingMachine[] = [
        {
          id: "vm-1",
          service_point_id: "sp-123",
          name: "Vending Machine #1",
          description: "Main vending machine",
          model: "BVM-2000",
          serial_number: "SN-001",
          status: "operational",
          capacity: 100,
          current_stock: 75,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "vm-2",
          service_point_id: "sp-123",
          name: "Vending Machine #2",
          description: "Secondary vending machine",
          model: "BVM-2000",
          serial_number: "SN-002",
          status: "operational",
          capacity: 80,
          current_stock: 60,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByServicePoint.mockResolvedValue({
        data: mockMachines,
        error: null,
      });

      const result = await service.findByServicePoint("sp-123");

      expect(result).toEqual(mockMachines);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByServicePoint).toHaveBeenCalledWith("sp-123");
    });

    it("should return empty array when service point has no machines", async () => {
      mockRepository.findByServicePoint.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByServicePoint("sp-no-machines");

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByServicePoint.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(service.findByServicePoint("sp-123")).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe("findByStatus", () => {
    it("should return machines with specific status", async () => {
      const mockMaintenanceMachines: VendingMachine[] = [
        {
          id: "vm-1",
          service_point_id: "sp-123",
          name: "Vending Machine #1",
          description: "Machine under maintenance",
          model: "BVM-2000",
          serial_number: "SN-001",
          status: "maintenance",
          capacity: 100,
          current_stock: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "vm-3",
          service_point_id: "sp-456",
          name: "Vending Machine #3",
          description: "Machine under repair",
          model: "BVM-3000",
          serial_number: "SN-003",
          status: "maintenance",
          capacity: 120,
          current_stock: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByStatus.mockResolvedValue({
        data: mockMaintenanceMachines,
        error: null,
      });

      const result = await service.findByStatus("maintenance");

      expect(result).toEqual(mockMaintenanceMachines);
      expect(result).toHaveLength(2);
      expect(result.every((machine) => machine.status === "maintenance")).toBe(
        true
      );
      expect(mockRepository.findByStatus).toHaveBeenCalledWith("maintenance");
    });

    it("should return empty array when no machines have the status", async () => {
      mockRepository.findByStatus.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByStatus("deactivated");

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByStatus.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(service.findByStatus("operational")).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe("delete (inherited)", () => {
    it("should delete vending machine successfully", async () => {
      mockRepository.delete.mockResolvedValue({
        error: null,
      });

      await expect(service.delete("vm-1")).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith("vm-1");
    });
  });
});
