import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { VendingMachineController } from "@/api/controllers/vending_machine.controller";
import { VendingMachineService } from "@/api/services/vending_machine.service";
import type { NextApiRequest, NextApiResponse } from "next";
import { VendingMachineFactory } from "../helpers/factories";

/* eslint-disable @typescript-eslint/no-explicit-any */

describe("VendingMachineController", () => {
  let controller: VendingMachineController;
  let mockService: jest.Mocked<VendingMachineService>;
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByServicePoint: jest.fn(),
      findByStatus: jest.fn(),
      createVendingMachine: jest.fn(),
      updateVendingMachine: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<VendingMachineService>;

    controller = new VendingMachineController(mockService);
    mockReq = { method: "GET", query: {}, body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
      end: jest.fn().mockReturnThis() as any,
      setHeader: jest.fn().mockReturnThis() as any,
    };
  });

  it("should route GET requests", async () => {
    mockService.findAll.mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    });
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it("should filter by service_point_id", async () => {
    const mockMachine = VendingMachineFactory.create();
    mockReq.query = { service_point_id: mockMachine.service_point_id };
    mockService.findByServicePoint.mockResolvedValue([mockMachine]);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockService.findByServicePoint).toHaveBeenCalledWith(
      mockMachine.service_point_id
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it("should filter by status", async () => {
    mockReq.query = { status: "operational" };
    const mockMachines = VendingMachineFactory.createMany(2, { status: "operational" });
    mockService.findByStatus.mockResolvedValue(mockMachines);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockService.findByStatus).toHaveBeenCalledWith("operational");
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it("should create vending machine", async () => {
    mockReq.method = "POST";
    const reqBody = VendingMachineFactory.createDto({
      name: "Snacks Machine #1",
      status: "operational",
    });
    mockReq.body = reqBody;
    const createdMachine = VendingMachineFactory.create({
      ...reqBody,
    });
    mockService.createVendingMachine.mockResolvedValue(createdMachine);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it("should handle errors", async () => {
    mockService.findAll.mockRejectedValue(new Error("DB error"));
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });
});
