import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { InventoryController } from "@/api/controllers/inventory.controller";
import { InventoryService } from "@/api/services/inventory.service";
import type { NextApiRequest, NextApiResponse } from "next";
import { InventoryFactory } from "../helpers/factories";

/* eslint-disable @typescript-eslint/no-explicit-any */

describe("InventoryController", () => {
  let controller: InventoryController;
  let mockService: jest.Mocked<InventoryService>;
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByServicePoint: jest.fn(),
      createInventory: jest.fn(),
      updateInventory: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<InventoryService>;

    controller = new InventoryController(mockService);
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
    const mockInventory = InventoryFactory.create();
    mockReq.query = { service_point_id: mockInventory.service_point_id };
    mockService.findByServicePoint.mockResolvedValue([mockInventory]);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockService.findByServicePoint).toHaveBeenCalledWith(
      mockInventory.service_point_id
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it("should create inventory", async () => {
    mockReq.method = "POST";
    const reqBody = InventoryFactory.createDto({
      name: "Bike Tires",
      quantity: 10,
      min_stock: 5,
    });
    mockReq.body = reqBody;
    const createdInventory = InventoryFactory.create({
      ...reqBody,
    });
    mockService.createInventory.mockResolvedValue(createdInventory);
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
