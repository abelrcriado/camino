/**
 * DTOs para Inventory Items
 */

export interface InventoryItem {
  id: string;
  inventory_id: string;
  name: string;
  description?: string;
  sku?: string;
  price?: number;
  quantity: number;
  type?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItemFilters {
  [key: string]: string | undefined;
  inventory_id?: string;
  type?: string;
}

export interface CreateInventoryItemDto {
  inventory_id: string;
  name: string;
  description?: string;
  sku?: string;
  price?: number;
  quantity: number;
  type?: string;
}

export interface UpdateInventoryItemDto {
  id: string;
  inventory_id?: string;
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  quantity?: number;
  type?: string;
}
