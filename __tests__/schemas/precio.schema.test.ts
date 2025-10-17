import {
  createPrecioSchema,
  updatePrecioSchema,
  deletePrecioSchema,
  queryPreciosSchema,
  getPrecioAplicableSchema,
  queryPreciosVigentesSchema,
  precioResueltoSchema,
  precioEntitySchema,
} from "@/api/schemas/precio.schema";
import { NivelPrecio, EntidadTipo } from "@/shared/dto/precio.dto";
import { generateUUID } from "../helpers/factories";

describe("Precio Schemas", () => {
  // ===== CREATE PRECIO SCHEMA =====
  describe("createPrecioSchema", () => {
    const validUUID = generateUUID();
    const validUUID2 = generateUUID();
    const validUUID3 = generateUUID();

    describe("Nivel BASE - validaciones", () => {
      it("debería validar precio BASE correcto", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 250,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("debería rechazar BASE con ubicacion_id", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 250,
          ubicacion_id: validUUID2,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            "no puede tener ubicacion_id ni service_point_id"
          );
        }
      });

      it("debería rechazar BASE con service_point_id", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 250,
          service_point_id: validUUID2,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            "no puede tener ubicacion_id ni service_point_id"
          );
        }
      });
    });

    describe("Nivel UBICACION - validaciones", () => {
      it("debería validar precio UBICACION correcto", () => {
        const data = {
          nivel: "ubicacion" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 300,
          ubicacion_id: validUUID2,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("debería rechazar UBICACION sin ubicacion_id", () => {
        const data = {
          nivel: "ubicacion" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 300,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            "UBICACION requiere ubicacion_id y NO debe tener service_point_id"
          );
        }
      });

      it("debería rechazar UBICACION con service_point_id", () => {
        const data = {
          nivel: "ubicacion" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 300,
          ubicacion_id: validUUID2,
          service_point_id: validUUID3,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            "UBICACION requiere ubicacion_id y NO debe tener service_point_id"
          );
        }
      });
    });

    describe("Nivel SERVICE_POINT - validaciones", () => {
      it("debería validar precio SERVICE_POINT correcto", () => {
        const data = {
          nivel: "service_point" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 350,
          ubicacion_id: validUUID2,
          service_point_id: validUUID3,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("debería rechazar SERVICE_POINT sin ubicacion_id", () => {
        const data = {
          nivel: "service_point" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 350,
          service_point_id: validUUID3,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            "SERVICE_POINT requiere tanto ubicacion_id como service_point_id"
          );
        }
      });

      it("debería rechazar SERVICE_POINT sin service_point_id", () => {
        const data = {
          nivel: "service_point" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 350,
          ubicacion_id: validUUID2,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            "SERVICE_POINT requiere tanto ubicacion_id como service_point_id"
          );
        }
      });
    });

    describe("Validaciones de precio", () => {
      it("debería rechazar precio negativo", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: -100,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("mayor que 0");
        }
      });

      it("debería rechazar precio cero", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 0,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("mayor que 0");
        }
      });

      it("debería rechazar precio decimal", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 2.5,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("entero");
        }
      });

      it("debería rechazar precio mayor a límite", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 1000000000,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("demasiado alto");
        }
      });

      it("debería aceptar precio en límite superior", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 999999998,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe("Validaciones de fechas", () => {
      it("debería validar fecha_inicio ISO 8601", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 250,
          fecha_inicio: "2025-01-01",
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("debería rechazar fecha_inicio inválida", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 250,
          fecha_inicio: "01/01/2025",
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("debería validar fecha_fin posterior a fecha_inicio", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 250,
          fecha_inicio: "2025-01-01",
          fecha_fin: "2025-12-31",
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("debería rechazar fecha_fin anterior a fecha_inicio", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 250,
          fecha_inicio: "2025-12-31",
          fecha_fin: "2025-01-01",
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            "fecha_fin debe ser posterior a fecha_inicio"
          );
        }
      });

      it("debería rechazar fecha_fin igual a fecha_inicio", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 250,
          fecha_inicio: "2025-06-15",
          fecha_fin: "2025-06-15",
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(
            "fecha_fin debe ser posterior a fecha_inicio"
          );
        }
      });
    });

    describe("Validaciones de UUIDs", () => {
      it("debería rechazar entidad_id inválido", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: "not-a-uuid",
          precio: 250,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("UUID");
        }
      });

      it("debería rechazar ubicacion_id inválido", () => {
        const data = {
          nivel: "ubicacion" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 300,
          ubicacion_id: "invalid-uuid",
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("debería rechazar service_point_id inválido", () => {
        const data = {
          nivel: "service_point" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 350,
          ubicacion_id: validUUID2,
          service_point_id: "bad-id",
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });

    describe("Validaciones de enums", () => {
      it("debería rechazar nivel inválido", () => {
        const data = {
          nivel: "invalid_nivel",
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 250,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("debería rechazar entidad_tipo inválido", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "invalid_type",
          entidad_id: validUUID,
          precio: 250,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
      });

      it("debería aceptar entidad_tipo servicio", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "servicio" as EntidadTipo,
          entidad_id: validUUID,
          precio: 500,
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    describe("Validaciones de notas", () => {
      it("debería aceptar notas válidas", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 250,
          notas: "Precio base de 2.50€",
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(true);
      });

      it("debería rechazar notas muy largas", () => {
        const data = {
          nivel: "base" as NivelPrecio,
          entidad_tipo: "producto" as EntidadTipo,
          entidad_id: validUUID,
          precio: 250,
          notas: "a".repeat(1001),
        };
        const result = createPrecioSchema.safeParse(data);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("1000");
        }
      });
    });
  });

  // ===== UPDATE PRECIO SCHEMA =====
  describe("updatePrecioSchema", () => {
    const validUUID = "550e8400-e29b-41d4-a716-446655440000";

    it("debería validar actualización de precio", () => {
      const data = {
        id: validUUID,
        precio: 275,
      };
      const result = updatePrecioSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("debería validar actualización de fechas", () => {
      const data = {
        id: validUUID,
        fecha_inicio: "2025-02-01",
        fecha_fin: "2025-12-31",
      };
      const result = updatePrecioSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("debería validar actualización de notas", () => {
      const data = {
        id: validUUID,
        notas: "Precio actualizado",
      };
      const result = updatePrecioSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("debería rechazar actualización sin id", () => {
      const data = {
        precio: 275,
      };
      const result = updatePrecioSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("debería rechazar id inválido", () => {
      const data = {
        id: "not-a-uuid",
        precio: 275,
      };
      const result = updatePrecioSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("debería rechazar actualización sin campos", () => {
      const data = {
        id: validUUID,
      };
      const result = updatePrecioSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("al menos un campo");
      }
    });

    it("debería rechazar fecha_fin anterior a fecha_inicio", () => {
      const data = {
        id: validUUID,
        fecha_inicio: "2025-12-31",
        fecha_fin: "2025-01-01",
      };
      const result = updatePrecioSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          "fecha_fin debe ser posterior a fecha_inicio"
        );
      }
    });

    it("debería validar actualización múltiple", () => {
      const data = {
        id: validUUID,
        precio: 300,
        fecha_fin: "2025-12-31",
        notas: "Actualización completa",
      };
      const result = updatePrecioSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  // ===== DELETE PRECIO SCHEMA =====
  describe("deletePrecioSchema", () => {
    const validUUID = "550e8400-e29b-41d4-a716-446655440000";

    it("debería validar id correcto", () => {
      const result = deletePrecioSchema.safeParse({ id: validUUID });
      expect(result.success).toBe(true);
    });

    it("debería rechazar id inválido", () => {
      const result = deletePrecioSchema.safeParse({ id: "not-a-uuid" });
      expect(result.success).toBe(false);
    });

    it("debería rechazar sin id", () => {
      const result = deletePrecioSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ===== QUERY PRECIOS SCHEMA =====
  describe("queryPreciosSchema", () => {
    const validUUID = "550e8400-e29b-41d4-a716-446655440000";

    it("debería validar query vacío con defaults", () => {
      const result = queryPreciosSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("debería validar filtro por nivel", () => {
      const result = queryPreciosSchema.safeParse({ nivel: "base" });
      expect(result.success).toBe(true);
    });

    it("debería validar filtro por entidad", () => {
      const result = queryPreciosSchema.safeParse({
        entidad_tipo: "producto",
        entidad_id: validUUID,
      });
      expect(result.success).toBe(true);
    });

    it("debería validar filtro vigente", () => {
      const result = queryPreciosSchema.safeParse({ vigente: "true" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.vigente).toBe(true);
      }
    });

    it("debería validar filtro por fecha", () => {
      const result = queryPreciosSchema.safeParse({ fecha: "2025-10-11" });
      expect(result.success).toBe(true);
    });

    it("debería validar paginación custom", () => {
      const result = queryPreciosSchema.safeParse({ page: "2", limit: "50" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });

    it("debería rechazar limit mayor a 100", () => {
      const result = queryPreciosSchema.safeParse({ limit: 150 });
      expect(result.success).toBe(false);
    });

    it("debería rechazar page negativa", () => {
      const result = queryPreciosSchema.safeParse({ page: -1 });
      expect(result.success).toBe(false);
    });

    it("debería validar ordenamiento", () => {
      const result = queryPreciosSchema.safeParse({
        order_by: "precio",
        order_direction: "asc",
      });
      expect(result.success).toBe(true);
    });

    it("debería rechazar order_by inválido", () => {
      const result = queryPreciosSchema.safeParse({ order_by: "invalid" });
      expect(result.success).toBe(false);
    });
  });

  // ===== GET PRECIO APLICABLE SCHEMA =====
  describe("getPrecioAplicableSchema", () => {
    const validUUID = "550e8400-e29b-41d4-a716-446655440000";
    const validUUID2 = "650e8400-e29b-41d4-a716-446655440001";
    const validUUID3 = "750e8400-e29b-41d4-a716-446655440002";

    it("debería validar consulta BASE", () => {
      const result = getPrecioAplicableSchema.safeParse({
        entidad_tipo: "producto",
        entidad_id: validUUID,
      });
      expect(result.success).toBe(true);
    });

    it("debería validar consulta UBICACION", () => {
      const result = getPrecioAplicableSchema.safeParse({
        entidad_tipo: "producto",
        entidad_id: validUUID,
        ubicacion_id: validUUID2,
      });
      expect(result.success).toBe(true);
    });

    it("debería validar consulta SERVICE_POINT", () => {
      const result = getPrecioAplicableSchema.safeParse({
        entidad_tipo: "producto",
        entidad_id: validUUID,
        ubicacion_id: validUUID2,
        service_point_id: validUUID3,
      });
      expect(result.success).toBe(true);
    });

    it("debería validar con fecha específica", () => {
      const result = getPrecioAplicableSchema.safeParse({
        entidad_tipo: "producto",
        entidad_id: validUUID,
        fecha: "2025-10-11",
      });
      expect(result.success).toBe(true);
    });

    it("debería rechazar sin entidad_tipo", () => {
      const result = getPrecioAplicableSchema.safeParse({
        entidad_id: validUUID,
      });
      expect(result.success).toBe(false);
    });

    it("debería rechazar sin entidad_id", () => {
      const result = getPrecioAplicableSchema.safeParse({
        entidad_tipo: "producto",
      });
      expect(result.success).toBe(false);
    });
  });

  // ===== QUERY PRECIOS VIGENTES SCHEMA =====
  describe("queryPreciosVigentesSchema", () => {
    const validUUID = "550e8400-e29b-41d4-a716-446655440000";

    it("debería validar query vacío", () => {
      const result = queryPreciosVigentesSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("debería validar filtros específicos", () => {
      const result = queryPreciosVigentesSchema.safeParse({
        nivel: "base",
        entidad_tipo: "producto",
        ubicacion_id: validUUID,
      });
      expect(result.success).toBe(true);
    });

    it("debería validar ordenamiento por dias_restantes", () => {
      const result = queryPreciosVigentesSchema.safeParse({
        order_by: "dias_restantes",
        order_direction: "asc",
      });
      expect(result.success).toBe(true);
    });

    it("debería validar paginación", () => {
      const result = queryPreciosVigentesSchema.safeParse({
        page: "3",
        limit: "30",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(30);
      }
    });
  });

  // ===== PRECIO RESUELTO SCHEMA =====
  describe("precioResueltoSchema", () => {
    const validUUID = "550e8400-e29b-41d4-a716-446655440000";

    it("debería validar precio resuelto BASE", () => {
      const data = {
        precio_id: validUUID,
        precio: 250,
        precio_euros: 2.5,
        nivel: "base" as NivelPrecio,
        fecha_inicio: "2025-01-01",
        activo_hoy: true,
      };
      const result = precioResueltoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("debería validar precio resuelto con todos los campos", () => {
      const data = {
        precio_id: validUUID,
        precio: 350,
        precio_euros: 3.5,
        nivel: "service_point" as NivelPrecio,
        ubicacion_id: validUUID,
        service_point_id: validUUID,
        fecha_inicio: "2025-01-01",
        fecha_fin: "2025-12-31",
        ubicacion_nombre: "Madrid",
        service_point_nombre: "SP001",
        dias_restantes: 60,
        activo_hoy: true,
      };
      const result = precioResueltoSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("debería rechazar precio resuelto sin campos requeridos", () => {
      const data = {
        precio: 250,
      };
      const result = precioResueltoSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ===== PRECIO ENTITY SCHEMA =====
  describe("precioEntitySchema", () => {
    const validUUID = "550e8400-e29b-41d4-a716-446655440000";
    const validUUID2 = "650e8400-e29b-41d4-a716-446655440001";

    it("debería validar entidad producto completa", () => {
      const result = precioEntitySchema.safeParse({
        id: validUUID,
        nivel: "base",
        entidad_tipo: "producto",
        entidad_id: validUUID2,
        precio: 250,
        fecha_inicio: "2025-01-01",
      });
      expect(result.success).toBe(true);
    });

    it("debería validar entidad servicio completa", () => {
      const result = precioEntitySchema.safeParse({
        id: validUUID,
        nivel: "base",
        entidad_tipo: "servicio",
        entidad_id: validUUID2,
        precio: 500,
        fecha_inicio: "2025-01-01",
      });
      expect(result.success).toBe(true);
    });

    it("debería rechazar entidad sin id", () => {
      const result = precioEntitySchema.safeParse({
        nivel: "base",
        entidad_tipo: "producto",
        entidad_id: validUUID2,
        precio: 250,
        fecha_inicio: "2025-01-01",
      });
      expect(result.success).toBe(false);
    });

    it("debería rechazar entidad inválida", () => {
      const result = precioEntitySchema.safeParse({
        id: validUUID,
        nivel: "base",
        entidad_tipo: "invalid",
        entidad_id: validUUID2,
        precio: 250,
        fecha_inicio: "2025-01-01",
      });
      expect(result.success).toBe(false);
    });

    it("debería rechazar sin entidad_tipo", () => {
      const result = precioEntitySchema.safeParse({
        id: validUUID,
        nivel: "base",
        entidad_id: validUUID2,
        precio: 250,
        fecha_inicio: "2025-01-01",
      });
      expect(result.success).toBe(false);
    });
  });
});
