import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { UserRepository } from "../../src/repositories/user.repository";
import { User, CreateUserDto } from "../../src/dto/user.dto";
import { SupabaseClient } from "@supabase/supabase-js";

// Mock Supabase client con métodos de query builder
/* eslint-disable @typescript-eslint/no-explicit-any */
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  range: jest.fn(),
  order: jest.fn(),
} as any as SupabaseClient;
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("UserRepository", () => {
  let repository: UserRepository;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();

    // Configurar el query builder chain
    (mockSupabase.from as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.select as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.eq as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.insert as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.update as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.delete as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.range as jest.Mock).mockReturnValue(mockSupabase);
    (mockSupabase.order as jest.Mock).mockReturnValue(mockSupabase);

    repository = new UserRepository(mockSupabase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with correct table name 'profiles'", () => {
      expect(repository).toBeInstanceOf(UserRepository);
    });
  });

  describe("findByEmail", () => {
    it("should find user by email successfully", async () => {
      const mockUser: User = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        full_name: "Test User",
        email: "test@example.com",
        role: "user",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      mockSupabase.single.mockResolvedValue({ data: mockUser, error: null });

      const result = await repository.findByEmail("test@example.com");

      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("email", "test@example.com");
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual({ data: mockUser, error: null });
    });

    it("should return error when user not found", async () => {
      const mockError = { message: "User not found", code: "PGRST116" };
      mockSupabase.single.mockResolvedValue({ data: null, error: mockError });

      const result = await repository.findByEmail("notfound@example.com");

      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith(
        "email",
        "notfound@example.com"
      );
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual({ data: null, error: mockError });
    });
  });

  describe("findByRole", () => {
    it("should find users by role successfully", async () => {
      const mockUsers: User[] = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          full_name: "Admin User",
          email: "admin@example.com",
          role: "admin",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];

      // Mock para el método findByRole (no usa single)
      mockSupabase.eq.mockResolvedValue({ data: mockUsers, error: null });

      const result = await repository.findByRole("admin");

      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("role", "admin");
      expect(result).toEqual({
        data: mockUsers,
        error: null,
      });
    });
  });

  describe("Inherited BaseRepository methods", () => {
    it("should use profiles table name", async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      // Test que verifica que usa la tabla correcta
      await repository.findById("123e4567-e89b-12d3-a456-426614174000");
      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
    });

    it("should call create method correctly", async () => {
      const createData: CreateUserDto = {
        full_name: "New User",
        email: "new@example.com",
        role: "user",
      };

      mockSupabase.select.mockResolvedValue({
        data: [createData],
        error: null,
      });

      await repository.create(createData);

      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockSupabase.insert).toHaveBeenCalledWith([createData]);
    });
  });
});
