/**
 * Tests para AuthController
 * 
 * Verifica que todos los handlers HTTP funcionan correctamente:
 * - handleLogin, handleRegister, handleLogout
 * - handleMe, handleUpdateProfile
 * - handleResetPassword, handleChangePassword
 * - handleRefresh, handleVerifyEmail
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createMocks } from "node-mocks-http";
import { AuthController } from "@/api/controllers/auth.controller";
import { AuthService } from "@/api/services/auth.service";
import type { NextApiRequest, NextApiResponse } from "next";
import { UserFactory, generateUUID } from "../helpers/factories";
import type { AuthResponse } from "@/api/dto/auth.dto";

// Mock del logger - MUST be before any imports that use logger
jest.mock("@/config/logger", () => {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };
  return {
    __esModule: true,
    logger: mockLogger,
    default: mockLogger,
  };
});

// Mock de AuthService
jest.mock("@/api/services/auth.service");

// ============================================================================
// Auth-specific test helpers
// ============================================================================

/**
 * Factory para AuthResponse (login/register)
 */
const createMockAuthResponse = (overrides: Partial<AuthResponse> = {}): AuthResponse => {
  const user = UserFactory.create();
  return {
    user,
    session: {
      access_token: `mock_access_token_${generateUUID().slice(0, 8)}`,
      refresh_token: `mock_refresh_token_${generateUUID().slice(0, 8)}`,
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    },
    ...overrides,
  };
};

/**
 * AuthResponse sin sesión (requiere confirmación email)
 */
const createMockAuthResponseNoSession = (): AuthResponse => {
  const user = UserFactory.create();
  return {
    user,
    session: {
      access_token: "",
      refresh_token: "",
      expires_in: 0,
      expires_at: 0,
    },
  };
};

