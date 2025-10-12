// DTOs para Favorite
export interface Favorite {
  id: string;
  user_id: string;
  service_point_id: string;
  workshop_id?: string;
  created_at?: string;
}

export interface FavoriteFilters {
  user_id?: string;
  service_point_id?: string;
  [key: string]: string | undefined;
}

export interface CreateFavoriteDto {
  user_id: string;
  service_point_id: string;
  workshop_id?: string;
}

export interface UpdateFavoriteDto {
  id: string;
  user_id?: string;
  service_point_id?: string;
  workshop_id?: string;
}
