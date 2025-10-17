import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { PartnerService } from "@/api/services/partner.service";
import { PartnerRepository } from "@/api/repositories/partner.repository";
import type { UpdatePartnerDto } from "@/shared/dto/partner.dto";
import { DatabaseError } from "@/api/errors/custom-errors";
import { PartnerFactory } from "../helpers/factories";

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
      const createData = PartnerFactory.createDto({
        name: "Bike Shop Partner",
        type: "bike_shop",
        contact_email: "partner@bikeshop.com",
      });

      const createdPartner = PartnerFactory.create(createData);

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
      const partnerId = "partner-1";
      const updateData: UpdatePartnerDto = {
        id: partnerId,
        name: "Updated Partner Name",
      };

      const updatedPartner = PartnerFactory.create({
        id: partnerId,
        name: "Updated Partner Name",
      });

      mockRepository.update.mockResolvedValue({
        data: [updatedPartner],
        error: null,
      });

      const result = await service.updatePartner(updateData);

      expect(result).toEqual(updatedPartner);
      expect(mockRepository.update).toHaveBeenCalledWith(partnerId, {
        name: "Updated Partner Name",
      });
    });
  });

  describe("findByType", () => {
    it("should return partners of specified type", async () => {
      const partnerType = "bike_shop";
      const mockPartners = PartnerFactory.createMany(2, { type: partnerType });

      mockRepository.findByType.mockResolvedValue({
        data: mockPartners,
        error: null,
      });

      const result = await service.findByType(partnerType);

      expect(result).toEqual(mockPartners);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByType).toHaveBeenCalledWith(partnerType);
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
        DatabaseError
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
