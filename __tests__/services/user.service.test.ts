import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { UserService } from "../../src/services/user.service";
import { UserRepository } from "../../src/repositories/user.repository";
import {
  ConflictError,
  DatabaseError,
  NotFoundError,
} from "../../src/errors/custom-errors";
import type {
  CreateUserDto,
  UpdateUserDto,
  User,
} from "../../src/dto/user.dto";

describe("UserService", () => {
  let service: UserService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Crear mock del repository
    mockRepository = {
      findAll: jest.fn() as jest.Mock,
      findById: jest.fn() as jest.Mock,
      create: jest.fn() as jest.Mock,
      update: jest.fn() as jest.Mock,
      delete: jest.fn() as jest.Mock,
      findByEmail: jest.fn() as jest.Mock,
      findByRole: jest.fn() as jest.Mock,
    };

    service = new UserService(mockRepository as UserRepository);
  });

  // ============================================================================
  // Tests heredados de BaseService
  // ============================================================================

  describe("findAll (inherited)", () => {
    it("should return paginated users", async () => {
      const mockUsers = [
        { id: "1", email: "user1@example.com", role: "user" },
        { id: "2", email: "user2@example.com", role: "admin" },
      ];

      mockRepository.findAll.mockResolvedValue({
        data: mockUsers,
        error: undefined,
        count: 2,
      });

      const result = await service.findAll({}, { page: 1, limit: 10 });

      expect(result.data).toEqual(mockUsers);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe("findById (inherited)", () => {
    it("should return user when found", async () => {
      const mockUser = {
        id: "test-id",
        email: "test@example.com",
        role: "user",
      };
      mockRepository.findById.mockResolvedValue({
        data: mockUser,
        error: undefined,
      });

      const result = await service.findById("test-id");

      expect(result).toEqual(mockUser);
    });

    it("should throw NotFoundError when user not found", async () => {
      mockRepository.findById.mockResolvedValue({
        data: undefined,
        error: undefined,
      });

      await expect(service.findById("non-existent")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  // ============================================================================
  // Tests específicos de UserService
  // ============================================================================

  describe("createUser", () => {
    it("should create user successfully when email is unique", async () => {
      const createData: CreateUserDto = {
        id: "new-user-id",
        email: "newuser@example.com",
        role: "user",
      };

      const createdUser: User = {
        ...createData,
        full_name: undefined,
        avatar_url: undefined,
        phone: undefined,
        preferred_language: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Simular que el email no existe
      mockRepository.findByEmail.mockResolvedValue({
        data: undefined,
        error: undefined,
      });

      // Simular creación exitosa
      mockRepository.create.mockResolvedValue({
        data: [createdUser],
        error: undefined,
      });

      const result = await service.createUser(createData);

      expect(result).toEqual(createdUser);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        "newuser@example.com"
      );
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });

    it("should throw ConflictError when email already exists", async () => {
      const createData: CreateUserDto = {
        id: "new-user-id",
        email: "existing@example.com",
        role: "user",
      };

      // Simular que el email ya existe
      mockRepository.findByEmail.mockResolvedValue({
        data: { id: "existing-id", email: "existing@example.com" },
        error: undefined,
      });

      await expect(service.createUser(createData)).rejects.toThrow(
        ConflictError
      );
      await expect(service.createUser(createData)).rejects.toThrow(
        "El email ya está registrado"
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should create user when email is not provided", async () => {
      const createData: CreateUserDto = {
        id: "new-user-id",
        role: "user",
      };

      const createdUser: User = {
        id: "new-user-id",
        email: undefined,
        role: "user",
        full_name: undefined,
        avatar_url: undefined,
        phone: undefined,
        preferred_language: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.create.mockResolvedValue({
        data: [createdUser],
        error: undefined,
      });

      const result = await service.createUser(createData);

      expect(result).toEqual(createdUser);
      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const updateData: UpdateUserDto = {
        id: "user-id",
        full_name: "Updated Name",
      };

      const updatedUser: User = {
        id: "user-id",
        email: "user@example.com",
        role: "user",
        full_name: "Updated Name",
        avatar_url: undefined,
        phone: undefined,
        preferred_language: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.update.mockResolvedValue({
        data: [updatedUser],
        error: undefined,
      });

      const result = await service.updateUser(updateData);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.update).toHaveBeenCalledWith("user-id", {
        full_name: "Updated Name",
      });
    });

    it("should update email when it is unique", async () => {
      const updateData: UpdateUserDto = {
        id: "user-id",
        email: "newemail@example.com",
      };

      // Simular que el nuevo email no existe
      mockRepository.findByEmail.mockResolvedValue({
        data: undefined,
        error: undefined,
      });

      const updatedUser: User = {
        id: "user-id",
        email: "newemail@example.com",
        role: "user",
        full_name: undefined,
        avatar_url: undefined,
        phone: undefined,
        preferred_language: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.update.mockResolvedValue({
        data: [updatedUser],
        error: undefined,
      });

      const result = await service.updateUser(updateData);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        "newemail@example.com"
      );
    });

    it("should throw ConflictError when updating to existing email", async () => {
      const updateData: UpdateUserDto = {
        id: "user-id",
        email: "existing@example.com",
      };

      // Simular que el email existe para otro usuario
      mockRepository.findByEmail.mockResolvedValue({
        data: { id: "other-user-id", email: "existing@example.com" },
        error: undefined,
      });

      await expect(service.updateUser(updateData)).rejects.toThrow(
        ConflictError
      );
      await expect(service.updateUser(updateData)).rejects.toThrow(
        "El email ya está registrado"
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should allow updating email to same user current email", async () => {
      const updateData: UpdateUserDto = {
        id: "user-id",
        email: "myemail@example.com",
      };

      // Simular que el email existe pero es del mismo usuario
      mockRepository.findByEmail.mockResolvedValue({
        data: { id: "user-id", email: "myemail@example.com" },
        error: undefined,
      });

      const updatedUser: User = {
        id: "user-id",
        email: "myemail@example.com",
        role: "user",
        full_name: undefined,
        avatar_url: undefined,
        phone: undefined,
        preferred_language: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.update.mockResolvedValue({
        data: [updatedUser],
        error: undefined,
      });

      const result = await service.updateUser(updateData);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.update).toHaveBeenCalled();
    });
  });

  describe("findByEmail", () => {
    it("should return user when found", async () => {
      const mockUser: User = {
        id: "user-id",
        email: "test@example.com",
        role: "user",
        full_name: "Test User",
        avatar_url: undefined,
        phone: undefined,
        preferred_language: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.findByEmail.mockResolvedValue({
        data: mockUser,
        error: undefined,
      });

      const result = await service.findByEmail("test@example.com");

      expect(result).toEqual(mockUser);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
    });

    it("should return null when user not found", async () => {
      mockRepository.findByEmail.mockResolvedValue({
        data: undefined,
        error: null,
      });

      const result = await service.findByEmail("notfound@example.com");

      expect(result).toBeUndefined();
    });

    it("should throw DatabaseError when repository returns error", async () => {
      mockRepository.findByEmail.mockResolvedValue({
        data: undefined,
        error: { message: "Database error" },
      });

      await expect(service.findByEmail("test@example.com")).rejects.toThrow(
        DatabaseError
      );
      await expect(service.findByEmail("test@example.com")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("findByRole", () => {
    it("should return users with specified role", async () => {
      const mockUsers: User[] = [
        {
          id: "admin-1",
          email: "admin1@example.com",
          role: "admin",
          full_name: "Admin One",
          avatar_url: undefined,
          phone: undefined,
          preferred_language: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "admin-2",
          email: "admin2@example.com",
          role: "admin",
          full_name: "Admin Two",
          avatar_url: undefined,
          phone: undefined,
          preferred_language: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByRole.mockResolvedValue({
        data: mockUsers,
        error: undefined,
      });

      const result = await service.findByRole("admin");

      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByRole).toHaveBeenCalledWith("admin");
    });

    it("should return empty array when no users found", async () => {
      mockRepository.findByRole.mockResolvedValue({
        data: undefined,
        error: undefined,
      });

      const result = await service.findByRole("manager");

      expect(result).toEqual([]);
    });

    it("should throw DatabaseError when repository returns error", async () => {
      mockRepository.findByRole.mockResolvedValue({
        data: undefined,
        error: { message: "Query failed" },
      });

      await expect(service.findByRole("admin")).rejects.toThrow(DatabaseError);
      await expect(service.findByRole("admin")).rejects.toThrow("Query failed");
    });
  });

  describe("delete (inherited)", () => {
    it("should delete user successfully", async () => {
      mockRepository.delete.mockResolvedValue({
        error: undefined,
      });

      await expect(service.delete("user-id")).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith("user-id");
    });
  });
});
