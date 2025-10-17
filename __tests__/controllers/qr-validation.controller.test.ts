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
 * Mock Strategy:
 * - Dependency injection: Controller accepts mocked Supabase client
 * - HTTP mocking: node-mocks-http for request/response
 * - Factory pattern: generateUUID(), generateISODate(), generateHMACSignature()
 */

import { createMocks } from 'node-mocks-http';
import crypto from 'crypto';
import { QRValidationController } from '@/api/controllers/qr-validation.controller';
import { generateUUID, generateISODate } from '../helpers/factories';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { QRPayload, TransactionItem } from '@/api/dto/qr.dto';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock del módulo supabase
jest.mock('@/api/services/supabase', () => {
  const mockFrom = jest.fn();
  const mockSelect = jest.fn();
  const mockInsert = jest.fn();
  const mockUpdate = jest.fn();
  const mockEq = jest.fn();
  const mockSingle = jest.fn();

  // Configurar chaining
  mockFrom.mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    eq: mockEq,
  });

  mockSelect.mockReturnValue({
    eq: mockEq,
    single: mockSingle,
  });

  mockInsert.mockReturnValue({
    select: mockSelect,
    single: mockSingle,
  });

  mockUpdate.mockReturnValue({
    eq: mockEq,
  });

  mockEq.mockReturnValue({
    eq: mockEq,
    single: mockSingle,
    select: mockSelect,
  });

  const mockSupabase = {
    from: mockFrom,
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    eq: mockEq,
    single: mockSingle,
  };

  return { supabase: mockSupabase };
});

// Mock del logger (logger.ts usa export default)
jest.mock('@/config/logger', () => {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
  return {
    default: mockLogger,
    logger: mockLogger, // También exportar como named para compatibilidad
  };
});

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

/**
 * Obtiene el mock de Supabase del módulo mockeado
 */
import { supabase as mockSupabaseModule } from '@/api/services/supabase';

// ============================================================================
// Test Suite
// ============================================================================

