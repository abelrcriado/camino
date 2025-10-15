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
  // Tests para calculateCommission (nueva funcionalidad)
  // ============================================================================
  describe("calculateCommission", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockServicePointService: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockBookingService: any;
    let serviceWithMocks: PaymentService;

    beforeEach(() => {
      mockServicePointService = {
        getById: jest.fn(),
      };
      mockBookingService = {
        findById: jest.fn(),
      };

      serviceWithMocks = new PaymentService(
        mockRepository as PaymentRepository,
        mockServicePointService,
        mockBookingService
      );
    });

    it("should calculate commission for service booking (20% default)", async () => {
      const booking = {
        id: "booking-1",
        service_point_id: "csp-1",
        service_type: "repair",
        estimated_cost: 10000, // 100.00 EUR en céntimos
        actual_cost: 10000,
      };

      const servicePoint = {
        id: "csp-1",
        type: "CSP",
        commission_model: {
          service_commission: 0.2, // 20% para plataforma
        },
      };

      mockServicePointService.getById.mockResolvedValue(servicePoint);

      const result = await serviceWithMocks.calculateCommission(
        booking as any
      );

      expect(result.total).toBe(10000);
      expect(result.commission_percentage).toBe(0.2);
      expect(result.platform_fee).toBe(2000); // 20%
      expect(result.partner_amount).toBe(8000); // 80%
      expect(mockServicePointService.getById).toHaveBeenCalledWith("csp-1");
    });

    it("should calculate commission for vending machine (10% default)", async () => {
      const booking = {
        id: "booking-2",
        service_point_id: "csp-2",
        service_type: null, // No es servicio, es vending
        estimated_cost: 500, // 5.00 EUR
        actual_cost: null,
      };

      const servicePoint = {
        id: "csp-2",
        type: "CSP",
        commission_model: {
          vending: 0.1, // 10% para plataforma
        },
      };

      mockServicePointService.getById.mockResolvedValue(servicePoint);

      const result = await serviceWithMocks.calculateCommission(
        booking as any
      );

      expect(result.total).toBe(500);
      expect(result.commission_percentage).toBe(0.1);
      expect(result.platform_fee).toBe(50); // 10%
      expect(result.partner_amount).toBe(450); // 90%
    });

    it("should use estimated_cost if actual_cost is not available", async () => {
      const booking = {
        id: "booking-3",
        service_point_id: "csp-3",
        service_type: "wash",
        estimated_cost: 2000,
        actual_cost: null,
      };

      const servicePoint = {
        id: "csp-3",
        type: "CSP",
        commission_model: {
          service_commission: 0.15,
        },
      };

      mockServicePointService.getById.mockResolvedValue(servicePoint);

      const result = await serviceWithMocks.calculateCommission(
        booking as any
      );

      expect(result.total).toBe(2000);
      expect(result.platform_fee).toBe(300); // 15%
      expect(result.partner_amount).toBe(1700); // 85%
    });

    it("should throw NotFoundError when service point does not exist", async () => {
      const booking = {
        id: "booking-4",
        service_point_id: "nonexistent",
        service_type: "repair",
        estimated_cost: 5000,
      };

      mockServicePointService.getById.mockResolvedValue(null);

      await expect(
        serviceWithMocks.calculateCommission(booking as any)
      ).rejects.toThrow("Service Point");
    });

    it("should handle custom commission percentages", async () => {
      const booking = {
        id: "booking-5",
        service_point_id: "csp-5",
        service_type: "premium",
        estimated_cost: 15000,
        actual_cost: 15000,
      };

      const servicePoint = {
        id: "csp-5",
        type: "CSP",
        commission_model: {
          service_commission: 0.3, // 30% personalizado
        },
      };

      mockServicePointService.getById.mockResolvedValue(servicePoint);

      const result = await serviceWithMocks.calculateCommission(
        booking as any
      );

      expect(result.commission_percentage).toBe(0.3);
      expect(result.platform_fee).toBe(4500); // 30%
      expect(result.partner_amount).toBe(10500); // 70%
    });

    it("should round amounts correctly", async () => {
      const booking = {
        id: "booking-6",
        service_point_id: "csp-6",
        service_type: "service",
        estimated_cost: 333, // Número que genera decimales
        actual_cost: 333,
      };

      const servicePoint = {
        id: "csp-6",
        type: "CSP",
        commission_model: {
          service_commission: 0.15, // 15%
        },
      };

      mockServicePointService.getById.mockResolvedValue(servicePoint);

      const result = await serviceWithMocks.calculateCommission(
        booking as any
      );

      expect(result.platform_fee).toBe(50); // Math.round(333 * 0.15) = 50
      expect(result.partner_amount).toBe(283); // 333 - 50
      expect(Number.isInteger(result.platform_fee)).toBe(true);
      expect(Number.isInteger(result.partner_amount)).toBe(true);
    });
  });
});
