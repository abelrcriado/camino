import { describe, it, expect } from "@jest/globals";
import { generateUUID } from "../helpers/factories";
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  deleteInventoryItemSchema,
  queryInventoryItemSchema,
} from "../../src/schemas/inventory_items.schema";
import { INVENTORY_ITEM_TYPE_VALUES } from "../../src/constants/enums";

describe("Inventory Items Schemas", () => {
  const validUUID = generateUUID();
  const invalidUUID = "invalid-uuid";

  describe("createInventoryItemSchema", () => {
    const validData = {
      inventory_id: validUUID,
      name: "Llanta 26 pulgadas",
      description: "Llanta para bicicleta de montaña de 26 pulgadas.",
      quantity: 15,
    };

    it("should validate correct inventory item data", () => {
      expect(() => createInventoryItemSchema.parse(validData)).not.toThrow();
    });

    it("should validate with optional sku", () => {
      const data = { ...validData, sku: "TIRE-26-MTB-001" };
      expect(() => createInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should validate with optional price", () => {
      const data = { ...validData, price: 29.99 };
      expect(() => createInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should validate with optional type", () => {
      const data = { ...validData, type: "spare_part" };
      expect(() => createInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should reject missing inventory_id", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { inventory_id, ...data } = validData;
      expect(() => createInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject missing name", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name, ...data } = validData;
      expect(() => createInventoryItemSchema.parse(data)).toThrow();
    });

    it("should validate without optional description", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { description, ...data } = validData;
      expect(() => createInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should reject missing quantity", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { quantity, ...data } = validData;
      expect(() => createInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject name too short", () => {
      const data = { ...validData, name: "A" };
      expect(() => createInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject name too long", () => {
      const data = { ...validData, name: "A".repeat(101) };
      expect(() => createInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject negative quantity", () => {
      const data = { ...validData, quantity: -5 };
      expect(() => createInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject negative price", () => {
      const data = { ...validData, price: -10.5 };
      expect(() => createInventoryItemSchema.parse(data)).toThrow();
    });

    it("should validate all inventory item type values", () => {
      INVENTORY_ITEM_TYPE_VALUES.forEach((type) => {
        const data = { ...validData, type };
        expect(() => createInventoryItemSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject invalid item type", () => {
      const data = { ...validData, type: "invalid_type" };
      expect(() => createInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject extra fields in strict mode", () => {
      const data = { ...validData, extra_field: "value" };
      expect(() => createInventoryItemSchema.parse(data)).toThrow();
    });

    // Nuevos tests comprehensivos
    it("should reject invalid inventory_id format", () => {
      const data = { ...validData, inventory_id: invalidUUID };
      expect(() => createInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject empty inventory_id", () => {
      const data = { ...validData, inventory_id: "" };
      expect(() => createInventoryItemSchema.parse(data)).toThrow();
    });

    it("should accept minimum valid name length", () => {
      const data = { ...validData, name: "AB" };
      expect(() => createInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should accept maximum valid name length", () => {
      const data = { ...validData, name: "A".repeat(100) };
      expect(() => createInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should accept zero quantity", () => {
      const data = { ...validData, quantity: 0 };
      expect(() => createInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should accept large quantity", () => {
      const data = { ...validData, quantity: 999999 };
      expect(() => createInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should reject non-integer quantity", () => {
      const data = { ...validData, quantity: 15.5 };
      expect(() => createInventoryItemSchema.parse(data)).toThrow();
    });

    it("should accept valid price with decimals", () => {
      const data = { ...validData, price: 19.99 };
      expect(() => createInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should accept minimum valid price", () => {
      const data = { ...validData, price: 0.01 };
      expect(() => createInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should accept zero price", () => {
      const data = { ...validData, price: 0 };
      expect(() => createInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should accept empty string SKU", () => {
      const data = { ...validData, sku: "" };
      expect(() => createInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should accept complex SKU format", () => {
      const data = { ...validData, sku: "BRK-DSC-180-FR-001" };
      expect(() => createInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should reject null values", () => {
      const data = { ...validData, name: null };
      expect(() => createInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject undefined required fields", () => {
      const data = { ...validData, name: undefined };
      expect(() => createInventoryItemSchema.parse(data)).toThrow();
    });

    it("should accept undefined optional fields", () => {
      const data = { ...validData, description: undefined };
      expect(() => createInventoryItemSchema.parse(data)).not.toThrow();
    });
  });

  describe("updateInventoryItemSchema", () => {
    const validData = {
      id: validUUID,
    };

    it("should validate with only id", () => {
      expect(() => updateInventoryItemSchema.parse(validData)).not.toThrow();
    });

    it("should validate with optional fields", () => {
      const data = {
        ...validData,
        name: "Updated Item",
        quantity: 20,
        price: 35.99,
        type: "accessory",
      };
      expect(() => updateInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should reject missing id", () => {
      expect(() => updateInventoryItemSchema.parse({})).toThrow();
    });

    // Nuevos tests comprehensivos
    it("should reject invalid id format", () => {
      const data = { id: invalidUUID };
      expect(() => updateInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject empty id", () => {
      const data = { id: "" };
      expect(() => updateInventoryItemSchema.parse(data)).toThrow();
    });

    it("should accept partial updates with name only", () => {
      const data = { ...validData, name: "New Name" };
      expect(() => updateInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should accept partial updates with quantity only", () => {
      const data = { ...validData, quantity: 50 };
      expect(() => updateInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should accept partial updates with price only", () => {
      const data = { ...validData, price: 99.99 };
      expect(() => updateInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should accept partial updates with type only", () => {
      const data = { ...validData, type: "tool" };
      expect(() => updateInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid name in update", () => {
      const data = { ...validData, name: "A" };
      expect(() => updateInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject negative quantity in update", () => {
      const data = { ...validData, quantity: -1 };
      expect(() => updateInventoryItemSchema.parse(data)).toThrow();
    });

    it("should accept zero quantity in update", () => {
      const data = { ...validData, quantity: 0 };
      expect(() => updateInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should reject negative price in update", () => {
      const data = { ...validData, price: -0.01 };
      expect(() => updateInventoryItemSchema.parse(data)).toThrow();
    });

    it("should accept zero price in update", () => {
      const data = { ...validData, price: 0 };
      expect(() => updateInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid type in update", () => {
      const data = { ...validData, type: "invalid_type" };
      expect(() => updateInventoryItemSchema.parse(data)).toThrow();
    });

    it("should accept all valid type values in update", () => {
      INVENTORY_ITEM_TYPE_VALUES.forEach((type) => {
        const data = { ...validData, type };
        expect(() => updateInventoryItemSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject extra fields in strict mode", () => {
      const data = { ...validData, extra_field: "value" };
      expect(() => updateInventoryItemSchema.parse(data)).toThrow();
    });

    it("should accept optional inventory_id update", () => {
      const data = { ...validData, inventory_id: validUUID };
      expect(() => updateInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should reject invalid inventory_id in update", () => {
      const data = { ...validData, inventory_id: invalidUUID };
      expect(() => updateInventoryItemSchema.parse(data)).toThrow();
    });

    it("should accept complex field combinations", () => {
      const data = {
        ...validData,
        name: "Complex Update",
        description: "Updated description",
        sku: "NEW-SKU-001",
        price: 49.99,
        quantity: 100,
        type: "consumable",
      };
      expect(() => updateInventoryItemSchema.parse(data)).not.toThrow();
    });
  });

  describe("deleteInventoryItemSchema", () => {
    it("should validate correct id", () => {
      const data = { id: validUUID };
      expect(() => deleteInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should reject missing id", () => {
      expect(() => deleteInventoryItemSchema.parse({})).toThrow();
    });

    it("should reject extra fields in strict mode", () => {
      const data = { id: validUUID, extra: "field" };
      expect(() => deleteInventoryItemSchema.parse(data)).toThrow();
    });

    // Nuevos tests comprehensivos
    it("should reject invalid UUID format", () => {
      const data = { id: invalidUUID };
      expect(() => deleteInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject empty id", () => {
      const data = { id: "" };
      expect(() => deleteInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject null id", () => {
      const data = { id: null };
      expect(() => deleteInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject undefined id", () => {
      const data = { id: undefined };
      expect(() => deleteInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject numeric id", () => {
      const data = { id: 123 };
      expect(() => deleteInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject array as id", () => {
      const data = { id: [validUUID] };
      expect(() => deleteInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject object as id", () => {
      const data = { id: { uuid: validUUID } };
      expect(() => deleteInventoryItemSchema.parse(data)).toThrow();
    });

    it("should accept different valid UUID formats", () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "987fcdeb-51a2-43d1-9f23-123456789abc",
        "00000000-0000-0000-0000-000000000000",
      ];
      validUUIDs.forEach((uuid) => {
        const data = { id: uuid };
        expect(() => deleteInventoryItemSchema.parse(data)).not.toThrow();
      });
    });
  });

  describe("queryInventoryItemSchema", () => {
    it("should validate empty query", () => {
      expect(() => queryInventoryItemSchema.parse({})).not.toThrow();
    });

    it("should validate with inventory_id filter", () => {
      const data = { inventory_id: validUUID };
      expect(() => queryInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should validate with type filter", () => {
      const data = { type: "tool" };
      expect(() => queryInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should validate with combined filters", () => {
      const data = {
        inventory_id: validUUID,
        type: "consumable",
      };
      expect(() => queryInventoryItemSchema.parse(data)).not.toThrow();
    });

    // Nuevos tests comprehensivos
    it("should accept undefined values", () => {
      const data = undefined;
      expect(() => queryInventoryItemSchema.parse(data)).not.toThrow();
    });

    it("should reject null values", () => {
      const data = null;
      expect(() => queryInventoryItemSchema.parse(data)).toThrow();
    });

    it("should accept all valid type values in queries", () => {
      INVENTORY_ITEM_TYPE_VALUES.forEach((type) => {
        const data = { type };
        expect(() => queryInventoryItemSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject invalid type in query", () => {
      const data = { type: "invalid_type" };
      expect(() => queryInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject invalid inventory_id format in query", () => {
      const data = { inventory_id: invalidUUID };
      expect(() => queryInventoryItemSchema.parse(data)).toThrow();
    });

    it("should reject empty inventory_id in query", () => {
      const data = { inventory_id: "" };
      expect(() => queryInventoryItemSchema.parse(data)).toThrow();
    });

    it("should ignore unknown fields gracefully", () => {
      const data = { type: "tool", unknown_field: "value" };
      const result = queryInventoryItemSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ type: "tool" });
      }
    });

    it("should handle multiple filters correctly", () => {
      const scenarios = [
        { inventory_id: validUUID },
        { type: "accessory" },
        { inventory_id: validUUID, type: "spare_part" },
      ];
      scenarios.forEach((scenario) => {
        expect(() => queryInventoryItemSchema.parse(scenario)).not.toThrow();
      });
    });

    it("should accept complex type combinations", () => {
      const typeScenarios = [
        { type: "spare_part" },
        { type: "tool" },
        { type: "accessory" },
        { type: "consumable" },
        { type: "other" },
      ];
      typeScenarios.forEach((scenario) => {
        expect(() => queryInventoryItemSchema.parse(scenario)).not.toThrow();
      });
    });

    it("should validate different UUID formats in inventory_id", () => {
      const validUUIDs = [
        "123e4567-e89b-12d3-a456-426614174000",
        "987fcdeb-51a2-43d1-9f23-123456789abc",
        "00000000-0000-0000-0000-000000000000",
      ];
      validUUIDs.forEach((uuid) => {
        const data = { inventory_id: uuid };
        expect(() => queryInventoryItemSchema.parse(data)).not.toThrow();
      });
    });

    it("should reject partial UUID formats", () => {
      const invalidUUIDs = [
        "123e4567-e89b-12d3-a456",
        "123e4567-e89b-12d3",
        "123e4567",
        "not-a-uuid-at-all",
      ];
      invalidUUIDs.forEach((uuid) => {
        const data = { inventory_id: uuid };
        expect(() => queryInventoryItemSchema.parse(data)).toThrow();
      });
    });
  });
});
