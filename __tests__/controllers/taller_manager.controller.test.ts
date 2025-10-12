import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { TallerManagerController } from "../../src/controllers/taller_manager.controller";
import { TallerManagerService } from "../../src/services/taller_manager.service";
import type { NextApiRequest, NextApiResponse } from "next";

describe("TallerManagerController", () => {
  let controller: TallerManagerController;
  let mockService: jest.Mocked<TallerManagerService>;
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByWorkshop: jest.fn(),
      findByUser: jest.fn(),
      createTallerManager: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<TallerManagerService>;

    controller = new TallerManagerController(mockService);
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

  it("should filter by workshop_id", async () => {
    const workshopId = "550e8400-e29b-41d4-a716-446655440001";
    mockReq.query = { workshop_id: workshopId };
    mockService.findByWorkshop.mockResolvedValue([]);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockService.findByWorkshop).toHaveBeenCalledWith(workshopId);
  });

  it("should filter by user_id", async () => {
    const userId = "550e8400-e29b-41d4-a716-446655440002";
    mockReq.query = { user_id: userId };
    mockService.findByUser.mockResolvedValue([]);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockService.findByUser).toHaveBeenCalledWith(userId);
  });

  it("should create manager", async () => {
    mockReq.method = "POST";
    mockReq.body = {
      workshop_id: "123e4567-e89b-12d3-a456-426614174000",
      user_id: "223e4567-e89b-12d3-a456-426614174000",
      name: "John Manager",
      email: "john@workshop.com",
      phone: "+34600123456",
    };
    mockService.createTallerManager.mockResolvedValue({
      id: "tm-1",
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