describe("AuthController", () => {
  let controller: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    // Resetear mocks
    jest.clearAllMocks();

    // Crear mock de AuthService
    mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      getCurrentUser: jest.fn(),
      updateProfile: jest.fn(),
      requestPasswordReset: jest.fn(),
      changePassword: jest.fn(),
      refreshToken: jest.fn(),
    } as any;

    // Crear controller con servicio mockeado
    controller = new AuthController(mockAuthService);
  });

  describe("handleLogin", () => {
    it("debe retornar 200 con user y session en login exitoso", async () => {
      const testUser = UserFactory.create();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          email: testUser.email,
          password: "Password123",
        },
      });

      const mockAuthResponse = createMockAuthResponse({
        user: testUser,
      });

      mockAuthService.login.mockResolvedValue(mockAuthResponse as any);

      await controller.handleLogin(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        data: mockAuthResponse,
      });
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: testUser.email,
        password: "Password123",
      });
    });

    it("debe retornar 400 si falta email", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          password: "Password123",
        },
      });

      await controller.handleLogin(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.error).toBe("Errores de validación");
      expect(response.details).toBeDefined();
    });

    it("debe retornar 400 si email es inválido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          email: "invalid-email",
          password: "Password123",
        },
      });

      await controller.handleLogin(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.error).toBe("Errores de validación");
      expect(response.details).toBeDefined();
    });

    it("debe retornar 400 si contraseña es muy corta", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          email: "test@example.com",
          password: "123",
        },
      });

      await controller.handleLogin(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.error).toBe("Errores de validación");
      expect(response.details).toBeDefined();
    });

    it("debe retornar 405 si el método no es POST", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await controller.handleLogin(req, res);

      expect(res._getStatusCode()).toBe(405);
      const response = JSON.parse(res._getData());
      expect(response.error).toContain("Método no permitido");
    });
  });

  describe("handleRegister", () => {
    it("debe retornar 201 con usuario creado en registro exitoso", async () => {
      const testUser = UserFactory.create();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          email: testUser.email,
          password: "Password123",
          nombre: "Nuevo",
          apellidos: "Usuario",
          telefono: "+34600123456",
        },
      });

      const mockAuthResponse = createMockAuthResponseNoSession();
      mockAuthService.register.mockResolvedValue(mockAuthResponse as any);

      await controller.handleRegister(req, res);

      expect(res._getStatusCode()).toBe(201);
      const response = JSON.parse(res._getData());
      expect(response.data).toEqual(mockAuthResponse);
      expect(response.message).toContain("verifica tu email");
      expect(mockAuthService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          email: testUser.email,
          password: "Password123",
          nombre: "Nuevo",
        })
      );
    });

    it("debe retornar 201 con sesión si email ya confirmado", async () => {
      const testUser = UserFactory.create();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          email: testUser.email,
          password: "Password123",
          nombre: "Nuevo",
        },
      });

      const mockAuthResponse = createMockAuthResponse({
        user: testUser,
      });
      mockAuthService.register.mockResolvedValue(mockAuthResponse as any);

      await controller.handleRegister(req, res);

      expect(res._getStatusCode()).toBe(201);
      const response = JSON.parse(res._getData());
      expect(response.data).toEqual(mockAuthResponse);
      expect(response.message).toBeUndefined();
    });

    it("debe retornar 400 si contraseña no cumple requisitos", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          email: "nuevo@example.com",
          password: "password", // Sin mayúsculas ni números
          nombre: "Nuevo",
        },
      });

      await controller.handleRegister(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.error).toBe("Errores de validación");
      expect(response.details).toBeDefined();
    });

    it("debe retornar 400 si nombre es muy corto", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          email: "nuevo@example.com",
          password: "Password123",
          nombre: "A", // Solo 1 carácter
        },
      });

      await controller.handleRegister(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.error).toBe("Errores de validación");
      expect(response.details).toBeDefined();
    });

    it("debe retornar 400 si teléfono es inválido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          email: "nuevo@example.com",
          password: "Password123",
          nombre: "Nuevo",
          telefono: "12345", // Muy corto
        },
      });

      await controller.handleRegister(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.error).toBe("Errores de validación");
      expect(response.details).toBeDefined();
    });

    it("debe retornar 405 si el método no es POST", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await controller.handleRegister(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe("handleLogout", () => {
    it("debe retornar 200 con mensaje de éxito en logout", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
      });

      mockAuthService.logout.mockResolvedValue();

      await controller.handleLogout(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.message).toBe("Sesión cerrada exitosamente");
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it("debe retornar 405 si el método no es POST", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await controller.handleLogout(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe("handleMe - GET", () => {
    it("debe retornar 200 con datos del usuario actual", async () => {
      const testUser = UserFactory.create();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      // Simular que el middleware de auth añadió userId
      (req as any).userId = testUser.id;

      mockAuthService.getCurrentUser.mockResolvedValue(testUser as any);

      await controller.handleMe(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.data).toEqual(testUser);
      expect(mockAuthService.getCurrentUser).toHaveBeenCalledWith(testUser.id);
    });

    it("debe retornar 401 si no hay userId en request", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      // No hay userId (middleware no ejecutado)
      await controller.handleMe(req, res);

      expect(res._getStatusCode()).toBe(401);
      const response = JSON.parse(res._getData());
      expect(response.error).toContain("no autenticado");
    });
  });

  describe("handleMe - PUT (updateProfile)", () => {
    it("debe retornar 200 con perfil actualizado", async () => {
      const testUser = UserFactory.create();
      const { req, res} = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        body: {
          nombre: "Nombre Actualizado",
          telefono: "+34600999888",
        },
      });

      (req as any).userId = testUser.id;

      const mockUpdatedUser = UserFactory.create({
        id: testUser.id,
        full_name: "Nombre Actualizado",
        phone: "+34600999888",
      });

      mockAuthService.updateProfile.mockResolvedValue(mockUpdatedUser as any);

      await controller.handleMe(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.data).toEqual(mockUpdatedUser);
      expect(mockAuthService.updateProfile).toHaveBeenCalledWith(
        testUser.id,
        {
          nombre: "Nombre Actualizado",
          telefono: "+34600999888",
        }
      );
    });

    it("debe retornar 400 si teléfono es inválido", async () => {
      const testUser = UserFactory.create();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        body: {
          telefono: "123", // Muy corto
        },
      });

      (req as any).userId = testUser.id;

      await controller.handleMe(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.error).toBe("Errores de validación");
      expect(response.details).toBeDefined();
    });

    it("debe retornar 401 si no hay userId", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "PUT",
        body: {
          nombre: "Nuevo Nombre",
        },
      });

      await controller.handleMe(req, res);

      expect(res._getStatusCode()).toBe(401);
    });
  });

  describe("handleResetPassword", () => {
    it("debe retornar 200 con mensaje de éxito", async () => {
      const testUser = UserFactory.create();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          email: testUser.email,
        },
      });

      mockAuthService.requestPasswordReset.mockResolvedValue();

      await controller.handleResetPassword(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.message).toContain("email con instrucciones");
      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(
        testUser.email
      );
    });

    it("debe retornar 400 si email es inválido", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          email: "invalid-email",
        },
      });

      await controller.handleResetPassword(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.error).toBe("Errores de validación");
      expect(response.details).toBeDefined();
    });

    it("debe retornar 405 si el método no es POST", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await controller.handleResetPassword(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe("handleChangePassword", () => {
    it("debe retornar 200 con mensaje de éxito", async () => {
      const testUser = UserFactory.create();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          current_password: "OldPassword123",
          new_password: "NewPassword456",
        },
      });

      (req as any).userId = testUser.id;

      mockAuthService.changePassword.mockResolvedValue();

      await controller.handleChangePassword(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.message).toBe("Contraseña actualizada exitosamente");
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        testUser.id,
        "OldPassword123",
        "NewPassword456"
      );
    });

    it("debe retornar 400 si faltan campos requeridos", async () => {
      const testUser = UserFactory.create();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          current_password: "OldPassword123",
        },
      });

      (req as any).userId = testUser.id;

      await controller.handleChangePassword(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("debe retornar 401 si no hay userId", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          current_password: "OldPassword123",
          new_password: "NewPassword456",
        },
      });

      await controller.handleChangePassword(req, res);

      expect(res._getStatusCode()).toBe(401);
    });

    it("debe retornar 405 si el método no es POST", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await controller.handleChangePassword(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe("handleRefresh", () => {
    it("debe retornar 200 con nuevos tokens", async () => {
      const testUser = UserFactory.create();
      const { req, res} = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          refresh_token: `mock_refresh_token_${generateUUID().slice(0, 8)}`,
        },
      });

      const mockAuthResponse = createMockAuthResponse({ user: testUser });

      mockAuthService.refreshToken.mockResolvedValue(mockAuthResponse);

      await controller.handleRefresh(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.data.user).toEqual(testUser);
      expect(response.data.session).toBeDefined();
    });

    it("debe retornar 400 si falta refresh_token", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {},
      });

      await controller.handleRefresh(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("debe retornar 405 si el método no es POST", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
      });

      await controller.handleRefresh(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe("handleVerifyEmail", () => {
    it("debe retornar 200 con mensaje de éxito", async () => {
      const verificationToken = `mock_token_${generateUUID().slice(0, 12)}`;
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {
          token: verificationToken,
        },
      });

      await controller.handleVerifyEmail(req, res);

      expect(res._getStatusCode()).toBe(200);
      const response = JSON.parse(res._getData());
      expect(response.message).toBe("Email verificado exitosamente");
    });

    it("debe retornar 400 si falta token", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {},
      });

      await controller.handleVerifyEmail(req, res);

      expect(res._getStatusCode()).toBe(400);
      const response = JSON.parse(res._getData());
      expect(response.error).toContain("Token de verificación requerido");
    });

    it("debe retornar 400 si token es array en lugar de string", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "GET",
        query: {
          token: ["token1", "token2"], // Array no permitido
        },
      });

      await controller.handleVerifyEmail(req, res);

      expect(res._getStatusCode()).toBe(400);
    });

    it("debe retornar 405 si el método no es GET", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
      });

      await controller.handleVerifyEmail(req, res);

      expect(res._getStatusCode()).toBe(405);
    });
  });

  describe("Error handling", () => {
    it("debe manejar errores del servicio correctamente", async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: "POST",
        body: {
          email: "test@example.com",
          password: "Password123",
        },
      });

      const serviceError = new Error("Credenciales incorrectas");
      mockAuthService.login.mockRejectedValue(serviceError);

      await controller.handleLogin(req, res);

      expect(res._getStatusCode()).toBe(500);
      const response = JSON.parse(res._getData());
      expect(response.error).toBe("Error interno del servidor");
    });
  });
});
