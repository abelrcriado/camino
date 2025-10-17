/**
 * Enums centralizados de la aplicación
 *
 * Centraliza todos los valores enum para:
 * - Una sola fuente de verdad
 * - Autocomplete en IDE
 * - Fácil mantenimiento
 * - Type-safety en TypeScript
 */

// ============================================================================
// USER ROLES
// ============================================================================

export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
  GUEST: "guest",
  MECHANIC: "mechanic",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_VALUES = Object.values(USER_ROLES);

// ============================================================================
// USER STATUS
// ============================================================================

export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  SUSPENDED: "suspended",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const USER_STATUS_VALUES = Object.values(USER_STATUS);

// ============================================================================
// BOOKING STATUS
// ============================================================================

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  NO_SHOW: "no_show",
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUS_VALUES = Object.values(BOOKING_STATUS);

// ============================================================================
// PAYMENT STATUS (Alineado con Stripe Payment Intent statuses)
// ============================================================================

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  CANCELED: "canceled",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);

// ============================================================================
// PAYMENT METHOD (Alineado con DTO de Payment)
// ============================================================================

export const PAYMENT_METHOD = {
  CARD: "card",
  BANK_TRANSFER: "bank_transfer",
  WALLET: "wallet",
  CASH: "cash",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHOD);

// ============================================================================
// REPORT STATUS
// ============================================================================

export const REPORT_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];

export const REPORT_STATUS_VALUES = Object.values(REPORT_STATUS);

// ============================================================================
// REPORT TYPES
// ============================================================================

export const REPORT_TYPES = {
  MAINTENANCE: "maintenance",
  INCIDENT: "incident",
  USAGE: "usage",
  FINANCIAL: "financial",
  INVENTORY: "inventory",
  OTHER: "other",
} as const;

export type ReportType = (typeof REPORT_TYPES)[keyof typeof REPORT_TYPES];

export const REPORT_TYPE_VALUES = Object.values(REPORT_TYPES);

// ============================================================================
// VENDING MACHINE STATUS
// ============================================================================

export const VENDING_MACHINE_STATUS = {
  OPERATIONAL: "operational",
  MAINTENANCE: "maintenance",
  OUT_OF_SERVICE: "out_of_service",
  LOW_STOCK: "low_stock",
} as const;

export type VendingMachineStatus =
  (typeof VENDING_MACHINE_STATUS)[keyof typeof VENDING_MACHINE_STATUS];

export const VENDING_MACHINE_STATUS_VALUES = Object.values(
  VENDING_MACHINE_STATUS
);

// ============================================================================
// PARTNER TYPES
// ============================================================================

export const PARTNER_TYPES = {
  SPONSOR: "sponsor",
  COLLABORATOR: "collaborator",
  SUPPLIER: "supplier",
  SERVICE_PROVIDER: "service_provider",
  OTHER: "other",
} as const;

export type PartnerType = (typeof PARTNER_TYPES)[keyof typeof PARTNER_TYPES];

export const PARTNER_TYPE_VALUES = Object.values(PARTNER_TYPES);

// ============================================================================
// INVENTORY ITEM TYPES
// ============================================================================

export const INVENTORY_ITEM_TYPES = {
  SPARE_PART: "spare_part",
  TOOL: "tool",
  ACCESSORY: "accessory",
  CONSUMABLE: "consumable",
  OTHER: "other",
} as const;

export type InventoryItemType =
  (typeof INVENTORY_ITEM_TYPES)[keyof typeof INVENTORY_ITEM_TYPES];

export const INVENTORY_ITEM_TYPE_VALUES = Object.values(INVENTORY_ITEM_TYPES);

// ============================================================================
// LANGUAGES
// ============================================================================

export const LANGUAGES = {
  ES: "es",
  EN: "en",
  FR: "fr",
  DE: "de",
  PT: "pt",
} as const;

export type Language = (typeof LANGUAGES)[keyof typeof LANGUAGES];

export const LANGUAGE_VALUES = Object.values(LANGUAGES);

// ============================================================================
// CSP TYPES
// ============================================================================

export const CSP_TYPES = {
  BIKE_STATION: "bike_station",
  WORKSHOP: "workshop",
  REST_AREA: "rest_area",
  INFO_POINT: "info_point",
  WATER_POINT: "water_point",
  CAMPING: "camping",
  HOTEL: "hotel",
  OTHER: "other",
} as const;

export type CSPType = (typeof CSP_TYPES)[keyof typeof CSP_TYPES];

export const CSP_TYPE_VALUES = Object.values(CSP_TYPES);

// ============================================================================
// CSP STATUS
// ============================================================================

export const CSP_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  MAINTENANCE: "maintenance",
  CLOSED: "closed",
} as const;

export type CSPStatus = (typeof CSP_STATUS)[keyof typeof CSP_STATUS];

export const CSP_STATUS_VALUES = Object.values(CSP_STATUS);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Verifica si un valor es un valor válido de un enum
 *
 * @example
 * if (isValidEnumValue(status, BOOKING_STATUS_VALUES)) {
 *   // status es válido
 * }
 */
export function isValidEnumValue<T>(
  value: unknown,
  enumValues: readonly T[]
): value is T {
  return enumValues.includes(value as T);
}

/**
 * Obtiene todos los valores de un enum como array
 *
 * @example
 * const statusOptions = getEnumValues(BOOKING_STATUS);
 * // ["pending", "confirmed", "cancelled", "completed", "no_show"]
 */
export function getEnumValues<T extends Record<string, string>>(
  enumObj: T
): string[] {
  return Object.values(enumObj);
}

/**
 * Obtiene todas las claves de un enum como array
 *
 * @example
 * const statusKeys = getEnumKeys(BOOKING_STATUS);
 * // ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]
 */
export function getEnumKeys<T extends Record<string, string>>(
  enumObj: T
): Array<keyof T> {
  return Object.keys(enumObj) as Array<keyof T>;
}
