import { describe, it, expect } from "@jest/globals";
import {
  createPartnerSchema,
  updatePartnerSchema,
  deletePartnerSchema,
  queryPartnerSchema,
  type CreatePartnerInput,
  type UpdatePartnerInput,
  type DeletePartnerInput,
  type QueryPartnerInput,
} from "@/api/schemas/partner.schema";
import { PARTNER_TYPE_VALUES } from "@/shared/constants/enums";
import { generateUUID } from "../helpers/factories";

describe("Partner Schema Validation", () => {
  const validUUID = generateUUID();

  describe("createPartnerSchema", () => {
    const validPartnerData = {
      name: "Shimano España",
      description: "Proveedor oficial de componentes de bicicletas.",
      logo_url: "https://www.shimano.com/logo.png",
      website_url: "https://www.shimano.com",
      contact_phone: "+34912345678",
    };

    describe("Validaciones exitosas", () => {
      it("debería validar datos mínimos requeridos", () => {
        const minimalData = {
          name: "Partner Mínimo",
          contact_phone: "+34912345678",
        };
        const result = createPartnerSchema.safeParse(minimalData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe("Partner Mínimo");
          expect(result.data.contact_phone).toBe("+34912345678");
        }
      });

      it("debería validar datos completos con todos los campos opcionales", () => {
        const completeData = {
          ...validPartnerData,
          contact_email: "info@shimano.es",
          type: "supplier" as const,
        };
        const result = createPartnerSchema.safeParse(completeData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe("Shimano España");
          expect(result.data.contact_email).toBe("info@shimano.es");
          expect(result.data.type).toBe("supplier");
        }
      });

      it("debería aceptar contact_email opcional", () => {
        const dataWithEmail = {
          ...validPartnerData,
          contact_email: "info@shimano.es",
        };
        const result = createPartnerSchema.safeParse(dataWithEmail);
        expect(result.success).toBe(true);
      });

      it("debería aceptar type opcional", () => {
        const dataWithType = { ...validPartnerData, type: "supplier" };
        const result = createPartnerSchema.safeParse(dataWithType);
        expect(result.success).toBe(true);
      });

      it("debería aceptar description opcional", () => {
        const dataWithDescription = {
          ...validPartnerData,
          description: "Descripción detallada del partner",
        };
        const result = createPartnerSchema.safeParse(dataWithDescription);
        expect(result.success).toBe(true);
      });

      it("debería aceptar logo_url opcional", () => {
        const dataWithLogo = {
          ...validPartnerData,
          logo_url: "https://example.com/logo.png",
        };
        const result = createPartnerSchema.safeParse(dataWithLogo);
        expect(result.success).toBe(true);
      });

      it("debería aceptar website_url opcional", () => {
        const dataWithWebsite = {
          ...validPartnerData,
          website_url: "https://example.com",
        };
        const result = createPartnerSchema.safeParse(dataWithWebsite);
        expect(result.success).toBe(true);
      });

      it("debería aceptar todos los valores de type válidos", () => {
        PARTNER_TYPE_VALUES.forEach((type) => {
          const dataWithType = { ...validPartnerData, type };
          const result = createPartnerSchema.safeParse(dataWithType);
          expect(result.success).toBe(true);
        });
      });
    });

    describe("Validaciones de campos requeridos", () => {
      it("debería fallar sin name", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { name, ...dataWithoutName } = validPartnerData;
        const result = createPartnerSchema.safeParse(dataWithoutName);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("name");
        }
      });

      it("debería fallar sin contact_phone", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { contact_phone, ...dataWithoutPhone } = validPartnerData;
        const result = createPartnerSchema.safeParse(dataWithoutPhone);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain("contact_phone");
        }
      });
    });

    describe("Validaciones de name", () => {
      it("debería fallar con name muy corto", () => {
        const dataWithShortName = { ...validPartnerData, name: "A" };
        const result = createPartnerSchema.safeParse(dataWithShortName);
        expect(result.success).toBe(false);
      });

      it("debería fallar con name muy largo", () => {
        const longName = "A".repeat(151);
        const dataWithLongName = { ...validPartnerData, name: longName };
        const result = createPartnerSchema.safeParse(dataWithLongName);
        expect(result.success).toBe(false);
      });

      it("debería aceptar name en el límite inferior (2 chars)", () => {
        const dataWithMinName = { ...validPartnerData, name: "AB" };
        const result = createPartnerSchema.safeParse(dataWithMinName);
        expect(result.success).toBe(true);
      });

      it("debería aceptar name en el límite superior (150 chars)", () => {
        const maxName = "A".repeat(150);
        const dataWithMaxName = { ...validPartnerData, name: maxName };
        const result = createPartnerSchema.safeParse(dataWithMaxName);
        expect(result.success).toBe(true);
      });

      it("debería fallar con name vacío", () => {
        const dataWithEmptyName = { ...validPartnerData, name: "" };
        const result = createPartnerSchema.safeParse(dataWithEmptyName);
        expect(result.success).toBe(false);
      });
    });

    describe("Validaciones de contact_phone", () => {
      it("debería fallar con teléfono muy corto", () => {
        const dataWithShortPhone = {
          ...validPartnerData,
          contact_phone: "123",
        };
        const result = createPartnerSchema.safeParse(dataWithShortPhone);
        expect(result.success).toBe(false);
      });

      it("debería fallar con teléfono muy largo", () => {
        const longPhone = "1".repeat(21);
        const dataWithLongPhone = {
          ...validPartnerData,
          contact_phone: longPhone,
        };
        const result = createPartnerSchema.safeParse(dataWithLongPhone);
        expect(result.success).toBe(false);
      });

      it("debería aceptar teléfono en límite inferior (7 chars)", () => {
        const dataWithMinPhone = {
          ...validPartnerData,
          contact_phone: "1234567",
        };
        const result = createPartnerSchema.safeParse(dataWithMinPhone);
        expect(result.success).toBe(true);
      });

      it("debería aceptar teléfono en límite superior (20 chars)", () => {
        const maxPhone = "1".repeat(20);
        const dataWithMaxPhone = {
          ...validPartnerData,
          contact_phone: maxPhone,
        };
        const result = createPartnerSchema.safeParse(dataWithMaxPhone);
        expect(result.success).toBe(true);
      });

      it("debería fallar con caracteres inválidos en teléfono", () => {
        const dataWithInvalidPhone = {
          ...validPartnerData,
          contact_phone: "12345abc",
        };
        const result = createPartnerSchema.safeParse(dataWithInvalidPhone);
        expect(result.success).toBe(false);
      });

      it("debería aceptar teléfonos con formato internacional", () => {
        const internationalFormats = [
          "+34912345678",
          "+1-555-123-4567",
          "(555) 123-4567",
          "555 123 4567",
          "555-123-4567",
        ];

        internationalFormats.forEach((phone) => {
          const dataWithIntlPhone = {
            ...validPartnerData,
            contact_phone: phone,
          };
          const result = createPartnerSchema.safeParse(dataWithIntlPhone);
          expect(result.success).toBe(true);
        });
      });
    });

    describe("Validaciones de URL", () => {
      it("debería fallar con logo_url inválida", () => {
        const dataWithInvalidLogo = {
          ...validPartnerData,
          logo_url: "not-a-url",
        };
        const result = createPartnerSchema.safeParse(dataWithInvalidLogo);
        expect(result.success).toBe(false);
      });

      it("debería fallar con website_url inválida", () => {
        const dataWithInvalidWebsite = {
          ...validPartnerData,
          website_url: "invalid-url",
        };
        const result = createPartnerSchema.safeParse(dataWithInvalidWebsite);
        expect(result.success).toBe(false);
      });

      it("debería aceptar URLs HTTPS", () => {
        const dataWithHTTPS = {
          ...validPartnerData,
          logo_url: "https://example.com/logo.png",
          website_url: "https://example.com",
        };
        const result = createPartnerSchema.safeParse(dataWithHTTPS);
        expect(result.success).toBe(true);
      });

      it("debería aceptar URLs HTTP", () => {
        const dataWithHTTP = {
          ...validPartnerData,
          logo_url: "http://example.com/logo.png",
          website_url: "http://example.com",
        };
        const result = createPartnerSchema.safeParse(dataWithHTTP);
        expect(result.success).toBe(true);
      });
    });

    describe("Validaciones de email", () => {
      it("debería fallar con contact_email inválido", () => {
        const dataWithInvalidEmail = {
          ...validPartnerData,
          contact_email: "invalid-email",
        };
        const result = createPartnerSchema.safeParse(dataWithInvalidEmail);
        expect(result.success).toBe(false);
      });

      it("debería aceptar emails válidos", () => {
        const validEmails = [
          "test@example.com",
          "user.name@domain.co.uk",
          "info+partners@company.es",
          "contact123@test-domain.org",
        ];

        validEmails.forEach((email) => {
          const dataWithEmail = { ...validPartnerData, contact_email: email };
          const result = createPartnerSchema.safeParse(dataWithEmail);
          expect(result.success).toBe(true);
        });
      });
    });

    describe("Validaciones de type", () => {
      it("debería fallar con type inválido", () => {
        const dataWithInvalidType = {
          ...validPartnerData,
          type: "invalid_type",
        };
        const result = createPartnerSchema.safeParse(dataWithInvalidType);
        expect(result.success).toBe(false);
      });

      it("debería validar todos los tipos de partner", () => {
        const expectedTypes = [
          "sponsor",
          "collaborator",
          "supplier",
          "service_provider",
          "other",
        ];
        expect(PARTNER_TYPE_VALUES).toEqual(
          expect.arrayContaining(expectedTypes)
        );
      });
    });

    describe("Validación strict mode", () => {
      it("debería fallar con campos adicionales no permitidos", () => {
        const dataWithExtraField = {
          ...validPartnerData,
          extra_field: "value",
        };
        const result = createPartnerSchema.safeParse(dataWithExtraField);
        expect(result.success).toBe(false);
      });

      it("debería fallar con múltiples campos extra", () => {
        const dataWithExtraFields = {
          ...validPartnerData,
          extra1: "value1",
          extra2: "value2",
        };
        const result = createPartnerSchema.safeParse(dataWithExtraFields);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("updatePartnerSchema", () => {
    const validUpdateData = {
      id: validUUID,
    };

    it("debería validar con solo id requerido", () => {
      const result = updatePartnerSchema.safeParse(validUpdateData);
      expect(result.success).toBe(true);
    });

    it("debería validar con campos opcionales", () => {
      const dataWithOptionalFields = {
        ...validUpdateData,
        name: "Partner Actualizado",
        type: "sponsor" as const,
        contact_phone: "+34987654321",
      };
      const result = updatePartnerSchema.safeParse(dataWithOptionalFields);
      expect(result.success).toBe(true);
    });

    it("debería fallar sin id", () => {
      const result = updatePartnerSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("debería fallar con id inválido", () => {
      const dataWithInvalidId = { id: "invalid-uuid" };
      const result = updatePartnerSchema.safeParse(dataWithInvalidId);
      expect(result.success).toBe(false);
    });

    it("debería validar campos opcionales completos", () => {
      const completeUpdateData = {
        id: validUUID,
        name: "Nuevo Partner",
        description: "Descripción actualizada",
        logo_url: "https://newpartner.com/logo.png",
        website_url: "https://newpartner.com",
        contact_email: "info@newpartner.com",
        contact_phone: "+34600123456",
        type: "collaborator" as const,
      };
      const result = updatePartnerSchema.safeParse(completeUpdateData);
      expect(result.success).toBe(true);
    });

    it("debería fallar con campos adicionales no permitidos", () => {
      const dataWithExtraField = {
        ...validUpdateData,
        extra_field: "not allowed",
      };
      const result = updatePartnerSchema.safeParse(dataWithExtraField);
      expect(result.success).toBe(false);
    });
  });

  describe("deletePartnerSchema", () => {
    it("debería validar id correcto", () => {
      const data = { id: validUUID };
      const result = deletePartnerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("debería fallar sin id", () => {
      const result = deletePartnerSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("debería fallar con id inválido", () => {
      const data = { id: "invalid-uuid" };
      const result = deletePartnerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("debería fallar con campos adicionales en modo strict", () => {
      const data = { id: validUUID, extra: "field" };
      const result = deletePartnerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("queryPartnerSchema", () => {
    it("debería validar query vacío", () => {
      const result = queryPartnerSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("debería validar query undefined", () => {
      const result = queryPartnerSchema.safeParse(undefined);
      expect(result.success).toBe(true);
    });

    it("debería validar con filtro type", () => {
      const data = { type: "collaborator" as const };
      const result = queryPartnerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("debería fallar con type inválido", () => {
      const data = { type: "invalid_type" };
      const result = queryPartnerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("debería validar todos los tipos de partner válidos", () => {
      PARTNER_TYPE_VALUES.forEach((type) => {
        const data = { type };
        const result = queryPartnerSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Type Inference Tests", () => {
    it("debería inferir tipos correctamente para CreatePartnerInput", () => {
      const data: CreatePartnerInput = {
        name: "Test Partner",
        contact_phone: "+34912345678",
        description: "Test Description",
        type: "supplier",
      };
      expect(data.name).toBe("Test Partner");
      expect(data.contact_phone).toBe("+34912345678");
    });

    it("debería inferir tipos correctamente para UpdatePartnerInput", () => {
      const data: UpdatePartnerInput = {
        id: validUUID,
        name: "Updated Partner",
        type: "sponsor",
      };
      expect(data.id).toBe(validUUID);
      expect(data.name).toBe("Updated Partner");
    });

    it("debería inferir tipos correctamente para DeletePartnerInput", () => {
      const data: DeletePartnerInput = {
        id: validUUID,
      };
      expect(data.id).toBe(validUUID);
    });

    it("debería inferir tipos correctamente para QueryPartnerInput", () => {
      const data: QueryPartnerInput = {
        type: "collaborator",
      };
      expect(data.type).toBe("collaborator");
    });
  });
});
