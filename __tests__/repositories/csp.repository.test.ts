import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { CSPRepository } from "../../src/repositories/csp.repository";
import { CSP } from "../../src/dto/csp.dto";
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
  order: jest.fn(),
  range: jest.fn(),
} as any as SupabaseClient;
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("CSPRepository", () => {
  let repository: CSPRepository;

  const mockCSP: CSP = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Test Service Point",
    type: "workshop",
    address: "123 Test St",
    latitude: 40.4168,
    longitude: -3.7038,
    status: "active",
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
    (mockSupabase.order as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.range as jest.Mock).mockReturnValue(mockSupabase);

    repository = new CSPRepository(mockSupabase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with correct table name 'csps'", () => {
      expect(repository).toBeInstanceOf(CSPRepository);
    });

    it("should accept optional SupabaseClient", () => {
      const customRepo = new CSPRepository(mockSupabase);
      expect(customRepo).toBeInstanceOf(CSPRepository);
    });
  });

  describe("findByType", () => {
    it("should find CSPs by type 'workshop'", async () => {
      const mockCSPs = [
        mockCSP,
        { ...mockCSP, id: "diff-id", name: "Another Workshop" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockCSPs,
        error: null,
      });

      const result = await repository.findByType("workshop");

      expect(mockSupabase.from).toHaveBeenCalledWith("csps");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("type", "workshop");
      expect(result.data).toEqual(mockCSPs);
    });

    it("should find CSPs by type 'service_center'", async () => {
      const serviceCenter = {
        ...mockCSP,
        type: "service_center",
        name: "Service Center",
      };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [serviceCenter],
        error: null,
      });

      const result = await repository.findByType("service_center");

      expect(mockSupabase.eq).toHaveBeenCalledWith("type", "service_center");
      expect(result.data?.[0].type).toBe("service_center");
    });

    it("should return empty array when no CSPs of type found", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByType("unknown-type");

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Database error" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findByType("workshop");

      expect(result.error).toEqual(dbError);
    });
  });

  describe("findActive", () => {
    it("should find all active CSPs", async () => {
      const activeCSPs = [
        mockCSP,
        { ...mockCSP, id: "id-2", name: "Active CSP 2" },
        { ...mockCSP, id: "id-3", name: "Active CSP 3" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: activeCSPs,
        error: null,
      });

      const result = await repository.findActive();

      expect(mockSupabase.from).toHaveBeenCalledWith("csps");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("status", "active");
      expect(result.data).toHaveLength(3);
      expect(result.data?.every((csp: CSP) => csp.status === "active")).toBe(
        true
      );
    });

    it("should return empty array when no active CSPs", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findActive();

      expect(result.data).toEqual([]);
    });

    it("should return error on database failure", async () => {
      const dbError = { message: "Connection timeout" };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findActive();

      expect(result.error).toEqual(dbError);
    });

    it("should only return active status CSPs", async () => {
      const activeCSPs = [mockCSP];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: activeCSPs,
        error: null,
      });

      const result = await repository.findActive();

      expect(result.data?.every((csp: CSP) => csp.status === "active")).toBe(
        true
      );
    });
  });

  describe("findNearby", () => {
    it("should call findAll for nearby search", async () => {
      const mockCSPs = [mockCSP, { ...mockCSP, id: "id-2" }];

      // Mock findAll method
      jest.spyOn(repository, "findAll").mockResolvedValue({
        data: mockCSPs,
        error: null,
      });

      const result = await repository.findNearby(40.4168, -3.7038, 10);

      expect(repository.findAll).toHaveBeenCalled();
      expect(result.data).toEqual(mockCSPs);
    });

    it("should accept latitude, longitude, and radius parameters", async () => {
      jest.spyOn(repository, "findAll").mockResolvedValue({
        data: [mockCSP],
        error: null,
      });

      await repository.findNearby(40.4168, -3.7038, 5);

      expect(repository.findAll).toHaveBeenCalled();
    });

    it("should return empty array when no CSPs found", async () => {
      jest.spyOn(repository, "findAll").mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findNearby(40.4168, -3.7038, 10);

      expect(result.data).toEqual([]);
    });

    it("should return error when findAll fails", async () => {
      const dbError = { message: "Database error" };
      jest.spyOn(repository, "findAll").mockResolvedValue({
        data: null,
        error: dbError,
      });

      const result = await repository.findNearby(40.4168, -3.7038, 10);

      expect(result.error).toEqual(dbError);
    });

    it("should handle negative coordinates", async () => {
      jest.spyOn(repository, "findAll").mockResolvedValue({
        data: [mockCSP],
        error: null,
      });

      await repository.findNearby(-40.4168, -3.7038, 10);

      expect(repository.findAll).toHaveBeenCalled();
    });

    it("should handle zero radius", async () => {
      jest.spyOn(repository, "findAll").mockResolvedValue({
        data: [],
        error: null,
      });

      await repository.findNearby(40.4168, -3.7038, 0);

      expect(repository.findAll).toHaveBeenCalled();
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
