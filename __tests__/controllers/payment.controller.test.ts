/**
 * Tests para PaymentController
 * Valida operaciones HTTP CRUD para payments
 * ALINEADO con Stripe Payment Intent statuses y DTO de Payment
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createMocks } from "node-mocks-http";
import { PaymentController } from "../../src/controllers/payment.controller";
import { PaymentService } from "../../src/services/payment.service";

/* eslint-disable @typescript-eslint/no-explicit-any */

jest.mock("../../src/services/payment.service");

describe("PaymentController", () => {
  let controller: PaymentController;
  let mockService: jest.Mocked<PaymentService>;

  const mockPayment = {
    id: "550e8400-e29b-41d4-a716-446655440001",
    user_id: "550e8400-e29b-41d4-a716-446655440002",
    booking_id: "550e8400-e29b-41d4-a716-446655440003",
    service_point_id: "550e8400-e29b-41d4-a716-446655440004",
    amount: 5000,
    currency: "eur",
    status: "succeeded" as const,
    payment_method: "card" as const,
    stripe_payment_intent_id: "pi_123456789",
    stripe_charge_id: "ch_123456789",
    platform_fee: 500,
    csp_amount: 4500,
    description: "Payment for booking",
    metadata: {},
    refunded_amount: 0,
    refund_reason: null,
    refunded_at: null,
    paid_at: "2025-10-10T12:00:00.000Z",
    created_at: "2025-10-10T11:00:00.000Z",
    updated_at: "2025-10-10T12:00:00.000Z",
  };

  beforeEach(() => {
    mockService = {
      findById: jest.fn(),
      findByUser: jest.fn(),
      findByBooking: jest.fn(),
      findByStatus: jest.fn(),
      findWithFilters: jest.fn(),
      createPaymentIntent: jest.fn(),
      updatePayment: jest.fn(),
      delete: jest.fn(),
    } as any;

    controller = new PaymentController(mockService as any);
  });

  describe("GET /api/payments", () => {
    it("should route to findByUser when user_id provided", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { user_id: "550e8400-e29b-41d4-a716-446655440002" },
      });

      mockService.findByUser.mockResolvedValue([mockPayment]);

      await controller.handle(req, res);

      expect(mockService.findByUser).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440002"
      );
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual([mockPayment]);
    });

    it("should route to findByBooking when booking_id provided", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { booking_id: "550e8400-e29b-41d4-a716-446655440003" },
      });

      mockService.findByBooking.mockResolvedValue([mockPayment]);

      await controller.handle(req, res);

      expect(mockService.findByBooking).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440003"
      );
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual([mockPayment]);
    });

    it("should route to findByStatus when status provided", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { status: "succeeded" },
      });

      mockService.findByStatus.mockResolvedValue([mockPayment]);

      await controller.handle(req, res);

      expect(mockService.findByStatus).toHaveBeenCalledWith("succeeded");
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual([mockPayment]);
    });

    it("should route to findWithFilters when no specific query parameter", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {},
      });

      mockService.findWithFilters.mockResolvedValue([mockPayment]);

      await controller.handle(req, res);

      expect(mockService.findWithFilters).toHaveBeenCalledWith({});
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual([mockPayment]);
    });

    it("should return empty array when no payments found", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { user_id: "550e8400-e29b-41d4-a716-446655440002" },
      });

      mockService.findByUser.mockResolvedValue([]);

      await controller.handle(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual([]);
    });

    it("should return 500 on service error", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { user_id: "550e8400-e29b-41d4-a716-446655440002" },
      });

      mockService.findByUser.mockRejectedValue(
        new Error("Database connection failed")
      );

      await controller.handle(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });

  describe("POST /api/payments", () => {
    it("should create payment intent successfully", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          user_id: "550e8400-e29b-41d4-a716-446655440002",
          booking_id: "550e8400-e29b-41d4-a716-446655440003",
          service_point_id: "550e8400-e29b-41d4-a716-446655440004",
          amount: 5000,
          currency: "eur",
          payment_method: "card",
        },
      });

      mockService.createPaymentIntent.mockResolvedValue(mockPayment as any);

      await controller.handle(req, res);

      expect(mockService.createPaymentIntent).toHaveBeenCalled();
      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual(mockPayment);
    });

    it("should validate required fields", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          // missing user_id
          booking_id: "550e8400-e29b-41d4-a716-446655440003",
          amount: 5000,
        },
      });

      await controller.handle(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("should reject negative amounts", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          user_id: "550e8400-e29b-41d4-a716-446655440002",
          booking_id: "550e8400-e29b-41d4-a716-446655440003",
          service_point_id: "550e8400-e29b-41d4-a716-446655440004",
          amount: -100,
        },
      });

      await controller.handle(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("should reject invalid payment methods", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: {
          user_id: "550e8400-e29b-41d4-a716-446655440002",
          booking_id: "550e8400-e29b-41d4-a716-446655440003",
          service_point_id: "550e8400-e29b-41d4-a716-446655440004",
          amount: 5000,
          payment_method: "paypal", // invalid
        },
      });

      await controller.handle(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe("PUT /api/payments", () => {
    it("should update payment successfully", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        url: "/api/payments/550e8400-e29b-41d4-a716-446655440001",
        body: {
          id: "550e8400-e29b-41d4-a716-446655440001",
          status: "succeeded",
          paid_at: "2025-10-10T12:00:00.000Z",
        },
      });

      const updatedPayment = { ...mockPayment, status: "succeeded" as const };
      mockService.updatePayment.mockResolvedValue(updatedPayment as any);

      await controller.handle(req, res);

      expect(mockService.updatePayment).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440001",
        expect.objectContaining({
          id: "550e8400-e29b-41d4-a716-446655440001",
          status: "succeeded",
          paid_at: "2025-10-10T12:00:00.000Z",
        })
      );
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual([updatedPayment]);
    });

    it("should require id field", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        url: "/api/payments",
        body: {
          status: "succeeded",
        },
      });

      await controller.handle(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("should accept all valid Stripe status values", async () => {
      const validStatuses = [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "canceled",
        "refunded",
        "partially_refunded",
      ];

      for (const status of validStatuses) {
        const { req, res } = createMocks({
          method: "PUT",
          url: "/api/payments/550e8400-e29b-41d4-a716-446655440001",
          body: {
            id: "550e8400-e29b-41d4-a716-446655440001",
            status,
          },
        });

        const updatedPayment = { ...mockPayment, status };
        mockService.updatePayment.mockResolvedValue(updatedPayment as any);

        await controller.handle(req, res);

        expect(res._getStatusCode()).toBe(200);
      }
    });

    it("should reject invalid status values", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        url: "/api/payments/550e8400-e29b-41d4-a716-446655440001",
        body: {
          status: "completed", // invalid - should be "succeeded"
        },
      });

      await controller.handle(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });

  describe("DELETE /api/payments", () => {
    it("should delete payment successfully with 204 status", async () => {
      const { req, res } = createMocks({
        method: "DELETE",
        body: { id: "550e8400-e29b-41d4-a716-446655440001" },
      });

      mockService.findById.mockResolvedValue(mockPayment as any);
      mockService.delete.mockResolvedValue(undefined as any);

      await controller.handle(req, res);

      expect(mockService.delete).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440001"
      );
      expect(res._getStatusCode()).toBe(204);
    });

    it("should require id parameter", async () => {
      const { req, res } = createMocks({
        method: "DELETE",
        body: {},
      });

      await controller.handle(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("should validate UUID format", async () => {
      const { req, res } = createMocks({
        method: "DELETE",
        body: { id: "invalid-uuid" },
      });

      await controller.handle(req, res);

      expect(res._getStatusCode()).toBe(400);
    });
  });
});
