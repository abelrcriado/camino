/**
 * Tests para QRValidationController
 * 
 * Test Coverage:
 * - HMAC-SHA256 signature verification (valid/invalid)
 * - Expiration check (<24h valid, >24h expired, future timestamp)
 * - One-time use enforcement (qr_used flag)
 * - QR invalidation detection (qr_invalidated flag)
 * - 13-step validation process flow
 * - Error scenarios: 400, 403, 404, 409, 410, 500
 * 
 * Mock Strategy (UPDATED - Repository DI Pattern):
 * - Repository dependency injection: Controller accepts mocked repositories
 * - HTTP mocking: node-mocks-http for request/response
 * - Factory pattern: generateUUID(), generateISODate(), generateHMACSignature()
 */

import { createMocks } from 'node-mocks-http';
import crypto from 'crypto';
import { QRValidationController } from '@/api/controllers/qr-validation.controller';
import { TransactionRepository } from '@/api/repositories/transaction.repository';
import { AccessLogRepository } from '@/api/repositories/access_log.repository';
import { UserRepository } from '@/api/repositories/user.repository';
import { generateUUID, generateISODate } from '../helpers/factories';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { QRPayload, TransactionItem } from '@/api/dto/qr.dto';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock del logger (default export)
jest.mock('@/config/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock del asyncHandler para que ejecute directamente
jest.mock('@/api/middlewares/error-handler', () => ({
  asyncHandler: (handler: any) => handler,
}));

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Genera una firma HMAC-SHA256 válida para un payload QR
 */
const generateHMACSignature = (
  transactionId: string,
  userId: string,
  items: TransactionItem[],
  timestamp: number,
  secret: string
): string => {
  const dataToSign = JSON.stringify({
    transaction_id: transactionId,
    user_id: userId,
    items,
    timestamp,
  });

  return crypto
    .createHmac('sha256', secret)
    .update(dataToSign)
    .digest('hex');
};

/**
 * Genera un payload QR completo con firma HMAC
 */
const generateValidQRPayload = (
  overrides: Partial<{
    transactionId: string;
    userId: string;
    items: TransactionItem[];
    timestamp: number;
    secret: string;
    version: string;
  }> = {}
): { payload: QRPayload; secret: string; qrData: string } => {
  const secret = overrides.secret || 'test-secret-key-12345';
  const transactionId = overrides.transactionId || generateUUID();
  const userId = overrides.userId || generateUUID();
  const timestamp = overrides.timestamp || Date.now();
  const items: TransactionItem[] = overrides.items || [
    {
      type: 'product',
      id: generateUUID(),
      name: 'Bocadillo jamón',
      quantity: 1,
      price: 3.50,
    },
  ];

  const signature = generateHMACSignature(transactionId, userId, items, timestamp, secret);

  const payload: QRPayload = {
    transaction_id: transactionId,
    user_id: userId,
    items,
    timestamp,
    version: overrides.version || '1.0',
    signature,
  };

  const qrData = Buffer.from(JSON.stringify(payload)).toString('base64');

  return { payload, secret, qrData };
};

/**
 * Genera un QR con firma inválida
 */
const generateInvalidSignatureQR = (): string => {
  const { payload } = generateValidQRPayload();
  // Alterar la firma
  payload.signature = 'invalid-signature-12345';
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

/**
 * Genera un QR expirado (>24h)
 */
const generateExpiredQR = (secret: string): string => {
  const twentyFiveHoursAgo = Date.now() - (25 * 60 * 60 * 1000);
  const { qrData } = generateValidQRPayload({ timestamp: twentyFiveHoursAgo, secret });
  return qrData;
};

/**
 * Genera un QR con timestamp futuro
 */
const generateFutureQR = (secret: string): string => {
  const futureTimestamp = Date.now() + (2 * 60 * 60 * 1000); // +2 horas
  const { qrData } = generateValidQRPayload({ timestamp: futureTimestamp, secret });
  return qrData;
};

// ============================================================================
// Test Suite
// ============================================================================

describe('QRValidationController', () => {
  let controller: QRValidationController;
  let mockTransactionRepo: jest.Mocked<TransactionRepository>;
  let mockAccessLogRepo: jest.Mocked<AccessLogRepository>;
  let mockUserRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // Create mocked repository instances with all methods
    mockTransactionRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      markQRAsUsed: jest.fn(),
      invalidateQR: jest.fn(),
      upsert: jest.fn(),
      createFromQRPayload: jest.fn(),
      updateStatus: jest.fn(),
      findByUserId: jest.fn(),
    } as any;

    mockAccessLogRepo = {
      logAccess: jest.fn(),
      findWithFilters: jest.fn(),
      findByTransactionId: jest.fn(),
      findByUserId: jest.fn(),
      countByValidationResult: jest.fn(),
    } as any;

    mockUserRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as any;

    // Inject mocked repositories into controller
    controller = new QRValidationController(
      mockTransactionRepo,
      mockAccessLogRepo,
      mockUserRepo
    );

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // Happy Path: Validación exitosa
  // ==========================================================================

  describe('verifyQR - Happy Path', () => {
    it('should validate QR with correct HMAC signature and return 200', async () => {
      const { qrData, payload, secret } = generateValidQRPayload();
      const locationId = generateUUID();
      const scannedBy = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
          scanned_by: scannedBy,
        },
      });

      // Mock: Usuario existe con qr_secret
      mockUserRepo.findById.mockResolvedValue({
        data: { id: payload.user_id, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Transacción NO existe (crear desde QR)
      mockTransactionRepo.findById.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Crear nueva transacción desde payload QR
      const testTransaction = {
        id: payload.transaction_id,
        user_id: payload.user_id,
        items: payload.items,
        total: 3.50,
        status: 'pending_sync' as const,
        qr_used: false,
        qr_invalidated: false,
        qr_used_at: undefined,
        qr_used_location: undefined,
        qr_used_by: undefined,
        qr_invalidated_at: undefined,
        qr_invalidated_reason: undefined,
        parent_transaction_id: undefined,
        created_at: new Date(payload.timestamp).toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: undefined,
      };
      
      mockTransactionRepo.createFromQRPayload.mockResolvedValue({
        data: testTransaction,  // single() returns object, not array
        error: null,
      } as any);

      // Mock: Marcar transacción como usada
      mockTransactionRepo.markQRAsUsed.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Log de acceso (non-blocking)
      mockAccessLogRepo.logAccess.mockResolvedValue({
        data: [{
          id: generateUUID(),
          transaction_id: payload.transaction_id,
          user_id: payload.user_id,
          location_id: locationId,
          validation_result: 'valid',
          scanned_by: scannedBy,
        }],
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.valid).toBe(true);
      expect(responseData.transaction.id).toBe(payload.transaction_id);
      expect(responseData.message).toBe('QR válido - Acceso autorizado');
    });

    it('should validate QR with existing transaction (not yet used)', async () => {
      const { qrData, payload, secret } = generateValidQRPayload();
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: payload.user_id, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Transacción existe y NO está usada
      mockTransactionRepo.findById.mockResolvedValue({
        data: {
          id: payload.transaction_id,
          user_id: payload.user_id,
          items: payload.items,
          total: 3.50,
          status: 'pending_sync' as const,
          qr_used: false,
          qr_invalidated: false,
          created_at: new Date(payload.timestamp).toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      } as any);

      // Mock: Marcar como usado
      mockTransactionRepo.markQRAsUsed.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Log de acceso
      mockAccessLogRepo.logAccess.mockResolvedValue({
        data: [{ id: generateUUID() }],
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.valid).toBe(true);
    });

    it('should validate QR within 24h expiration window', async () => {
      const twentyThreeHoursAgo = Date.now() - (23 * 60 * 60 * 1000);
      const { qrData, payload, secret } = generateValidQRPayload({ timestamp: twentyThreeHoursAgo });
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: payload.user_id, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Transacción no existe
      mockTransactionRepo.findById.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Crear transacción
      mockTransactionRepo.createFromQRPayload.mockResolvedValue({
        data: {
          id: payload.transaction_id,
          user_id: payload.user_id,
          qr_used: false,
          qr_invalidated: false,
          items: payload.items,
          total: 3.50,
          status: 'pending_sync' as const,
          created_at: new Date(twentyThreeHoursAgo).toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      } as any);

      // Mock: Marcar como usado
      mockTransactionRepo.markQRAsUsed.mockResolvedValue({ data: null, error: null } as any);
      
      // Mock: Log
      mockAccessLogRepo.logAccess.mockResolvedValue({ data: [{}], error: null } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(200);
    });
  });

  // ==========================================================================
  // Error 400: Invalid QR Format
  // ==========================================================================

  describe('verifyQR - 400 Bad Request', () => {
    it('should reject invalid base64 QR data with 400', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: 'invalid-base64-!!!@@@',
          location_id: generateUUID(),
        },
      });

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('QR inválido o corrupto');
    });

    it('should reject corrupted JSON payload with 400', async () => {
      const corruptedQR = Buffer.from('{corrupted-json').toString('base64');

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: corruptedQR,
          location_id: generateUUID(),
        },
      });

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('QR inválido o corrupto');
    });

    it('should reject QR with unsupported version (e.g., 2.0) with 400', async () => {
      const { qrData, payload, secret } = generateValidQRPayload({ version: '2.0' });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: generateUUID(),
        },
      });

      // Mock: Usuario existe (pero falla antes por versión)
      mockUserRepo.findById.mockResolvedValue({
        data: { id: payload.user_id, qr_secret: secret },
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Versión de QR no soportada: 2.0');
    });

    it('should reject QR with missing required fields (Zod validation)', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          // Missing qr_data
          location_id: generateUUID(),
        },
      });

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBeDefined();
    });
  });

  // ==========================================================================
  // Error 403: Falsified Signature
  // ==========================================================================

  describe('verifyQR - 403 Forbidden (Falsified)', () => {
    it('should reject QR with invalid HMAC signature with 403', async () => {
      const qrData = generateInvalidSignatureQR();
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: generateUUID(), qr_secret: 'test-secret-key-12345' },
        error: null,
      } as any);

      // Mock: Log (falsified)
      mockAccessLogRepo.logAccess.mockResolvedValue({
        data: [{}],
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(403);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('QR falsificado o manipulado');
    });

    it('should reject QR with tampered items (altered after signing)', async () => {
      const { qrData, payload, secret } = generateValidQRPayload();
      const locationId = generateUUID();

      // Alterar el payload DESPUÉS de generar la firma
      const decodedPayload = JSON.parse(
        Buffer.from(qrData, 'base64').toString('utf-8')
      );
      decodedPayload.items[0].price = 999.99; // Cambiar precio
      const tamperedQR = Buffer.from(JSON.stringify(decodedPayload)).toString('base64');

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: tamperedQR,
          location_id: locationId,
        },
      });

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: payload.user_id, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Log
      mockAccessLogRepo.logAccess.mockResolvedValue({
        data: [{}],
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(403);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('QR falsificado o manipulado');
    });
  });

  // ==========================================================================
  // Error 404: User Not Found
  // ==========================================================================

  describe('verifyQR - 404 Not Found', () => {
    it('should reject QR when user does not exist with 404', async () => {
      const { qrData } = generateValidQRPayload();
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Mock: Usuario NO existe
      mockUserRepo.findById.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      } as any);

      // Mock: Log (invalid)
      mockAccessLogRepo.logAccess.mockResolvedValue({
        data: [{}],
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(404);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBeDefined();
    });
  });

  // ==========================================================================
  // Error 409: QR Already Used
  // ==========================================================================

  describe('verifyQR - 409 Conflict (Already Used)', () => {
    it('should reject QR that was already used (qr_used=true) with 409', async () => {
      const { qrData, payload, secret } = generateValidQRPayload();
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Mock: Usuario existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: payload.user_id, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Transacción existe y YA ESTÁ USADA
      mockTransactionRepo.findById.mockResolvedValue({
        data: {
          id: payload.transaction_id,
          user_id: payload.user_id,
          qr_used: true,
          qr_used_at: generateISODate({ past: true }),
          qr_invalidated: false,
          items: payload.items,
          total: 3.50,
        },
        error: null,
      } as any);

      // Mock: Log (already_used)
      mockAccessLogRepo.logAccess.mockResolvedValue({
        data: [{}],
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(409);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('QR ya utilizado anteriormente');
    });
  });

  // ==========================================================================
  // Error 410: QR Expired or Invalidated
  // ==========================================================================

  describe('verifyQR - 410 Gone (Expired/Invalidated)', () => {
    it('should reject QR older than 24 hours (expired) with 410', async () => {
      const secret = 'test-secret-key-12345';
      const qrData = generateExpiredQR(secret);
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Decode to get user_id from expired QR
      const decodedPayload = JSON.parse(
        Buffer.from(qrData, 'base64').toString('utf-8')
      );

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: decodedPayload.user_id, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Log (expired)
      mockAccessLogRepo.logAccess.mockResolvedValue({
        data: [{}],
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(410);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('QR expirado');
    });

    it('should reject QR with qr_invalidated=true (due to return) with 410', async () => {
      const { qrData, payload, secret } = generateValidQRPayload();
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: payload.user_id, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Transacción existe y está INVALIDADA
      mockTransactionRepo.findById.mockResolvedValue({
        data: {
          id: payload.transaction_id,
          user_id: payload.user_id,
          qr_used: false,
          qr_invalidated: true,
          qr_invalidated_reason: 'devolución parcial',
          items: payload.items,
          total: 3.50,
        },
        error: null,
      } as any);

      // Mock: Log (invalid)
      mockAccessLogRepo.logAccess.mockResolvedValue({
        data: [{}],
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(410);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('QR invalidado');
      expect(responseData.error).toContain('devolución parcial');
    });

    it('should accept QR with future timestamp within reasonable bounds', async () => {
      const secret = 'test-secret-key-12345';
      const qrData = generateFutureQR(secret);
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Decode to get user_id and transaction_id from future QR
      const decodedPayload = JSON.parse(
        Buffer.from(qrData, 'base64').toString('utf-8')
      );

      const testTransaction = {
        id: decodedPayload.transaction_id,
        user_id: decodedPayload.user_id,
        items: decodedPayload.items,
        total: decodedPayload.total,
        status: 'pending_sync' as const,
        qr_used: false,
        qr_invalidated: false,
        created_at: new Date(decodedPayload.timestamp).toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: decodedPayload.user_id, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Transacción no existe
      mockTransactionRepo.findById.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Crear transacción
      mockTransactionRepo.createFromQRPayload.mockResolvedValue({
        data: testTransaction,
        error: null,
      } as any);

      // Mock: Mark as used
      mockTransactionRepo.markQRAsUsed.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Log
      mockAccessLogRepo.logAccess.mockResolvedValue({
        data: [{}],
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      // Nota: El controlador actual solo valida expiración hacia el pasado
      // Este test valida que timestamps futuros NO causen error
      expect(res._getStatusCode()).toBe(200);
    });
  });

  // ==========================================================================
  // Error 500: Database/Internal Errors
  // ==========================================================================

  describe('verifyQR - 500 Internal Server Error', () => {
    it('should return 500 when database query fails', async () => {
      const { qrData } = generateValidQRPayload();
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Mock: Error de base de datos (user lookup fails)
      mockUserRepo.findById.mockRejectedValue(
        new Error('Database connection failed')
      );

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(500);
    });

    it('should return 500 when transaction creation fails', async () => {
      const userId = generateUUID();
      const transactionId = generateUUID();
      const { qrData, secret } = generateValidQRPayload({ userId, transactionId });
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: userId, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Transacción no existe
      mockTransactionRepo.findById.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Error al crear transacción
      mockTransactionRepo.createFromQRPayload.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Error al procesar QR');
    });

    it('should return 500 when transaction update fails', async () => {
      const userId = generateUUID();
      const transactionId = generateUUID();
      const items: TransactionItem[] = [
        {
          type: 'product',
          id: generateUUID(),
          name: 'Test Product',
          quantity: 1,
          price: 3.50,
        },
      ];
      const { qrData, secret } = generateValidQRPayload({ userId, transactionId, items });
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: userId, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Transacción existe
      mockTransactionRepo.findById.mockResolvedValue({
        data: {
          id: transactionId,
          user_id: userId,
          qr_used: false,
          qr_invalidated: false,
          items,
          total: 3.50,
          status: 'pending_sync' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      } as any);

      // Mock: Error al actualizar (markQRAsUsed fails)
      mockTransactionRepo.markQRAsUsed.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('Error al procesar QR');
    });
  });

  // ==========================================================================
  // Access Logs Auditing
  // ==========================================================================

  describe('verifyQR - Access Logs Auditing', () => {
    it('should log "valid" access when QR is successfully validated', async () => {
      const { qrData, secret } = generateValidQRPayload();
      const locationId = generateUUID();
      const scannedBy = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
          scanned_by: scannedBy,
        },
      });

      // Decode to get user_id and transaction_id
      const decodedPayload = JSON.parse(
        Buffer.from(qrData, 'base64').toString('utf-8')
      );

      const testTransaction = {
        id: decodedPayload.transaction_id,
        user_id: decodedPayload.user_id,
        items: decodedPayload.items,
        total: decodedPayload.total,
        status: 'pending_sync' as const,
        qr_used: false,
        qr_invalidated: false,
        created_at: new Date(decodedPayload.timestamp).toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: decodedPayload.user_id, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Transacción no existe
      mockTransactionRepo.findById.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Crear transacción
      mockTransactionRepo.createFromQRPayload.mockResolvedValue({
        data: testTransaction,
        error: null,
      } as any);

      // Mock: Mark as used
      mockTransactionRepo.markQRAsUsed.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Insert log
      mockAccessLogRepo.logAccess.mockResolvedValue({
        data: [{}],
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockAccessLogRepo.logAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          location_id: locationId,
          scanned_by: scannedBy,
          validation_result: 'valid',
        })
      );
    });

    it('should log "falsified" when signature is invalid', async () => {
      const qrData = generateInvalidSignatureQR();
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Decode to get user_id
      const decodedPayload = JSON.parse(
        Buffer.from(qrData, 'base64').toString('utf-8')
      );

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: decodedPayload.user_id, qr_secret: 'test-secret-key-12345' },
        error: null,
      } as any);

      // Mock: Insert log
      mockAccessLogRepo.logAccess.mockResolvedValue({
        data: [{}],
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(mockAccessLogRepo.logAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          validation_result: 'falsified',
        })
      );
    });

    it('should log "already_used" when QR was previously scanned', async () => {
      const userId = generateUUID();
      const transactionId = generateUUID();
      const { qrData, secret } = generateValidQRPayload({ userId, transactionId });
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: userId, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Transacción ya usada
      mockTransactionRepo.findById.mockResolvedValue({
        data: {
          id: transactionId,
          user_id: userId,
          qr_used: true,
          qr_used_at: generateISODate({ past: true }),
          qr_invalidated: false,
          items: [],
          total: 3.50,
          status: 'completed' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      } as any);

      // Mock: Insert log
      mockAccessLogRepo.logAccess.mockResolvedValue({
        data: [{}],
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(409);
      expect(mockAccessLogRepo.logAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          validation_result: 'already_used',
        })
      );
    });

    it('should NOT throw error if log insertion fails (non-blocking)', async () => {
      const { qrData, secret } = generateValidQRPayload();
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Decode to get user_id and transaction_id
      const decodedPayload = JSON.parse(
        Buffer.from(qrData, 'base64').toString('utf-8')
      );

      const testTransaction = {
        id: decodedPayload.transaction_id,
        user_id: decodedPayload.user_id,
        items: decodedPayload.items,
        total: decodedPayload.total,
        status: 'pending_sync' as const,
        qr_used: false,
        qr_invalidated: false,
        created_at: new Date(decodedPayload.timestamp).toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: decodedPayload.user_id, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Transacción no existe
      mockTransactionRepo.findById.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Crear transacción
      mockTransactionRepo.createFromQRPayload.mockResolvedValue({
        data: testTransaction,
        error: null,
      } as any);

      // Mock: Mark as used
      mockTransactionRepo.markQRAsUsed.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Log insertion FAILS (non-blocking)
      mockAccessLogRepo.logAccess.mockRejectedValue(
        new Error('Log insertion failed')
      );

      await controller.verifyQR(req, res);

      // Debería seguir devolviendo 200 aunque el log falle
      expect(res._getStatusCode()).toBe(200);
    });
  });

  // ==========================================================================
  // HMAC Verification Logic
  // ==========================================================================

  describe('verifyHMACSignature - Private Method', () => {
    it('should verify correct HMAC signature', () => {
      const transactionId = generateUUID();
      const userId = generateUUID();
      const items: TransactionItem[] = [
        {
          type: 'product',
          id: generateUUID(),
          name: 'Test Product',
          quantity: 2,
          price: 5.50,
        },
      ];
      const timestamp = Date.now();
      const secret = 'test-secret-123';

      const signature = generateHMACSignature(transactionId, userId, items, timestamp, secret);

      const payload: QRPayload = {
        transaction_id: transactionId,
        user_id: userId,
        items,
        timestamp,
        version: '1.0',
        signature,
      };

      // Usar método privado (requiere casting o refactorización)
      const isValid = controller['verifyHMACSignature'](payload, secret);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect HMAC signature', () => {
      const transactionId = generateUUID();
      const userId = generateUUID();
      const items: TransactionItem[] = [
        {
          type: 'product',
          id: generateUUID(),
          name: 'Test Product',
          quantity: 1,
          price: 3.50,
        },
      ];
      const timestamp = Date.now();
      const secret = 'test-secret-123';

      const payload: QRPayload = {
        transaction_id: transactionId,
        user_id: userId,
        items,
        timestamp,
        version: '1.0',
        signature: 'wrong-signature-12345',
      };

      const isValid = controller['verifyHMACSignature'](payload, secret);

      expect(isValid).toBe(false);
    });

    it('should reject signature with different secret', () => {
      const transactionId = generateUUID();
      const userId = generateUUID();
      const items: TransactionItem[] = [];
      const timestamp = Date.now();
      const correctSecret = 'correct-secret';
      const wrongSecret = 'wrong-secret';

      const signature = generateHMACSignature(transactionId, userId, items, timestamp, correctSecret);

      const payload: QRPayload = {
        transaction_id: transactionId,
        user_id: userId,
        items,
        timestamp,
        version: '1.0',
        signature,
      };

      const isValid = controller['verifyHMACSignature'](payload, wrongSecret);

      expect(isValid).toBe(false);
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('verifyQR - Edge Cases', () => {
    it('should handle QR with empty items array', async () => {
      const { qrData, secret } = generateValidQRPayload({ items: [] });
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Decode to get user_id and transaction_id
      const decodedPayload = JSON.parse(
        Buffer.from(qrData, 'base64').toString('utf-8')
      );

      const testTransaction = {
        id: decodedPayload.transaction_id,
        user_id: decodedPayload.user_id,
        items: [],
        total: 0,
        status: 'pending_sync' as const,
        qr_used: false,
        qr_invalidated: false,
        created_at: new Date(decodedPayload.timestamp).toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: decodedPayload.user_id, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Transacción no existe
      mockTransactionRepo.findById.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Crear transacción con total = 0
      mockTransactionRepo.createFromQRPayload.mockResolvedValue({
        data: testTransaction,
        error: null,
      } as any);

      // Mock: Mark as used
      mockTransactionRepo.markQRAsUsed.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Log
      mockAccessLogRepo.logAccess.mockResolvedValue({
        data: [{}],
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.transaction.total).toBe(0);
    });

    it('should handle QR with multiple items', async () => {
      const items: TransactionItem[] = [
        {
          type: 'product',
          id: generateUUID(),
          name: 'Item 1',
          quantity: 2,
          price: 5.00,
        },
        {
          type: 'service',
          id: generateUUID(),
          name: 'Item 2',
          quantity: 1,
          price: 10.00,
        },
      ];
      const { qrData, secret } = generateValidQRPayload({ items });
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
        },
      });

      // Decode to get user_id and transaction_id
      const decodedPayload = JSON.parse(
        Buffer.from(qrData, 'base64').toString('utf-8')
      );

      const testTransaction = {
        id: decodedPayload.transaction_id,
        user_id: decodedPayload.user_id,
        items,
        total: 20.00,
        status: 'pending_sync' as const,
        qr_used: false,
        qr_invalidated: false,
        created_at: new Date(decodedPayload.timestamp).toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: decodedPayload.user_id, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Transacción no existe
      mockTransactionRepo.findById.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Crear transacción con total calculado (2*5 + 1*10 = 20)
      mockTransactionRepo.createFromQRPayload.mockResolvedValue({
        data: testTransaction,
        error: null,
      } as any);

      // Mock: Mark as used
      mockTransactionRepo.markQRAsUsed.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Log
      mockAccessLogRepo.logAccess.mockResolvedValue({
        data: [{}],
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.transaction.total).toBe(20.00);
      expect(responseData.transaction.items).toHaveLength(2);
    });

    it('should handle scanned_by as optional field', async () => {
      const { qrData, secret } = generateValidQRPayload();
      const locationId = generateUUID();

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: locationId,
          // scanned_by omitted
        },
      });

      // Decode to get user_id and transaction_id
      const decodedPayload = JSON.parse(
        Buffer.from(qrData, 'base64').toString('utf-8')
      );

      const testTransaction = {
        id: decodedPayload.transaction_id,
        user_id: decodedPayload.user_id,
        items: [],
        total: 0,
        status: 'pending_sync' as const,
        qr_used: false,
        qr_invalidated: false,
        created_at: new Date(decodedPayload.timestamp).toISOString(),
        updated_at: new Date().toISOString(),
        synced_at: new Date().toISOString(),
      };

      // Mock: Usuario existe
      mockUserRepo.findById.mockResolvedValue({
        data: { id: decodedPayload.user_id, qr_secret: secret },
        error: null,
      } as any);

      // Mock: Transacción no existe
      mockTransactionRepo.findById.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Crear transacción
      mockTransactionRepo.createFromQRPayload.mockResolvedValue({
        data: testTransaction,
        error: null,
      } as any);

      // Mock: Mark as used (qr_used_by should be null)
      mockTransactionRepo.markQRAsUsed.mockResolvedValue({
        data: null,
        error: null,
      } as any);

      // Mock: Log
      mockAccessLogRepo.logAccess.mockResolvedValue({
        data: [{}],
        error: null,
      } as any);

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(200);
      // Verify markQRAsUsed was called with null for scanned_by
      expect(mockTransactionRepo.markQRAsUsed).toHaveBeenCalledWith(
        decodedPayload.transaction_id,
        locationId,
        null // scanned_by is null (optional field omitted)
      );
    });
  });
});
