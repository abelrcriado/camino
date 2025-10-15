import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { PaymentService } from "../../src/services/payment.service";
import { PaymentRepository } from "../../src/repositories/payment.repository";
import type { UpdatePaymentDto } from "../../src/dto/payment.dto";
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

  // ============================================================================
  // Tests para calculateCommission
  // ============================================================================
  describe("calculateCommission", () => {
    it("should calculate commission for vending machine (10%)", async () => {
      const amount = 10000; // 100 EUR in cents
      const serviceType = "vending";
      const commissionModel = { vending: 0.1 };

      const result = await service.calculateCommission(
        amount,
        serviceType,
        commissionModel
      );

      expect(result.total).toBe(10000);
      expect(result.platform_fee).toBe(1000); // 10%
      expect(result.partner_amount).toBe(9000); // 90%
      expect(result.commission_percentage).toBe(0.1);
    });

    it("should calculate commission for workshop (30%)", async () => {
      const amount = 5000; // 50 EUR in cents
      const serviceType = "workshop";
      const commissionModel = { workshop: 0.3 };

      const result = await service.calculateCommission(
        amount,
        serviceType,
        commissionModel
      );

      expect(result.total).toBe(5000);
      expect(result.platform_fee).toBe(1500); // 30%
      expect(result.partner_amount).toBe(3500); // 70%
      expect(result.commission_percentage).toBe(0.3);
    });

    it("should calculate commission for bike wash (40%)", async () => {
      const amount = 2000; // 20 EUR in cents
      const serviceType = "wash";
      const commissionModel = { wash: 0.4 };

      const result = await service.calculateCommission(
        amount,
        serviceType,
        commissionModel
      );

      expect(result.total).toBe(2000);
      expect(result.platform_fee).toBe(800); // 40%
      expect(result.partner_amount).toBe(1200); // 60%
      expect(result.commission_percentage).toBe(0.4);
    });

    it("should calculate commission for e-bike charging (50%)", async () => {
      const amount = 1500; // 15 EUR in cents
      const serviceType = "charging";
      const commissionModel = { charging: 0.5 };

      const result = await service.calculateCommission(
        amount,
        serviceType,
        commissionModel
      );

      expect(result.total).toBe(1500);
      expect(result.platform_fee).toBe(750); // 50%
      expect(result.partner_amount).toBe(750); // 50%
      expect(result.commission_percentage).toBe(0.5);
    });

    it("should use default commission (15%) when no commission model provided", async () => {
      const amount = 10000;
      const serviceType = "unknown";

      const result = await service.calculateCommission(
        amount,
        serviceType,
        undefined
      );

      expect(result.total).toBe(10000);
      expect(result.platform_fee).toBe(1500); // 15% default
      expect(result.partner_amount).toBe(8500); // 85%
      expect(result.commission_percentage).toBe(0.15);
    });

    it("should use default values when commission model lacks specific type", async () => {
      const amount = 10000;
      const serviceType = "vending";
      const commissionModel = {}; // Empty commission model

      const result = await service.calculateCommission(
        amount,
        serviceType,
        commissionModel
      );

      expect(result.total).toBe(10000);
      expect(result.platform_fee).toBe(1000); // 10% default for vending
      expect(result.partner_amount).toBe(9000);
      expect(result.commission_percentage).toBe(0.1);
    });

    it("should handle service type containing keyword (e.g., 'vending_machine')", async () => {
      const amount = 5000;
      const serviceType = "vending_machine";
      const commissionModel = { vending: 0.08 };

      const result = await service.calculateCommission(
        amount,
        serviceType,
        commissionModel
      );

      expect(result.platform_fee).toBe(400); // 8%
      expect(result.partner_amount).toBe(4600);
      expect(result.commission_percentage).toBe(0.08);
    });

    it("should round platform fee correctly", async () => {
      const amount = 9999; // Odd amount
      const serviceType = "vending";
      const commissionModel = { vending: 0.1 };

      const result = await service.calculateCommission(
        amount,
        serviceType,
        commissionModel
      );

      // Platform fee should be rounded: Math.round(9999 * 0.1) = 1000
      expect(result.platform_fee).toBe(1000);
      expect(result.partner_amount).toBe(8999);
      expect(result.total).toBe(9999);
    });
  });
});
