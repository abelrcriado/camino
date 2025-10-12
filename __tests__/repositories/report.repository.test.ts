import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { ReportRepository } from "../../src/repositories/report.repository";
import { Report } from "../../src/dto/report.dto";
import { SupabaseClient } from "@supabase/supabase-js";

// Mock Supabase client
/* eslint-disable @typescript-eslint/no-explicit-any */
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as any as SupabaseClient;
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("ReportRepository", () => {
  let repository: ReportRepository;

  const mockReport: Report = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    type: "sales",
    title: "Reporte de Ventas Enero",
    description: "Reporte mensual de ventas del punto de servicio",
    status: "pending",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    service_point_id: "550e8400-e29b-41d4-a716-446655440002",
    data: { total: 1000, items: 10 },
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (mockSupabase.from as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.select as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.eq as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.insert as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.update as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.delete as jest.Mock).mockReturnValue(mockSupabase);

    repository = new ReportRepository(mockSupabase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with correct table name 'reports'", () => {
      expect(repository).toBeInstanceOf(ReportRepository);
    });

    it("should accept optional SupabaseClient", () => {
      const customRepo = new ReportRepository(mockSupabase);
      expect(customRepo).toBeInstanceOf(ReportRepository);
    });
  });

  describe("findByType", () => {
    it("should find reports by type successfully", async () => {
      const mockReports = [
        mockReport,
        { ...mockReport, id: "diff-id", data: { total: 2000 } },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockReports,
        error: null,
      });

      const result = await repository.findByType("sales");

      expect(mockSupabase.from).toHaveBeenCalledWith("reports");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("type", "sales");
      expect(result.data).toEqual(mockReports);
    });

    it("should return empty array when no reports found", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByType("sales");

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Database error" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByType("sales");

      expect(result.error).toEqual(dbError);
    });

    it("should find different report types", async () => {
      const inventoryReports = [
        { ...mockReport, type: "inventory", data: { stock: 500 } },
        { ...mockReport, id: "id-2", type: "inventory", data: { stock: 300 } },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: inventoryReports,
        error: null,
      });

      const result = await repository.findByType("inventory");

      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].type).toBe("inventory");
    });
  });

  describe("findByStatus", () => {
    it("should find reports by status successfully", async () => {
      const pendingReports = [mockReport, { ...mockReport, id: "diff-id" }];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: pendingReports,
        error: null,
      });

      const result = await repository.findByStatus("pending");

      expect(mockSupabase.from).toHaveBeenCalledWith("reports");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("status", "pending");
      expect(result.data).toEqual(pendingReports);
    });

    it("should return empty array when no reports found", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByStatus("pending");

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Query failed" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByStatus("pending");

      expect(result.error).toEqual(dbError);
    });

    it("should find completed reports", async () => {
      const completedReports = [
        { ...mockReport, status: "completed" },
        { ...mockReport, id: "id-2", status: "completed" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: completedReports,
        error: null,
      });

      const result = await repository.findByStatus("completed");

      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].status).toBe("completed");
    });
  });

  describe("findByUser", () => {
    it("should find reports by user ID successfully", async () => {
      const mockReports = [
        mockReport,
        { ...mockReport, id: "diff-id", type: "inventory" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockReports,
        error: null,
      });

      const result = await repository.findByUser(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("reports");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "user_id",
        "550e8400-e29b-41d4-a716-446655440001"
      );
      expect(result.data).toEqual(mockReports);
    });

    it("should return empty array when no reports found", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByUser(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "User query failed" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByUser(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.error).toEqual(dbError);
    });
  });

  describe("findByServicePoint", () => {
    it("should find reports by service point ID successfully", async () => {
      const mockReports = [
        mockReport,
        { ...mockReport, id: "diff-id", status: "completed" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockReports,
        error: null,
      });

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("reports");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "service_point_id",
        "550e8400-e29b-41d4-a716-446655440002"
      );
      expect(result.data).toEqual(mockReports);
    });

    it("should return empty array when no reports found", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Service point query failed" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByServicePoint(
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(result.error).toEqual(dbError);
    });
  });

  describe("BaseRepository methods", () => {
    it("should have access to findById", () => {
      expect(typeof repository.findById).toBe("function");
    });

    it("should have access to findAll", () => {
      expect(typeof repository.findAll).toBe("function");
    });

    it("should have access to create", () => {
      expect(typeof repository.create).toBe("function");
    });

    it("should have access to update", () => {
      expect(typeof repository.update).toBe("function");
    });

    it("should have access to delete", () => {
      expect(typeof repository.delete).toBe("function");
    });
  });
});
