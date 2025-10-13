import { describe, it, expect, beforeEach } from "@jest/globals";
import { createMocks } from "node-mocks-http";
import {
  withCorrelationId,
  getCorrelationId,
  getRequestDuration,
} from "../../src/middlewares/correlationId";
import type { NextApiRequest, NextApiResponse } from "next";

describe("correlationId middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("withCorrelationId", () => {
    it("should use existing X-Correlation-ID from headers", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "x-correlation-id": "existing-correlation-id",
        },
      });

      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        res.status(200).json({ correlationId: req.correlationId });
      };

      const wrappedHandler = withCorrelationId(handler);
      await wrappedHandler(req, res);

      expect(req.correlationId).toBe("existing-correlation-id");
      expect(res.getHeader("X-Correlation-ID")).toBe("existing-correlation-id");
    });

    it("should use X-Request-ID as fallback", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "x-request-id": "request-id-123",
        },
      });

      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        res.status(200).json({ correlationId: req.correlationId });
      };

      const wrappedHandler = withCorrelationId(handler);
      await wrappedHandler(req, res);

      expect(req.correlationId).toBe("request-id-123");
      expect(res.getHeader("X-Correlation-ID")).toBe("request-id-123");
    });

    it("should generate new UUID if no correlation ID provided", async () => {
      const { req, res } = createMocks({
        method: "POST",
      });

      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        res.status(200).json({ correlationId: req.correlationId });
      };

      const wrappedHandler = withCorrelationId(handler);
      await wrappedHandler(req, res);

      expect(req.correlationId).toBeDefined();
      expect(typeof req.correlationId).toBe("string");
      expect(req.correlationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(res.getHeader("X-Correlation-ID")).toBe(req.correlationId);
    });

    it("should set startTime on request", async () => {
      const { req, res } = createMocks({
        method: "GET",
      });

      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        res.status(200).json({ startTime: req.startTime });
      };

      const wrappedHandler = withCorrelationId(handler);
      await wrappedHandler(req, res);

      expect(req.startTime).toBeDefined();
      expect(typeof req.startTime).toBe("number");
      expect(req.startTime).toBeLessThanOrEqual(Date.now());
    });

    it("should add Correlation ID to response headers", async () => {
      const { req, res } = createMocks({
        method: "PUT",
      });

      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        res.status(200).json({ message: "OK" });
      };

      const wrappedHandler = withCorrelationId(handler);
      await wrappedHandler(req, res);

      const correlationIdHeader = res.getHeader("X-Correlation-ID");
      expect(correlationIdHeader).toBeDefined();
      expect(typeof correlationIdHeader).toBe("string");
    });

    it("should execute handler after setting up correlation ID", async () => {
      const { req, res } = createMocks({
        method: "DELETE",
      });

      let handlerCalled = false;
      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        handlerCalled = true;
        expect(req.correlationId).toBeDefined();
        expect(req.startTime).toBeDefined();
        res.status(204).end();
      };

      const wrappedHandler = withCorrelationId(handler);
      await wrappedHandler(req, res);

      expect(handlerCalled).toBe(true);
    });

    it("should preserve handler return value", async () => {
      const { req, res } = createMocks({
        method: "POST",
      });

      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        res.status(201).json({ id: "new-resource" });
        return res;
      };

      const wrappedHandler = withCorrelationId(handler);
      const result = await wrappedHandler(req, res);

      expect(result).toBe(res);
    });

    it("should handle errors in wrapped handler", async () => {
      const { req, res } = createMocks({
        method: "GET",
      });

      const handler = async () => {
        throw new Error("Handler error");
      };

      const wrappedHandler = withCorrelationId(handler);

      await expect(wrappedHandler(req, res)).rejects.toThrow("Handler error");
    });
  });

  describe("getCorrelationId", () => {
    it("should return correlation ID from request", () => {
      const { req } = createMocks({
        method: "GET",
      });

      req.correlationId = "test-id-123";

      expect(getCorrelationId(req)).toBe("test-id-123");
    });

    it("should return 'unknown' if no correlation ID set", () => {
      const { req } = createMocks({
        method: "GET",
      });

      expect(getCorrelationId(req)).toBe("unknown");
    });

    it("should handle undefined correlation ID", () => {
      const { req } = createMocks({
        method: "POST",
      });

      req.correlationId = undefined;

      expect(getCorrelationId(req)).toBe("unknown");
    });
  });

  describe("getRequestDuration", () => {
    it("should calculate duration from startTime", () => {
      const { req } = createMocks({
        method: "GET",
      });

      req.startTime = Date.now() - 100; // 100ms ago

      const duration = getRequestDuration(req);

      expect(duration).toBeGreaterThanOrEqual(100);
      expect(duration).toBeLessThan(200); // reasonable upper bound
    });

    it("should return 0 if no startTime set", () => {
      const { req } = createMocks({
        method: "GET",
      });

      expect(getRequestDuration(req)).toBe(0);
    });

    it("should handle undefined startTime", () => {
      const { req } = createMocks({
        method: "POST",
      });

      req.startTime = undefined;

      expect(getRequestDuration(req)).toBe(0);
    });

    it("should return increasing duration over time", async () => {
      const { req } = createMocks({
        method: "GET",
      });

      req.startTime = Date.now();

      const duration1 = getRequestDuration(req);

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10));

      const duration2 = getRequestDuration(req);

      expect(duration2).toBeGreaterThanOrEqual(duration1);
    });
  });

  describe("Integration: Full request lifecycle", () => {
    it("should track correlation ID through entire request", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "x-correlation-id": "lifecycle-test-id",
        },
      });

      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        const correlationId = getCorrelationId(req);
        const duration = getRequestDuration(req);

        res.status(200).json({
          correlationId,
          duration,
          message: "OK",
        });
      };

      const wrappedHandler = withCorrelationId(handler);
      await wrappedHandler(req, res);

      const jsonData = JSON.parse(res._getData());
      expect(jsonData.correlationId).toBe("lifecycle-test-id");
      expect(typeof jsonData.duration).toBe("number");
      expect(res.getHeader("X-Correlation-ID")).toBe("lifecycle-test-id");
    });

    it("should measure actual execution time", async () => {
      const { req, res } = createMocks({
        method: "POST",
      });

      const handler = async (req: NextApiRequest, res: NextApiResponse) => {
        // Simulate some work
        await new Promise((resolve) => setTimeout(resolve, 50));

        const duration = getRequestDuration(req);

        res.status(200).json({ duration });
      };

      const wrappedHandler = withCorrelationId(handler);
      await wrappedHandler(req, res);

      const jsonData = JSON.parse(res._getData());
      expect(jsonData.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
