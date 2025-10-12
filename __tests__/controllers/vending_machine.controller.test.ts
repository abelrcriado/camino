import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { VendingMachineController } from "../../src/controllers/vending_machine.controller";
import { VendingMachineService } from "../../src/services/vending_machine.service";
import type { NextApiRequest, NextApiResponse } from "next";

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
    const validServicePointId = "123e4567-e89b-12d3-a456-426614174000";
    mockReq.query = { service_point_id: validServicePointId };
    mockService.findByServicePoint.mockResolvedValue([]);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockService.findByServicePoint).toHaveBeenCalledWith(
      validServicePointId
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it("should filter by status", async () => {
    mockReq.query = { status: "operational" };
    mockService.findByStatus.mockResolvedValue([]);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockService.findByStatus).toHaveBeenCalledWith("operational");
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it("should create vending machine", async () => {
    mockReq.method = "POST";
    mockReq.body = {
      service_point_id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Snacks Machine #1",
      status: "operational",
    };
    mockService.createVendingMachine.mockResolvedValue({
      id: "vm-1",
      ...mockReq.body,
    });
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
