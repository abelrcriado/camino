// DTOs para User/Profile
export interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  preferred_language?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserFilters {
  email?: string;
  role?: string;
  [key: string]: string | undefined;
}

export interface CreateUserDto {
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  preferred_language?: string;
  role?: string;
}

export interface UpdateUserDto {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  preferred_language?: string;
  role?: string;
}
