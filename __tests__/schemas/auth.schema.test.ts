/**
 * Tests para auth.schema.ts
 * 
 * Valida todos los schemas de Zod para autenticación
 */

import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
} from "@/api/schemas/auth.schema";

describe("Auth Schemas", () => {
  describe("loginSchema", () => {
    it("debe validar email y password correctos", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("test@example.com");
        expect(result.data.password).toBe("password123");
      }
    });

    it("debe rechazar email inválido", () => {
      const invalidData = {
        email: "not-an-email",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("inválido");
      }
    });

    it("debe rechazar password muy corto", () => {
      const invalidData = {
        email: "test@example.com",
        password: "12345",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("al menos 6 caracteres");
      }
    });

    it("debe rechazar campos faltantes", () => {
      const invalidData = {
        email: "test@example.com",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("password");
      }
    });
  });

  describe("registerSchema", () => {
    it("debe validar registro completo con todos los campos", () => {
      const validData = {
        email: "nuevo@example.com",
        password: "Password123",
        nombre: "Juan",
        apellidos: "Pérez García",
        telefono: "+34600123456",
        rol: "user" as const,
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("nuevo@example.com");
        expect(result.data.nombre).toBe("Juan");
        expect(result.data.rol).toBe("user");
      }
    });

    it("debe validar registro mínimo sin campos opcionales", () => {
      const validData = {
        email: "nuevo@example.com",
        password: "Password123",
        nombre: "Juan",
        apellidos: "Pérez",
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("debe rechazar contraseña sin mayúscula", () => {
      const invalidData = {
        email: "nuevo@example.com",
        password: "password123",
        nombre: "Juan",
        apellidos: "Pérez",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("mayúscula");
      }
    });

    it("debe rechazar contraseña sin minúscula", () => {
      const invalidData = {
        email: "nuevo@example.com",
        password: "PASSWORD123",
        nombre: "Juan",
        apellidos: "Pérez",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("minúscula");
      }
    });

    it("debe rechazar contraseña sin número", () => {
      const invalidData = {
        email: "nuevo@example.com",
        password: "PasswordABC",
        nombre: "Juan",
        apellidos: "Pérez",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("número");
      }
    });

    it("debe rechazar nombre muy corto", () => {
      const invalidData = {
        email: "nuevo@example.com",
        password: "Password123",
        nombre: "J",
        apellidos: "Pérez",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("al menos 2 caracteres");
      }
    });

    it("debe rechazar teléfono inválido", () => {
      const invalidData = {
        email: "nuevo@example.com",
        password: "Password123",
        nombre: "Juan",
        apellidos: "Pérez",
        telefono: "123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("inválido");
      }
    });

    it("debe rechazar rol inválido", () => {
      const invalidData = {
        email: "nuevo@example.com",
        password: "Password123",
        nombre: "Juan",
        apellidos: "Pérez",
        rol: "superadmin",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateProfileSchema", () => {
    it("debe validar actualización completa", () => {
      const validData = {
        nombre: "Juan Actualizado",
        apellidos: "Pérez García",
        telefono: "+34600999888",
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.nombre).toBe("Juan Actualizado");
      }
    });

    it("debe validar actualización parcial (solo nombre)", () => {
      const validData = {
        nombre: "Juan",
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("debe validar actualización parcial (solo teléfono)", () => {
      const validData = {
        telefono: "+34600111222",
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("debe validar objeto vacío (sin cambios)", () => {
      const validData = {};

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("debe rechazar nombre muy corto", () => {
      const invalidData = {
        nombre: "J",
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("debe validar email correcto", () => {
      const validData = {
        email: "reset@example.com",
      };

      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("reset@example.com");
      }
    });

    it("debe rechazar email inválido", () => {
      const invalidData = {
        email: "not-an-email",
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("inválido");
      }
    });

    it("debe rechazar email faltante", () => {
      const invalidData = {};

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("changePasswordSchema", () => {
    it("debe validar cambio de contraseña con datos correctos", () => {
      const validData = {
        current_password: "OldPassword123",
        new_password: "NewPassword456",
      };

      const result = changePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.current_password).toBe("OldPassword123");
        expect(result.data.new_password).toBe("NewPassword456");
      }
    });

    it("debe rechazar nueva contraseña sin mayúscula", () => {
      const invalidData = {
        current_password: "OldPassword123",
        new_password: "newpassword456",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("mayúscula");
      }
    });

    it("debe rechazar nueva contraseña muy corta", () => {
      const invalidData = {
        current_password: "OldPassword123",
        new_password: "New1",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("al menos");
      }
    });

    it("debe rechazar campos faltantes", () => {
      const invalidData = {
        current_password: "OldPassword123",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("new_password");
      }
    });
  });

  describe("verifyEmailSchema", () => {
    it("debe validar token correcto", () => {
      const validData = {
        token: "valid-verification-token-123",
      };

      const result = verifyEmailSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.token).toBe("valid-verification-token-123");
      }
    });

    it("debe rechazar token vacío", () => {
      const invalidData = {
        token: "",
      };

      const result = verifyEmailSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("vacío");
      }
    });

    it("debe rechazar token faltante", () => {
      const invalidData = {};

      const result = verifyEmailSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
