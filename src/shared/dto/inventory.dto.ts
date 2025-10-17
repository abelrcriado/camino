/**
 * DTOs para Inventory
 */

export interface Inventory {
  id: string;
  service_point_id: string;
  name: string;
  description?: string;
  quantity: number;
  min_stock: number;
  max_stock?: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryFilters {
  [key: string]: string | undefined;
  service_point_id?: string;
}

export interface CreateInventoryDto {
  service_point_id: string;
  name: string;
  description?: string;
  quantity: number;
  min_stock: number;
  max_stock?: number;
}

export interface UpdateInventoryDto {
  id: string;
  service_point_id?: string;
  name?: string;
  description?: string;
  quantity?: number;
  min_stock?: number;
  max_stock?: number;
}
