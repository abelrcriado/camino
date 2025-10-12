// Service para lógica de negocio de Review
import { BaseService } from "./base.service";
import { ReviewRepository } from "../repositories/review.repository";
import type {
  Review,
  CreateReviewDto,
  UpdateReviewDto,
} from "../dto/review.dto";

export class ReviewService extends BaseService<Review> {
  private reviewRepository: ReviewRepository;

  constructor(repository?: ReviewRepository) {
    const repo = repository || new ReviewRepository();
    super(repo);
    this.reviewRepository = repo;
  }

  /**
   * Crear una nueva review
   */
  async createReview(data: CreateReviewDto): Promise<Review> {
    return this.create(data);
  }

  /**
   * Actualizar una review
   */
  async updateReview(data: UpdateReviewDto): Promise<Review> {
    const { id, ...updates } = data;
    return this.update(id, updates);
  }

  /**
   * Buscar reviews por usuario
   */
  async findByUser(userId: string): Promise<Review[]> {
    const { data, error } = await this.reviewRepository.findByUser(userId);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Buscar reviews por service point
   */
  async findByServicePoint(servicePointId: string): Promise<Review[]> {
    const { data, error } = await this.reviewRepository.findByServicePoint(
      servicePointId
    );

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Buscar reviews por workshop
   */
  async findByWorkshop(workshopId: string): Promise<Review[]> {
    const { data, error } = await this.reviewRepository.findByWorkshop(
      workshopId
    );

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  /**
   * Buscar reviews por rating
   */
  async findByRating(rating: number): Promise<Review[]> {
    const { data, error } = await this.reviewRepository.findByRating(rating);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}
