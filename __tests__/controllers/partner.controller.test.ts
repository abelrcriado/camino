import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { PartnerController } from "../../src/controllers/partner.controller";
import { PartnerService } from "../../src/services/partner.service";
import type { NextApiRequest, NextApiResponse } from "next";

describe("PartnerController", () => {
  let controller: PartnerController;
  let mockService: jest.Mocked<PartnerService>;
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByType: jest.fn(),
      createPartner: jest.fn(),
      updatePartner: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<PartnerService>;

    controller = new PartnerController(mockService);
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

  it("should filter by type", async () => {
    mockReq.query = { type: "sponsor" };
    mockService.findByType.mockResolvedValue([]);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockService.findByType).toHaveBeenCalledWith("sponsor");
  });

  it("should create partner", async () => {
    mockReq.method = "POST";
    mockReq.body = {
      name: "Bike Brand",
      type: "sponsor",
      contact_phone: "+34600123456",
    };
    mockService.createPartner.mockResolvedValue({
      id: "partner-1",
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
