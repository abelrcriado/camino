import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { ReportService } from "@/api/services/report.service";
import { ReportRepository } from "@/api/repositories/report.repository";
import type { UpdateReportDto } from "@/shared/dto/report.dto";
import { ReportFactory } from "../helpers/factories";

describe("ReportService", () => {
  let service: ReportService;
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
      findByType: jest.fn() as jest.Mock,
      findByStatus: jest.fn() as jest.Mock,
      findByUser: jest.fn() as jest.Mock,
      findByServicePoint: jest.fn() as jest.Mock,
    };

    // Inject mock repository
    service = new ReportService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service as any).repository = mockRepository;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service as any).reportRepository = mockRepository;
  });

  describe("createReport", () => {
    it("should create report successfully", async () => {
      const createData = ReportFactory.createDto();
      const createdReport = ReportFactory.create(createData);

      mockRepository.create.mockResolvedValue({
        data: [createdReport],
        error: null,
      });

      const result = await service.createReport(createData);

      expect(result).toEqual(createdReport);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe("updateReport", () => {
    it("should update report successfully", async () => {
      const reportId = "report-1";
      const updateData: UpdateReportDto = {
        status: "resolved",
        description: "Fixed the bike rack",
      };

      const updatedReport = ReportFactory.create({
        id: reportId,
        status: "resolved",
      });

      mockRepository.update.mockResolvedValue({
        data: [updatedReport],
        error: null,
      });

      const result = await service.updateReport(reportId, updateData);

      expect(result).toEqual(updatedReport);
      expect(mockRepository.update).toHaveBeenCalledWith(reportId, updateData);
    });
  });

  describe("findByType", () => {
    it("should return reports of specific type", async () => {
      const reportType = "maintenance";
      const mockReports = ReportFactory.createMany(2, { type: reportType });

      mockRepository.findByType.mockResolvedValue({
        data: mockReports,
        error: null,
      });

      const result = await service.findByType(reportType);

      expect(result).toEqual(mockReports);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByType).toHaveBeenCalledWith(reportType);
    });

    it("should return empty array when no reports of type", async () => {
      mockRepository.findByType.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByType("emergency");

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByType.mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      await expect(service.findByType("maintenance")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("findByStatus", () => {
    it("should return reports with specific status", async () => {
      const reportStatus = "pending";
      const mockReports = ReportFactory.createMany(1, { status: reportStatus });

      mockRepository.findByStatus.mockResolvedValue({
        data: mockReports,
        error: null,
      });

      const result = await service.findByStatus(reportStatus);

      expect(result).toEqual(mockReports);
      expect(mockRepository.findByStatus).toHaveBeenCalledWith(reportStatus);
    });

    it("should return empty array when no reports with status", async () => {
      mockRepository.findByStatus.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByStatus("archived");

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByStatus.mockResolvedValue({
        data: null,
        error: new Error("Query failed"),
      });

      await expect(service.findByStatus("pending")).rejects.toThrow(
        "Query failed"
      );
    });
  });

  describe("findByUser", () => {
    it("should return reports for user", async () => {
      const userId = "user-123";
      const mockReports = ReportFactory.createMany(2, { user_id: userId });

      mockRepository.findByUser.mockResolvedValue({
        data: mockReports,
        error: null,
      });

      const result = await service.findByUser(userId);

      expect(result).toEqual(mockReports);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByUser).toHaveBeenCalledWith(userId);
    });

    it("should return empty array when user has no reports", async () => {
      mockRepository.findByUser.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByUser("user-no-reports");

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByUser.mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      await expect(service.findByUser("user-123")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("findByServicePoint", () => {
    it("should return reports for service point", async () => {
      const servicePointId = "sp-123";
      const mockReports = ReportFactory.createMany(1, {
        service_point_id: servicePointId,
      });

      mockRepository.findByServicePoint.mockResolvedValue({
        data: mockReports,
        error: null,
      });

      const result = await service.findByServicePoint(servicePointId);

      expect(result).toEqual(mockReports);
      expect(mockRepository.findByServicePoint).toHaveBeenCalledWith(
        servicePointId
      );
    });

    it("should return empty array when service point has no reports", async () => {
      mockRepository.findByServicePoint.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByServicePoint("sp-no-reports");

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByServicePoint.mockResolvedValue({
        data: null,
        error: new Error("Connection lost"),
      });

      await expect(service.findByServicePoint("sp-123")).rejects.toThrow(
        "Connection lost"
      );
    });
  });

  describe("delete (inherited)", () => {
    it("should delete report successfully", async () => {
      mockRepository.delete.mockResolvedValue({
        error: null,
      });

      await expect(service.delete("report-1")).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith("report-1");
    });
  });
});
