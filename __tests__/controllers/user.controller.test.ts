import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { UserController } from "../../src/controllers/user.controller";
import { UserService } from "../../src/services/user.service";
import type { NextApiRequest, NextApiResponse } from "next";
import { UserFactory } from "../helpers/factories";

describe("UserController", () => {
  let controller: UserController;
  let mockService: jest.Mocked<UserService>;
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock service methods
    mockService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByRole: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    controller = new UserController(mockService);

    // Mock request and response
    mockReq = {
      method: "GET",
      query: {},
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
  });

  describe("handle - Method Routing", () => {
    it("should route GET requests to getAll", async () => {
      mockReq.method = "GET";
      mockService.findAll.mockResolvedValue({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      });

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should route POST requests to create", async () => {
      mockReq.method = "POST";
      const reqBody = UserFactory.createDto({ role: "user" });
      const userId = UserFactory.create().id; // Generate a valid UUID
      mockReq.body = {
        id: userId,
        ...reqBody,
      };

      const createdUser = UserFactory.create({
        id: userId,
        email: reqBody.email,
        full_name: reqBody.full_name,
        role: "user",
      });

      mockService.createUser.mockResolvedValue(createdUser);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createUser).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should route PUT requests to update", async () => {
      mockReq.method = "PUT";
      const existingUser = UserFactory.create();
      mockReq.body = {
        id: existingUser.id,
        full_name: "Updated Name",
      };

      const updatedUser = UserFactory.create({
        id: existingUser.id,
        full_name: "Updated Name",
      });

      mockService.updateUser.mockResolvedValue(updatedUser);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.updateUser).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should route DELETE requests to delete", async () => {
      mockReq.method = "DELETE";
      const userId = UserFactory.create().id;
      mockReq.body = {
        id: userId,
      };

      mockService.delete.mockResolvedValue(undefined);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.delete).toHaveBeenCalledWith(userId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Usuario eliminado correctamente",
      });
    });

    it("should return 405 for unsupported methods", async () => {
      mockReq.method = "PATCH";

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.setHeader).toHaveBeenCalledWith("Allow", [
        "GET",
        "POST",
        "PUT",
        "DELETE",
      ]);
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Method PATCH Not Allowed",
      });
    });
  });

  describe("GET - Find All Users", () => {
    it("should return all users when no filters provided", async () => {
      mockReq.method = "GET";
      const mockUsers = UserFactory.createMany(2, { role: "user" });

      mockService.findAll.mockResolvedValue({
        data: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          total: mockUsers.length,
          totalPages: 1,
          hasMore: false,
        },
      });

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
    });

    it("should filter by email when email query param provided", async () => {
      mockReq.method = "GET";
      const mockUser = UserFactory.create({ email: "test@example.com" });
      mockReq.query = { email: mockUser.email };

      mockService.findByEmail.mockResolvedValue(mockUser);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([mockUser]);
    });

    it("should return empty array when email not found", async () => {
      mockReq.method = "GET";
      mockReq.query = { email: "notfound@example.com" };

      mockService.findByEmail.mockResolvedValue(null);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it("should filter by role when role query param provided", async () => {
      mockReq.method = "GET";
      mockReq.query = { role: "admin" };

      const mockAdmins = UserFactory.createMany(2, { role: "admin" });

      mockService.findByRole.mockResolvedValue(mockAdmins);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.findByRole).toHaveBeenCalledWith("admin");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockAdmins);
    });
  });

  describe("POST - Create User", () => {
    it("should create user with valid data", async () => {
      mockReq.method = "POST";
      const reqBody = UserFactory.createDto({
        email: "newuser@example.com",
        full_name: "New User",
        phone: "+34123456789",
        role: "user",
      });
      mockReq.body = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        ...reqBody,
      };

      const createdUser = UserFactory.create({
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: reqBody.email,
        full_name: reqBody.full_name,
        phone: reqBody.phone,
        role: reqBody.role,
      });

      mockService.createUser.mockResolvedValue(createdUser);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "newuser@example.com",
          full_name: "New User",
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith([createdUser]);
    });

    it("should return 400 for invalid email format", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "invalid-email",
        full_name: "Test User",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createUser).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Errores de validación",
          details: expect.any(Array),
        })
      );
    });

    it("should return 400 for invalid UUID format", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        id: "invalid-uuid",
        email: "test@example.com",
        full_name: "Test User",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createUser).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 for invalid avatar URL", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "test@example.com",
        avatar_url: "not-a-valid-url",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.createUser).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("PUT - Update User", () => {
    it("should update user with valid data", async () => {
      mockReq.method = "PUT";
      const existingUser = UserFactory.create();
      mockReq.body = {
        id: existingUser.id,
        full_name: "Updated Name",
        phone: "+34987654321",
      };

      const updatedUser = UserFactory.create({
        id: existingUser.id,
        full_name: "Updated Name",
        phone: "+34987654321",
      });

      mockService.updateUser.mockResolvedValue(updatedUser);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingUser.id,
          full_name: "Updated Name",
          phone: "+34987654321",
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([updatedUser]);
    });

    it("should return 400 when validation fails", async () => {
      mockReq.method = "PUT";
      mockReq.body = {
        full_name: "Updated Name",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.updateUser).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Errores de validación",
          details: expect.any(Array),
        })
      );
    });

    it("should return 400 for validation failure", async () => {
      mockReq.method = "PUT";
      mockReq.body = {
        id: "not-a-uuid",
        full_name: "Updated Name",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.updateUser).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Errores de validación",
          details: expect.any(Array),
        })
      );
    });
  });

  describe("DELETE - Delete User", () => {
    it("should delete user with valid id", async () => {
      mockReq.method = "DELETE";
      const userId = UserFactory.create().id;
      mockReq.body = {
        id: userId,
      };

      mockService.delete.mockResolvedValue(undefined);

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.delete).toHaveBeenCalledWith(userId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Usuario eliminado correctamente",
      });
    });

    it("should return 400 for validation failure", async () => {
      mockReq.method = "DELETE";
      mockReq.body = {};

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.delete).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Errores de validación",
          details: expect.any(Array),
        })
      );
    });

    it("should return 400 for invalid UUID format", async () => {
      mockReq.method = "DELETE";
      mockReq.body = {
        id: "invalid-uuid",
      };

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockService.delete).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Errores de validación",
          details: expect.any(Array),
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should return 404 when user not found", async () => {
      mockReq.method = "GET";
      mockReq.query = { email: "notfound@example.com" };

      mockService.findByEmail.mockRejectedValue(new Error("User not found"));

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "User not found",
      });
    });

    it("should return 400 for validation errors (not service errors)", async () => {
      mockReq.method = "POST";
      mockReq.body = {
        id: "invalid-uuid", // This will cause validation error
        email: "test@example.com",
        full_name: "Test User",
      };

      // Service shouldn't be called due to validation error
      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Errores de validación",
          details: expect.any(Array),
        })
      );
    });

    it("should return 500 for unexpected errors", async () => {
      mockReq.method = "GET";

      mockService.findAll.mockRejectedValue(
        new Error("Database connection failed")
      );

      await controller.handle(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });
});
