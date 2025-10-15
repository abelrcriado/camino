import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { UserService } from "../../src/services/user.service";
import { UserRepository } from "../../src/repositories/user.repository";
import {
  ConflictError,
  DatabaseError,
  NotFoundError,
} from "../../src/errors/custom-errors";
import type { UpdateUserDto } from "../../src/dto/user.dto";
import { UserFactory } from "../helpers/factories";

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
      const mockUsers = UserFactory.createMany(2);

      mockRepository.findAll.mockResolvedValue({
        data: mockUsers,
        error: undefined,
        count: mockUsers.length,
      });

      const result = await service.findAll({}, { page: 1, limit: 10 });

      expect(result.data).toEqual(mockUsers);
      expect(result.pagination.total).toBe(mockUsers.length);
    });
  });

  describe("findById (inherited)", () => {
    it("should return user when found", async () => {
      const mockUser = UserFactory.create();
      
      mockRepository.findById.mockResolvedValue({
        data: mockUser,
        error: undefined,
      });

      const result = await service.findById(mockUser.id);

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
      const createData = UserFactory.createDto();
      const createdUser = UserFactory.create({
        ...createData,
      });

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
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(createData.email);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });

    it("should throw ConflictError when email already exists", async () => {
      const createData = UserFactory.createDto();
      const existingUser = UserFactory.create({ email: createData.email });

      // Simular que el email ya existe
      mockRepository.findByEmail.mockResolvedValue({
        data: existingUser,
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
      const createData = UserFactory.createDto({ email: undefined });
      const createdUser = UserFactory.create({
        email: undefined,
        role: createData.role,
      });

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
      const existingUser = UserFactory.create();
      const updateData: UpdateUserDto = {
        id: existingUser.id,
        full_name: "Updated Name",
      };

      const updatedUser = UserFactory.create({
        ...existingUser,
        full_name: "Updated Name",
      });

      mockRepository.update.mockResolvedValue({
        data: [updatedUser],
        error: undefined,
      });

      const result = await service.updateUser(updateData);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.update).toHaveBeenCalledWith(existingUser.id, {
        full_name: "Updated Name",
      });
    });

    it("should update email when it is unique", async () => {
      const existingUser = UserFactory.create();
      const newEmail = "newemail@example.com";
      const updateData: UpdateUserDto = {
        id: existingUser.id,
        email: newEmail,
      };

      // Simular que el nuevo email no existe
      mockRepository.findByEmail.mockResolvedValue({
        data: undefined,
        error: undefined,
      });

      const updatedUser = UserFactory.create({
        ...existingUser,
        email: newEmail,
      });

      mockRepository.update.mockResolvedValue({
        data: [updatedUser],
        error: undefined,
      });

      const result = await service.updateUser(updateData);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(newEmail);
    });

    it("should throw ConflictError when updating to existing email", async () => {
      const user1Id = "user-1-id";
      const user2Id = "user-2-id";
      const conflictEmail = "conflict@example.com";
      
      const user2 = UserFactory.create({ id: user2Id, email: conflictEmail });
      
      const updateData: UpdateUserDto = {
        id: user1Id,
        email: conflictEmail, // Intentar usar el email de otro usuario
      };

      // Simular que el email existe para otro usuario (con ID diferente)
      mockRepository.findByEmail.mockResolvedValue({
        data: user2,
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
      const existingUser = UserFactory.create();
      const updateData: UpdateUserDto = {
        id: existingUser.id,
        email: existingUser.email, // Mismo email
      };

      // Simular que el email existe pero es del mismo usuario
      mockRepository.findByEmail.mockResolvedValue({
        data: existingUser,
        error: undefined,
      });

      const updatedUser = UserFactory.create(existingUser);

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
      const mockUser = UserFactory.create();

      mockRepository.findByEmail.mockResolvedValue({
        data: mockUser,
        error: undefined,
      });

      const result = await service.findByEmail(mockUser.email!);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
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
      const mockUsers = UserFactory.createMany(2, { role: "admin" });

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
