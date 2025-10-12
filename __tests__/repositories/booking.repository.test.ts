import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { BookingRepository } from "../../src/repositories/booking.repository";
import {
  Booking,
  CreateBookingDto,
  BookingFilters,
} from "../../src/dto/booking.dto";
import { SupabaseClient } from "@supabase/supabase-js";
import { PaginationParams } from "../../src/types/common.types";

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
  gte: jest.fn(),
  lte: jest.fn(),
  in: jest.fn(),
} as any as SupabaseClient;
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("BookingRepository", () => {
  let repository: BookingRepository;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();

    // Configurar el query builder chain
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.delete.mockReturnValue(mockSupabase);
    mockSupabase.range.mockReturnValue(mockSupabase);
    mockSupabase.order.mockReturnValue(mockSupabase);
    mockSupabase.gte.mockReturnValue(mockSupabase);
    mockSupabase.lte.mockReturnValue(mockSupabase);
    mockSupabase.in.mockReturnValue(mockSupabase);

    repository = new BookingRepository(mockSupabase);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("Constructor", () => {
    it("should initialize with correct table name 'bookings'", () => {
      expect(repository).toBeInstanceOf(BookingRepository);
    });
  });

  describe("findAll with filters", () => {
    it("should find bookings with date range filters", async () => {
      const mockBookings: Booking[] = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          user_id: "user-123",
          service_type: "maintenance",
          start_time: "2024-01-01T10:00:00Z",
          end_time: "2024-01-01T11:00:00Z",
          status: "pending",
          created_at: "2024-01-01T09:00:00Z",
          updated_at: "2024-01-01T09:00:00Z",
        },
      ];

      const filters: BookingFilters = {
        start_date: "2024-01-01T00:00:00Z",
        end_date: "2024-01-01T23:59:59Z",
        user_id: "user-123",
      };

      const pagination: PaginationParams = {
        page: 1,
        limit: 10,
      };

      mockSupabase.order.mockResolvedValue({
        data: mockBookings,
        error: null,
        count: 1,
      });

      const result = await repository.findAll(filters, pagination);

      expect(mockSupabase.from).toHaveBeenCalledWith("bookings");
      expect(mockSupabase.select).toHaveBeenCalledWith("*", { count: "exact" });
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(mockSupabase.gte).toHaveBeenCalledWith(
        "start_time",
        "2024-01-01T00:00:00Z"
      );
      expect(mockSupabase.lte).toHaveBeenCalledWith(
        "end_time",
        "2024-01-01T23:59:59Z"
      );
      expect(mockSupabase.range).toHaveBeenCalledWith(0, 9);
      expect(mockSupabase.order).toHaveBeenCalledWith("start_time", {
        ascending: false,
      });
    });
  });

  describe("findActive", () => {
    it("should find active bookings", async () => {
      const mockBookings: Booking[] = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          user_id: "user-123",
          service_type: "maintenance",
          start_time: "2024-01-01T10:00:00Z",
          end_time: "2024-01-01T11:00:00Z",
          status: "confirmed",
          created_at: "2024-01-01T09:00:00Z",
          updated_at: "2024-01-01T09:00:00Z",
        },
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockBookings,
        error: null,
      });

      const result = await repository.findActive();

      expect(mockSupabase.from).toHaveBeenCalledWith("bookings");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.in).toHaveBeenCalledWith("status", [
        "pending",
        "confirmed",
      ]);
      expect(mockSupabase.order).toHaveBeenCalledWith("start_time", {
        ascending: true,
      });
    });
  });

  describe("findByUserAndStatus", () => {
    it("should find bookings by user and status", async () => {
      const userId = "user-123";
      const status = "completed";

      mockSupabase.order.mockResolvedValue({
        data: [],
        error: null,
      });

      await repository.findByUserAndStatus(userId, status);

      expect(mockSupabase.from).toHaveBeenCalledWith("bookings");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", userId);
      expect(mockSupabase.eq).toHaveBeenCalledWith("status", status);
      expect(mockSupabase.order).toHaveBeenCalledWith("start_time", {
        ascending: false,
      });
    });
  });

  describe("findUpcoming", () => {
    it("should find upcoming bookings with default 7 days", async () => {
      mockSupabase.order.mockResolvedValue({
        data: [],
        error: null,
      });

      await repository.findUpcoming();

      expect(mockSupabase.from).toHaveBeenCalledWith("bookings");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.gte).toHaveBeenCalledWith(
        "start_time",
        expect.any(String)
      );
      expect(mockSupabase.lte).toHaveBeenCalledWith(
        "start_time",
        expect.any(String)
      );
      expect(mockSupabase.in).toHaveBeenCalledWith("status", [
        "pending",
        "confirmed",
      ]);
      expect(mockSupabase.order).toHaveBeenCalledWith("start_time", {
        ascending: true,
      });
    });
  });

  describe("Inherited BaseRepository methods", () => {
    it("should use bookings table name", async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      await repository.findById("123e4567-e89b-12d3-a456-426614174000");
      expect(mockSupabase.from).toHaveBeenCalledWith("bookings");
    });

    it("should call create method correctly", async () => {
      const createData: CreateBookingDto = {
        user_id: "user-123",
        service_type: "maintenance",
        start_time: "2024-01-01T10:00:00Z",
        end_time: "2024-01-01T11:00:00Z",
      };

      mockSupabase.select.mockResolvedValue({
        data: [createData],
        error: null,
      });

      await repository.create(createData);

      expect(mockSupabase.from).toHaveBeenCalledWith("bookings");
      expect(mockSupabase.insert).toHaveBeenCalledWith([createData]);
    });
  });
});
