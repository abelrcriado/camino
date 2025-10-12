import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { PartnerRepository } from "../../src/repositories/partner.repository";
import { Partner } from "../../src/dto/partner.dto";
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

describe("PartnerRepository", () => {
  let repository: PartnerRepository;

  const mockPartner: Partner = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Test Partner",
    type: "supplier",
    contact_email: "partner@test.com",
    contact_phone: "+34600000000",
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

    repository = new PartnerRepository(mockSupabase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with correct table name 'partners'", () => {
      expect(repository).toBeInstanceOf(PartnerRepository);
    });

    it("should accept optional SupabaseClient", () => {
      const customRepo = new PartnerRepository(mockSupabase);
      expect(customRepo).toBeInstanceOf(PartnerRepository);
    });

    it("should use default supabase client when not provided", () => {
      const defaultRepo = new PartnerRepository();
      expect(defaultRepo).toBeInstanceOf(PartnerRepository);
    });
  });

  describe("findByType", () => {
    it("should find partners by type 'supplier'", async () => {
      const mockPartners = [
        mockPartner,
        { ...mockPartner, id: "diff-id", name: "Another Supplier" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: mockPartners,
        error: null,
      });

      const result = await repository.findByType("supplier");

      expect(mockSupabase.from).toHaveBeenCalledWith("partners");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("type", "supplier");
      expect(result.data).toEqual(mockPartners);
    });

    it("should find partners by type 'manufacturer'", async () => {
      const manufacturer = {
        ...mockPartner,
        type: "manufacturer",
        name: "Manufacturer Co",
      };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [manufacturer],
        error: null,
      });

      const result = await repository.findByType("manufacturer");

      expect(mockSupabase.eq).toHaveBeenCalledWith("type", "manufacturer");
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].type).toBe("manufacturer");
    });

    it("should find partners by type 'distributor'", async () => {
      const distributor = {
        ...mockPartner,
        type: "distributor",
        name: "Distributor Inc",
      };
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [distributor],
        error: null,
      });

      const result = await repository.findByType("distributor");

      expect(mockSupabase.eq).toHaveBeenCalledWith("type", "distributor");
      expect(result.data?.[0].type).toBe("distributor");
    });

    it("should return empty array when no partners of type found", async () => {
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

      const result = await repository.findByType("supplier");

      expect(result.error).toEqual(dbError);
    });

    it("should handle case-sensitive type searches", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByType("SUPPLIER");

      expect(mockSupabase.eq).toHaveBeenCalledWith("type", "SUPPLIER");
      expect(result.data).toEqual([]);
    });

    it("should find multiple partners of the same type", async () => {
      const partners = [
        mockPartner,
        { ...mockPartner, id: "id-2", name: "Partner 2" },
        { ...mockPartner, id: "id-3", name: "Partner 3" },
      ];
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: partners,
        error: null,
      });

      const result = await repository.findByType("supplier");

      expect(result.data).toHaveLength(3);
    });

    it("should handle empty string type", async () => {
      (mockSupabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findByType("");

      expect(mockSupabase.eq).toHaveBeenCalledWith("type", "");
      expect(result.data).toEqual([]);
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
