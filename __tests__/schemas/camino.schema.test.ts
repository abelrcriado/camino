/**
 * Tests para camino.schema.ts
 * Valida schemas Zod para operaciones CRUD de caminos
 */

import {
  createCaminoSchema,
  updateCaminoSchema,
  deleteCaminoSchema,
  queryCaminoSchema,
} from "@/api/schemas/camino.schema";
import { generateUUID } from "../helpers/factories";

describe("Camino Schemas", () => {
  describe("createCaminoSchema", () => {
    const validData = {
      nombre: "Camino de Santiago Francés",
      codigo: "CSF",
    };

    it("should validate correct camino data", () => {
      const result = createCaminoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject missing nombre", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { nombre, ...data } = validData;
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject nombre too short", () => {
      const data = { ...validData, nombre: "AB" };
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject nombre too long", () => {
      const data = { ...validData, nombre: "A".repeat(151) };
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept nombre with 3 characters", () => {
      const data = { ...validData, nombre: "ABC" };
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept nombre with 150 characters", () => {
      const data = { ...validData, nombre: "A".repeat(150) };
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing codigo", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { codigo, ...data } = validData;
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject codigo too short", () => {
      const data = { ...validData, codigo: "A" };
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject codigo too long", () => {
      const data = { ...validData, codigo: "A".repeat(11) };
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject codigo with invalid characters", () => {
      const invalidCodigos = ["cs f", "cs@f", "cs.f", "cs/f", "csñ"];
      invalidCodigos.forEach((codigo) => {
        const data = { ...validData, codigo };
        const result = createCaminoSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    it("should accept valid codigo formats", () => {
      const validCodigos = ["CSF", "CN", "CP-01", "VDP_2024", "C123"];
      validCodigos.forEach((codigo) => {
        const data = { ...validData, codigo };
        const result = createCaminoSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should accept optional zona_operativa", () => {
      const data = { ...validData, zona_operativa: "Norte de España" };
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject zona_operativa too long", () => {
      const data = { ...validData, zona_operativa: "A".repeat(101) };
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept optional region", () => {
      const data = { ...validData, region: "Galicia, Castilla y León" };
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject region too long", () => {
      const data = { ...validData, region: "A".repeat(101) };
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept all valid estado_operativo values", () => {
      const estados = ["activo", "inactivo", "mantenimiento", "planificado"];
      estados.forEach((estado_operativo) => {
        const data = { ...validData, estado_operativo };
        const result = createCaminoSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid estado_operativo", () => {
      const data = { ...validData, estado_operativo: "suspendido" };
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should default estado_operativo to activo", () => {
      const result = createCaminoSchema.safeParse(validData);
      if (result.success) {
        expect(result.data.estado_operativo).toBe("activo");
      }
    });

    it("should accept optional descripcion", () => {
      const data = {
        ...validData,
        descripcion:
          "El Camino Francés es la ruta más popular del Camino de Santiago",
      };
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept descripcion with max length", () => {
      const data = { ...validData, descripcion: "A".repeat(500) };
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject extra fields", () => {
      const data = { ...validData, extra_field: "value" };
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept complete valid camino data", () => {
      const data = {
        nombre: "Camino de Santiago Francés",
        codigo: "CSF",
        zona_operativa: "Norte de España",
        region: "Galicia, Castilla y León, La Rioja, Navarra",
        estado_operativo: "activo",
        descripcion:
          "El Camino Francés es la ruta jacobea más transitada y emblemática",
      };
      const result = createCaminoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("updateCaminoSchema", () => {
    const validData = {
      id: generateUUID(),
      nombre: "Camino actualizado",
    };

    it("should reject update data with only id (requires at least one field)", () => {
      const data = { id: generateUUID() };
      const result = updateCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should validate correct update data with id and nombre", () => {
      const result = updateCaminoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should require id field", () => {
      const data = { nombre: "Nuevo nombre" };
      const result = updateCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid id UUID", () => {
      const data = { ...validData, id: "invalid-uuid" };
      const result = updateCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept optional nombre", () => {
      const data = { ...validData, nombre: "Camino del Norte" };
      const result = updateCaminoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept optional codigo", () => {
      const data = { ...validData, codigo: "CN" };
      const result = updateCaminoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate nombre length constraints", () => {
      const tooShort = { ...validData, nombre: "AB" };
      const tooLong = { ...validData, nombre: "A".repeat(151) };

      expect(updateCaminoSchema.safeParse(tooShort).success).toBe(false);
      expect(updateCaminoSchema.safeParse(tooLong).success).toBe(false);
    });

    it("should validate codigo pattern and length", () => {
      const invalid = { ...validData, codigo: "cs f" };
      const tooLong = { ...validData, codigo: "A".repeat(11) };

      expect(updateCaminoSchema.safeParse(invalid).success).toBe(false);
      expect(updateCaminoSchema.safeParse(tooLong).success).toBe(false);
    });

    it("should accept all optional fields", () => {
      const data = {
        id: generateUUID(),
        nombre: "Camino Portugués",
        codigo: "CP",
        zona_operativa: "Noroeste",
        region: "Galicia, Portugal",
        estado_operativo: "mantenimiento" as const,
        descripcion: "Actualización del camino",
      };
      const result = updateCaminoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate estado_operativo enum", () => {
      const valid = { ...validData, estado_operativo: "inactivo" };
      const invalid = { ...validData, estado_operativo: "eliminado" };

      expect(updateCaminoSchema.safeParse(valid).success).toBe(true);
      expect(updateCaminoSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("deleteCaminoSchema", () => {
    it("should validate correct delete data", () => {
      const data = { id: generateUUID() };
      const result = deleteCaminoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject missing id", () => {
      const data = {};
      const result = deleteCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid id UUID", () => {
      const data = { id: "invalid-uuid" };
      const result = deleteCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject extra fields", () => {
      const data = {
        id: generateUUID(),
        extra: "field",
      };
      const result = deleteCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("queryCaminoSchema", () => {
    it("should validate empty query", () => {
      const result = queryCaminoSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it("should accept codigo filter", () => {
      const data = { codigo: "CSF" };
      const result = queryCaminoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate codigo pattern", () => {
      const valid = { codigo: "CSF-2024" };
      const invalid = { codigo: "cs f" };

      expect(queryCaminoSchema.safeParse(valid).success).toBe(true);
      expect(queryCaminoSchema.safeParse(invalid).success).toBe(false);
    });

    it("should accept estado_operativo filter", () => {
      const data = { estado_operativo: "activo" };
      const result = queryCaminoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate estado_operativo enum", () => {
      const valid = { estado_operativo: "planificado" };
      const invalid = { estado_operativo: "eliminado" };

      expect(queryCaminoSchema.safeParse(valid).success).toBe(true);
      expect(queryCaminoSchema.safeParse(invalid).success).toBe(false);
    });

    it("should accept region filter", () => {
      const data = { region: "Galicia" };
      const result = queryCaminoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept all filters together", () => {
      const data = {
        codigo: "CSF",
        estado_operativo: "activo",
        region: "Galicia",
      };
      const result = queryCaminoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid filter combinations", () => {
      const data = {
        codigo: "invalid codigo with spaces",
        estado_operativo: "eliminado",
      };
      const result = queryCaminoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
