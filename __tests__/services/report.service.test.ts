import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { ReportService } from "../../src/services/report.service";
import { ReportRepository } from "../../src/repositories/report.repository";
import type {
  CreateReportDto,
  UpdateReportDto,
  Report,
} from "../../src/dto/report.dto";

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
      const createData: CreateReportDto = {
        user_id: "user-123",
        service_point_id: "sp-123",
        type: "maintenance",
        title: "Report Title",
        title: "Bike Rack Issue",
        description: "Bike rack needs repair",
        status: "pending",
      };

      const createdReport: Report = {
        id: "report-123",
        user_id: "user-123",
        service_point_id: "sp-123",
        type: "maintenance",
        title: "Report Title",
        title: "Bike Rack Issue",
        description: "Bike rack needs repair",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

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
      const updateData: UpdateReportDto = {
        status: "resolved",
        description: "Fixed the bike rack",
      };

      const updatedReport: Report = {
        id: "report-1",
        user_id: "user-123",
        service_point_id: "sp-123",
        type: "maintenance",
        title: "Report Title",
        title: "Bike Rack Issue",
        description: "Bike rack needs repair",
        status: "resolved",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.update.mockResolvedValue({
        data: [updatedReport],
        error: null,
      });

      const result = await service.updateReport("report-1", updateData);

      expect(result).toEqual(updatedReport);
      expect(mockRepository.update).toHaveBeenCalledWith(
        "report-1",
        updateData
      );
    });
  });

  describe("findByType", () => {
    it("should return reports of specific type", async () => {
      const mockReports: Report[] = [
        {
          id: "report-1",
          user_id: "user-1",
          service_point_id: "sp-1",

          type: "maintenance",
          title: "Report Title",
          description: "Issue 1",
          status: "pending",

          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "report-2",
          user_id: "user-2",
          service_point_id: "sp-2",

          type: "maintenance",
          title: "Report Title",
          description: "Issue 2",
          status: "pending",

          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByType.mockResolvedValue({
        data: mockReports,
        error: null,
      });

      const result = await service.findByType("maintenance");

      expect(result).toEqual(mockReports);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByType).toHaveBeenCalledWith("maintenance");
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
      const mockReports: Report[] = [
        {
          id: "report-1",
          user_id: "user-1",
          service_point_id: "sp-1",

          type: "maintenance",
          title: "Report Title",
          description: "Pending issue",
          status: "pending",

          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByStatus.mockResolvedValue({
        data: mockReports,
        error: null,
      });

      const result = await service.findByStatus("pending");

      expect(result).toEqual(mockReports);
      expect(mockRepository.findByStatus).toHaveBeenCalledWith("pending");
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
      const mockReports: Report[] = [
        {
          id: "report-1",
          user_id: "user-123",
          service_point_id: "sp-1",

          type: "maintenance",
          title: "Report Title",
          description: "User report 1",
          status: "pending",

          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "report-2",
          user_id: "user-123",
          service_point_id: "sp-2",

          type: "issue",
          title: "Report Title",
          description: "User report 2",
          status: "resolved",

          resolution: "Fixed",

          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByUser.mockResolvedValue({
        data: mockReports,
        error: null,
      });

      const result = await service.findByUser("user-123");

      expect(result).toEqual(mockReports);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByUser).toHaveBeenCalledWith("user-123");
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
      const mockReports: Report[] = [
        {
          id: "report-1",
          user_id: "user-1",
          service_point_id: "sp-123",

          type: "maintenance",
          title: "Report Title",
          description: "SP issue 1",
          status: "pending",

          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByServicePoint.mockResolvedValue({
        data: mockReports,
        error: null,
      });

      const result = await service.findByServicePoint("sp-123");

      expect(result).toEqual(mockReports);
      expect(mockRepository.findByServicePoint).toHaveBeenCalledWith("sp-123");
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
