/**
 * Tests de integración para /api/booking
 *
 * Estos tests verifican el comportamiento completo del endpoint
 * de bookings, incluyendo validaciones, respuestas HTTP y manejo de errores.
 */

import { createMocks } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";

// Mock de Supabase para evitar llamadas reales a la base de datos
jest.mock("../../src/services/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => {
        const mockChain = {
          range: jest.fn(() => ({
            order: jest.fn(() =>
              Promise.resolve({
                data: [
                  {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    user_id: "550e8400-e29b-41d4-a716-446655440001",
                    service_point_id: "550e8400-e29b-41d4-a716-446655440002",
                    workshop_id: "550e8400-e29b-41d4-a716-446655440003",
                    start_time: "2025-10-20T10:00:00.000Z",
                    end_time: "2025-10-20T11:00:00.000Z",
                    status: "pending",
                    created_at: "2025-01-01T00:00:00.000Z",
                    updated_at: "2025-01-01T00:00:00.000Z",
                  },
                ],
                error: null,
                count: 1,
              })
            ),
          })),
          eq: jest.fn(() => mockChain),
        };
        return mockChain;
      }),
      insert: jest.fn(() => ({
        select: jest.fn(() =>
          Promise.resolve({
            data: [
              {
                id: "550e8400-e29b-41d4-a716-446655440000",
                user_id: "550e8400-e29b-41d4-a716-446655440001",
                service_point_id: "550e8400-e29b-41d4-a716-446655440002",
                workshop_id: "550e8400-e29b-41d4-a716-446655440003",
                start_time: "2025-10-20T10:00:00.000Z",
                end_time: "2025-10-20T11:00:00.000Z",
                status: "pending",
              },
            ],
            error: null,
          })
        ),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() =>
            Promise.resolve({
              data: [
                {
                  id: "550e8400-e29b-41d4-a716-446655440000",
                  status: "confirmed",
                },
              ],
              error: null,
            })
          ),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() =>
          Promise.resolve({
            data: null,
            error: null,
          })
        ),
      })),
    })),
  },
}));

// Mock del logger para tests
jest.mock("../../src/utils/apiLogger", () => ({
  logRequest: jest.fn(),
  logResponse: jest.fn(),
  logError: jest.fn(),
  logDatabaseOperation: jest.fn(),
}));

import handler from "../../pages/api/booking";

