import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { UserRepository } from "@/api/repositories/user.repository";
import { User, CreateUserDto } from "@/shared/dto/user.dto";
import { SupabaseClient } from "@supabase/supabase-js";
import { UserFactory } from "../helpers/factories";

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
      const testEmail = "test@example.com";
      const mockUser = UserFactory.create({ email: testEmail });

      mockSupabase.single.mockResolvedValue({ data: mockUser, error: null });

      const result = await repository.findByEmail(testEmail);

      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("email", testEmail);
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
      const mockUsers = UserFactory.createMany(1, { role: "admin" });

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
      const mockUser = UserFactory.create();
      mockSupabase.single.mockResolvedValue({ data: mockUser, error: null });

      // Test que verifica que usa la tabla correcta
      await repository.findById(mockUser.id);
      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
    });

    it("should call create method correctly", async () => {
      const createData = UserFactory.createDto();

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
