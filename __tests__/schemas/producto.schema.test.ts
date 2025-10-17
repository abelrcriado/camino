/**
 * Tests para producto.schema.ts
 * Cobertura completa de validación Zod
 */

import {
  createProductoSchema,
  updateProductoSchema,
  deleteProductoSchema,
  queryProductoSchema,
  UnidadMedidaEnum,
} from "@/api/schemas/producto.schema";
import { generateUUID } from "../helpers/factories";

describe("Producto Schemas", () => {
  describe("createProductoSchema", () => {
    it("debe validar datos completos correctamente", () => {
      const validData = {
        sku: "COCA-COLA-500ML",
        nombre: "Coca-Cola 500ml",
        descripcion: "Bebida gaseosa",
        category_id: generateUUID(),
        costo_base: 80,
        precio_venta: 150,
        tasa_iva: 21.0,
        unidad_medida: "unidad" as const,
        peso_gramos: 500,
        codigo_barras: "1234567890123",
        is_active: true,
      };

      const result = createProductoSchema.parse(validData);
      expect(result).toMatchObject(validData);
    });

    it("debe aplicar defaults correctamente", () => {
      const minimalData = {
        sku: "TEST-SKU-001",
        nombre: "Producto Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
      };

      const result = createProductoSchema.parse(minimalData);
      expect(result.tasa_iva).toBe(21.0);
      expect(result.unidad_medida).toBe("unidad");
      expect(result.is_active).toBe(true);
      expect(result.requiere_refrigeracion).toBe(false);
      expect(result.perecedero).toBe(false);
      expect(result.especificaciones).toEqual({});
    });

    it("debe rechazar SKU inválido (minúsculas)", () => {
      const invalidData = {
        sku: "coca-cola-500ml", // Minúsculas no permitidas
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
      };

      expect(() => createProductoSchema.parse(invalidData)).toThrow();
    });

    it("debe rechazar SKU con espacios", () => {
      const invalidData = {
        sku: "COCA COLA 500ML",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
      };

      expect(() => createProductoSchema.parse(invalidData)).toThrow();
    });

    it("debe rechazar nombre muy corto", () => {
      const invalidData = {
        sku: "TEST-001",
        nombre: "T", // Solo 1 carácter
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
      };

      expect(() => createProductoSchema.parse(invalidData)).toThrow();
    });

    it("debe rechazar category_id inválido", () => {
      const invalidData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: "invalid-uuid",
        costo_base: 100,
        precio_venta: 200,
      };

      expect(() => createProductoSchema.parse(invalidData)).toThrow();
    });

    it("debe rechazar precio_venta menor que costo_base", () => {
      const invalidData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 200,
        precio_venta: 100, // Menor que costo_base
      };

      expect(() => createProductoSchema.parse(invalidData)).toThrow(
        /mayor al costo base/
      );
    });

    it("debe rechazar precio_venta igual a costo_base", () => {
      const invalidData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 150,
        precio_venta: 150, // Igual a costo_base
      };

      expect(() => createProductoSchema.parse(invalidData)).toThrow();
    });

    it("debe rechazar tasa_iva negativa", () => {
      const invalidData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
        tasa_iva: -5,
      };

      expect(() => createProductoSchema.parse(invalidData)).toThrow();
    });

    it("debe rechazar tasa_iva mayor a 100", () => {
      const invalidData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
        tasa_iva: 150,
      };

      expect(() => createProductoSchema.parse(invalidData)).toThrow();
    });

    it("debe validar unidad_medida enum", () => {
      const validData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
        unidad_medida: "kilogramo" as const,
      };

      const result = createProductoSchema.parse(validData);
      expect(result.unidad_medida).toBe("kilogramo");
    });

    it("debe rechazar unidad_medida inválida", () => {
      const invalidData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        unidad_medida: "tonelada" as any, // No existe en enum
      };

      expect(() => createProductoSchema.parse(invalidData)).toThrow();
    });

    it("debe validar dimensiones correctamente", () => {
      const validData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
        dimensiones: {
          largo: 10.5,
          ancho: 5.2,
          alto: 20.0,
          unidad: "cm" as const,
        },
      };

      const result = createProductoSchema.parse(validData);
      expect(result.dimensiones).toEqual(validData.dimensiones);
    });

    it("debe aplicar default 'cm' a dimensiones.unidad", () => {
      const validData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
        dimensiones: {
          largo: 10,
          ancho: 5,
          alto: 3,
        },
      };

      const result = createProductoSchema.parse(validData);
      expect(result.dimensiones?.unidad).toBe("cm");
    });

    it("debe rechazar peso_gramos negativo", () => {
      const invalidData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
        peso_gramos: -100,
      };

      expect(() => createProductoSchema.parse(invalidData)).toThrow();
    });

    it("debe rechazar producto perecedero sin caducidad", () => {
      const invalidData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
        perecedero: true,
        // Falta meses_caducidad o dias_caducidad
      };

      expect(() => createProductoSchema.parse(invalidData)).toThrow(
        /debe tener meses_caducidad o dias_caducidad/
      );
    });

    it("debe aceptar producto perecedero con meses_caducidad", () => {
      const validData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
        perecedero: true,
        meses_caducidad: 6,
      };

      const result = createProductoSchema.parse(validData);
      expect(result.perecedero).toBe(true);
      expect(result.meses_caducidad).toBe(6);
    });

    it("debe aceptar producto perecedero con dias_caducidad", () => {
      const validData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
        perecedero: true,
        dias_caducidad: 30,
      };

      const result = createProductoSchema.parse(validData);
      expect(result.perecedero).toBe(true);
      expect(result.dias_caducidad).toBe(30);
    });

    it("debe validar URLs de proveedor", () => {
      const validData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
        proveedor_url: "https://proveedor.com",
      };

      const result = createProductoSchema.parse(validData);
      expect(result.proveedor_url).toBe("https://proveedor.com");
    });

    it("debe rechazar URLs de proveedor inválidas", () => {
      const invalidData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
        proveedor_url: "not-a-url",
      };

      expect(() => createProductoSchema.parse(invalidData)).toThrow();
    });

    it("debe validar array de imagenes con URLs", () => {
      const validData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
        imagenes: [
          "https://example.com/img1.jpg",
          "https://example.com/img2.jpg",
        ],
      };

      const result = createProductoSchema.parse(validData);
      expect(result.imagenes).toEqual(validData.imagenes);
    });

    it("debe rechazar imagenes con URLs inválidas", () => {
      const invalidData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
        imagenes: ["not-a-url", "https://example.com/img2.jpg"],
      };

      expect(() => createProductoSchema.parse(invalidData)).toThrow();
    });

    it("debe validar tags como array de strings", () => {
      const validData = {
        sku: "TEST-001",
        nombre: "Test",
        category_id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
        tags: ["bebida", "gaseosa", "cola"],
      };

      const result = createProductoSchema.parse(validData);
      expect(result.tags).toEqual(["bebida", "gaseosa", "cola"]);
    });
  });

  describe("updateProductoSchema", () => {
    it("debe validar actualización completa", () => {
      const validData = {
        id: generateUUID(),
        nombre: "Nombre Actualizado",
        precio_venta: 250,
        is_active: false,
      };

      const result = updateProductoSchema.parse(validData);
      expect(result).toMatchObject(validData);
    });

    it("debe rechazar actualización sin id", () => {
      const invalidData = {
        nombre: "Test",
      };

      expect(() => updateProductoSchema.parse(invalidData)).toThrow();
    });

    it("debe rechazar actualización solo con id (sin campos)", () => {
      const invalidData = {
        id: generateUUID(),
      };

      expect(() => updateProductoSchema.parse(invalidData)).toThrow(
        /al menos un campo para actualizar/
      );
    });

    it("debe validar actualización parcial con un campo", () => {
      const validData = {
        id: generateUUID(),
        nombre: "Nuevo Nombre",
      };

      const result = updateProductoSchema.parse(validData);
      expect(result.nombre).toBe("Nuevo Nombre");
    });

    it("debe validar precios en actualización", () => {
      const validData = {
        id: generateUUID(),
        costo_base: 100,
        precio_venta: 200,
      };

      const result = updateProductoSchema.parse(validData);
      expect(result.precio_venta).toBe(200);
    });

    it("debe rechazar precio_venta menor que costo_base en actualización", () => {
      const invalidData = {
        id: generateUUID(),
        costo_base: 200,
        precio_venta: 100,
      };

      expect(() => updateProductoSchema.parse(invalidData)).toThrow(
        /mayor al costo base/
      );
    });

    it("debe permitir actualizar solo precio_venta", () => {
      const validData = {
        id: generateUUID(),
        precio_venta: 300,
      };

      const result = updateProductoSchema.parse(validData);
      expect(result.precio_venta).toBe(300);
    });

    it("debe permitir actualizar solo costo_base", () => {
      const validData = {
        id: generateUUID(),
        costo_base: 150,
      };

      const result = updateProductoSchema.parse(validData);
      expect(result.costo_base).toBe(150);
    });
  });

  describe("deleteProductoSchema", () => {
    it("debe validar id correcto", () => {
      const validData = {
        id: generateUUID(),
      };

      const result = deleteProductoSchema.parse(validData);
      expect(result.id).toBe(validData.id);
    });

    it("debe rechazar id inválido", () => {
      const invalidData = {
        id: "not-a-uuid",
      };

      expect(() => deleteProductoSchema.parse(invalidData)).toThrow();
    });

    it("debe rechazar sin id", () => {
      const invalidData = {};

      expect(() => deleteProductoSchema.parse(invalidData)).toThrow();
    });
  });

  describe("queryProductoSchema", () => {
    it("debe aplicar defaults de paginación", () => {
      const result = queryProductoSchema.parse({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
      expect(result.sort_by).toBe("created_at");
      expect(result.sort_order).toBe("desc");
    });

    it("debe transformar strings a números en paginación", () => {
      const result = queryProductoSchema.parse({
        page: "3",
        limit: "100",
      });

      expect(result.page).toBe(3);
      expect(result.limit).toBe(100);
    });

    it("debe transformar is_active string a boolean", () => {
      const result1 = queryProductoSchema.parse({ is_active: "true" });
      expect(result1.is_active).toBe(true);

      const result2 = queryProductoSchema.parse({ is_active: "false" });
      expect(result2.is_active).toBe(false);
    });

    it("debe transformar perecedero string a boolean", () => {
      const result = queryProductoSchema.parse({ perecedero: "true" });
      expect(result.perecedero).toBe(true);
    });

    it("debe transformar precio_min/max strings a números", () => {
      const result = queryProductoSchema.parse({
        precio_min: "100",
        precio_max: "500",
      });

      expect(result.precio_min).toBe(100);
      expect(result.precio_max).toBe(500);
    });

    it("debe validar sort_by enum", () => {
      const result = queryProductoSchema.parse({ sort_by: "nombre" });
      expect(result.sort_by).toBe("nombre");
    });

    it("debe rechazar sort_by inválido", () => {
      expect(() =>
        queryProductoSchema.parse({ sort_by: "invalid_field" })
      ).toThrow();
    });

    it("debe validar sort_order enum", () => {
      const result1 = queryProductoSchema.parse({ sort_order: "asc" });
      expect(result1.sort_order).toBe("asc");

      const result2 = queryProductoSchema.parse({ sort_order: "desc" });
      expect(result2.sort_order).toBe("desc");
    });

    it("debe permitir filtros opcionales", () => {
      const result = queryProductoSchema.parse({
        sku: "TEST-001",
        nombre: "Coca",
        category_id: generateUUID(),
        marca: "Coca-Cola",
        search: "bebida",
      });

      expect(result.sku).toBe("TEST-001");
      expect(result.nombre).toBe("Coca");
      expect(result.marca).toBe("Coca-Cola");
      expect(result.search).toBe("bebida");
    });

    it("debe validar query completo", () => {
      const result = queryProductoSchema.parse({
        sku: "TEST-001",
        is_active: "true",
        page: "2",
        limit: "25",
        sort_by: "precio_venta",
        sort_order: "asc",
      });

      expect(result).toMatchObject({
        sku: "TEST-001",
        is_active: true,
        page: 2,
        limit: 25,
        sort_by: "precio_venta",
        sort_order: "asc",
      });
    });
  });

  describe("UnidadMedidaEnum", () => {
    it("debe contener todos los valores esperados", () => {
      const valores = UnidadMedidaEnum.options;
      expect(valores).toContain("unidad");
      expect(valores).toContain("paquete");
      expect(valores).toContain("caja");
      expect(valores).toContain("litro");
      expect(valores).toContain("kilogramo");
      expect(valores).toContain("gramo");
      expect(valores.length).toBe(12);
    });
  });
});
