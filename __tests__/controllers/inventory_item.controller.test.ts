import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { InventoryItemController } from "../../src/controllers/inventory_item.controller";
import { InventoryItemService } from "../../src/services/inventory_item.service";
import type { NextApiRequest, NextApiResponse } from "next";

describe("InventoryItemController", () => {
  let controller: InventoryItemController;
  let mockService: jest.Mocked<InventoryItemService>;
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByInventory: jest.fn(),
      createInventoryItem: jest.fn(),
      updateInventoryItem: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<InventoryItemService>;

    controller = new InventoryItemController(mockService);
    mockReq = { method: "GET", query: {}, body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
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

  it("should create item", async () => {
    mockReq.method = "POST";
    mockReq.body = {
      inventory_id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Bike Chain",
      quantity: 5,
    };
    mockService.createInventoryItem.mockResolvedValue({
      id: "item-1",
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