describe("/api/booking", () => {
  describe("GET /api/booking", () => {
    it("should return 200 and list of bookings", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {
          page: "1",
          limit: "10",
        },
        headers: {
          "x-correlation-id": "test-correlation-id-123",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toHaveProperty("data");
      expect(res._getJSONData()).toHaveProperty("pagination");
    });

    it("should filter by user_id when provided", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {
          user_id: "123e4567-e89b-12d3-a456-426614174000",
        },
        headers: {
          "x-correlation-id": "test-correlation-id-123",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe("POST /api/booking", () => {
    it("should create a new booking successfully", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          user_id: "550e8400-e29b-41d4-a716-446655440001",
          service_point_id: "550e8400-e29b-41d4-a716-446655440002",
          workshop_id: "550e8400-e29b-41d4-a716-446655440003",
          service_type: "maintenance",
          start_time: "2025-10-20T10:00:00.000Z",
          end_time: "2025-10-20T11:00:00.000Z",
          status: "pending",
        },
        headers: {
          "x-correlation-id": "test-correlation-id-123",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toBeInstanceOf(Array);
      expect(res._getJSONData()[0]).toHaveProperty("id");
      expect(res._getJSONData()[0]).toHaveProperty("status", "pending");
    });

    it("should return 400 when user_id is missing", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          service_point_id: "550e8400-e29b-41d4-a716-446655440002",
          workshop_id: "550e8400-e29b-41d4-a716-446655440003",
          start_time: "2025-10-20T10:00:00.000Z",
          end_time: "2025-10-20T11:00:00.000Z",
        },
        headers: {
          "x-correlation-id": "test-correlation-id-123",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = res._getJSONData();
      expect(data).toHaveProperty("error", "Errores de validación");
      expect(data).toHaveProperty("details");
    });

    it("should return 400 when user_id is invalid UUID", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          user_id: "invalid-uuid",
          service_point_id: "550e8400-e29b-41d4-a716-446655440002",
          workshop_id: "550e8400-e29b-41d4-a716-446655440003",
          start_time: "2025-10-20T10:00:00.000Z",
          end_time: "2025-10-20T11:00:00.000Z",
        },
        headers: {
          "x-correlation-id": "test-correlation-id-123",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = res._getJSONData();
      expect(data).toHaveProperty("error", "Errores de validación");
      expect(data).toHaveProperty("details");
    });

    it("should return 400 when start_time is missing", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          user_id: "123e4567-e89b-12d3-a456-426614174000",
          status: "pending",
        },
        headers: {
          "x-correlation-id": "test-correlation-id-123",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = res._getJSONData();
      expect(data).toHaveProperty("error", "Errores de validación");
      expect(data).toHaveProperty("details");
    });

    it("should return 400 when start_time is invalid ISO date", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          user_id: "123e4567-e89b-12d3-a456-426614174000",
          start_time: "invalid-date",
          status: "pending",
        },
        headers: {
          "x-correlation-id": "test-correlation-id-123",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = res._getJSONData();
      expect(data).toHaveProperty("error", "Errores de validación");
      expect(data).toHaveProperty("details");
    });

    it("should return 400 when status is invalid", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          user_id: "123e4567-e89b-12d3-a456-426614174000",
          start_time: "2025-10-20T10:00:00Z",
          status: "invalid-status",
        },
        headers: {
          "x-correlation-id": "test-correlation-id-123",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = res._getJSONData();
      expect(data).toHaveProperty("error", "Errores de validación");
      expect(data).toHaveProperty("details");
    });
  });

  describe("PUT /api/booking", () => {
    it("should update a booking successfully", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        body: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          status: "confirmed",
        },
        headers: {
          "x-correlation-id": "test-correlation-id-123",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toBeInstanceOf(Array);
      expect(res._getJSONData()[0]).toHaveProperty("id");
      expect(res._getJSONData()[0]).toHaveProperty("status", "confirmed");
    });

    it("should return 400 when id is missing", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        body: {
          status: "confirmed",
        },
        headers: {
          "x-correlation-id": "test-correlation-id-123",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = res._getJSONData();
      expect(data).toHaveProperty("error", "Errores de validación");
      expect(data).toHaveProperty("details");
    });

    it("should return 400 when id is invalid UUID", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        body: {
          id: "invalid-uuid",
          status: "confirmed",
        },
        headers: {
          "x-correlation-id": "test-correlation-id-123",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = res._getJSONData();
      expect(data).toHaveProperty("error", "Errores de validación");
      expect(data).toHaveProperty("details");
    });
  });

  describe("DELETE /api/booking", () => {
    it("should delete a booking successfully", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        body: {
          id: "550e8400-e29b-41d4-a716-446655440000",
        },
        headers: {
          "x-correlation-id": "test-correlation-id-123",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(204);
    });

    it("should return 400 when id is missing", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        body: {},
        headers: {
          "x-correlation-id": "test-correlation-id-123",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = res._getJSONData();
      expect(data).toHaveProperty("error", "Errores de validación");
      expect(data).toHaveProperty("details");
    });

    it("should return 400 when id is invalid UUID", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "DELETE",
        body: {
          id: "invalid-uuid",
        },
        headers: {
          "x-correlation-id": "test-correlation-id-123",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = res._getJSONData();
      expect(data).toHaveProperty("error", "Errores de validación");
      expect(data).toHaveProperty("details");
    });
  });

  describe("Invalid HTTP methods", () => {
    it("should return 405 for PATCH method", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PATCH",
        headers: {
          "x-correlation-id": "test-correlation-id-123",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getJSONData()).toHaveProperty("error");
    });
  });
});
