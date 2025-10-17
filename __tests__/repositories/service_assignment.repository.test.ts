/**
 * Tests para ServiceAssignmentRepository
 * Valida operaciones de repositorio con dependency injection
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ServiceAssignmentRepository } from "@/api/repositories/service_assignment.repository";
import { SupabaseClient } from "@supabase/supabase-js";
import { ServiceAssignmentFactory } from "../helpers/factories";

describe("ServiceAssignmentRepository", () => {
  let repository: ServiceAssignmentRepository;
  let mockSupabase: any;

  beforeEach(() => {
    // Mock SupabaseClient con dependency injection pattern
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      rpc: jest.fn(),
    } as any as SupabaseClient;

    // Repository con dependency injection
    repository = new ServiceAssignmentRepository(mockSupabase);
  });

  describe("Constructor", () => {
    it("should initialize with correct table name 'servicio_service_point'", () => {
      expect(repository).toBeDefined();
      expect((repository as any).tableName).toBe("servicio_service_point");
    });

    it("should accept optional SupabaseClient", () => {
      const customRepo = new ServiceAssignmentRepository(mockSupabase);
      expect(customRepo).toBeDefined();
    });
  });

  describe("findByServiceAndPoint", () => {
    it("should find assignment by service_id and service_point_id successfully", async () => {
      const mockAssignment = {
        id: "assignment-123",
        service_id: "service-456",
        service_point_id: "sp-789",
        is_active: true,
        priority: 50,
        configuracion: {},
        created_at: "2025-10-10T10:00:00Z",
        updated_at: "2025-10-10T10:00:00Z",
      };

      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: mockAssignment,
        error: null,
      });

      const result = await repository.findByServiceAndPoint(
        "service-456",
        "sp-789"
      );

      expect(result).toEqual(mockAssignment);
      expect(mockSupabase.from).toHaveBeenCalledWith("servicio_service_point");
      expect(mockSupabase.eq).toHaveBeenCalledWith("service_id", "service-456");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "service_point_id",
        "sp-789"
      );
    });

    it("should return null when assignment not found", async () => {
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.findByServiceAndPoint(
        "service-456",
        "sp-789"
      );

      expect(result).toBeNull();
    });

    it("should throw error on database failure", async () => {
      const dbError = { message: "Database error" };
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      await expect(
        repository.findByServiceAndPoint("service-456", "sp-789")
      ).rejects.toEqual(dbError);
    });
  });

  describe("findByService", () => {
    it("should find all assignments for a service", async () => {
      const mockAssignments = [
        {
          id: "assignment-1",
          service_id: "service-123",
          service_point_id: "sp-1",
          priority: 100,
        },
        {
          id: "assignment-2",
          service_id: "service-123",
          service_point_id: "sp-2",
          priority: 50,
        },
      ];

      // Mock the chain - order() es el último en la cadena antes de awaitar
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: mockAssignments,
        error: null,
      });

      const result = await repository.findByService("service-123");

      expect(result).toEqual(mockAssignments);
      expect(mockSupabase.from).toHaveBeenCalledWith("servicio_service_point");
      expect(mockSupabase.eq).toHaveBeenCalledWith("service_id", "service-123");
      expect(mockSupabase.order).toHaveBeenCalledWith("priority", {
        ascending: false,
      });
    });

    it("should return empty array when service has no assignments", async () => {
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.findByService("service-123");

      expect(result).toEqual([]);
    });

    it("should throw error on database failure", async () => {
      const dbError = { message: "Database error" };
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      await expect(repository.findByService("service-123")).rejects.toEqual(
        dbError
      );
    });
  });

  describe("findByServicePoint", () => {
    it("should find all assignments for a service point", async () => {
      const mockAssignments = [
        {
          id: "assignment-1",
          service_id: "service-1",
          service_point_id: "sp-123",
          priority: 90,
        },
        {
          id: "assignment-2",
          service_id: "service-2",
          service_point_id: "sp-123",
          priority: 80,
        },
      ];

      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: mockAssignments,
        error: null,
      });

      const result = await repository.findByServicePoint("sp-123");

      expect(result).toEqual(mockAssignments);
      expect(mockSupabase.from).toHaveBeenCalledWith("servicio_service_point");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "service_point_id",
        "sp-123"
      );
      expect(mockSupabase.order).toHaveBeenCalledWith("priority", {
        ascending: false,
      });
    });

    it("should return empty array when service point has no assignments", async () => {
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.findByServicePoint("sp-123");

      expect(result).toEqual([]);
    });
  });

  describe("assignmentExists", () => {
    it("should return true when assignment exists", async () => {
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: { id: "assignment-123" },
        error: null,
      });

      const result = await repository.assignmentExists("service-456", "sp-789");

      expect(result).toBe(true);
      expect(mockSupabase.select).toHaveBeenCalledWith("id");
    });

    it("should return false when assignment does not exist", async () => {
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: "PGRST116" }, // No rows returned
      });

      const result = await repository.assignmentExists("service-456", "sp-789");

      expect(result).toBe(false);
    });

    it("should throw error on database failure (non-PGRST116)", async () => {
      const dbError = { code: "XXXX", message: "Database error" };
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      await expect(
        repository.assignmentExists("service-456", "sp-789")
      ).rejects.toEqual(dbError);
    });
  });

  describe("getStats", () => {
    it("should call RPC function get_assignment_stats", async () => {
      const mockStats = {
        total_assignments: 100,
        active_assignments: 75,
        inactive_assignments: 25,
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const result = await repository.getStats();

      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_assignment_stats");
      expect(result).toEqual(mockStats);
    });

    it("should throw error when RPC fails", async () => {
      const dbError = { message: "RPC error" };
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      await expect(repository.getStats()).rejects.toEqual(dbError);
    });
  });

  describe("BaseRepository methods", () => {
    it("should have access to findById", async () => {
      expect(repository.findById).toBeDefined();
    });

    it("should have access to findAll", async () => {
      expect(repository.findAll).toBeDefined();
    });

    it("should have access to create", async () => {
      expect(repository.create).toBeDefined();
    });

    it("should have access to update", async () => {
      expect(repository.update).toBeDefined();
    });

    it("should have access to delete", async () => {
      expect(repository.delete).toBeDefined();
    });
  });
});
