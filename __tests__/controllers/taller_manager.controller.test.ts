import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { TallerManagerController } from "@/api/controllers/taller_manager.controller";
import { TallerManagerService } from "@/api/services/taller_manager.service";
import type { NextApiRequest, NextApiResponse } from "next";
import { TallerManagerFactory } from "../helpers/factories";

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
    const mockManager = TallerManagerFactory.create();
    mockReq.query = { workshop_id: mockManager.workshop_id };
    mockService.findByWorkshop.mockResolvedValue([mockManager]);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockService.findByWorkshop).toHaveBeenCalledWith(mockManager.workshop_id);
  });

  it("should filter by user_id", async () => {
    const mockManager = TallerManagerFactory.create();
    mockReq.query = { user_id: mockManager.user_id };
    mockService.findByUser.mockResolvedValue([mockManager]);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockService.findByUser).toHaveBeenCalledWith(mockManager.user_id);
  });

  it("should create manager", async () => {
    mockReq.method = "POST";
    const reqBody = TallerManagerFactory.createDto({
      name: "John Manager",
      email: "john@workshop.com",
      phone: "+34600123456",
    });
    mockReq.body = reqBody;
    const createdManager = TallerManagerFactory.create({
      ...reqBody,
    });
    mockService.createTallerManager.mockResolvedValue(createdManager);
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
