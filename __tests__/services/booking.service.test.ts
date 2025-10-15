import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { BookingService } from '../../src/services/booking.service';
import { BookingRepository } from '../../src/repositories/booking.repository';
import type { CreateBookingDto } from '../../src/dto/booking.dto';
import { DatabaseError } from '../../src/errors/custom-errors';
import {
  BookingFactory,
  generateValidDateRange,
  generateInvalidDateRange,
  generateInvalidDateFormat,
} from '../helpers/factories';

describe('BookingService', () => {
  let service: BookingService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRepository = {
      findAll: jest.fn() as jest.Mock,
      findById: jest.fn() as jest.Mock,
      create: jest.fn() as jest.Mock,
      update: jest.fn() as jest.Mock,
      delete: jest.fn() as jest.Mock,
      findActive: jest.fn() as jest.Mock,
      findByUserAndStatus: jest.fn() as jest.Mock,
      findUpcoming: jest.fn() as jest.Mock,
    };
    
    service = new BookingService(mockRepository as BookingRepository);
  });

  describe('createBooking', () => {
    it('should create booking with valid times', async () => {
      const validDates = generateValidDateRange();
      const createData = BookingFactory.createDto({
        ...validDates,
      });

      const createdBooking = BookingFactory.create({
        ...createData,
        status: 'pending',
        payment_status: 'pending',
      });

      mockRepository.create.mockResolvedValue({
        data: [createdBooking],
        error: null,
      });

      const result = await service.createBooking(createData);

      expect(result).toEqual(createdBooking);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createData,
        status: 'pending',
        payment_status: 'pending',
      });
    });

    it('should throw error when start_time is after end_time', async () => {
      const invalidDates = generateInvalidDateRange();
      const createData: CreateBookingDto = {
        ...BookingFactory.createDto(),
        ...invalidDates,
      };

      await expect(service.createBooking(createData)).rejects.toThrow(
        'Start time must be before end time'
      );
    });

    it('should throw error with invalid date format', async () => {
      const createData: CreateBookingDto = {
        ...BookingFactory.createDto(),
        start_time: generateInvalidDateFormat(),
        end_time: generateValidDateRange().end_time,
      };

      await expect(service.createBooking(createData)).rejects.toThrow(
        'Invalid date format'
      );
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking', async () => {
      const bookingId = 'booking-test-id';
      const cancelledBooking = BookingFactory.create({
        id: bookingId,
        status: 'cancelled',
      });

      mockRepository.update.mockResolvedValue({
        data: [cancelledBooking],
        error: null,
      });

      const result = await service.cancelBooking(bookingId);

      expect(result.status).toBe('cancelled');
    });
  });

  describe('confirmBooking', () => {
    it('should confirm booking', async () => {
      const bookingId = 'booking-test-id';
      const confirmedBooking = BookingFactory.create({
        id: bookingId,
        status: 'confirmed',
      });

      mockRepository.update.mockResolvedValue({
        data: [confirmedBooking],
        error: null,
      });

      const result = await service.confirmBooking(bookingId);

      expect(result.status).toBe('confirmed');
    });
  });

  describe('completeBooking', () => {
    it('should complete booking with actual cost', async () => {
      const bookingId = 'booking-test-id';
      const actualCost = 35.50;
      const completedBooking = BookingFactory.create({
        id: bookingId,
        status: 'completed',
        actual_cost: actualCost,
        payment_status: 'paid',
      });

      mockRepository.update.mockResolvedValue({
        data: [completedBooking],
        error: null,
      });

      const result = await service.completeBooking(bookingId, actualCost);

      expect(result.status).toBe('completed');
      expect(result.actual_cost).toBe(actualCost);
    });
  });

  describe('findActiveBookings', () => {
    it('should return active bookings', async () => {
      const mockActiveBookings = BookingFactory.createMany(1, {
        status: 'confirmed',
      });

      mockRepository.findActive.mockResolvedValue({
        data: mockActiveBookings,
        error: null,
      });

      const result = await service.findActiveBookings();

      expect(result).toEqual(mockActiveBookings);
    });

    it('should return empty array when no active bookings', async () => {
      mockRepository.findActive.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findActiveBookings();

      expect(result).toEqual([]);
    });

    it('should throw error when repository fails', async () => {
      mockRepository.findActive.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(service.findActiveBookings()).rejects.toThrow(DatabaseError);
    });
  });

  describe('findByUserAndStatus', () => {
    it('should return bookings for user with specific status', async () => {
      const userId = 'user-123';
      const status = 'confirmed';
      const mockUserBookings = BookingFactory.createMany(1, {
        user_id: userId,
        status,
      });

      mockRepository.findByUserAndStatus.mockResolvedValue({
        data: mockUserBookings,
        error: null,
      });

      const result = await service.findByUserAndStatus(userId, status);

      expect(result).toEqual(mockUserBookings);
    });

    it('should return empty array when no bookings match', async () => {
      mockRepository.findByUserAndStatus.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByUserAndStatus('user-123', 'completed');

      expect(result).toEqual([]);
    });

    it('should throw error when repository fails', async () => {
      mockRepository.findByUserAndStatus.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(service.findByUserAndStatus('user-123', 'pending')).rejects.toThrow(DatabaseError);
    });
  });

  describe('findUpcomingBookings', () => {
    it('should return upcoming bookings with default days', async () => {
      const mockUpcomingBookings = BookingFactory.createMany(1, {
        status: 'confirmed',
      });

      mockRepository.findUpcoming.mockResolvedValue({
        data: mockUpcomingBookings,
        error: null,
      });

      const result = await service.findUpcomingBookings();

      expect(result).toEqual(mockUpcomingBookings);
      expect(mockRepository.findUpcoming).toHaveBeenCalledWith(7);
    });

    it('should return empty array when no upcoming bookings', async () => {
      mockRepository.findUpcoming.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findUpcomingBookings();

      expect(result).toEqual([]);
    });

    it('should throw error when repository fails', async () => {
      mockRepository.findUpcoming.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(service.findUpcomingBookings()).rejects.toThrow(DatabaseError);
    });
  });

  describe('delete (inherited)', () => {
    it('should delete booking successfully', async () => {
      mockRepository.delete.mockResolvedValue({
        error: null,
      });

      await expect(service.delete('booking-1')).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith('booking-1');
    });
  });
});
