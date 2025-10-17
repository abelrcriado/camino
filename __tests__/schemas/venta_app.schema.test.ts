/**
 * Tests para venta_app.schema.ts
 * Valida schemas Zod para operaciones CRUD de ventas desde app móvil
 */

import {
  createVentaAppSchema,
  updateVentaAppSchema,
  deleteVentaAppSchema,
  reservarStockSchema,
  confirmarPagoSchema,
  confirmarRetiroSchema,
  cancelarVentaSchema,
  crearYPagarVentaSchema,
  queryVentasSchema,
  getVentasActivasSchema,
  getVentasPorExpirarSchema,
} from "@/api/schemas/venta_app.schema";
import { generateUUID } from "../helpers/factories";

describe("VentaApp Schemas", () => {
  // ============================================
  // createVentaAppSchema
  // ============================================
  describe("createVentaAppSchema", () => {
    const validData = {
      slot_id: generateUUID(),
      producto_id: generateUUID(),
      cantidad: 2,
    };

    it("should validate correct venta data", () => {
      const result = createVentaAppSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept optional user_id", () => {
      const data = {
        ...validData,
        user_id: generateUUID(),
      };
      const result = createVentaAppSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should default cantidad to 1 if not provided", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { cantidad, ...data } = validData;
      const result = createVentaAppSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cantidad).toBe(1);
      }
    });

    it("should accept metadata object", () => {
      const data = {
        ...validData,
        metadata: { source: "mobile_app", version: "1.0" },
      };
      const result = createVentaAppSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing slot_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { slot_id, ...data } = validData;
      const result = createVentaAppSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid slot_id UUID", () => {
      const data = { ...validData, slot_id: "invalid-uuid" };
      const result = createVentaAppSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing producto_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { producto_id, ...data } = validData;
      const result = createVentaAppSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject cantidad less than 1", () => {
      const data = { ...validData, cantidad: 0 };
      const result = createVentaAppSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("al menos 1");
      }
    });

    it("should reject cantidad greater than 100", () => {
      const data = { ...validData, cantidad: 101 };
      const result = createVentaAppSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("100");
      }
    });

    it("should reject invalid user_id UUID", () => {
      const data = { ...validData, user_id: "not-a-uuid" };
      const result = createVentaAppSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // updateVentaAppSchema
  // ============================================
  describe("updateVentaAppSchema", () => {
    const validData = {
      id: generateUUID(),
      notas: "Cliente solicitó cambio",
    };

    it("should validate correct update data", () => {
      const result = updateVentaAppSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept only metadata", () => {
      const data = {
        id: validData.id,
        metadata: { updated_by: "admin" },
      };
      const result = updateVentaAppSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept both notas and metadata", () => {
      const data = {
        id: validData.id,
        notas: "Actualizado",
        metadata: { reason: "customer_request" },
      };
      const result = updateVentaAppSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...data } = validData;
      const result = updateVentaAppSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid id UUID", () => {
      const data = { ...validData, id: "invalid-uuid" };
      const result = updateVentaAppSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject notas longer than 1000 characters", () => {
      const data = {
        id: validData.id,
        notas: "a".repeat(1001),
      };
      const result = updateVentaAppSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // deleteVentaAppSchema
  // ============================================
  describe("deleteVentaAppSchema", () => {
    it("should validate correct delete data", () => {
      const data = { id: generateUUID() };
      const result = deleteVentaAppSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const result = deleteVentaAppSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject invalid id UUID", () => {
      const data = { id: "not-a-uuid" };
      const result = deleteVentaAppSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // reservarStockSchema
  // ============================================
  describe("reservarStockSchema", () => {
    it("should validate correct reservar stock data", () => {
      const data = { venta_id: generateUUID() };
      const result = reservarStockSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing venta_id", () => {
      const result = reservarStockSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject invalid venta_id UUID", () => {
      const data = { venta_id: "invalid-uuid" };
      const result = reservarStockSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // confirmarPagoSchema
  // ============================================
  describe("confirmarPagoSchema", () => {
    const validData = {
      venta_id: generateUUID(),
      payment_id: generateUUID(),
    };

    it("should validate correct confirmar pago data", () => {
      const result = confirmarPagoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept optional tiempo_expiracion_minutos", () => {
      const data = {
        ...validData,
        tiempo_expiracion_minutos: 120,
      };
      const result = confirmarPagoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should have tiempo_expiracion_minutos as optional", () => {
      const result = confirmarPagoSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tiempo_expiracion_minutos).toBeUndefined();
      }
    });

    it("should reject missing venta_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { venta_id, ...data } = validData;
      const result = confirmarPagoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing payment_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { payment_id, ...data } = validData;
      const result = confirmarPagoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject tiempo_expiracion_minutos less than 1", () => {
      const data = {
        ...validData,
        tiempo_expiracion_minutos: 0,
      };
      const result = confirmarPagoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject tiempo_expiracion_minutos greater than 1440", () => {
      const data = {
        ...validData,
        tiempo_expiracion_minutos: 1441,
      };
      const result = confirmarPagoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid UUIDs", () => {
      const data = {
        venta_id: "invalid",
        payment_id: "also-invalid",
      };
      const result = confirmarPagoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // confirmarRetiroSchema
  // ============================================
  describe("confirmarRetiroSchema", () => {
    const validData = {
      venta_id: generateUUID(),
      codigo_retiro: "ABC123",
    };

    it("should validate correct confirmar retiro data", () => {
      const result = confirmarRetiroSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept valid codigo_retiro patterns", () => {
      const validCodes = ["ABC123", "XYZ789", "A1B2C3", "123456", "ABCDEF"];

      validCodes.forEach((codigo) => {
        const data = { ...validData, codigo_retiro: codigo };
        const result = confirmarRetiroSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should reject missing venta_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { venta_id, ...data } = validData;
      const result = confirmarRetiroSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing codigo_retiro", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { codigo_retiro, ...data } = validData;
      const result = confirmarRetiroSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject codigo_retiro shorter than 6 characters", () => {
      const data = { ...validData, codigo_retiro: "ABC12" };
      const result = confirmarRetiroSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject codigo_retiro longer than 10 characters", () => {
      const data = { ...validData, codigo_retiro: "ABCDEFGHIJK" };
      const result = confirmarRetiroSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject codigo_retiro with lowercase letters", () => {
      const data = { ...validData, codigo_retiro: "abc123" };
      const result = confirmarRetiroSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject codigo_retiro with special characters", () => {
      const data = { ...validData, codigo_retiro: "ABC-123" };
      const result = confirmarRetiroSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // cancelarVentaSchema
  // ============================================
  describe("cancelarVentaSchema", () => {
    const validData = {
      venta_id: generateUUID(),
    };

    it("should validate correct cancelar venta data", () => {
      const result = cancelarVentaSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept optional motivo", () => {
      const data = {
        ...validData,
        motivo: "Cliente solicitó cancelación",
      };
      const result = cancelarVentaSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing venta_id", () => {
      const result = cancelarVentaSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject invalid venta_id UUID", () => {
      const data = { venta_id: "not-a-uuid" };
      const result = cancelarVentaSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject motivo longer than 500 characters", () => {
      const data = {
        venta_id: validData.venta_id,
        motivo: "a".repeat(501),
      };
      const result = cancelarVentaSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // crearYPagarVentaSchema
  // ============================================
  describe("crearYPagarVentaSchema", () => {
    const validData = {
      slot_id: generateUUID(),
      producto_id: generateUUID(),
      payment_id: generateUUID(),
      cantidad: 2,
    };

    it("should validate correct crear y pagar data", () => {
      const result = crearYPagarVentaSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept optional user_id and metadata", () => {
      const data = {
        ...validData,
        user_id: generateUUID(),
        metadata: { source: "mobile_checkout" },
      };
      const result = crearYPagarVentaSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept optional tiempo_expiracion_minutos", () => {
      const data = {
        ...validData,
        tiempo_expiracion_minutos: 30,
      };
      const result = crearYPagarVentaSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should default cantidad to 1", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { cantidad, ...data } = validData;
      const result = crearYPagarVentaSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cantidad).toBe(1);
      }
    });

    it("should have tiempo_expiracion_minutos as optional", () => {
      const result = crearYPagarVentaSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tiempo_expiracion_minutos).toBeUndefined();
      }
    });

    it("should reject missing slot_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { slot_id, ...data } = validData;
      const result = crearYPagarVentaSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing producto_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { producto_id, ...data } = validData;
      const result = crearYPagarVentaSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing payment_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { payment_id, ...data } = validData;
      const result = crearYPagarVentaSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject cantidad out of range", () => {
      const data1 = { ...validData, cantidad: 0 };
      const data2 = { ...validData, cantidad: 101 };

      expect(crearYPagarVentaSchema.safeParse(data1).success).toBe(false);
      expect(crearYPagarVentaSchema.safeParse(data2).success).toBe(false);
    });
  });

  // ============================================
  // queryVentasSchema
  // ============================================
  describe("queryVentasSchema", () => {
    it("should validate empty query", () => {
      const result = queryVentasSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should default page to 1 and limit to 20", () => {
      const result = queryVentasSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should accept valid pagination", () => {
      const data = { page: 2, limit: 20 };
      const result = queryVentasSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept string page and limit and coerce to number", () => {
      const data = { page: "3", limit: "15" };
      const result = queryVentasSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(15);
      }
    });

    it("should accept valid filters", () => {
      const data = {
        user_id: generateUUID(),
        slot_id: generateUUID(),
        producto_id: generateUUID(),
        estado: "pagado",
        fecha_desde: "2025-10-01T00:00:00Z",
        fecha_hasta: "2025-10-31T23:59:59Z",
        precio_min: 100,
        precio_max: 5000,
      };
      const result = queryVentasSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept valid estado values", () => {
      const estados = [
        "borrador",
        "reservado",
        "pagado",
        "completado",
        "cancelado",
        "expirado",
      ];

      estados.forEach((estado) => {
        const data = { estado };
        const result = queryVentasSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid estado", () => {
      const data = { estado: "invalid_estado" };
      const result = queryVentasSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid sort options", () => {
      const sortOptions = [
        { sort_by: "fecha_creacion", sort_order: "asc" },
        { sort_by: "fecha_pago", sort_order: "desc" },
        { sort_by: "precio_total", sort_order: "asc" },
      ];

      sortOptions.forEach((sort) => {
        const result = queryVentasSchema.safeParse(sort);
        expect(result.success).toBe(true);
      });
    });

    it("should default sort_by to fecha_creacion and sort_order to desc", () => {
      const result = queryVentasSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sort_by).toBe("fecha_creacion");
        expect(result.data.sort_order).toBe("desc");
      }
    });

    it("should reject page less than 1", () => {
      const data = { page: 0 };
      const result = queryVentasSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject limit less than 1", () => {
      const data = { limit: 0 };
      const result = queryVentasSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject limit greater than 100", () => {
      const data = { limit: 101 };
      const result = queryVentasSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should coerce string precio values to numbers", () => {
      const data = { precio_min: "100", precio_max: "5000" };
      const result = queryVentasSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.precio_min).toBe(100);
        expect(result.data.precio_max).toBe(5000);
      }
    });
  });

  // ============================================
  // getVentasActivasSchema
  // ============================================
  describe("getVentasActivasSchema", () => {
    it("should validate correct user_id", () => {
      const data = { user_id: generateUUID() };
      const result = getVentasActivasSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing user_id", () => {
      const result = getVentasActivasSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should reject invalid user_id UUID", () => {
      const data = { user_id: "not-a-uuid" };
      const result = getVentasActivasSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // getVentasPorExpirarSchema
  // ============================================
  describe("getVentasPorExpirarSchema", () => {
    it("should validate with default minutos", () => {
      const result = getVentasPorExpirarSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.minutos).toBe(10);
      }
    });

    it("should accept valid minutos", () => {
      const data = { minutos: 30 };
      const result = getVentasPorExpirarSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should coerce string minutos to number", () => {
      const data = { minutos: "15" };
      const result = getVentasPorExpirarSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.minutos).toBe(15);
      }
    });

    it("should reject minutos less than 1", () => {
      const data = { minutos: 0 };
      const result = getVentasPorExpirarSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject minutos greater than 1440", () => {
      const data = { minutos: 1441 };
      const result = getVentasPorExpirarSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
