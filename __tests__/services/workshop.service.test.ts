import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { WorkshopService } from '@/api/services/workshop.service';
import { WorkshopRepository } from '@/api/repositories/workshop.repository';
import type { UpdateWorkshopDto } from '@/shared/dto/workshop.dto';
import { DatabaseError } from '@/api/errors/custom-errors';
import { WorkshopFactory } from '../helpers/factories';

describe('WorkshopService', () => {
  let service: WorkshopService;
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
      findByServicePoint: jest.fn() as jest.Mock,
    };
    
    service = new WorkshopService(mockRepository as WorkshopRepository);
  });

  describe('createWorkshop', () => {
    it('should create workshop successfully', async () => {
      const createData = WorkshopFactory.createDto();
      const createdWorkshop = WorkshopFactory.create(createData);

      mockRepository.create.mockResolvedValue({
        data: [createdWorkshop],
        error: null,
      });

      const result = await service.createWorkshop(createData);

      expect(result).toEqual(createdWorkshop);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('updateWorkshop', () => {
    it('should update workshop successfully', async () => {
      const workshopId = 'workshop-test-id';
      const updateData: UpdateWorkshopDto = {
        id: workshopId,
        name: 'Updated Workshop Name',
        capacity: 10,
      };

      const updatedWorkshop = WorkshopFactory.create({
        id: workshopId,
        name: 'Updated Workshop Name',
        capacity: 10,
      });

      mockRepository.update.mockResolvedValue({
        data: [updatedWorkshop],
        error: null,
      });

      const result = await service.updateWorkshop(updateData);

      expect(result).toEqual(updatedWorkshop);
      expect(mockRepository.update).toHaveBeenCalledWith(workshopId, {
        name: 'Updated Workshop Name',
        capacity: 10,
      });
    });
  });

  describe('findByServicePoint', () => {
    it('should return workshops for service point', async () => {
      const servicePointId = 'sp-123';
      const mockWorkshops = WorkshopFactory.createMany(2, {
        service_point_id: servicePointId,
      });

      mockRepository.findByServicePoint.mockResolvedValue({
        data: mockWorkshops,
        error: null,
      });

      const result = await service.findByServicePoint(servicePointId);

      expect(result).toEqual(mockWorkshops);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByServicePoint).toHaveBeenCalledWith(
        servicePointId
      );
    });

    it('should return empty array when service point has no workshops', async () => {
      mockRepository.findByServicePoint.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.findByServicePoint('sp-no-workshops');

      expect(result).toEqual([]);
    });

    it('should throw error when repository fails', async () => {
      mockRepository.findByServicePoint.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(service.findByServicePoint('sp-123')).rejects.toThrow(DatabaseError);
    });
  });

  describe('delete (inherited)', () => {
    it('should delete workshop successfully', async () => {
      mockRepository.delete.mockResolvedValue({
        error: null,
      });

      await expect(service.delete('workshop-1')).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith('workshop-1');
    });
  });
});
