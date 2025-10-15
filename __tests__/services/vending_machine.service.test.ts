import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { VendingMachineService } from "../../src/services/vending_machine.service";
import { VendingMachineRepository } from "../../src/repositories/vending_machine.repository";
import type { UpdateVendingMachineDto } from "../../src/dto/vending_machine.dto";
import { DatabaseError } from "../../src/errors/custom-errors";
import { VendingMachineFactory } from "../helpers/factories";

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
      const createData = VendingMachineFactory.createDto();
      const createdMachine = VendingMachineFactory.create(createData);

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
      const machineId = "vm-test-id";
      const updateData: UpdateVendingMachineDto = {
        id: machineId,
        current_stock: 50,
        status: "maintenance",
      };

      const updatedMachine = VendingMachineFactory.create({
        id: machineId,
        current_stock: 50,
        status: "maintenance",
      });

      mockRepository.update.mockResolvedValue({
        data: [updatedMachine],
        error: null,
      });

      const result = await service.updateVendingMachine(updateData);

      expect(result).toEqual(updatedMachine);
      expect(mockRepository.update).toHaveBeenCalledWith(machineId, {
        current_stock: 50,
        status: "maintenance",
      });
    });
  });

  describe("findByServicePoint", () => {
    it("should return vending machines for service point", async () => {
      const servicePointId = "sp-123";
      const mockMachines = VendingMachineFactory.createMany(2, {
        service_point_id: servicePointId,
      });

      mockRepository.findByServicePoint.mockResolvedValue({
        data: mockMachines,
        error: null,
      });

      const result = await service.findByServicePoint(servicePointId);

      expect(result).toEqual(mockMachines);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByServicePoint).toHaveBeenCalledWith(
        servicePointId
      );
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
      const status = "maintenance";
      const mockMaintenanceMachines = VendingMachineFactory.createMany(2, {
        status,
      });

      mockRepository.findByStatus.mockResolvedValue({
        data: mockMaintenanceMachines,
        error: null,
      });

      const result = await service.findByStatus(status);

      expect(result).toEqual(mockMaintenanceMachines);
      expect(result).toHaveLength(2);
      expect(result.every((machine) => machine.status === status)).toBe(true);
      expect(mockRepository.findByStatus).toHaveBeenCalledWith(status);
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
