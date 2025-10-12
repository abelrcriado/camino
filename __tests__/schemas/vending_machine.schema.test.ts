/**
 * @file __tests__/schemas/vending_machine.schema.test.ts
 * @description Test unitarios para validaciones Zod de Vending Machine Schema
 */

import {
  createVendingMachineSchema,
  updateVendingMachineSchema,
  deleteVendingMachineSchema,
  queryVendingMachineSchema,
  type CreateVendingMachineInput,
  type UpdateVendingMachineInput,
  type DeleteVendingMachineInput,
  type QueryVendingMachineInput,
} from "../../src/schemas/vending_machine.schema";
import { VENDING_MACHINE_STATUS_VALUES } from "../../src/constants/enums";

describe("Vending Machine Schema Validation", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";

  describe("createVendingMachineSchema", () => {
    const validVendingMachineData = {
      service_point_id: validUUID,
      name: "Máquina Expendedora Principal",
      description: "Máquina expendedora de productos para ciclistas.",
    };

    describe("Validaciones exitosas", () => {
      it("debería validar datos mínimos requeridos", () => {
        const result = createVendingMachineSchema.safeParse(
          validVendingMachineData
        );
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.service_point_id).toBe(
            validVendingMachineData.service_point_id
          );
          expect(result.data.name).toBe(validVendingMachineData.name);
          expect(result.data.status).toBe("operational"); // default value
        }
      });

      it("debería validar datos completos con todos los campos opcionales", () => {
        const completeData = {
          ...validVendingMachineData,
          model: "VM-2024-XL",
          serial_number: "SN123456789",
          status: "operational" as const,
          capacity: 50,
          current_stock: 25,
          last_refill_date: "2025-01-01T00:00:00Z",
          next_maintenance_date: "2025-01-15T00:00:00Z",
          total_sales: 100,
          total_revenue: 2500.5,
          configuration: { slots: 10, temperature: 15 },
        };

        const result = createVendingMachineSchema.safeParse(completeData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.model).toBe("VM-2024-XL");
          expect(result.data.serial_number).toBe("SN123456789");
          expect(result.data.capacity).toBe(50);
          expect(result.data.current_stock).toBe(25);
          expect(result.data.total_sales).toBe(100);
          expect(result.data.total_revenue).toBe(2500.5);
          expect(result.data.configuration).toEqual({
            slots: 10,
            temperature: 15,
          });
        }
      });

      it("debería aceptar capacity como número positivo", () => {
        const dataWithCapacity = { ...validVendingMachineData, capacity: 100 };
        const result = createVendingMachineSchema.safeParse(dataWithCapacity);
        expect(result.success).toBe(true);
      });

      it("debería aceptar current_stock como número no negativo", () => {
        const dataWithStock = { ...validVendingMachineData, current_stock: 0 };
        const result = createVendingMachineSchema.safeParse(dataWithStock);
        expect(result.success).toBe(true);
      });

      it("debería aceptar fechas ISO 8601 válidas", () => {
        const dataWithDates = {
          ...validVendingMachineData,
          last_refill_date: "2025-01-01T12:00:00Z",
          next_maintenance_date: "2025-02-01T12:00:00Z",
        };
        const result = createVendingMachineSchema.safeParse(dataWithDates);
        expect(result.success).toBe(true);
      });

      it("debería aceptar configuration como objeto JSON", () => {
        const dataWithConfig = {
          ...validVendingMachineData,
          configuration: {
            slots: 20,
            temperature: { min: 10, max: 20 },
            payment_methods: ["card", "cash"],
          },
        };
        const result = createVendingMachineSchema.safeParse(dataWithConfig);
        expect(result.success).toBe(true);
      });

      it("debería aceptar todos los valores de status válidos", () => {
        VENDING_MACHINE_STATUS_VALUES.forEach((status) => {
          const dataWithStatus = { ...validVendingMachineData, status };
          const result = createVendingMachineSchema.safeParse(dataWithStatus);
          expect(result.success).toBe(true);
        });
      });
    });

    describe("Validaciones de campos requeridos", () => {
      it("debería fallar sin service_point_id", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { service_point_id, ...dataWithoutServicePoint } =
          validVendingMachineData;
        const result = createVendingMachineSchema.safeParse(
          dataWithoutServicePoint
        );
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("service_point_id");
        }
      });

      it("debería fallar sin name", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { name, ...dataWithoutName } = validVendingMachineData;
        const result = createVendingMachineSchema.safeParse(dataWithoutName);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("name");
        }
      });
    });

    describe("Validaciones de service_point_id", () => {
      it("debería fallar con UUID inválido", () => {
        const dataWithInvalidUUID = {
          ...validVendingMachineData,
          service_point_id: "invalid-uuid",
        };
        const result =
          createVendingMachineSchema.safeParse(dataWithInvalidUUID);
        expect(result.success).toBe(false);
      });

      it("debería fallar con service_point_id vacío", () => {
        const dataWithEmptyUUID = {
          ...validVendingMachineData,
          service_point_id: "",
        };
        const result = createVendingMachineSchema.safeParse(dataWithEmptyUUID);
        expect(result.success).toBe(false);
      });
    });

    describe("Validaciones de name", () => {
      it("debería fallar con name muy corto", () => {
        const dataWithShortName = { ...validVendingMachineData, name: "A" };
        const result = createVendingMachineSchema.safeParse(dataWithShortName);
        expect(result.success).toBe(false);
      });

      it("debería fallar con name muy largo", () => {
        const longName = "A".repeat(151);
        const dataWithLongName = { ...validVendingMachineData, name: longName };
        const result = createVendingMachineSchema.safeParse(dataWithLongName);
        expect(result.success).toBe(false);
      });

      it("debería aceptar name en el límite inferior (2 chars)", () => {
        const dataWithMinName = { ...validVendingMachineData, name: "AB" };
        const result = createVendingMachineSchema.safeParse(dataWithMinName);
        expect(result.success).toBe(true);
      });

      it("debería aceptar name en el límite superior (150 chars)", () => {
        const maxName = "A".repeat(150);
        const dataWithMaxName = { ...validVendingMachineData, name: maxName };
        const result = createVendingMachineSchema.safeParse(dataWithMaxName);
        expect(result.success).toBe(true);
      });
    });

    describe("Validaciones de capacity", () => {
      it("debería fallar con capacity cero", () => {
        const dataWithZeroCapacity = {
          ...validVendingMachineData,
          capacity: 0,
        };
        const result =
          createVendingMachineSchema.safeParse(dataWithZeroCapacity);
        expect(result.success).toBe(false);
      });

      it("debería fallar con capacity negativo", () => {
        const dataWithNegativeCapacity = {
          ...validVendingMachineData,
          capacity: -1,
        };
        const result = createVendingMachineSchema.safeParse(
          dataWithNegativeCapacity
        );
        expect(result.success).toBe(false);
      });

      it("debería fallar con capacity decimal", () => {
        const dataWithDecimalCapacity = {
          ...validVendingMachineData,
          capacity: 5.5,
        };
        const result = createVendingMachineSchema.safeParse(
          dataWithDecimalCapacity
        );
        expect(result.success).toBe(false);
      });
    });

    describe("Validaciones de current_stock", () => {
      it("debería fallar con current_stock negativo", () => {
        const dataWithNegativeStock = {
          ...validVendingMachineData,
          current_stock: -1,
        };
        const result = createVendingMachineSchema.safeParse(
          dataWithNegativeStock
        );
        expect(result.success).toBe(false);
      });

      it("debería fallar con current_stock decimal", () => {
        const dataWithDecimalStock = {
          ...validVendingMachineData,
          current_stock: 5.5,
        };
        const result =
          createVendingMachineSchema.safeParse(dataWithDecimalStock);
        expect(result.success).toBe(false);
      });
    });

    describe("Validaciones de fechas", () => {
      it("debería fallar con formato de fecha inválido", () => {
        const dataWithInvalidDate = {
          ...validVendingMachineData,
          last_refill_date: "invalid-date",
        };
        const result =
          createVendingMachineSchema.safeParse(dataWithInvalidDate);
        expect(result.success).toBe(false);
      });

      it("debería fallar con fecha que no es ISO 8601", () => {
        const dataWithInvalidDate = {
          ...validVendingMachineData,
          next_maintenance_date: "2025-01-01",
        };
        const result =
          createVendingMachineSchema.safeParse(dataWithInvalidDate);
        expect(result.success).toBe(false);
      });
    });

    describe("Validaciones de total_sales y total_revenue", () => {
      it("debería fallar con total_sales negativo", () => {
        const dataWithNegativeSales = {
          ...validVendingMachineData,
          total_sales: -1,
        };
        const result = createVendingMachineSchema.safeParse(
          dataWithNegativeSales
        );
        expect(result.success).toBe(false);
      });

      it("debería fallar con total_revenue negativo", () => {
        const dataWithNegativeRevenue = {
          ...validVendingMachineData,
          total_revenue: -1,
        };
        const result = createVendingMachineSchema.safeParse(
          dataWithNegativeRevenue
        );
        expect(result.success).toBe(false);
      });

      it("debería fallar con total_sales decimal", () => {
        const dataWithDecimalSales = {
          ...validVendingMachineData,
          total_sales: 5.5,
        };
        const result =
          createVendingMachineSchema.safeParse(dataWithDecimalSales);
        expect(result.success).toBe(false);
      });
    });

    describe("Validaciones de status", () => {
      it("debería fallar con status inválido", () => {
        const dataWithInvalidStatus = {
          ...validVendingMachineData,
          status: "invalid_status",
        };
        const result = createVendingMachineSchema.safeParse(
          dataWithInvalidStatus
        );
        expect(result.success).toBe(false);
      });
    });

    describe("Validación strict mode", () => {
      it("debería fallar con campos adicionales no permitidos", () => {
        const dataWithExtraField = {
          ...validVendingMachineData,
          extra_field: "not allowed",
        };
        const result = createVendingMachineSchema.safeParse(dataWithExtraField);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("updateVendingMachineSchema", () => {
    const validUpdateData = {
      id: validUUID,
    };

    it("debería validar con solo id requerido", () => {
      const result = updateVendingMachineSchema.safeParse(validUpdateData);
      expect(result.success).toBe(true);
    });

    it("debería validar con campos opcionales", () => {
      const dataWithOptionalFields = {
        ...validUpdateData,
        name: "Máquina Actualizada",
        status: "low_stock" as const,
        capacity: 75,
        current_stock: 10,
      };
      const result = updateVendingMachineSchema.safeParse(
        dataWithOptionalFields
      );
      expect(result.success).toBe(true);
    });

    it("debería fallar sin id", () => {
      const result = updateVendingMachineSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("debería fallar con id inválido", () => {
      const dataWithInvalidId = { id: "invalid-uuid" };
      const result = updateVendingMachineSchema.safeParse(dataWithInvalidId);
      expect(result.success).toBe(false);
    });

    it("debería validar campos opcionales completos", () => {
      const completeUpdateData = {
        id: validUUID,
        service_point_id: validUUID,
        name: "Nueva Máquina",
        description: "Descripción actualizada",
        model: "VM-2025",
        serial_number: "SN987654321",
        status: "maintenance" as const,
        capacity: 60,
        current_stock: 30,
        last_refill_date: "2025-01-02T00:00:00Z",
        next_maintenance_date: "2025-02-02T00:00:00Z",
        total_sales: 200,
        total_revenue: 5000.0,
        configuration: { temperature: 20 },
      };
      const result = updateVendingMachineSchema.safeParse(completeUpdateData);
      expect(result.success).toBe(true);
    });

    it("debería fallar con campos adicionales no permitidos", () => {
      const dataWithExtraField = {
        ...validUpdateData,
        extra_field: "not allowed",
      };
      const result = updateVendingMachineSchema.safeParse(dataWithExtraField);
      expect(result.success).toBe(false);
    });
  });

  describe("deleteVendingMachineSchema", () => {
    it("debería validar id correcto", () => {
      const data = { id: validUUID };
      const result = deleteVendingMachineSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("debería fallar sin id", () => {
      const result = deleteVendingMachineSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("debería fallar con id inválido", () => {
      const data = { id: "invalid-uuid" };
      const result = deleteVendingMachineSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("debería fallar con campos adicionales en modo strict", () => {
      const data = { id: validUUID, extra: "field" };
      const result = deleteVendingMachineSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("queryVendingMachineSchema", () => {
    it("debería validar query vacío", () => {
      const result = queryVendingMachineSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("debería validar query undefined", () => {
      const result = queryVendingMachineSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it("debería validar con filtro service_point_id", () => {
      const data = { service_point_id: validUUID };
      const result = queryVendingMachineSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("debería validar con filtro status", () => {
      const data = { status: "operational" as const };
      const result = queryVendingMachineSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("debería validar con ambos filtros", () => {
      const data = {
        service_point_id: validUUID,
        status: "maintenance" as const,
      };
      const result = queryVendingMachineSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("debería validar con filtros adicionales de paginación", () => {
      const data = {
        service_point_id: validUUID,
        status: "operational" as const,
        page: 1,
        limit: 10,
        sortBy: "created_at",
        sortOrder: "desc" as const,
      };
      const result = queryVendingMachineSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("debería fallar con service_point_id inválido", () => {
      const data = { service_point_id: "invalid-uuid" };
      const result = queryVendingMachineSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("debería fallar con status inválido", () => {
      const data = { status: "invalid_status" };
      const result = queryVendingMachineSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("Type Inference Tests", () => {
    it("debería inferir tipos correctamente para CreateVendingMachineInput", () => {
      const data: CreateVendingMachineInput = {
        service_point_id: validUUID,
        name: "Test Machine",
        description: "Test Description",
        status: "operational",
        capacity: 50,
        current_stock: 25,
      };
      expect(data.service_point_id).toBe(validUUID);
      expect(data.name).toBe("Test Machine");
    });

    it("debería inferir tipos correctamente para UpdateVendingMachineInput", () => {
      const data: UpdateVendingMachineInput = {
        id: validUUID,
        name: "Updated Machine",
        status: "maintenance",
      };
      expect(data.id).toBe(validUUID);
      expect(data.name).toBe("Updated Machine");
    });

    it("debería inferir tipos correctamente para DeleteVendingMachineInput", () => {
      const data: DeleteVendingMachineInput = {
        id: validUUID,
      };
      expect(data.id).toBe(validUUID);
    });

    it("debería inferir tipos correctamente para QueryVendingMachineInput", () => {
      const data: QueryVendingMachineInput = {
        service_point_id: validUUID,
        status: "operational",
      };
      expect(data.service_point_id).toBe(validUUID);
      expect(data.status).toBe("operational");
    });
  });
});
