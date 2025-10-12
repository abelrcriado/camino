// ============================================================================
// Sprint 3.2: Vending Machine Slots - DTO Layer
// ============================================================================

/**
 * Interface: VendingMachineSlot
 * Representa un slot individual dentro de una máquina vending
 */
export interface VendingMachineSlot {
  id: string;
  machine_id: string;
  slot_number: number;
  producto_id: string | null;
  capacidad_maxima: number;
  stock_disponible: number;
  stock_reservado: number;
  precio_override: number | null; // Centavos
  activo: boolean;
  notas: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface: CreateVendingMachineSlotDto
 * DTO para crear un nuevo slot en una máquina vending
 */
export interface CreateVendingMachineSlotDto {
  machine_id: string;
  slot_number: number;
  producto_id?: string | null;
  capacidad_maxima?: number; // Default: 10
  stock_disponible?: number; // Default: 0
  stock_reservado?: number; // Default: 0
  precio_override?: number | null;
  activo?: boolean; // Default: true
  notas?: string | null;
}

/**
 * Interface: UpdateVendingMachineSlotDto
 * DTO para actualizar un slot existente
 */
export interface UpdateVendingMachineSlotDto {
  id: string;
  producto_id?: string | null;
  capacidad_maxima?: number;
  stock_disponible?: number;
  stock_reservado?: number;
  precio_override?: number | null;
  activo?: boolean;
  notas?: string | null;
}

/**
 * Interface: VendingMachineSlotFilters
 * Filtros para consultas de slots
 */
export interface VendingMachineSlotFilters {
  machine_id?: string;
  slot_number?: number;
  producto_id?: string;
  activo?: boolean;
  stock_bajo?: boolean; // stock_disponible < capacidad_maxima / 2
  sin_producto?: boolean; // producto_id IS NULL
}

/**
 * Interface: SlotReservation
 * DTO para operaciones de reserva de stock
 */
export interface SlotReservation {
  slot_id: string;
  cantidad: number;
}

/**
 * Interface: SlotStockUpdate
 * DTO para actualización de stock
 */
export interface SlotStockUpdate {
  slot_id: string;
  stock_disponible?: number;
  stock_reservado?: number;
}

/**
 * Interface: CreateSlotsForMachineDto
 * DTO para creación masiva de slots
 */
export interface CreateSlotsForMachineDto {
  machine_id: string;
  num_slots: number;
  capacidad_maxima?: number; // Default: 10
}

/**
 * Interface: AssignProductToSlotDto
 * DTO para asignación de producto a slot
 */
export interface AssignProductToSlotDto {
  slot_id: string;
  producto_id: string;
  stock_inicial: number;
}

/**
 * Interface: VendingMachineSlotFull
 * Vista completa de slot con información de máquina y producto
 */
export interface VendingMachineSlotFull extends VendingMachineSlot {
  machine_name: string;
  service_point_id: string;
  machine_status: string;
  politica_reserva: "hard_reservation" | "soft_reservation" | "no_reservation";
  tiempo_expiracion_minutos: number;

  producto_sku: string | null;
  producto_nombre: string | null;
  producto_precio_venta: number | null; // Centavos
  producto_unidad_medida: string | null;
  producto_activo: boolean | null;

  precio_efectivo: number | null; // Centavos (precio_override o producto_precio_venta)
}

/**
 * Interface: SlotStockSummary
 * Resumen de stock de un slot
 */
export interface SlotStockSummary {
  slot_id: string;
  machine_id: string;
  slot_number: number;
  capacidad_maxima: number;
  stock_disponible: number;
  stock_reservado: number;
  stock_total: number; // disponible + reservado
  porcentaje_ocupacion: number; // (stock_total / capacidad_maxima) * 100
  requiere_reposicion: boolean; // stock_total < capacidad_maxima * 0.3
}
