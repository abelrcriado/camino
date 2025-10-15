/**
 * Tests para payment.schema.ts
 * Valida schemas Zod para operaciones CRUD de payments
 * ALINEADO con Stripe Payment Intent statuses y DTO de Payment
 */

import { describe, it, expect } from "@jest/globals";
import {
  createPaymentSchema,
  updatePaymentSchema,
  deletePaymentSchema,
  queryPaymentSchema,
} from "../../src/schemas/payment.schema";
import { generateUUID } from "../helpers/factories";

describe("Payment Schemas", () => {
  const validUUID = generateUUID();
  const invalidUUID = "invalid-uuid";

  describe("createPaymentSchema", () => {
    const validData = {
      user_id: validUUID,
      booking_id: validUUID,
      service_point_id: validUUID,
      amount: 5000,
      currency: "eur",
      payment_method: "card" as const,
    };

    it("should validate correct payment data", () => {
      const result = createPaymentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should default currency to eur", () => {
      const { currency, ...data } = validData;
      const result = createPaymentSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe("eur");
      }
    });

    it("should default payment_method to card", () => {
      const { payment_method, ...data } = validData;
      const result = createPaymentSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.payment_method).toBe("card");
      }
    });

    it("should accept optional description", () => {
      const data = { ...validData, description: "Payment for booking" };
      const result = createPaymentSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe("Payment for booking");
      }
    });

    it("should accept optional metadata", () => {
      const data = { ...validData, metadata: { key: "value" } };
      const result = createPaymentSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata).toEqual({ key: "value" });
      }
    });

    it("should reject missing user_id", () => {
      const { user_id, ...data } = validData;
      const result = createPaymentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid user_id UUID", () => {
      const data = { ...validData, user_id: invalidUUID };
      const result = createPaymentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing amount", () => {
      const { amount, ...data } = validData;
      const result = createPaymentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject negative amount", () => {
      const data = { ...validData, amount: -10.5 };
      const result = createPaymentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject zero amount", () => {
      const data = { ...validData, amount: 0 };
      const result = createPaymentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept all valid payment methods", () => {
      const methods = ["card", "bank_transfer", "wallet", "cash"];
      methods.forEach((payment_method) => {
        const data = { ...validData, payment_method };
        const result = createPaymentSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid payment methods", () => {
      const invalidMethods = ["credit_card", "paypal", "bitcoin"];
      invalidMethods.forEach((payment_method) => {
        const data = { ...validData, payment_method };
        const result = createPaymentSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("updatePaymentSchema", () => {
    it("should validate correct update data", () => {
      const data = { id: validUUID, status: "succeeded" };
      const result = updatePaymentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should require id field", () => {
      const data = { status: "succeeded" };
      const result = updatePaymentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept all valid status values", () => {
      const statuses = [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "canceled",
        "refunded",
        "partially_refunded",
      ];
      statuses.forEach((status) => {
        const data = { id: validUUID, status };
        const result = updatePaymentSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid status values", () => {
      const invalidStatuses = ["completed", "cancelled"];
      invalidStatuses.forEach((status) => {
        const data = { id: validUUID, status };
        const result = updatePaymentSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it("should accept commission_percentage field", () => {
      const data = {
        id: validUUID,
        commission_percentage: 0.15,
      };
      const result = updatePaymentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept partner_amount field", () => {
      const data = {
        id: validUUID,
        partner_amount: 8500,
      };
      const result = updatePaymentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept stripe_transfer_id field", () => {
      const data = {
        id: validUUID,
        stripe_transfer_id: "tr_1234567890",
      };
      const result = updatePaymentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject commission_percentage < 0", () => {
      const data = {
        id: validUUID,
        commission_percentage: -0.1,
      };
      const result = updatePaymentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject commission_percentage > 1", () => {
      const data = {
        id: validUUID,
        commission_percentage: 1.5,
      };
      const result = updatePaymentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject negative partner_amount", () => {
      const data = {
        id: validUUID,
        partner_amount: -100,
      };
      const result = updatePaymentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("deletePaymentSchema", () => {
    it("should validate correct delete data", () => {
      const data = { id: validUUID };
      const result = deletePaymentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should require id", () => {
      const data = {};
      const result = deletePaymentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("queryPaymentSchema", () => {
    it("should validate empty query", () => {
      const result = queryPaymentSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it("should accept user_id filter", () => {
      const data = { user_id: validUUID };
      const result = queryPaymentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept status filter", () => {
      const data = { status: "succeeded" };
      const result = queryPaymentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid status in query", () => {
      const data = { status: "completed" };
      const result = queryPaymentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
