import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { ReportController } from "../../src/controllers/report.controller";
import { ReportService } from "../../src/services/report.service";
import type { NextApiRequest, NextApiResponse } from "next";
import { ReportFactory } from "../helpers/factories";

describe("ReportController", () => {
  let controller: ReportController;
  let mockService: jest.Mocked<ReportService>;
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
      findByType: jest.fn(),
      findByStatus: jest.fn(),
      createReport: jest.fn(),
      updateReport: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ReportService>;

    controller = new ReportController();
    (controller as any).reportService = mockService;

    mockReq = { method: "GET", query: {}, body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
  });

  it("should route GET requests", async () => {
    mockReq.method = "GET";
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

  it("should filter by user_id", async () => {
    const mockReport = ReportFactory.create();
    mockReq.query = { user_id: mockReport.user_id };
    mockService.findByUser.mockResolvedValue([mockReport]);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockService.findByUser).toHaveBeenCalledWith(mockReport.user_id);
  });

  it("should filter by type", async () => {
    mockReq.query = { type: "incident" };
    mockService.findByType.mockResolvedValue([]);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockService.findByType).toHaveBeenCalledWith("incident");
  });

  it("should filter by status", async () => {
    mockReq.query = { status: "submitted" };
    mockService.findByStatus.mockResolvedValue([]);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockService.findByStatus).toHaveBeenCalledWith("submitted");
  });

  it("should create report", async () => {
    mockReq.method = "POST";
    const reqBody = ReportFactory.createDto();
    mockReq.body = reqBody;
    const createdReport = ReportFactory.create({
      ...reqBody,
    });
    mockService.createReport.mockResolvedValue(createdReport);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it("should update report", async () => {
    mockReq.method = "PUT";
    const existingReport = ReportFactory.create();
    mockReq.body = {
      id: existingReport.id,
      status: "approved",
    };
    const updatedReport = ReportFactory.create({ ...mockReq.body });
    mockService.updateReport.mockResolvedValue(updatedReport);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it("should delete report", async () => {
    mockReq.method = "DELETE";
    const reportId = ReportFactory.create().id;
    mockReq.body = { id: reportId };
    mockService.delete.mockResolvedValue(undefined);
    await controller.handle(
      mockReq as NextApiRequest,
      mockRes as NextApiResponse
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
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
