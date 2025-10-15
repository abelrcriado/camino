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
import { BookingFactory } from "../helpers/factories";

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
      const userId = "user-123";
      const startDate = "2024-01-01T00:00:00Z";
      const endDate = "2024-01-01T23:59:59Z";
      
      const mockBookings = BookingFactory.createMany(1, {
        user_id: userId,
        status: "pending",
      });

      const filters: BookingFilters = {
        start_date: startDate,
        end_date: endDate,
        user_id: userId,
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
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", userId);
      expect(mockSupabase.gte).toHaveBeenCalledWith(
        "start_time",
        startDate
      );
      expect(mockSupabase.lte).toHaveBeenCalledWith(
        "end_time",
        endDate
      );
      expect(mockSupabase.range).toHaveBeenCalledWith(0, 9);
      expect(mockSupabase.order).toHaveBeenCalledWith("start_time", {
        ascending: false,
      });
    });
  });

  describe("findActive", () => {
    it("should find active bookings", async () => {
      const mockBookings = BookingFactory.createMany(1, {
        status: "confirmed",
      });

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
      const mockBooking = BookingFactory.create();
      mockSupabase.single.mockResolvedValue({ data: mockBooking, error: null });

      await repository.findById(mockBooking.id);
      expect(mockSupabase.from).toHaveBeenCalledWith("bookings");
    });

    it("should call create method correctly", async () => {
      const createData = BookingFactory.createDto();

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
