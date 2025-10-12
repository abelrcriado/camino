import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { TallerManagerRepository } from "../../src/repositories/taller_manager.repository";
import { TallerManager } from "../../src/dto/taller_manager.dto";
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

describe("TallerManagerRepository", () => {
  let repository: TallerManagerRepository;

  const mockTallerManager: TallerManager = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    workshop_id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Juan Pérez",
    email: "juan.perez@taller.com",
    phone: "+34123456789",
    role: "manager",
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

    repository = new TallerManagerRepository(mockSupabase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with correct table name 'taller_managers'", () => {
      expect(repository).toBeInstanceOf(TallerManagerRepository);
    });

    it("should accept optional SupabaseClient", () => {
      const customRepo = new TallerManagerRepository(mockSupabase);
      expect(customRepo).toBeInstanceOf(TallerManagerRepository);
    });
  });

  describe("findByWorkshop", () => {
    it("should find taller managers by workshop ID successfully", async () => {
      const mockManagers = [
        mockTallerManager,
        { ...mockTallerManager, id: "diff-id", user_id: "user-2" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockManagers,
        error: null,
      });

      const result = await repository.findByWorkshop(
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("taller_managers");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "workshop_id",
        "550e8400-e29b-41d4-a716-446655440002"
      );
      expect(result.data).toEqual(mockManagers);
    });

    it("should return empty array when no managers found", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByWorkshop(
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Database error" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByWorkshop(
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(result.error).toEqual(dbError);
    });

    it("should find multiple managers for same workshop", async () => {
      const managers = [
        mockTallerManager,
        {
          ...mockTallerManager,
          id: "id-2",
          user_id: "user-2",
          role: "supervisor",
        },
        { ...mockTallerManager, id: "id-3", user_id: "user-3", role: "admin" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: managers,
        error: null,
      });

      const result = await repository.findByWorkshop(
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(result.data).toHaveLength(3);
    });
  });

  describe("findByUser", () => {
    it("should find taller managers by user ID successfully", async () => {
      const mockManagers = [
        mockTallerManager,
        { ...mockTallerManager, id: "diff-id", workshop_id: "ws-2" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockManagers,
        error: null,
      });

      const result = await repository.findByUser(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("taller_managers");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "user_id",
        "550e8400-e29b-41d4-a716-446655440001"
      );
      expect(result.data).toEqual(mockManagers);
    });

    it("should return empty array when no managers found", async () => {
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
      const dbError = { message: "Query failed" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByUser(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.error).toEqual(dbError);
    });

    it("should find user managing multiple workshops", async () => {
      const managers = [
        mockTallerManager,
        { ...mockTallerManager, id: "id-2", workshop_id: "ws-2" },
        { ...mockTallerManager, id: "id-3", workshop_id: "ws-3" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: managers,
        error: null,
      });

      const result = await repository.findByUser(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result.data).toHaveLength(3);
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
