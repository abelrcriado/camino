/**
 * Tests for QR System Zod Schemas
 * 
 * MANDATORY: Uses Factory pattern for test data generation
 */

import {
  transactionItemSchema,
  verifyQRSchema,
  qrPayloadSchema,
  createTransactionSchema,
  syncTransactionSchema,
  returnedItemSchema,
  createReturnSchema,
  queryAccessLogsSchema,
} from '@/api/schemas/qr.schema';
import { generateUUID, generateISODate } from '../helpers/factories';

describe('QR Schemas', () => {
  describe('transactionItemSchema', () => {
    it('should validate a valid product item', () => {
      const validItem = {
        type: 'product' as const,
        id: generateUUID(),
        name: 'Bocadillo Jamón',
        quantity: 1,
        price: 4.50,
      };

      const result = transactionItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it('should validate a valid service item', () => {
      const validItem = {
        type: 'service' as const,
        id: generateUUID(),
        name: 'Alojamiento en albergue',
        quantity: 1,
        price: 12.00,
      };

      const result = transactionItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it('should reject invalid type', () => {
      const invalidItem = {
        type: 'invalid',
        id: generateUUID(),
        name: 'Test',
        quantity: 1,
        price: 10,
      };

      const result = transactionItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('product');
      }
    });

    it('should reject invalid UUID', () => {
      const invalidItem = {
        type: 'product' as const,
        id: 'not-a-uuid',
        name: 'Test',
        quantity: 1,
        price: 10,
      };

      const result = transactionItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('UUID válido');
      }
    });

    it('should reject zero quantity', () => {
      const invalidItem = {
        type: 'product' as const,
        id: generateUUID(),
        name: 'Test',
        quantity: 0,
        price: 10,
      };

      const result = transactionItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('al menos 1');
      }
    });

    it('should reject negative price', () => {
      const invalidItem = {
        type: 'product' as const,
        id: generateUUID(),
        name: 'Test',
        quantity: 1,
        price: -5,
      };

      const result = transactionItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('no puede ser negativo');
      }
    });

    it('should reject empty name', () => {
      const invalidItem = {
        type: 'product' as const,
        id: generateUUID(),
        name: '',
        quantity: 1,
        price: 10,
      };

      const result = transactionItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('requerido');
      }
    });
  });

  describe('verifyQRSchema', () => {
    it('should validate valid QR verification request', () => {
      const validRequest = {
        qr_data: 'eyJ0cmFuc2FjdGlvbl9pZCI6InRlc3QifQ==', // base64
        location_id: generateUUID(),
      };

      const result = verifyQRSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate with optional scanned_by', () => {
      const validRequest = {
        qr_data: 'eyJ0cmFuc2FjdGlvbl9pZCI6InRlc3QifQ==',
        location_id: generateUUID(),
        scanned_by: generateUUID(),
      };

      const result = verifyQRSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject missing qr_data', () => {
      const invalidRequest = {
        location_id: generateUUID(),
      };

      const result = verifyQRSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod default message for missing required field
        expect(result.error.issues[0].message).toContain('expected string');
      }
    });

    it('should reject empty qr_data', () => {
      const invalidRequest = {
        qr_data: '',
        location_id: generateUUID(),
      };

      const result = verifyQRSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject invalid location_id UUID', () => {
      const invalidRequest = {
        qr_data: 'test',
        location_id: 'not-a-uuid',
      };

      const result = verifyQRSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('UUID válido');
      }
    });

    it('should reject invalid scanned_by UUID', () => {
      const invalidRequest = {
        qr_data: 'test',
        location_id: generateUUID(),
        scanned_by: 'not-a-uuid',
      };

      const result = verifyQRSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('UUID válido');
      }
    });
  });

  describe('qrPayloadSchema', () => {
    it('should validate valid QR payload', () => {
      const validPayload = {
        transaction_id: generateUUID(),
        user_id: generateUUID(),
        items: [
          {
            type: 'product' as const,
            id: generateUUID(),
            name: 'Test Product',
            quantity: 1,
            price: 10,
          },
        ],
        timestamp: Date.now(),
        signature: 'abc123signature',
        version: '1.0',
      };

      const result = qrPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject empty items array', () => {
      const invalidPayload = {
        transaction_id: generateUUID(),
        user_id: generateUUID(),
        items: [],
        timestamp: Date.now(),
        signature: 'abc123',
        version: '1.0',
      };

      const result = qrPayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('al menos un item');
      }
    });

    it('should reject negative timestamp', () => {
      const invalidPayload = {
        transaction_id: generateUUID(),
        user_id: generateUUID(),
        items: [
          {
            type: 'product' as const,
            id: generateUUID(),
            name: 'Test',
            quantity: 1,
            price: 10,
          },
        ],
        timestamp: -1000,
        signature: 'abc123',
        version: '1.0',
      };

      const result = qrPayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positivo');
      }
    });

    it('should reject missing signature', () => {
      const invalidPayload = {
        transaction_id: generateUUID(),
        user_id: generateUUID(),
        items: [
          {
            type: 'product' as const,
            id: generateUUID(),
            name: 'Test',
            quantity: 1,
            price: 10,
          },
        ],
        timestamp: Date.now(),
        version: '1.0',
      };

      const result = qrPayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod default message for missing required field
        expect(result.error.issues[0].message).toContain('expected string');
      }
    });

    it('should reject empty signature', () => {
      const invalidPayload = {
        transaction_id: generateUUID(),
        user_id: generateUUID(),
        items: [
          {
            type: 'product' as const,
            id: generateUUID(),
            name: 'Test',
            quantity: 1,
            price: 10,
          },
        ],
        timestamp: Date.now(),
        signature: '',
        version: '1.0',
      };

      const result = qrPayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('createTransactionSchema', () => {
    it('should validate valid transaction creation', () => {
      const validTransaction = {
        id: generateUUID(),
        user_id: generateUUID(),
        items: [
          {
            type: 'product' as const,
            id: generateUUID(),
            name: 'Test Product',
            quantity: 2,
            price: 5.50,
          },
        ],
        total: 11.00,
      };

      const result = createTransactionSchema.safeParse(validTransaction);
      expect(result.success).toBe(true);
    });

    it('should validate with optional created_at', () => {
      const validTransaction = {
        id: generateUUID(),
        user_id: generateUUID(),
        items: [
          {
            type: 'product' as const,
            id: generateUUID(),
            name: 'Test',
            quantity: 1,
            price: 10,
          },
        ],
        total: 10,
        created_at: generateISODate(),
      };

      const result = createTransactionSchema.safeParse(validTransaction);
      expect(result.success).toBe(true);
    });

    it('should validate with optional parent_transaction_id', () => {
      const validTransaction = {
        id: generateUUID(),
        user_id: generateUUID(),
        items: [
          {
            type: 'product' as const,
            id: generateUUID(),
            name: 'Test',
            quantity: 1,
            price: 10,
          },
        ],
        total: 10,
        parent_transaction_id: generateUUID(),
      };

      const result = createTransactionSchema.safeParse(validTransaction);
      expect(result.success).toBe(true);
    });

    it('should reject negative total', () => {
      const invalidTransaction = {
        id: generateUUID(),
        user_id: generateUUID(),
        items: [
          {
            type: 'product' as const,
            id: generateUUID(),
            name: 'Test',
            quantity: 1,
            price: 10,
          },
        ],
        total: -5,
      };

      const result = createTransactionSchema.safeParse(invalidTransaction);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('no puede ser negativo');
      }
    });

    it('should reject invalid created_at format', () => {
      const invalidTransaction = {
        id: generateUUID(),
        user_id: generateUUID(),
        items: [
          {
            type: 'product' as const,
            id: generateUUID(),
            name: 'Test',
            quantity: 1,
            price: 10,
          },
        ],
        total: 10,
        created_at: 'not-iso-8601',
      };

      const result = createTransactionSchema.safeParse(invalidTransaction);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('ISO 8601');
      }
    });
  });

  describe('syncTransactionSchema', () => {
    it('should validate valid sync transaction', () => {
      const validSync = {
        transaction_id: generateUUID(),
        user_id: generateUUID(),
        items: [
          {
            type: 'service' as const,
            id: generateUUID(),
            name: 'Test Service',
            quantity: 1,
            price: 15,
          },
        ],
        total: 15,
        created_at: generateISODate(),
      };

      const result = syncTransactionSchema.safeParse(validSync);
      expect(result.success).toBe(true);
    });

    it('should reject missing created_at (required for sync)', () => {
      const invalidSync = {
        transaction_id: generateUUID(),
        user_id: generateUUID(),
        items: [
          {
            type: 'product' as const,
            id: generateUUID(),
            name: 'Test',
            quantity: 1,
            price: 10,
          },
        ],
        total: 10,
      };

      const result = syncTransactionSchema.safeParse(invalidSync);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('created_at');
      }
    });
  });

  describe('returnedItemSchema', () => {
    it('should validate valid returned item', () => {
      const validItem = {
        item_id: generateUUID(),
        quantity: 2,
      };

      const result = returnedItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it('should reject zero quantity', () => {
      const invalidItem = {
        item_id: generateUUID(),
        quantity: 0,
      };

      const result = returnedItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('al menos 1');
      }
    });

    it('should reject negative quantity', () => {
      const invalidItem = {
        item_id: generateUUID(),
        quantity: -1,
      };

      const result = returnedItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID', () => {
      const invalidItem = {
        item_id: 'not-a-uuid',
        quantity: 1,
      };

      const result = returnedItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('UUID válido');
      }
    });
  });

  describe('createReturnSchema', () => {
    it('should validate valid return creation', () => {
      const validReturn = {
        original_transaction_id: generateUUID(),
        returned_items: [
          {
            item_id: generateUUID(),
            quantity: 1,
          },
        ],
      };

      const result = createReturnSchema.safeParse(validReturn);
      expect(result.success).toBe(true);
    });

    it('should validate with optional fields', () => {
      const validReturn = {
        original_transaction_id: generateUUID(),
        new_transaction_id: generateUUID(),
        returned_items: [
          {
            item_id: generateUUID(),
            quantity: 2,
          },
        ],
        reason: 'Producto defectuoso',
        refund_amount: 10.50,
      };

      const result = createReturnSchema.safeParse(validReturn);
      expect(result.success).toBe(true);
    });

    it('should reject empty returned_items array', () => {
      const invalidReturn = {
        original_transaction_id: generateUUID(),
        returned_items: [],
      };

      const result = createReturnSchema.safeParse(invalidReturn);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('al menos un item devuelto');
      }
    });

    it('should reject negative refund_amount', () => {
      const invalidReturn = {
        original_transaction_id: generateUUID(),
        returned_items: [
          {
            item_id: generateUUID(),
            quantity: 1,
          },
        ],
        refund_amount: -5,
      };

      const result = createReturnSchema.safeParse(invalidReturn);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('no puede ser negativo');
      }
    });

    it('should reject reason exceeding 500 characters', () => {
      const invalidReturn = {
        original_transaction_id: generateUUID(),
        returned_items: [
          {
            item_id: generateUUID(),
            quantity: 1,
          },
        ],
        reason: 'a'.repeat(501),
      };

      const result = createReturnSchema.safeParse(invalidReturn);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('500 caracteres');
      }
    });
  });

  describe('queryAccessLogsSchema', () => {
    it('should validate query with all optional filters', () => {
      const validQuery = {
        user_id: generateUUID(),
        location_id: generateUUID(),
        transaction_id: generateUUID(),
        validation_result: 'valid' as const,
        from: generateISODate(),
        to: generateISODate(),
        page: 1,
        limit: 20,
      };

      const result = queryAccessLogsSchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should apply default values for page and limit', () => {
      const query = {};

      const result = queryAccessLogsSchema.parse(query);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should coerce string page to number', () => {
      const query = { page: '3' };

      const result = queryAccessLogsSchema.parse(query);
      expect(result.page).toBe(3);
      expect(typeof result.page).toBe('number');
    });

    it('should coerce string limit to number', () => {
      const query = { limit: '50' };

      const result = queryAccessLogsSchema.parse(query);
      expect(result.limit).toBe(50);
      expect(typeof result.limit).toBe('number');
    });

    it('should reject page less than 1', () => {
      const invalidQuery = { page: 0 };

      const result = queryAccessLogsSchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject limit greater than 100', () => {
      const invalidQuery = { limit: 101 };

      const result = queryAccessLogsSchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject invalid validation_result', () => {
      const invalidQuery = { validation_result: 'invalid_status' };

      const result = queryAccessLogsSchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should validate all valid validation_result values', () => {
      const validResults = ['valid', 'invalid', 'expired', 'already_used', 'falsified'];

      validResults.forEach((result) => {
        const query = { validation_result: result };
        const parsed = queryAccessLogsSchema.safeParse(query);
        expect(parsed.success).toBe(true);
      });
    });

    it('should reject invalid UUID in filters', () => {
      const invalidQuery = {
        user_id: 'not-a-uuid',
      };

      const result = queryAccessLogsSchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('UUID válido');
      }
    });

    it('should reject invalid date format', () => {
      const invalidQuery = {
        from: '2025-10-17',  // No ISO 8601 datetime (missing time)
      };

      const result = queryAccessLogsSchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('ISO 8601');
      }
    });
  });
});
