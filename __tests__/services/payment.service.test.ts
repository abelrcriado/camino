import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { PaymentService } from "@/api/services/payment.service";
import { PaymentRepository } from "@/api/repositories/payment.repository";
import type { UpdatePaymentDto } from "@/shared/dto/payment.dto";
import { PaymentFactory } from "../helpers/factories";

describe("PaymentService", () => {
  let service: PaymentService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByUserId: jest.fn(),
      findByBookingId: jest.fn(),
      findWithFilters: jest.fn(),
    };

    service = new PaymentService(mockRepository as PaymentRepository);
  });

  // ============================================================================
  // Tests heredados de BaseService
  // ============================================================================
  describe("findById (inherited)", () => {
    it("should return payment when found", async () => {
      const mockPayment = PaymentFactory.create();

      mockRepository.findById.mockResolvedValue({
        data: mockPayment,
        error: null,
      });
      const result = await service.findById(mockPayment.id);
      expect(result).toEqual(mockPayment);
    });
  });

  // ============================================================================
  // Tests específicos de PaymentService
  // ============================================================================
  describe("createPayment", () => {
    it("should create payment successfully", async () => {
      const createData = PaymentFactory.createDto();
      const createdPayment = PaymentFactory.create(createData);

      mockRepository.create.mockResolvedValue({
        data: [createdPayment],
        error: null,
      });
      const result = await service.createPayment(createData);
      expect(result).toEqual(createdPayment);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe("updatePayment", () => {
    it("should update payment successfully", async () => {
      const paymentId = "pay-test-id";
      const updateData: UpdatePaymentDto = {
        status: "succeeded",
        stripe_payment_intent_id: "pi-1-updated",
        stripe_charge_id: "ch-1-updated",
      };

      const updatedPayment = PaymentFactory.create({
        id: paymentId,
        ...updateData,
      });

      mockRepository.update.mockResolvedValue({
        data: [updatedPayment],
        error: null,
      });
      const result = await service.updatePayment(paymentId, updateData);
      expect(result).toEqual(updatedPayment);
      expect(mockRepository.update).toHaveBeenCalledWith(paymentId, updateData);
    });
  });

  describe("findByUser", () => {
    it("should return payments for user", async () => {
      const userId = "user-123";
      const mockPayments = PaymentFactory.createMany(2, { user_id: userId });

      mockRepository.findByUserId.mockResolvedValue(mockPayments);
      const result = await service.findByUser(userId);
      expect(result).toEqual(mockPayments);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it("should return empty array when user has no payments", async () => {
      mockRepository.findByUserId.mockResolvedValue([]);
      const result = await service.findByUser("user-no-payments");
      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByUserId.mockRejectedValue(
        new Error("Database error")
      );
      await expect(service.findByUser("user-123")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("findByBooking", () => {
    it("should return payments for booking", async () => {
      const bookingId = "booking-123";
      const mockPayments = PaymentFactory.createMany(1, {
        booking_id: bookingId,
      });

      mockRepository.findByBookingId.mockResolvedValue(mockPayments);
      const result = await service.findByBooking(bookingId);
      expect(result).toEqual(mockPayments);
      expect(mockRepository.findByBookingId).toHaveBeenCalledWith(bookingId);
    });

    it("should return empty array when booking has no payments", async () => {
      mockRepository.findByBookingId.mockResolvedValue([]);
      const result = await service.findByBooking("booking-no-payments");
      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findByBookingId.mockRejectedValue(
        new Error("Query failed")
      );
      await expect(service.findByBooking("booking-123")).rejects.toThrow(
        "Query failed"
      );
    });
  });

  describe("findByStatus", () => {
    it("should return payments with status", async () => {
      const status = "pending";
      const mockPayments = PaymentFactory.createMany(2, { status });

      mockRepository.findWithFilters.mockResolvedValue(mockPayments);
      const result = await service.findByStatus(status);
      expect(result).toEqual(mockPayments);
      expect(result).toHaveLength(2);
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith({ status });
    });

    it("should return empty array when no payments with status", async () => {
      mockRepository.findWithFilters.mockResolvedValue([]);
      const result = await service.findByStatus("refunded");
      expect(result).toEqual([]);
    });

    it("should throw error when repository fails", async () => {
      mockRepository.findWithFilters.mockRejectedValue(
        new Error("Connection lost")
      );
      await expect(service.findByStatus("pending")).rejects.toThrow(
        "Connection lost"
      );
    });
  });

  describe("delete (inherited)", () => {
    it("should delete payment successfully", async () => {
      mockRepository.delete.mockResolvedValue({ error: null });
      await expect(service.delete("pay-1")).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith("pay-1");
    });
  });
});
