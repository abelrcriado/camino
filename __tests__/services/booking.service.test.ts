import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { BookingService } from '../../src/services/booking.service';
import { BookingRepository } from '../../src/repositories/booking.repository';
import type { CreateBookingDto, Booking } from '../../src/dto/booking.dto';
import { DatabaseError } from '../../src/errors/custom-errors';

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
      const createData: CreateBookingDto = {
        user_id: 'user-123',
        service_point_id: 'sp-123',
        service_type: 'repair',
        start_time: '2025-06-15T10:00:00Z',
        end_time: '2025-06-15T11:00:00Z',
        notes: 'Brake adjustment needed',
        estimated_cost: 25.00,
      };

      const createdBooking: Booking = {
        id: 'booking-123',
        user_id: 'user-123',
        service_point_id: 'sp-123',
        service_type: 'repair',
        start_time: '2025-06-15T10:00:00Z',
        end_time: '2025-06-15T11:00:00Z',
        status: 'pending',
        notes: 'Brake adjustment needed',
        estimated_cost: 25.00,
        payment_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

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
      const createData: CreateBookingDto = {
        user_id: 'user-123',
        service_type: 'repair',
        start_time: '2025-06-15T12:00:00Z',
        end_time: '2025-06-15T10:00:00Z',
      };

      await expect(service.createBooking(createData)).rejects.toThrow(
        'Start time must be before end time'
      );
    });

    it('should throw error with invalid date format', async () => {
      const createData: CreateBookingDto = {
        user_id: 'user-123',
        service_type: 'repair',
        start_time: 'invalid-date',
        end_time: '2025-06-15T11:00:00Z',
      };

      await expect(service.createBooking(createData)).rejects.toThrow(
        'Invalid date format'
      );
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking', async () => {
      const cancelledBooking: Booking = {
        id: 'booking-1',
        user_id: 'user-123',
        service_type: 'repair',
        start_time: '2025-06-15T10:00:00Z',
        end_time: '2025-06-15T11:00:00Z',
        status: 'cancelled',
        payment_status: 'pending',
      };

      mockRepository.update.mockResolvedValue({
        data: [cancelledBooking],
        error: null,
      });

      const result = await service.cancelBooking('booking-1');

      expect(result.status).toBe('cancelled');
    });
  });

  describe('confirmBooking', () => {
    it('should confirm booking', async () => {
      const confirmedBooking: Booking = {
        id: 'booking-1',
        user_id: 'user-123',
        service_type: 'repair',
        start_time: '2025-06-15T10:00:00Z',
        end_time: '2025-06-15T11:00:00Z',
        status: 'confirmed',
        payment_status: 'pending',
      };

      mockRepository.update.mockResolvedValue({
        data: [confirmedBooking],
        error: null,
      });

      const result = await service.confirmBooking('booking-1');

      expect(result.status).toBe('confirmed');
    });
  });

  describe('completeBooking', () => {
    it('should complete booking with actual cost', async () => {
      const completedBooking: Booking = {
        id: 'booking-1',
        user_id: 'user-123',
        service_type: 'repair',
        start_time: '2025-06-15T10:00:00Z',
        end_time: '2025-06-15T11:00:00Z',
        status: 'completed',
        actual_cost: 35.50,
        payment_status: 'paid',
      };

      mockRepository.update.mockResolvedValue({
        data: [completedBooking],
        error: null,
      });

      const result = await service.completeBooking('booking-1', 35.50);

      expect(result.status).toBe('completed');
      expect(result.actual_cost).toBe(35.50);
    });
  });

  describe('findActiveBookings', () => {
    it('should return active bookings', async () => {
      const mockActiveBookings: Booking[] = [
        {
          id: 'booking-1',
          user_id: 'user-123',
          service_type: 'repair',
          start_time: '2025-06-15T10:00:00Z',
          end_time: '2025-06-15T11:00:00Z',
          status: 'confirmed',
          payment_status: 'pending',
        },
      ];

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
      const mockUserBookings: Booking[] = [
        {
          id: 'booking-1',
          user_id: 'user-123',
          service_type: 'repair',
          start_time: '2025-06-15T10:00:00Z',
          end_time: '2025-06-15T11:00:00Z',
          status: 'confirmed',
          payment_status: 'pending',
        },
      ];

      mockRepository.findByUserAndStatus.mockResolvedValue({
        data: mockUserBookings,
        error: null,
      });

      const result = await service.findByUserAndStatus('user-123', 'confirmed');

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
      const mockUpcomingBookings: Booking[] = [
        {
          id: 'booking-1',
          user_id: 'user-123',
          service_type: 'repair',
          start_time: '2025-06-16T10:00:00Z',
          end_time: '2025-06-16T11:00:00Z',
          status: 'confirmed',
          payment_status: 'pending',
        },
      ];

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
