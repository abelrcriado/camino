import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { PaymentRepository } from "../../src/repositories/payment.repository";
import {
  Payment,
  PaymentFilters,
  CreateRefundDto,
} from "../../src/dto/payment.dto";
import { SupabaseClient } from "@supabase/supabase-js";

// Mock Supabase client con métodos de query builder
/* eslint-disable @typescript-eslint/no-explicit-any */
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  range: jest.fn(),
  order: jest.fn(),
  gte: jest.fn(),
  lte: jest.fn(),
  rpc: jest.fn(),
} as any as SupabaseClient;
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("PaymentRepository", () => {
  let repository: PaymentRepository;

  const mockPayment: Payment = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    user_id: "550e8400-e29b-41d4-a716-446655440001",
    booking_id: "550e8400-e29b-41d4-a716-446655440002",
    service_point_id: "550e8400-e29b-41d4-a716-446655440003",
    amount: 10000,
    currency: "EUR",
    status: "succeeded",
    payment_method: "card",
    stripe_payment_intent_id: "pi_test123",
    stripe_charge_id: "ch_test123",
    platform_fee: 500,
    csp_amount: 9500,
    description: "Test payment",
    metadata: null,
    refunded_amount: 0,
    refund_reason: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    paid_at: "2025-01-01T00:00:00Z",
    refunded_at: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Configurar el query builder chain
    (mockSupabase.from as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.select as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.eq as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.insert as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.update as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.delete as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.range as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.order as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.gte as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.lte as jest.Mock).mockReturnValue(mockSupabase);

    repository = new PaymentRepository(mockSupabase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with correct table name 'payments'", () => {
      expect(repository).toBeInstanceOf(PaymentRepository);
    });
  });

  describe("findByStripePaymentIntentId", () => {
    it("should find payment by Stripe Payment Intent ID successfully", async () => {
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: mockPayment,
        error: null,
      });

      const result = await repository.findByStripePaymentIntentId("pi_test123");

      expect(mockSupabase.from).toHaveBeenCalledWith("payments");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "stripe_payment_intent_id",
        "pi_test123"
      );
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
    });

    it("should return null when payment not found (PGRST116)", async () => {
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: "PGRST116", message: "No rows returned" },
      });

      const result = await repository.findByStripePaymentIntentId(
        "pi_notfound"
      );

      expect(result).toBeNull();
    });

    it("should throw error for other database errors", async () => {
      const dbError = { code: "PGRST500", message: "Database error" };
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      await expect(
        repository.findByStripePaymentIntentId("pi_test123")
      ).rejects.toEqual(dbError);
    });
  });

  describe("findByUserId", () => {
    it("should find payments by user ID successfully", async () => {
      const mockPayments = [
        mockPayment,
        { ...mockPayment, id: "different-id" },
      ];
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: mockPayments,
        error: null,
      });

      const result = await repository.findByUserId(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("payments");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "user_id",
        "550e8400-e29b-41d4-a716-446655440001"
      );
      expect(mockSupabase.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toEqual(mockPayments);
    });

    it("should return empty array when no payments found", async () => {
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.findByUserId(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result).toEqual([]);
    });

    it("should throw error on database failure", async () => {
      const dbError = { message: "Database error" };
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      await expect(
        repository.findByUserId("550e8400-e29b-41d4-a716-446655440001")
      ).rejects.toEqual(dbError);
    });
  });

  describe("findByServicePointId", () => {
    it("should find payments by service point ID successfully", async () => {
      const mockPayments = [mockPayment];
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: mockPayments,
        error: null,
      });

      const result = await repository.findByServicePointId(
        "550e8400-e29b-41d4-a716-446655440003"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("payments");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "service_point_id",
        "550e8400-e29b-41d4-a716-446655440003"
      );
      expect(mockSupabase.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toEqual(mockPayments);
    });

    it("should return empty array when no payments found", async () => {
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.findByServicePointId(
        "550e8400-e29b-41d4-a716-446655440003"
      );

      expect(result).toEqual([]);
    });
  });

  describe("findByBookingId", () => {
    it("should find payments by booking ID successfully", async () => {
      const mockPayments = [mockPayment];
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: mockPayments,
        error: null,
      });

      const result = await repository.findByBookingId(
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("payments");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "booking_id",
        "550e8400-e29b-41d4-a716-446655440002"
      );
      expect(mockSupabase.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toEqual(mockPayments);
    });

    it("should return empty array when no payments found", async () => {
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.findByBookingId(
        "550e8400-e29b-41d4-a716-446655440002"
      );

      expect(result).toEqual([]);
    });
  });

  describe("findByStatus", () => {
    it("should find payments by status using RPC", async () => {
      const mockPayments = [mockPayment];
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockPayments,
        error: null,
      });

      const result = await repository.findByStatus("succeeded", 50, 10);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_payments_by_status", {
        p_status: "succeeded",
        p_limit: 50,
        p_offset: 10,
      });
      expect(result).toEqual(mockPayments);
    });

    it("should use default limit and offset when not provided", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: [mockPayment],
        error: null,
      });

      await repository.findByStatus("pending");

      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_payments_by_status", {
        p_status: "pending",
        p_limit: 100,
        p_offset: 0,
      });
    });

    it("should return empty array when no payments found", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.findByStatus("succeeded");

      expect(result).toEqual([]);
    });

    it("should throw error on RPC failure", async () => {
      const dbError = { message: "RPC error" };
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      await expect(repository.findByStatus("succeeded")).rejects.toEqual(
        dbError
      );
    });
  });

  describe("findWithFilters", () => {
    it("should find payments with all filters applied", async () => {
      const filters: PaymentFilters = {
        user_id: "550e8400-e29b-41d4-a716-446655440001",
        service_point_id: "550e8400-e29b-41d4-a716-446655440003",
        booking_id: "550e8400-e29b-41d4-a716-446655440002",
        status: "succeeded",
        payment_method: "card",
        min_amount: 5000,
        max_amount: 15000,
        start_date: "2025-01-01T00:00:00Z",
        end_date: "2025-12-31T23:59:59Z",
      };

      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: [mockPayment],
        error: null,
      });

      const result = await repository.findWithFilters(filters);

      expect(mockSupabase.from).toHaveBeenCalledWith("payments");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", filters.user_id);
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "service_point_id",
        filters.service_point_id
      );
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "booking_id",
        filters.booking_id
      );
      expect(mockSupabase.eq).toHaveBeenCalledWith("status", filters.status);
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "payment_method",
        filters.payment_method
      );
      expect(mockSupabase.gte).toHaveBeenCalledWith(
        "amount",
        filters.min_amount
      );
      expect(mockSupabase.lte).toHaveBeenCalledWith(
        "amount",
        filters.max_amount
      );
      expect(mockSupabase.gte).toHaveBeenCalledWith(
        "created_at",
        filters.start_date
      );
      expect(mockSupabase.lte).toHaveBeenCalledWith(
        "created_at",
        filters.end_date
      );
      expect(mockSupabase.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toEqual([mockPayment]);
    });

    it("should find payments with partial filters", async () => {
      const filters: PaymentFilters = {
        status: "pending",
        min_amount: 10000,
      };

      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: [mockPayment],
        error: null,
      });

      const result = await repository.findWithFilters(filters);

      expect(mockSupabase.eq).toHaveBeenCalledWith("status", "pending");
      expect(mockSupabase.gte).toHaveBeenCalledWith("amount", 10000);
      expect(result).toEqual([mockPayment]);
    });

    it("should find payments with empty filters", async () => {
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: [mockPayment],
        error: null,
      });

      const result = await repository.findWithFilters({});

      expect(mockSupabase.from).toHaveBeenCalledWith("payments");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toEqual([mockPayment]);
    });

    it("should return empty array when no payments match filters", async () => {
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.findWithFilters({ status: "failed" });

      expect(result).toEqual([]);
    });

    it("should throw error on database failure", async () => {
      const dbError = { message: "Database error" };
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      await expect(repository.findWithFilters({})).rejects.toEqual(dbError);
    });
  });

  describe("updateStatus", () => {
    it("should update payment status successfully", async () => {
      const updatedPayment = { ...mockPayment, status: "succeeded" as const };
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: updatedPayment,
        error: null,
      });

      const result = await repository.updateStatus(
        "550e8400-e29b-41d4-a716-446655440000",
        "succeeded"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("payments");
      expect(mockSupabase.update).toHaveBeenCalledWith({ status: "succeeded" });
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "id",
        "550e8400-e29b-41d4-a716-446655440000"
      );
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(updatedPayment);
    });

    it("should update payment status with paid_at timestamp", async () => {
      const paidAt = "2025-01-15T12:00:00Z";
      const updatedPayment = {
        ...mockPayment,
        status: "succeeded" as const,
        paid_at: paidAt,
      };
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: updatedPayment,
        error: null,
      });

      const result = await repository.updateStatus(
        "550e8400-e29b-41d4-a716-446655440000",
        "succeeded",
        paidAt
      );

      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: "succeeded",
        paid_at: paidAt,
      });
      expect(result).toEqual(updatedPayment);
    });

    it("should throw error on update failure", async () => {
      const dbError = { message: "Update failed" };
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      await expect(
        repository.updateStatus(
          "550e8400-e29b-41d4-a716-446655440000",
          "failed"
        )
      ).rejects.toEqual(dbError);
    });
  });

  describe("markAsSucceeded", () => {
    it("should mark payment as succeeded using RPC", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      // Mock findById para el fetch después del RPC
      const succeededPayment = { ...mockPayment, status: "succeeded" as const };
      jest.spyOn(repository, "findById").mockResolvedValue({
        data: succeededPayment,
        error: null,
      });

      const result = await repository.markAsSucceeded(
        "550e8400-e29b-41d4-a716-446655440000",
        "ch_test123"
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "mark_payment_as_succeeded",
        {
          p_payment_id: "550e8400-e29b-41d4-a716-446655440000",
          p_stripe_charge_id: "ch_test123",
        }
      );
      expect(result).toEqual(succeededPayment);
    });

    it("should mark payment as succeeded without stripe_charge_id", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      jest.spyOn(repository, "findById").mockResolvedValue({
        data: { ...mockPayment, status: "succeeded" as const },
        error: null,
      });

      await repository.markAsSucceeded("550e8400-e29b-41d4-a716-446655440000");

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "mark_payment_as_succeeded",
        {
          p_payment_id: "550e8400-e29b-41d4-a716-446655440000",
          p_stripe_charge_id: null,
        }
      );
    });

    it("should throw error when RPC fails", async () => {
      const dbError = { message: "RPC failed" };
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      await expect(
        repository.markAsSucceeded("550e8400-e29b-41d4-a716-446655440000")
      ).rejects.toEqual(dbError);
    });

    it("should throw error when payment not found after update", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      jest.spyOn(repository, "findById").mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        repository.markAsSucceeded("550e8400-e29b-41d4-a716-446655440000")
      ).rejects.toThrow(
        "Payment 550e8400-e29b-41d4-a716-446655440000 not found after update"
      );
    });
  });

  describe("getStats", () => {
    it("should get payment stats with all parameters", async () => {
      const mockStats = {
        total_payments: 100,
        total_amount: 500000,
        succeeded_count: 90,
        pending_count: 5,
        failed_count: 5,
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const result = await repository.getStats(
        "550e8400-e29b-41d4-a716-446655440003",
        "550e8400-e29b-41d4-a716-446655440001",
        "2025-01-01T00:00:00Z",
        "2025-12-31T23:59:59Z"
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_payment_stats", {
        p_service_point_id: "550e8400-e29b-41d4-a716-446655440003",
        p_user_id: "550e8400-e29b-41d4-a716-446655440001",
        p_start_date: "2025-01-01T00:00:00Z",
        p_end_date: "2025-12-31T23:59:59Z",
      });
      expect(result).toEqual(mockStats);
    });

    it("should get payment stats with no parameters (nulls)", async () => {
      const mockStats = { total_payments: 100, total_amount: 500000 };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockStats,
        error: null,
      });

      const result = await repository.getStats();

      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_payment_stats", {
        p_service_point_id: null,
        p_user_id: null,
        p_start_date: null,
        p_end_date: null,
      });
      expect(result).toEqual(mockStats);
    });

    it("should throw error on RPC failure", async () => {
      const dbError = { message: "Stats RPC failed" };
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      await expect(repository.getStats()).rejects.toEqual(dbError);
    });
  });

  describe("getServicePointRevenue", () => {
    it("should get service point revenue successfully", async () => {
      const mockRevenue = { total_revenue: 250000, payment_count: 50 };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockRevenue,
        error: null,
      });

      const result = await repository.getServicePointRevenue(
        "550e8400-e29b-41d4-a716-446655440003",
        "2025-01-01T00:00:00Z",
        "2025-12-31T23:59:59Z"
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_csp_revenue", {
        p_service_point_id: "550e8400-e29b-41d4-a716-446655440003",
        p_start_date: "2025-01-01T00:00:00Z",
        p_end_date: "2025-12-31T23:59:59Z",
      });
      expect(result).toEqual(mockRevenue);
    });

    it("should throw error on RPC failure", async () => {
      const dbError = { message: "Revenue RPC failed" };
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      await expect(
        repository.getServicePointRevenue(
          "550e8400-e29b-41d4-a716-446655440003",
          "2025-01-01T00:00:00Z",
          "2025-12-31T23:59:59Z"
        )
      ).rejects.toEqual(dbError);
    });
  });

  describe("getPendingPayments", () => {
    it("should get pending payments for user", async () => {
      const mockPendingPayments = [
        { ...mockPayment, status: "pending" as const },
        { ...mockPayment, id: "different-id", status: "processing" as const },
      ];

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockPendingPayments,
        error: null,
      });

      const result = await repository.getPendingPayments(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_pending_payments", {
        p_user_id: "550e8400-e29b-41d4-a716-446655440001",
      });
      expect(result).toEqual(mockPendingPayments);
    });

    it("should return empty array when no pending payments", async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.getPendingPayments(
        "550e8400-e29b-41d4-a716-446655440001"
      );

      expect(result).toEqual([]);
    });

    it("should throw error on RPC failure", async () => {
      const dbError = { message: "Pending payments RPC failed" };
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      await expect(
        repository.getPendingPayments("550e8400-e29b-41d4-a716-446655440001")
      ).rejects.toEqual(dbError);
    });
  });

  describe("processRefund", () => {
    it("should process refund successfully", async () => {
      const refundData: CreateRefundDto & { stripe_refund_id?: string } = {
        payment_id: "550e8400-e29b-41d4-a716-446655440000",
        amount: 5000,
        reason: "Customer request",
        stripe_refund_id: "re_test123",
      };

      const mockResult = { success: true, refund_id: "refund-id" };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockResult,
        error: null,
      });

      const result = await repository.processRefund(refundData);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("process_refund", {
        p_payment_id: refundData.payment_id,
        p_refund_amount: refundData.amount,
        p_reason: refundData.reason,
        p_stripe_refund_id: refundData.stripe_refund_id,
      });
      expect(result).toEqual(mockResult);
    });

    it("should process refund without stripe_refund_id", async () => {
      const refundData: CreateRefundDto = {
        payment_id: "550e8400-e29b-41d4-a716-446655440000",
        amount: 5000,
        reason: "Product damaged",
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      await repository.processRefund(refundData);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("process_refund", {
        p_payment_id: refundData.payment_id,
        p_refund_amount: 5000,
        p_reason: refundData.reason,
        p_stripe_refund_id: null,
      });
    });

    it("should handle refund without amount (defaults to 0)", async () => {
      const refundData: CreateRefundDto = {
        payment_id: "550e8400-e29b-41d4-a716-446655440000",
        reason: "Full refund",
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      await repository.processRefund(refundData);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("process_refund", {
        p_payment_id: refundData.payment_id,
        p_refund_amount: 0,
        p_reason: refundData.reason,
        p_stripe_refund_id: null,
      });
    });

    it("should throw error on RPC failure", async () => {
      const dbError = { message: "Refund processing failed" };
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      const refundData: CreateRefundDto = {
        payment_id: "550e8400-e29b-41d4-a716-446655440000",
        amount: 5000,
        reason: "Test",
      };

      await expect(repository.processRefund(refundData)).rejects.toEqual(
        dbError
      );
    });
  });

  describe("getRefundsByPaymentId", () => {
    it("should get refunds for payment successfully", async () => {
      const mockRefunds = [
        {
          id: "refund-1",
          payment_id: "550e8400-e29b-41d4-a716-446655440000",
          amount: 5000,
          reason: "Customer request",
          created_at: "2025-01-15T12:00:00Z",
        },
      ];

      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: mockRefunds,
        error: null,
      });

      const result = await repository.getRefundsByPaymentId(
        "550e8400-e29b-41d4-a716-446655440000"
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("refunds");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "payment_id",
        "550e8400-e29b-41d4-a716-446655440000"
      );
      expect(mockSupabase.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
      expect(result).toEqual(mockRefunds);
    });

    it("should return empty array when no refunds found", async () => {
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await repository.getRefundsByPaymentId(
        "550e8400-e29b-41d4-a716-446655440000"
      );

      expect(result).toEqual([]);
    });

    it("should throw error on database failure", async () => {
      const dbError = { message: "Database error" };
      (mockSupabase.order as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      await expect(
        repository.getRefundsByPaymentId("550e8400-e29b-41d4-a716-446655440000")
      ).rejects.toEqual(dbError);
    });
  });

  describe("updateMetadata", () => {
    it("should update payment metadata successfully", async () => {
      const metadata = { custom_field: "value", notes: "Important payment" };
      const updatedPayment = { ...mockPayment, metadata };

      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: updatedPayment,
        error: null,
      });

      const result = await repository.updateMetadata(
        "550e8400-e29b-41d4-a716-446655440000",
        metadata
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("payments");
      expect(mockSupabase.update).toHaveBeenCalledWith({ metadata });
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "id",
        "550e8400-e29b-41d4-a716-446655440000"
      );
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(updatedPayment);
    });

    it("should update metadata with empty object", async () => {
      const metadata = {};
      const updatedPayment = { ...mockPayment, metadata };

      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: updatedPayment,
        error: null,
      });

      const result = await repository.updateMetadata(
        "550e8400-e29b-41d4-a716-446655440000",
        metadata
      );

      expect(mockSupabase.update).toHaveBeenCalledWith({ metadata: {} });
      expect(result).toEqual(updatedPayment);
    });

    it("should throw error on update failure", async () => {
      const dbError = { message: "Metadata update failed" };
      (mockSupabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: dbError,
      });

      await expect(
        repository.updateMetadata("550e8400-e29b-41d4-a716-446655440000", {})
      ).rejects.toEqual(dbError);
    });
  });
});
