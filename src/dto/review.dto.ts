/**
 * DTOs para Review
 */

export interface Review {
  id: string;
  user_id: string;
  service_point_id?: string;
  workshop_id?: string;
  booking_id?: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewFilters {
  [key: string]: string | number | undefined;
  user_id?: string;
  service_point_id?: string;
  workshop_id?: string;
  rating?: number;
}

export interface CreateReviewDto {
  user_id: string;
  service_point_id?: string;
  workshop_id?: string;
  booking_id?: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewDto {
  id: string;
  rating?: number;
  comment?: string;
}
