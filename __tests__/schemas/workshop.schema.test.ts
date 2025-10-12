/**
 * @file __tests__/schemas/workshop.schema.test.ts
 * @description Test unitarios para validaciones Zod de Workshop Schema
 */

import {
  createWorkshopSchema,
  updateWorkshopSchema,
  deleteWorkshopSchema,
  queryWorkshopSchema,
  type CreateWorkshopInput,
  type UpdateWorkshopInput,
  type DeleteWorkshopInput,
  type QueryWorkshopInput,
} from "../../src/schemas/workshop.schema";

describe("Workshop Schema Validation", () => {
  describe("createWorkshopSchema", () => {
    const validWorkshopData = {
      service_point_id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Taller Especializado",
      description: "Descripción del taller",
      contact_phone: "+34 123 456 789",
    };

    describe("Validaciones exitosas", () => {
      it("debería validar datos mínimos requeridos", () => {
        const result = createWorkshopSchema.safeParse(validWorkshopData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.service_point_id).toBe(
            validWorkshopData.service_point_id
          );
          expect(result.data.name).toBe(validWorkshopData.name);
          expect(result.data.contact_phone).toBe(
            validWorkshopData.contact_phone
          );
        }
      });

      it("debería validar datos completos con todos los campos opcionales", () => {
        const completeData = {
          ...validWorkshopData,
          specialties: ["bike_repair", "maintenance"],
          contact_email: "test@workshop.com",
          website_url: "https://workshop.com",
          capacity: 5,
          equipment: { tools: ["wrench", "pump"] },
          certifications: ["ISO 9001", "CE"],
        };

        const result = createWorkshopSchema.safeParse(completeData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.specialties).toEqual([
            "bike_repair",
            "maintenance",
          ]);
          expect(result.data.contact_email).toBe("test@workshop.com");
          expect(result.data.equipment).toEqual({ tools: ["wrench", "pump"] });
          expect(result.data.certifications).toEqual(["ISO 9001", "CE"]);
        }
      });

      it("debería aceptar capacity como número positivo", () => {
        const dataWithCapacity = { ...validWorkshopData, capacity: 10 };
        const result = createWorkshopSchema.safeParse(dataWithCapacity);
        expect(result.success).toBe(true);
      });

      it("debería aceptar equipment como objeto JSON", () => {
        const dataWithEquipment = {
          ...validWorkshopData,
          equipment: { bikes: 5, tools: ["wrench", "pump"], area: 100 },
        };
        const result = createWorkshopSchema.safeParse(dataWithEquipment);
        expect(result.success).toBe(true);
      });

      it("debería aceptar certifications como array de strings", () => {
        const dataWithCerts = {
          ...validWorkshopData,
          certifications: ["ISO 9001", "CE", "Quality Certificate"],
        };
        const result = createWorkshopSchema.safeParse(dataWithCerts);
        expect(result.success).toBe(true);
      });
    });

    describe("Validaciones de campos requeridos", () => {
      it("debería fallar sin service_point_id", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { service_point_id, ...dataWithoutServicePoint } =
          validWorkshopData;
        const result = createWorkshopSchema.safeParse(dataWithoutServicePoint);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("service_point_id");
        }
      });

      it("debería fallar sin name", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { name, ...dataWithoutName } = validWorkshopData;
        const result = createWorkshopSchema.safeParse(dataWithoutName);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("name");
        }
      });

      it("debería fallar sin contact_phone", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { contact_phone, ...dataWithoutPhone } = validWorkshopData;
        const result = createWorkshopSchema.safeParse(dataWithoutPhone);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("contact_phone");
        }
      });
    });

    describe("Validaciones de service_point_id", () => {
      it("debería fallar con UUID inválido", () => {
        const dataWithInvalidUUID = {
          ...validWorkshopData,
          service_point_id: "invalid-uuid",
        };
        const result = createWorkshopSchema.safeParse(dataWithInvalidUUID);
        expect(result.success).toBe(false);
      });

      it("debería fallar con service_point_id vacío", () => {
        const dataWithEmptyUUID = {
          ...validWorkshopData,
          service_point_id: "",
        };
        const result = createWorkshopSchema.safeParse(dataWithEmptyUUID);
        expect(result.success).toBe(false);
      });
    });

    describe("Validaciones de name", () => {
      it("debería fallar con name muy corto", () => {
        const dataWithShortName = { ...validWorkshopData, name: "AB" };
        const result = createWorkshopSchema.safeParse(dataWithShortName);
        expect(result.success).toBe(false);
      });

      it("debería fallar con name muy largo", () => {
        const longName = "A".repeat(151);
        const dataWithLongName = { ...validWorkshopData, name: longName };
        const result = createWorkshopSchema.safeParse(dataWithLongName);
        expect(result.success).toBe(false);
      });

      it("debería aceptar name en el límite inferior (3 chars)", () => {
        const dataWithMinName = { ...validWorkshopData, name: "ABC" };
        const result = createWorkshopSchema.safeParse(dataWithMinName);
        expect(result.success).toBe(true);
      });

      it("debería aceptar name en el límite superior (150 chars)", () => {
        const maxName = "A".repeat(150);
        const dataWithMaxName = { ...validWorkshopData, name: maxName };
        const result = createWorkshopSchema.safeParse(dataWithMaxName);
        expect(result.success).toBe(true);
      });
    });

    describe("Validaciones de contact_phone", () => {
      it("debería aceptar teléfonos válidos", () => {
        const validPhones = [
          "+34 123 456 789",
          "123-456-7890",
          "(555) 123-4567",
          "+1 555 123 4567",
          "1234567",
        ];

        validPhones.forEach((phone) => {
          const dataWithValidPhone = {
            ...validWorkshopData,
            contact_phone: phone,
          };
          const result = createWorkshopSchema.safeParse(dataWithValidPhone);
          expect(result.success).toBe(true);
        });
      });

      it("debería fallar con teléfonos muy cortos", () => {
        const dataWithShortPhone = {
          ...validWorkshopData,
          contact_phone: "123456",
        };
        const result = createWorkshopSchema.safeParse(dataWithShortPhone);
        expect(result.success).toBe(false);
      });

      it("debería fallar con teléfonos muy largos", () => {
        const longPhone = "1".repeat(21);
        const dataWithLongPhone = {
          ...validWorkshopData,
          contact_phone: longPhone,
        };
        const result = createWorkshopSchema.safeParse(dataWithLongPhone);
        expect(result.success).toBe(false);
      });

      it("debería fallar con caracteres inválidos en teléfono", () => {
        const dataWithInvalidPhone = {
          ...validWorkshopData,
          contact_phone: "123-abc-456",
        };
        const result = createWorkshopSchema.safeParse(dataWithInvalidPhone);
        expect(result.success).toBe(false);
      });
    });

    describe("Validaciones de contact_email", () => {
      it("debería aceptar email válido", () => {
        const dataWithEmail = {
          ...validWorkshopData,
          contact_email: "test@workshop.com",
        };
        const result = createWorkshopSchema.safeParse(dataWithEmail);
        expect(result.success).toBe(true);
      });

      it("debería fallar con email inválido", () => {
        const dataWithInvalidEmail = {
          ...validWorkshopData,
          contact_email: "invalid-email",
        };
        const result = createWorkshopSchema.safeParse(dataWithInvalidEmail);
        expect(result.success).toBe(false);
      });

      it("debería aceptar contact_email como undefined", () => {
        const result = createWorkshopSchema.safeParse(validWorkshopData);
        expect(result.success).toBe(true);
      });
    });

    describe("Validaciones de website_url", () => {
      it("debería aceptar URL válida", () => {
        const dataWithURL = {
          ...validWorkshopData,
          website_url: "https://workshop.com",
        };
        const result = createWorkshopSchema.safeParse(dataWithURL);
        expect(result.success).toBe(true);
      });

      it("debería fallar con URL inválida", () => {
        const dataWithInvalidURL = {
          ...validWorkshopData,
          website_url: "invalid-url",
        };
        const result = createWorkshopSchema.safeParse(dataWithInvalidURL);
        expect(result.success).toBe(false);
      });

      it("debería aceptar website_url como undefined", () => {
        const result = createWorkshopSchema.safeParse(validWorkshopData);
        expect(result.success).toBe(true);
      });
    });

    describe("Validaciones de capacity", () => {
      it("debería aceptar capacity positivo", () => {
        const dataWithCapacity = { ...validWorkshopData, capacity: 5 };
        const result = createWorkshopSchema.safeParse(dataWithCapacity);
        expect(result.success).toBe(true);
      });

      it("debería fallar con capacity cero", () => {
        const dataWithZeroCapacity = { ...validWorkshopData, capacity: 0 };
        const result = createWorkshopSchema.safeParse(dataWithZeroCapacity);
        expect(result.success).toBe(false);
      });

      it("debería fallar con capacity negativo", () => {
        const dataWithNegativeCapacity = { ...validWorkshopData, capacity: -1 };
        const result = createWorkshopSchema.safeParse(dataWithNegativeCapacity);
        expect(result.success).toBe(false);
      });

      it("debería fallar con capacity decimal", () => {
        const dataWithDecimalCapacity = { ...validWorkshopData, capacity: 5.5 };
        const result = createWorkshopSchema.safeParse(dataWithDecimalCapacity);
        expect(result.success).toBe(false);
      });
    });

    describe("Validación strict mode", () => {
      it("debería fallar con campos adicionales no permitidos", () => {
        const dataWithExtraField = {
          ...validWorkshopData,
          extra_field: "not allowed",
        };
        const result = createWorkshopSchema.safeParse(dataWithExtraField);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("updateWorkshopSchema", () => {
    const validUpdateData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Taller Actualizado",
    };

    describe("Validaciones exitosas", () => {
      it("debería validar actualización con solo ID y un campo", () => {
        const result = updateWorkshopSchema.safeParse(validUpdateData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.id).toBe(validUpdateData.id);
          expect(result.data.name).toBe(validUpdateData.name);
        }
      });

      it("debería validar actualización con todos los campos", () => {
        const completeUpdateData = {
          id: "123e4567-e89b-12d3-a456-426614174000",
          service_point_id: "456e7890-e12b-34d5-a678-901234567890",
          name: "Taller Completo",
          description: "Nueva descripción",
          specialties: ["repair", "maintenance"],
          contact_phone: "+34 987 654 321",
          contact_email: "updated@workshop.com",
          website_url: "https://updated-workshop.com",
          capacity: 8,
          equipment: { new_tools: ["advanced_tool"] },
          certifications: ["Updated Certificate"],
        };

        const result = updateWorkshopSchema.safeParse(completeUpdateData);
        expect(result.success).toBe(true);
      });

      it("debería aceptar contact_phone como opcional en actualizaciones", () => {
        const dataWithoutPhone = { ...validUpdateData };
        const result = updateWorkshopSchema.safeParse(dataWithoutPhone);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.contact_phone).toBeUndefined();
        }
      });
    });

    describe("Validaciones de ID requerido", () => {
      it("debería fallar sin ID", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...dataWithoutId } = validUpdateData;
        const result = updateWorkshopSchema.safeParse(dataWithoutId);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("id");
        }
      });

      it("debería fallar con ID inválido", () => {
        const dataWithInvalidId = { ...validUpdateData, id: "invalid-uuid" };
        const result = updateWorkshopSchema.safeParse(dataWithInvalidId);
        expect(result.success).toBe(false);
      });
    });

    describe("Validaciones de campos opcionales", () => {
      it("debería validar service_point_id opcional", () => {
        const dataWithServicePoint = {
          ...validUpdateData,
          service_point_id: "456e7890-e12b-34d5-a678-901234567890",
        };
        const result = updateWorkshopSchema.safeParse(dataWithServicePoint);
        expect(result.success).toBe(true);
      });

      it("debería fallar con service_point_id inválido", () => {
        const dataWithInvalidServicePoint = {
          ...validUpdateData,
          service_point_id: "invalid-uuid",
        };
        const result = updateWorkshopSchema.safeParse(
          dataWithInvalidServicePoint
        );
        expect(result.success).toBe(false);
      });

      it("debería validar contact_phone opcional con formato correcto", () => {
        const dataWithPhone = {
          ...validUpdateData,
          contact_phone: "+34 123 456 789",
        };
        const result = updateWorkshopSchema.safeParse(dataWithPhone);
        expect(result.success).toBe(true);
      });

      it("debería fallar con contact_phone inválido", () => {
        const dataWithInvalidPhone = {
          ...validUpdateData,
          contact_phone: "abc",
        };
        const result = updateWorkshopSchema.safeParse(dataWithInvalidPhone);
        expect(result.success).toBe(false);
      });
    });

    describe("Validación strict mode en updates", () => {
      it("debería fallar con campos adicionales no permitidos", () => {
        const dataWithExtraField = {
          ...validUpdateData,
          unknown_field: "value",
        };
        const result = updateWorkshopSchema.safeParse(dataWithExtraField);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("deleteWorkshopSchema", () => {
    describe("Validaciones exitosas", () => {
      it("debería validar delete con ID válido", () => {
        const deleteData = { id: "123e4567-e89b-12d3-a456-426614174000" };
        const result = deleteWorkshopSchema.safeParse(deleteData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.id).toBe(deleteData.id);
        }
      });
    });

    describe("Validaciones de ID requerido", () => {
      it("debería fallar sin ID", () => {
        const result = deleteWorkshopSchema.safeParse({});
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("id");
        }
      });

      it("debería fallar con ID inválido", () => {
        const deleteData = { id: "invalid-uuid" };
        const result = deleteWorkshopSchema.safeParse(deleteData);
        expect(result.success).toBe(false);
      });

      it("debería fallar con ID vacío", () => {
        const deleteData = { id: "" };
        const result = deleteWorkshopSchema.safeParse(deleteData);
        expect(result.success).toBe(false);
      });
    });

    describe("Validación strict mode en delete", () => {
      it("debería fallar con campos adicionales", () => {
        const deleteData = {
          id: "123e4567-e89b-12d3-a456-426614174000",
          extra_field: "not allowed",
        };
        const result = deleteWorkshopSchema.safeParse(deleteData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("queryWorkshopSchema", () => {
    describe("Validaciones exitosas", () => {
      it("debería validar query vacío", () => {
        const result = queryWorkshopSchema.safeParse({});
        expect(result.success).toBe(true);
      });

      it("debería validar query con service_point_id", () => {
        const queryData = {
          service_point_id: "123e4567-e89b-12d3-a456-426614174000",
        };
        const result = queryWorkshopSchema.safeParse(queryData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data?.service_point_id).toBe(
            queryData.service_point_id
          );
        }
      });

      it("debería validar query como undefined", () => {
        const result = queryWorkshopSchema.safeParse(undefined);
        expect(result.success).toBe(true);
      });
    });

    describe("Validaciones de service_point_id", () => {
      it("debería fallar con service_point_id inválido", () => {
        const queryData = { service_point_id: "invalid-uuid" };
        const result = queryWorkshopSchema.safeParse(queryData);
        expect(result.success).toBe(false);
      });

      it("debería fallar con service_point_id vacío", () => {
        const queryData = { service_point_id: "" };
        const result = queryWorkshopSchema.safeParse(queryData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Type inference", () => {
    it("debería exportar tipos correctos", () => {
      // Test de inferencia de tipos en tiempo de compilación
      const createData: CreateWorkshopInput = {
        service_point_id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test Workshop",
        contact_phone: "+34 123 456 789",
      };

      const updateData: UpdateWorkshopInput = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Updated Workshop",
      };

      const deleteData: DeleteWorkshopInput = {
        id: "123e4567-e89b-12d3-a456-426614174000",
      };

      const queryData: QueryWorkshopInput = {
        service_point_id: "123e4567-e89b-12d3-a456-426614174000",
      };

      expect(createData).toBeDefined();
      expect(updateData).toBeDefined();
      expect(deleteData).toBeDefined();
      expect(queryData).toBeDefined();
    });
  });
});
