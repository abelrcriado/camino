import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { PaymentService } from "../../src/services/payment.service";
import { PaymentRepository } from "../../src/repositories/payment.repository";
import type {
  CreatePaymentDto,
  UpdatePaymentDto,
  Payment,
} from "../../src/dto/payment.dto";

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
      const mockPayment: Payment = {
        id: "pay-1",
        user_id: "user-1",
        booking_id: "booking-1",
        service_point_id: "sp-1",
        amount: 50,
        currency: "eur",
        payment_method: "card",
        status: "succeeded",
        stripe_payment_intent_id: "pi-1",
        stripe_charge_id: "ch-1",
        platform_fee: 5,
        csp_amount: 45,
        description: null,
        metadata: null,
        refunded_amount: 0,
        refund_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        paid_at: null,
        refunded_at: null,
      };

      mockRepository.findById.mockResolvedValue({
        data: mockPayment,
        error: null,
      });
      const result = await service.findById("pay-1");
      expect(result).toEqual(mockPayment);
    });
  });

  // ============================================================================
  // Tests específicos de PaymentService
  // ============================================================================
  describe("createPayment", () => {
    it("should create payment successfully", async () => {
      const createData: CreatePaymentDto = {
        user_id: "user-1",
        booking_id: "booking-123",
        service_point_id: "sp-1",
        amount: 75,
        currency: "eur",
        payment_method: "card",
      };

      const createdPayment: Payment = {
        id: "pay-456",
        user_id: "user-1",
        booking_id: "booking-123",
        service_point_id: "sp-1",
        amount: 75,
        currency: "eur",
        payment_method: "card",
        status: "pending",
        stripe_payment_intent_id: "pi-2",
        stripe_charge_id: "ch-2",
        platform_fee: 5,
        csp_amount: 70,
        description: null,
        metadata: null,
        refunded_amount: 0,
        refund_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        paid_at: null,
        refunded_at: null,
      };

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
      const updateData: UpdatePaymentDto = {
        status: "succeeded",
        stripe_payment_intent_id: "pi-1-updated",
        stripe_charge_id: "ch-1-updated",
      };

      const updatedPayment: Payment = {
        id: "pay-1",
        user_id: "user-1",
        booking_id: "booking-1",
        service_point_id: "sp-1",
        amount: 50,
        currency: "eur",
        payment_method: "card",
        status: "succeeded",
        stripe_payment_intent_id: "pi-1-updated",
        stripe_charge_id: "ch-1-updated",
        platform_fee: 5,
        csp_amount: 45,
        description: null,
        metadata: null,
        refunded_amount: 0,
        refund_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        paid_at: null,
        refunded_at: null,
      };

      mockRepository.update.mockResolvedValue({
        data: [updatedPayment],
        error: null,
      });
      const result = await service.updatePayment("pay-1", updateData);
      expect(result).toEqual(updatedPayment);
      expect(mockRepository.update).toHaveBeenCalledWith("pay-1", updateData);
    });
  });

  describe("findByUser", () => {
    it("should return payments for user", async () => {
      const mockPayments: Payment[] = [
        {
          id: "pay-1",
          user_id: "user-1",
          booking_id: "booking-1",
          service_point_id: "sp-1",
          amount: 50,
          currency: "eur",
          payment_method: "card",
          status: "succeeded",
          stripe_payment_intent_id: "pi-1",
          stripe_charge_id: "ch-1",
          platform_fee: 5,
          csp_amount: 45,
          description: null,
          metadata: null,
          refunded_amount: 0,
          refund_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          paid_at: null,
          refunded_at: null,
        },
        {
          id: "pay-2",
          user_id: "user-1",
          booking_id: "booking-2",
          service_point_id: "sp-1",
          amount: 100,
          currency: "eur",
          payment_method: "cash",
          status: "succeeded",
          stripe_payment_intent_id: "pi-2",
          stripe_charge_id: "ch-2",
          platform_fee: 10,
          csp_amount: 90,
          description: null,
          metadata: null,
          refunded_amount: 0,
          refund_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          paid_at: null,
          refunded_at: null,
        },
      ];

      mockRepository.findByUserId.mockResolvedValue(mockPayments);
      const result = await service.findByUser("user-123");
      expect(result).toEqual(mockPayments);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith("user-123");
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
      const mockPayments: Payment[] = [
        {
          id: "pay-1",
          user_id: "user-1",
          booking_id: "booking-123",
          service_point_id: "sp-1",
          amount: 50,
          currency: "eur",
          payment_method: "card",
          status: "succeeded",
          stripe_payment_intent_id: "pi-3",
          stripe_charge_id: "ch-3",
          platform_fee: 5,
          csp_amount: 45,
          description: null,
          metadata: null,
          refunded_amount: 0,
          refund_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          paid_at: null,
          refunded_at: null,
        },
      ];

      mockRepository.findByBookingId.mockResolvedValue(mockPayments);
      const result = await service.findByBooking("booking-123");
      expect(result).toEqual(mockPayments);
      expect(mockRepository.findByBookingId).toHaveBeenCalledWith(
        "booking-123"
      );
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
      const mockPayments: Payment[] = [
        {
          id: "pay-1",
          user_id: "user-1",
          booking_id: "booking-1",
          service_point_id: "sp-1",
          amount: 50,
          currency: "eur",
          payment_method: "card",
          status: "pending",
          stripe_payment_intent_id: "pi-4",
          stripe_charge_id: "ch-4",
          platform_fee: 5,
          csp_amount: 45,
          description: null,
          metadata: null,
          refunded_amount: 0,
          refund_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          paid_at: null,
          refunded_at: null,
        },
        {
          id: "pay-2",
          user_id: "user-1",
          booking_id: "booking-2",
          service_point_id: "sp-1",
          amount: 75,
          currency: "eur",
          payment_method: "cash",
          status: "pending",
          stripe_payment_intent_id: "pi-5",
          stripe_charge_id: "ch-5",
          platform_fee: 10,
          csp_amount: 65,
          description: null,
          metadata: null,
          refunded_amount: 0,
          refund_reason: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          paid_at: null,
          refunded_at: null,
        },
      ];

      mockRepository.findWithFilters.mockResolvedValue(mockPayments);
      const result = await service.findByStatus("pending");
      expect(result).toEqual(mockPayments);
      expect(result).toHaveLength(2);
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith({
        status: "pending",
      });
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