describe('QRValidationController', () => {
  let controller: QRValidationController;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = mockSupabaseModule;
    controller = new QRValidationController();
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
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

      // Mock: Transacción NO existe (crear desde QR)
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock: Crear nueva transacción
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: {
          id: payload.transaction_id,
          user_id: payload.user_id,
          items: payload.items,
          total: 3.50,
          status: 'pending_sync',
          qr_used: false,
          qr_invalidated: false,
          created_at: new Date(payload.timestamp).toISOString(),
        },
        error: null,
      });

      // Mock: Actualizar transacción (marcar como usado)
      (mockSupabase.update as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      // Mock: Insertar log de acceso
      (mockSupabase.insert as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

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
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

      // Mock: Transacción existe y NO está usada
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: {
          id: payload.transaction_id,
          user_id: payload.user_id,
          items: payload.items,
          total: 3.50,
          status: 'pending_sync',
          qr_used: false,
          qr_invalidated: false,
          created_at: new Date(payload.timestamp).toISOString(),
        },
        error: null,
      });

      // Mock: Actualizar transacción
      (mockSupabase.update as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      // Mock: Insertar log
      (mockSupabase.insert as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.valid).toBe(true);
    });

    it('should validate QR within 24h expiration window', async () => {
      const twentyThreeHoursAgo = Date.now() - (23 * 60 * 60 * 1000);
      const { qrData, secret } = generateValidQRPayload({ timestamp: twentyThreeHoursAgo });
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

      // Mock: Transacción no existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock: Crear transacción
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: {
          id: generateUUID(),
          qr_used: false,
          qr_invalidated: false,
          items: [],
          total: 0,
        },
        error: null,
      });

      // Mock: Update y insert
      (mockSupabase.update as jest.Mock).mockResolvedValue({ data: null, error: null });
      (mockSupabase.insert as jest.Mock).mockResolvedValue({ data: null, error: null });

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
      const { qrData, secret } = generateValidQRPayload({ version: '2.0' });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          qr_data: qrData,
          location_id: generateUUID(),
        },
      });

      // Mock: Usuario existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

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
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: 'test-secret-key-12345' },
        error: null,
      });

      // Mock: Insertar log (falsified)
      (mockSupabase.insert as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(403);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('QR falsificado o manipulado');
    });

    it('should reject QR with tampered items (altered after signing)', async () => {
      const { qrData, secret } = generateValidQRPayload();
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
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

      // Mock: Insertar log
      (mockSupabase.insert as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

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
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: { message: 'User not found' },
      });

      // Mock: Insertar log (invalid)
      (mockSupabase.insert as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

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

      // Mock: Transacción existe y YA ESTÁ USADA
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
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
      });

      // Mock: Insertar log (already_used)
      (mockSupabase.insert as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

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

      // Mock: Usuario existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

      // Mock: Insertar log (expired)
      (mockSupabase.insert as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

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
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

      // Mock: Transacción existe y está INVALIDADA
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
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
      });

      // Mock: Insertar log (invalid)
      (mockSupabase.insert as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

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

      // Mock: Usuario existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

      // Mock: Transacción no existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock: Crear transacción
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: {
          id: generateUUID(),
          qr_used: false,
          qr_invalidated: false,
          items: [],
          total: 0,
        },
        error: null,
      });

      // Mock: Update y insert
      (mockSupabase.update as jest.Mock).mockResolvedValue({ data: null, error: null });
      (mockSupabase.insert as jest.Mock).mockResolvedValue({ data: null, error: null });

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

      // Mock: Error de base de datos
      (mockSupabase.single as jest.Mock).mockRejectedValueOnce(
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
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

      // Mock: Transacción no existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock: Error al crear transacción
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: { message: 'Insert failed' },
      });

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
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

      // Mock: Transacción existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: {
          id: transactionId,
          qr_used: false,
          qr_invalidated: false,
          items,
          total: 3.50,
        },
        error: null,
      });

      // Mock: Error al actualizar
      (mockSupabase.update as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

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

      // Mock: Usuario existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

      // Mock: Transacción no existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock: Crear transacción
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: {
          id: generateUUID(),
          qr_used: false,
          qr_invalidated: false,
          items: [],
          total: 0,
        },
        error: null,
      });

      // Mock: Update
      (mockSupabase.update as jest.Mock).mockResolvedValue({ data: null, error: null });

      // Mock: Insert log
      const insertMock = (mockSupabase.insert as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(insertMock).toHaveBeenCalledWith(
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

      // Mock: Usuario existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: 'test-secret-key-12345' },
        error: null,
      });

      // Mock: Insert log
      const insertMock = (mockSupabase.insert as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(insertMock).toHaveBeenCalledWith(
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
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

      // Mock: Transacción ya usada
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: {
          id: transactionId,
          user_id: userId,
          qr_used: true,
          qr_used_at: generateISODate({ past: true }),
          qr_invalidated: false,
          items: [],
          total: 3.50,
        },
        error: null,
      });

      // Mock: Insert log
      const insertMock = (mockSupabase.insert as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(409);
      expect(insertMock).toHaveBeenCalledWith(
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

      // Mock: Usuario existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

      // Mock: Transacción no existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock: Crear transacción
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: {
          id: generateUUID(),
          qr_used: false,
          qr_invalidated: false,
          items: [],
          total: 0,
        },
        error: null,
      });

      // Mock: Update
      (mockSupabase.update as jest.Mock).mockResolvedValue({ data: null, error: null });

      // Mock: Log insertion FAILS
      (mockSupabase.insert as jest.Mock).mockRejectedValue(
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

      // Mock: Usuario existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

      // Mock: Transacción no existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock: Crear transacción con total = 0
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: {
          id: generateUUID(),
          qr_used: false,
          qr_invalidated: false,
          items: [],
          total: 0,
        },
        error: null,
      });

      // Mock: Update y insert
      (mockSupabase.update as jest.Mock).mockResolvedValue({ data: null, error: null });
      (mockSupabase.insert as jest.Mock).mockResolvedValue({ data: null, error: null });

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

      // Mock: Usuario existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

      // Mock: Transacción no existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock: Crear transacción con total calculado (2*5 + 1*10 = 20)
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: {
          id: generateUUID(),
          qr_used: false,
          qr_invalidated: false,
          items,
          total: 20.00,
        },
        error: null,
      });

      // Mock: Update y insert
      (mockSupabase.update as jest.Mock).mockResolvedValue({ data: null, error: null });
      (mockSupabase.insert as jest.Mock).mockResolvedValue({ data: null, error: null });

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

      // Mock: Usuario existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: { qr_secret: secret },
        error: null,
      });

      // Mock: Transacción no existe
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock: Crear transacción
      (mockSupabase.single as jest.Mock).mockResolvedValueOnce({
        data: {
          id: generateUUID(),
          qr_used: false,
          qr_invalidated: false,
          items: [],
          total: 0,
        },
        error: null,
      });

      // Mock: Update (qr_used_by should be null)
      const updateMock = (mockSupabase.update as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      // Mock: Insert log
      (mockSupabase.insert as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      await controller.verifyQR(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          qr_used_by: null,
        })
      );
    });
  });
});
