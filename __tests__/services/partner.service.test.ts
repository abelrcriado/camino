import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { PartnerService } from "../../src/services/partner.service";
import { PartnerRepository } from "../../src/repositories/partner.repository";
import type {
  CreatePartnerDto,
  UpdatePartnerDto,
  Partner,
} from "../../src/dto/partner.dto";

describe("PartnerService", () => {
  let service: PartnerService;
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
    };

    service = new PartnerService(mockRepository as PartnerRepository);
  });

  describe("createPartner", () => {
    it("should create partner successfully", async () => {
      const createData: CreatePartnerDto = {
        name: "Bike Shop Partner",
        type: "bike_shop",
        contact_email: "partner@bikeshop.com",
        contact_phone: "+34123456789",
      };

      const createdPartner: Partner = {
        id: "partner-123",
        name: "Bike Shop Partner",
        type: "bike_shop",
        contact_email: "partner@bikeshop.com",
        contact_phone: "+34123456789",
        website_url: undefined,
        description: undefined,

        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.create.mockResolvedValue({
        data: [createdPartner],
        error: null,
      });

      const result = await service.createPartner(createData);

      expect(result).toEqual(createdPartner);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe("updatePartner", () => {
    it("should update partner successfully", async () => {
      const updateData: UpdatePartnerDto = {
        id: "partner-1",
        name: "Updated Partner Name",
      };

      const updatedPartner: Partner = {
        id: "partner-1",
        name: "Updated Partner Name",
        type: "bike_shop",
        contact_email: "partner@example.com",
        contact_phone: "+34123456789",
        website_url: undefined,
        description: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.update.mockResolvedValue({
        data: [updatedPartner],
        error: null,
      });

      const result = await service.updatePartner(updateData);

      expect(result).toEqual(updatedPartner);
      expect(mockRepository.update).toHaveBeenCalledWith("partner-1", {
        name: "Updated Partner Name",
      });
    });
  });

  describe("findByType", () => {
    it("should return partners of specified type", async () => {
      const mockPartners: Partner[] = [
        {
          id: "partner-1",
          name: "Bike Shop 1",
          type: "bike_shop",
          contact_email: "shop1@example.com",
          contact_phone: "+34123456789",
          website_url: undefined,
          description: undefined,

          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "partner-2",
          name: "Bike Shop 2",
          type: "bike_shop",
          contact_email: "shop2@example.com",
          contact_phone: "+34123456789",
          website_url: undefined,
          description: undefined,

          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByType.mockResolvedValue({
        data: mockPartners,
        error: null,
      });

      const result = await service.findByType("bike_shop");

      expect(result).toEqual(mockPartners);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByType).toHaveBeenCalledWith("bike_shop");
    });

    it("should return empty array when no partners of type found", async () => {
      mockRepository.findByType.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByType("repair_shop");

      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByType.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(service.findByType("bike_shop")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("delete (inherited)", () => {
    it("should delete partner successfully", async () => {
      mockRepository.delete.mockResolvedValue({
        error: null,
      });

      await expect(service.delete("partner-1")).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith("partner-1");
    });
  });
});
