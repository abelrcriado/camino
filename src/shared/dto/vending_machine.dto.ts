/**
 * DTOs para Vending Machine
 */

export interface VendingMachine {
  id: string;
  service_point_id: string;
  name: string;
  description?: string;
  model?: string;
  serial_number?: string;
  status: string;
  capacity?: number;
  current_stock?: number;
  last_refill_date?: string;
  next_maintenance_date?: string;
  total_sales?: number;
  total_revenue?: number;
  configuration?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface VendingMachineFilters {
  [key: string]: string | undefined;
  service_point_id?: string;
  status?: string;
}

export interface CreateVendingMachineDto {
  service_point_id: string;
  name: string;
  description?: string;
  model?: string;
  serial_number?: string;
  status?: string;
  capacity?: number;
  current_stock?: number;
  last_refill_date?: string;
  next_maintenance_date?: string;
  total_sales?: number;
  total_revenue?: number;
  configuration?: Record<string, unknown>;
}

export interface UpdateVendingMachineDto {
  id: string;
  service_point_id?: string;
  name?: string;
  description?: string;
  model?: string;
  serial_number?: string;
  status?: string;
  capacity?: number;
  current_stock?: number;
  last_refill_date?: string;
  next_maintenance_date?: string;
  total_sales?: number;
  total_revenue?: number;
  configuration?: Record<string, unknown>;
}
