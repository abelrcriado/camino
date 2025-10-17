import { describe, it, expect } from "@jest/globals";
import { generateUUID } from "../helpers/factories";
import {
  createInventorySchema,
  updateInventorySchema,
  deleteInventorySchema,
  queryInventorySchema,
  type CreateInventoryInput,
  type UpdateInventoryInput,
  type DeleteInventoryInput,
  type QueryInventoryInput,
} from "@/api/schemas/inventory.schema";

describe("Inventory Schema Validation", () => {
  const validUUID = generateUUID();

  describe("createInventorySchema", () => {
    const validInventoryData = {
      service_point_id: validUUID,
      name: "Cámaras de bicicleta",
      description: "Cámaras de repuesto para diferentes tamaños de ruedas.",
      quantity: 50,
      min_stock: 10,
    };

    describe("Validaciones exitosas", () => {
      it("debería validar datos mínimos requeridos", () => {
        const minimalData = {
          service_point_id: validUUID,
          name: "Item Mínimo",
          quantity: 1,
          min_stock: 0,
        };
        const result = createInventorySchema.safeParse(minimalData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.service_point_id).toBe(validUUID);
          expect(result.data.name).toBe("Item Mínimo");
          expect(result.data.quantity).toBe(1);
          expect(result.data.min_stock).toBe(0);
        }
      });

      it("debería validar datos completos con todos los campos opcionales", () => {
        const completeData = {
          ...validInventoryData,
          max_stock: 100,
        };
        const result = createInventorySchema.safeParse(completeData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe("Cámaras de bicicleta");
          expect(result.data.description).toBe(
            "Cámaras de repuesto para diferentes tamaños de ruedas."
          );
          expect(result.data.quantity).toBe(50);
          expect(result.data.min_stock).toBe(10);
          expect(result.data.max_stock).toBe(100);
        }
      });

      it("debería aceptar quantity como número no negativo", () => {
        const dataWithQuantity = { ...validInventoryData, quantity: 0 };
        const result = createInventorySchema.safeParse(dataWithQuantity);
        expect(result.success).toBe(true);
      });

      it("debería aceptar min_stock como número no negativo", () => {
        const dataWithMinStock = { ...validInventoryData, min_stock: 0 };
        const result = createInventorySchema.safeParse(dataWithMinStock);
        expect(result.success).toBe(true);
      });

      it("debería aceptar max_stock opcional", () => {
        const dataWithMaxStock = { ...validInventoryData, max_stock: 200 };
        const result = createInventorySchema.safeParse(dataWithMaxStock);
        expect(result.success).toBe(true);
      });

      it("debería aceptar description opcional", () => {
        const dataWithDescription = {
          ...validInventoryData,
          description: "Descripción detallada del inventario",
        };
        const result = createInventorySchema.safeParse(dataWithDescription);
        expect(result.success).toBe(true);
      });

      it("debería validar sin description opcional", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { description, ...dataWithoutDescription } = validInventoryData;
        const result = createInventorySchema.safeParse(dataWithoutDescription);
        expect(result.success).toBe(true);
      });
    });

    describe("Validaciones de campos requeridos", () => {
      it("debería fallar sin service_point_id", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { service_point_id, ...dataWithoutServicePoint } =
          validInventoryData;
        const result = createInventorySchema.safeParse(dataWithoutServicePoint);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("service_point_id");
        }
      });

      it("debería fallar sin name", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { name, ...dataWithoutName } = validInventoryData;
        const result = createInventorySchema.safeParse(dataWithoutName);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("name");
        }
      });

      it("debería fallar sin quantity", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { quantity, ...dataWithoutQuantity } = validInventoryData;
        const result = createInventorySchema.safeParse(dataWithoutQuantity);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("quantity");
        }
      });

      it("debería fallar sin min_stock", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { min_stock, ...dataWithoutMinStock } = validInventoryData;
        const result = createInventorySchema.safeParse(dataWithoutMinStock);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("min_stock");
        }
      });
    });

    describe("Validaciones de service_point_id", () => {
      it("debería fallar con UUID inválido", () => {
        const dataWithInvalidUUID = {
          ...validInventoryData,
          service_point_id: "invalid-uuid",
        };
        const result = createInventorySchema.safeParse(dataWithInvalidUUID);
        expect(result.success).toBe(false);
      });

      it("debería fallar con service_point_id vacío", () => {
        const dataWithEmptyUUID = {
          ...validInventoryData,
          service_point_id: "",
        };
        const result = createInventorySchema.safeParse(dataWithEmptyUUID);
        expect(result.success).toBe(false);
      });
    });

    describe("Validaciones de name", () => {
      it("debería fallar con name muy corto", () => {
        const dataWithShortName = { ...validInventoryData, name: "A" };
        const result = createInventorySchema.safeParse(dataWithShortName);
        expect(result.success).toBe(false);
      });

      it("debería fallar con name muy largo", () => {
        const longName = "A".repeat(101);
        const dataWithLongName = { ...validInventoryData, name: longName };
        const result = createInventorySchema.safeParse(dataWithLongName);
        expect(result.success).toBe(false);
      });

      it("debería aceptar name en el límite inferior (2 chars)", () => {
        const dataWithMinName = { ...validInventoryData, name: "AB" };
        const result = createInventorySchema.safeParse(dataWithMinName);
        expect(result.success).toBe(true);
      });

      it("debería aceptar name en el límite superior (100 chars)", () => {
        const maxName = "A".repeat(100);
        const dataWithMaxName = { ...validInventoryData, name: maxName };
        const result = createInventorySchema.safeParse(dataWithMaxName);
        expect(result.success).toBe(true);
      });

      it("debería fallar con name vacío", () => {
        const dataWithEmptyName = { ...validInventoryData, name: "" };
        const result = createInventorySchema.safeParse(dataWithEmptyName);
        expect(result.success).toBe(false);
      });
    });

    describe("Validaciones de quantity", () => {
      it("debería fallar con quantity negativo", () => {
        const dataWithNegativeQuantity = {
          ...validInventoryData,
          quantity: -1,
        };
        const result = createInventorySchema.safeParse(
          dataWithNegativeQuantity
        );
        expect(result.success).toBe(false);
      });

      it("debería fallar con quantity decimal", () => {
        const dataWithDecimalQuantity = {
          ...validInventoryData,
          quantity: 5.5,
        };
        const result = createInventorySchema.safeParse(dataWithDecimalQuantity);
        expect(result.success).toBe(false);
      });

      it("debería aceptar quantity cero", () => {
        const dataWithZeroQuantity = { ...validInventoryData, quantity: 0 };
        const result = createInventorySchema.safeParse(dataWithZeroQuantity);
        expect(result.success).toBe(true);
      });

      it("debería aceptar quantity grande", () => {
        const dataWithLargeQuantity = {
          ...validInventoryData,
          quantity: 999999,
        };
        const result = createInventorySchema.safeParse(dataWithLargeQuantity);
        expect(result.success).toBe(true);
      });
    });

    describe("Validaciones de min_stock", () => {
      it("debería fallar con min_stock negativo", () => {
        const dataWithNegativeMinStock = {
          ...validInventoryData,
          min_stock: -1,
        };
        const result = createInventorySchema.safeParse(
          dataWithNegativeMinStock
        );
        expect(result.success).toBe(false);
      });

      it("debería fallar con min_stock decimal", () => {
        const dataWithDecimalMinStock = {
          ...validInventoryData,
          min_stock: 5.5,
        };
        const result = createInventorySchema.safeParse(dataWithDecimalMinStock);
        expect(result.success).toBe(false);
      });

      it("debería aceptar min_stock cero", () => {
        const dataWithZeroMinStock = { ...validInventoryData, min_stock: 0 };
        const result = createInventorySchema.safeParse(dataWithZeroMinStock);
        expect(result.success).toBe(true);
      });
    });

    describe("Validaciones de max_stock", () => {
      it("debería fallar con max_stock negativo", () => {
        const dataWithNegativeMaxStock = {
          ...validInventoryData,
          max_stock: -1,
        };
        const result = createInventorySchema.safeParse(
          dataWithNegativeMaxStock
        );
        expect(result.success).toBe(false);
      });

      it("debería aceptar max_stock cero", () => {
        const dataWithZeroMaxStock = { ...validInventoryData, max_stock: 0 };
        const result = createInventorySchema.safeParse(dataWithZeroMaxStock);
        expect(result.success).toBe(true);
      });

      it("debería fallar con max_stock decimal", () => {
        const dataWithDecimalMaxStock = {
          ...validInventoryData,
          max_stock: 5.5,
        };
        const result = createInventorySchema.safeParse(dataWithDecimalMaxStock);
        expect(result.success).toBe(false);
      });

      it("debería aceptar max_stock positivo", () => {
        const dataWithPositiveMaxStock = {
          ...validInventoryData,
          max_stock: 100,
        };
        const result = createInventorySchema.safeParse(
          dataWithPositiveMaxStock
        );
        expect(result.success).toBe(true);
      });
    });

    describe("Validaciones de lógica de negocio", () => {
      it("debería aceptar min_stock menor que max_stock", () => {
        const dataWithValidRange = {
          ...validInventoryData,
          min_stock: 10,
          max_stock: 100,
        };
        const result = createInventorySchema.safeParse(dataWithValidRange);
        expect(result.success).toBe(true);
      });
    });

    describe("Validación strict mode", () => {
      it("debería fallar con campos adicionales no permitidos", () => {
        const dataWithExtraField = {
          ...validInventoryData,
          extra_field: "not allowed",
        };
        const result = createInventorySchema.safeParse(dataWithExtraField);
        expect(result.success).toBe(false);
      });

      it("debería fallar con múltiples campos extra", () => {
        const dataWithExtraFields = {
          ...validInventoryData,
          extra1: "value1",
          extra2: "value2",
        };
        const result = createInventorySchema.safeParse(dataWithExtraFields);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("updateInventorySchema", () => {
    const validUpdateData = {
      id: validUUID,
    };

    it("debería validar con solo id requerido", () => {
      const result = updateInventorySchema.safeParse(validUpdateData);
      expect(result.success).toBe(true);
    });

    it("debería validar con campos opcionales", () => {
      const dataWithOptionalFields = {
        ...validUpdateData,
        name: "Item Actualizado",
        quantity: 75,
        min_stock: 15,
        max_stock: 120,
      };
      const result = updateInventorySchema.safeParse(dataWithOptionalFields);
      expect(result.success).toBe(true);
    });

    it("debería fallar sin id", () => {
      const result = updateInventorySchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("debería fallar con id inválido", () => {
      const dataWithInvalidId = { id: "invalid-uuid" };
      const result = updateInventorySchema.safeParse(dataWithInvalidId);
      expect(result.success).toBe(false);
    });

    it("debería validar campos opcionales completos", () => {
      const completeUpdateData = {
        id: validUUID,
        service_point_id: validUUID,
        name: "Nuevo Item",
        description: "Descripción actualizada",
        quantity: 80,
        min_stock: 20,
        max_stock: 150,
      };
      const result = updateInventorySchema.safeParse(completeUpdateData);
      expect(result.success).toBe(true);
    });

    it("debería fallar con campos adicionales no permitidos", () => {
      const dataWithExtraField = {
        ...validUpdateData,
        extra_field: "not allowed",
      };
      const result = updateInventorySchema.safeParse(dataWithExtraField);
      expect(result.success).toBe(false);
    });
  });

  describe("deleteInventorySchema", () => {
    it("debería validar id correcto", () => {
      const data = { id: validUUID };
      const result = deleteInventorySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("debería fallar sin id", () => {
      const result = deleteInventorySchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("debería fallar con id inválido", () => {
      const data = { id: "invalid-uuid" };
      const result = deleteInventorySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("debería fallar con campos adicionales en modo strict", () => {
      const data = { id: validUUID, extra: "field" };
      const result = deleteInventorySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("queryInventorySchema", () => {
    it("debería validar query vacío", () => {
      const result = queryInventorySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("debería validar query undefined", () => {
      const result = queryInventorySchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it("debería validar con filtro service_point_id", () => {
      const data = { service_point_id: validUUID };
      const result = queryInventorySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("debería fallar con service_point_id inválido", () => {
      const data = { service_point_id: "invalid-uuid" };
      const result = queryInventorySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("Type Inference Tests", () => {
    it("debería inferir tipos correctamente para CreateInventoryInput", () => {
      const data: CreateInventoryInput = {
        service_point_id: validUUID,
        name: "Test Item",
        quantity: 10,
        min_stock: 5,
        description: "Test Description",
      };
      expect(data.service_point_id).toBe(validUUID);
      expect(data.name).toBe("Test Item");
    });

    it("debería inferir tipos correctamente para UpdateInventoryInput", () => {
      const data: UpdateInventoryInput = {
        id: validUUID,
        name: "Updated Item",
        quantity: 20,
      };
      expect(data.id).toBe(validUUID);
      expect(data.name).toBe("Updated Item");
    });

    it("debería inferir tipos correctamente para DeleteInventoryInput", () => {
      const data: DeleteInventoryInput = {
        id: validUUID,
      };
      expect(data.id).toBe(validUUID);
    });

    it("debería inferir tipos correctamente para QueryInventoryInput", () => {
      const data: QueryInventoryInput = {
        service_point_id: validUUID,
      };
      expect(data.service_point_id).toBe(validUUID);
    });
  });
});
