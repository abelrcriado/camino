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
import { TestDataGenerators, SchemaDataGenerators } from "../helpers/test-data-generators";

describe("Payment Schemas", () => {
  const validUUID = SchemaDataGenerators.payment.id();
  const invalidUUID = TestDataGenerators.alphanumeric(10);

  describe("createPaymentSchema", () => {
    const validData = {
      user_id: SchemaDataGenerators.payment.userId(),
      booking_id: SchemaDataGenerators.payment.bookingId(),
      service_point_id: SchemaDataGenerators.payment.servicePointId(),
      amount: SchemaDataGenerators.payment.amount(),
      currency: SchemaDataGenerators.payment.currency(),
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
      const data = { ...validData, description: SchemaDataGenerators.payment.description() };
      const result = createPaymentSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeTruthy();
      }
    });

    it("should accept optional metadata", () => {
      const data = { ...validData, metadata: SchemaDataGenerators.payment.metadata() };
      const result = createPaymentSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.metadata).toBeTruthy();
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
      const data = { ...validData, amount: -TestDataGenerators.float({ min: 1, max: 100 }) };
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
      const data = { id: validUUID, status: SchemaDataGenerators.payment.status() };
      const result = updatePaymentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should require id field", () => {
      const data = { status: SchemaDataGenerators.payment.status() };
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
      const data = { user_id: SchemaDataGenerators.payment.userId() };
      const result = queryPaymentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept status filter", () => {
      const data = { status: SchemaDataGenerators.payment.status() };
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
