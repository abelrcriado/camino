import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { WorkshopService } from '../../src/services/workshop.service';
import { WorkshopRepository } from '../../src/repositories/workshop.repository';
import type { CreateWorkshopDto, UpdateWorkshopDto, Workshop } from '../../src/dto/workshop.dto';

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
      const createData: CreateWorkshopDto = {
        service_point_id: 'sp-123',
        name: 'Main Workshop',
        description: 'Primary bike workshop',
      };

      const createdWorkshop: Workshop = {
        id: 'workshop-123',
        service_point_id: 'sp-123',
        name: 'Main Workshop',
        description: 'Primary bike workshop',
        capacity: undefined,
        
        services_offered: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

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
      const updateData: UpdateWorkshopDto = {
        id: 'workshop-1',
        name: 'Updated Workshop Name',
        capacity: 10,
      };

      const updatedWorkshop: Workshop = {
        id: 'workshop-1',
        service_point_id: 'sp-123',
        name: 'Updated Workshop Name',
        description: 'Bike workshop',
        capacity: 10,
        
        services_offered: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockRepository.update.mockResolvedValue({
        data: [updatedWorkshop],
        error: null,
      });

      const result = await service.updateWorkshop(updateData);

      expect(result).toEqual(updatedWorkshop);
      expect(mockRepository.update).toHaveBeenCalledWith('workshop-1', {
        name: 'Updated Workshop Name',
        capacity: 10,
      });
    });
  });

  describe('findByServicePoint', () => {
    it('should return workshops for service point', async () => {
      const mockWorkshops: Workshop[] = [
        {
          id: 'workshop-1',
          service_point_id: 'sp-123',
          name: 'Workshop 1',
          description: 'First workshop',
          capacity: undefined,
          
          services_offered: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'workshop-2',
          service_point_id: 'sp-123',
          name: 'Workshop 2',
          description: 'Second workshop',
          capacity: undefined,
          
          services_offered: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockRepository.findByServicePoint.mockResolvedValue({
        data: mockWorkshops,
        error: null,
      });

      const result = await service.findByServicePoint('sp-123');

      expect(result).toEqual(mockWorkshops);
      expect(result).toHaveLength(2);
      expect(mockRepository.findByServicePoint).toHaveBeenCalledWith('sp-123');
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

      await expect(service.findByServicePoint('sp-123')).rejects.toThrow('Database error');
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
