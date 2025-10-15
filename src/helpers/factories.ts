/**
 * Test Data Factories con @ngneat/falso
 * 
 * Este archivo proporciona factories para generar datos de test consistentes
 * y realistas usando @ngneat/falso. Cada factory sigue el patrón:
 * 
 * 1. Genera datos válidos por defecto
 * 2. Acepta overrides para personalización
 * 3. Retorna datos que pasan validaciones Zod
 * 
 * Uso:
 * ```typescript
 * const user = UserFactory.create({ email: 'custom@example.com' });
 * const booking = BookingFactory.create();
 * ```
 */

import {
  randUuid,
  randEmail,
  randFullName,
  randAvatar,
  randPhoneNumber,
  randPastDate,
  randFutureDate,
  randRecentDate,
  randAlphaNumeric,
  randNumber,
  randProductName,
  randProductDescription,
  randCompanyName,
  randImg,
  randWord,
  randText,
  randCity,
  randState,
} from '@ngneat/falso';

import type { User, CreateUserDto } from '@/dto/user.dto';
import type { Booking, CreateBookingDto } from '@/dto/booking.dto';
import type { Payment, CreatePaymentDto } from '@/dto/payment.dto';
import type { Producto, CreateProductoDto } from '@/dto/producto.dto';
import type { VentaApp, CreateVentaAppDto } from '@/dto/venta_app.dto';
import type { VendingMachine, CreateVendingMachineDto } from '@/dto/vending_machine.dto';
import type { VendingMachineSlot, CreateVendingMachineSlotDto } from '@/dto/vending_machine_slot.dto';
import type { Camino, CreateCaminoDto } from '@/dto/camino.dto';
import type { Workshop, CreateWorkshopDto } from '@/dto/workshop.dto';
import type { Review, CreateReviewDto } from '@/dto/review.dto';
import type { Inventory, CreateInventoryDto } from '@/dto/inventory.dto';
import type { InventoryItem, CreateInventoryItemDto } from '@/dto/inventory_item.dto';
import type { Favorite, CreateFavoriteDto } from '@/dto/favorite.dto';
import type { TallerManager, CreateTallerManagerDto } from '@/dto/taller_manager.dto';
import type { Report, CreateReportDto } from '@/dto/report.dto';

// ============================================================================
// Counter for unique values
// ============================================================================

let counter = 0;
export const resetCounter = () => { counter = 0; };
const nextId = () => ++counter;

// ============================================================================
// Factory Helpers
// ============================================================================

/**
 * Genera UUID v4 válido
 */
export const generateUUID = (): string => randUuid();

/**
 * Genera fecha ISO 8601
 */
export const generateISODate = (options?: { past?: boolean; future?: boolean }): string => {
  if (options?.past) return randPastDate().toISOString();
  if (options?.future) return randFutureDate().toISOString();
  return randRecentDate().toISOString();
};

/**
 * Genera SKU único
 */
export const generateSKU = (): string => {
  return `SKU-${randAlphaNumeric({ length: 8 }).join('').toUpperCase()}`;
};

/**
 * Genera código de retiro (6 dígitos)
 */
export const generateCodigoRetiro = (): string => {
  return randNumber({ min: 100000, max: 999999 }).toString();
};

/**
 * Helpers de datos random
 */
const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals = 2): number => 
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randomPrice = (min = 5, max = 100): number => randomFloat(min, max, 2);

// ============================================================================
// User Factory
// ============================================================================

export const UserFactory = {
  /**
   * Crea un User completo (con id, timestamps)
   */
  create(overrides: Partial<User> = {}): User {
    return {
      id: generateUUID(),
      email: randEmail(),
      full_name: randFullName(),
      avatar_url: randAvatar(),
      phone: randPhoneNumber(),
      preferred_language: 'es',
      role: randomElement(['user', 'admin', 'partner']),
      created_at: generateISODate({ past: true }),
      updated_at: generateISODate(),
      ...overrides,
    };
  },

  /**
   * Crea un CreateUserDto (sin id, sin timestamps)
   */
  createDto(overrides: Partial<CreateUserDto> = {}): CreateUserDto {
    return {
      email: randEmail(),
      full_name: randFullName(),
      avatar_url: randAvatar(),
      phone: randPhoneNumber(),
      preferred_language: 'es',
      role: randomElement(['user', 'admin', 'partner']),
      ...overrides,
    };
  },

  /**
   * Crea múltiples users
   */
  createMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => UserFactory.create(overrides));
  },
};

// ============================================================================
// Booking Factory
// ============================================================================

export const BookingFactory = {
  create(overrides: Partial<Booking> = {}): Booking {
    const startTime = new Date(Date.now() + 86400000); // +1 día
    const endTime = new Date(startTime.getTime() + 3600000); // +1 hora

    return {
      id: generateUUID(),
      user_id: generateUUID(),
      service_point_id: generateUUID(),
      service_type: randomElement(['repair', 'maintenance', 'consultation']),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: randomElement(['pending', 'confirmed', 'completed', 'cancelled']),
      notes: `Test booking notes ${nextId()}`,
      estimated_cost: randomFloat(10, 100),
      payment_status: randomElement(['pending', 'paid', 'refunded']),
      created_at: generateISODate({ past: true }),
      updated_at: generateISODate(),
      ...overrides,
    };
  },

  createDto(overrides: Partial<CreateBookingDto> = {}): CreateBookingDto {
    const startTime = new Date(Date.now() + 86400000);
    const endTime = new Date(startTime.getTime() + 3600000);

    return {
      user_id: generateUUID(),
      service_point_id: generateUUID(),
      service_type: randomElement(['repair', 'maintenance', 'consultation']),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      notes: `Test booking notes ${nextId()}`,
      estimated_cost: randomFloat(10, 100),
      ...overrides,
    };
  },

  createMany(count: number, overrides: Partial<Booking> = {}): Booking[] {
    return Array.from({ length: count }, () => BookingFactory.create(overrides));
  },
};

// ============================================================================
// Payment Factory
// ============================================================================

export const PaymentFactory = {
  create(overrides: Partial<Payment> = {}): Payment {
    const amount = randomInt(1000, 10000); // centavos
    const platformFee = Math.round(amount * 0.15);

    return {
      id: generateUUID(),
      booking_id: generateUUID(),
      user_id: generateUUID(),
      service_point_id: generateUUID(),
      amount,
      currency: 'eur',
      status: randomElement(['pending', 'succeeded', 'failed', 'canceled']),
      stripe_payment_intent_id: `pi_${randAlphaNumeric({ length: 24 }).join('')}`,
      stripe_charge_id: null,
      payment_method: randomElement(['card', 'bank_transfer', 'wallet', 'cash']),
      platform_fee: platformFee,
      csp_amount: amount - platformFee,
      description: randText({ charCount: 50 }),
      metadata: {},
      refunded_amount: 0,
      refund_reason: null,
      created_at: generateISODate({ past: true }),
      updated_at: generateISODate(),
      paid_at: null,
      refunded_at: null,
      ...overrides,
    };
  },

  createDto(overrides: Partial<CreatePaymentDto> = {}): CreatePaymentDto {
    return {
      booking_id: generateUUID(),
      user_id: generateUUID(),
      service_point_id: generateUUID(),
      amount: randomInt(1000, 10000),
      currency: 'eur',
      payment_method: randomElement(['card', 'bank_transfer', 'wallet', 'cash']),
      description: randText({ charCount: 50 }),
      metadata: {},
      ...overrides,
    };
  },

  createMany(count: number, overrides: Partial<Payment> = {}): Payment[] {
    return Array.from({ length: count }, () => PaymentFactory.create(overrides));
  },
};

// ============================================================================
// Producto Factory
// ============================================================================

export const ProductoFactory = {
  create(overrides: Partial<Producto> = {}): Producto {
    const costoBase = randomPrice(5, 50);
    const precioVenta = randomPrice(costoBase + 5, costoBase + 30);

    return {
      id: generateUUID(),
      sku: generateSKU(),
      nombre: randProductName(),
      descripcion: randProductDescription(),
      category_id: generateUUID(),
      marca: randCompanyName(),
      costo_base: costoBase,
      precio_venta: precioVenta,
      imagenes: [randImg()],
      tags: [randWord(), randWord()],
      is_active: true,
      created_at: generateISODate({ past: true }),
      updated_at: generateISODate(),
      ...overrides,
    };
  },

  createDto(overrides: Partial<CreateProductoDto> = {}): CreateProductoDto {
    const costoBase = randomPrice(5, 50);
    const precioVenta = randomPrice(costoBase + 5, costoBase + 30);

    return {
      sku: generateSKU(),
      nombre: randProductName(),
      descripcion: randProductDescription(),
      category_id: generateUUID(),
      marca: randCompanyName(),
      costo_base: costoBase,
      precio_venta: precioVenta,
      imagenes: [randImg()],
      tags: [randWord(), randWord()],
      is_active: true,
      ...overrides,
    };
  },

  createMany(count: number, overrides: Partial<Producto> = {}): Producto[] {
    return Array.from({ length: count }, () => ProductoFactory.create(overrides));
  },
};

// ============================================================================
// VentaApp Factory
// ============================================================================

export const VentaAppFactory = {
  create(overrides: Partial<VentaApp> = {}): VentaApp {
    const cantidad = randomInt(1, 5);
    const precioUnitario = randomInt(100, 1000);
    const precioTotal = cantidad * precioUnitario;

    return {
      id: generateUUID(),
      user_id: generateUUID(),
      producto_id: generateUUID(),
      producto_nombre: randProductName(),
      slot_id: generateUUID(),
      cantidad,
      precio_unitario: precioUnitario,
      precio_total: precioTotal,
      estado: randomElement(['reservado', 'pagado', 'completado', 'cancelado']),
      codigo_retiro: generateCodigoRetiro(),
      fecha_creacion: generateISODate({ past: true }),
      fecha_expiracion: generateISODate({ future: true }),
      created_at: generateISODate({ past: true }),
      ...overrides,
    };
  },

  createDto(overrides: Partial<CreateVentaAppDto> = {}): CreateVentaAppDto {
    return {
      user_id: generateUUID(),
      producto_id: generateUUID(),
      slot_id: generateUUID(),
      cantidad: randomInt(1, 5),
      ...overrides,
    };
  },

  createMany(count: number, overrides: Partial<VentaApp> = {}): VentaApp[] {
    return Array.from({ length: count }, () => VentaAppFactory.create(overrides));
  },
};

// ============================================================================
// VendingMachine Factory
// ============================================================================

export const VendingMachineFactory = {
  create(overrides: Partial<VendingMachine> = {}): VendingMachine {
    return {
      id: generateUUID(),
      service_point_id: generateUUID(),
      name: `Vending Machine ${nextId()}`,
      description: randText({ charCount: 50 }),
      model: `Model-${randAlphaNumeric({ length: 6 }).join('').toUpperCase()}`,
      serial_number: `SN${randAlphaNumeric({ length: 10 }).join('').toUpperCase()}`,
      status: randomElement(['active', 'inactive', 'maintenance', 'out_of_service']),
      capacity: randomInt(20, 100),
      current_stock: randomInt(0, 50),
      last_refill_date: generateISODate({ past: true }),
      next_maintenance_date: generateISODate({ future: true }),
      total_sales: randomInt(0, 1000),
      total_revenue: randomFloat(0, 10000),
      configuration: {},
      created_at: generateISODate({ past: true }),
      updated_at: generateISODate(),
      ...overrides,
    };
  },

  createDto(overrides: Partial<CreateVendingMachineDto> = {}): CreateVendingMachineDto {
    return {
      service_point_id: generateUUID(),
      name: `Vending Machine ${nextId()}`,
      description: randText({ charCount: 50 }),
      model: `Model-${randAlphaNumeric({ length: 6 }).join('').toUpperCase()}`,
      serial_number: `SN${randAlphaNumeric({ length: 10 }).join('').toUpperCase()}`,
      status: randomElement(['active', 'inactive', 'maintenance', 'out_of_service']),
      capacity: randomInt(20, 100),
      current_stock: randomInt(0, 50),
      last_refill_date: generateISODate({ past: true }),
      next_maintenance_date: generateISODate({ future: true }),
      ...overrides,
    };
  },

  createMany(count: number, overrides: Partial<VendingMachine> = {}): VendingMachine[] {
    return Array.from({ length: count }, () => VendingMachineFactory.create(overrides));
  },
};

// ============================================================================
// VendingMachineSlot Factory
// ============================================================================

export const VendingMachineSlotFactory = {
  create(overrides: Partial<VendingMachineSlot> = {}): VendingMachineSlot {
    const capacidadMaxima = randomInt(5, 20);
    const stockDisponible = randomInt(0, capacidadMaxima);

    return {
      id: generateUUID(),
      machine_id: generateUUID(),
      slot_number: randomInt(1, 50),
      producto_id: generateUUID(),
      capacidad_maxima: capacidadMaxima,
      stock_disponible: stockDisponible,
      stock_reservado: randomInt(0, 3),
      precio_override: randomInt(100, 1000),
      activo: true,
      notas: randText({ charCount: 50 }),
      created_at: generateISODate({ past: true }),
      updated_at: generateISODate(),
      ...overrides,
    };
  },

  createDto(overrides: Partial<CreateVendingMachineSlotDto> = {}): CreateVendingMachineSlotDto {
    return {
      machine_id: generateUUID(),
      slot_number: randomInt(1, 50),
      producto_id: generateUUID(),
      capacidad_maxima: randomInt(5, 20),
      stock_disponible: randomInt(0, 10),
      stock_reservado: 0,
      precio_override: randomInt(100, 1000),
      activo: true,
      notas: randText({ charCount: 50 }),
      ...overrides,
    };
  },

  createMany(count: number, overrides: Partial<VendingMachineSlot> = {}): VendingMachineSlot[] {
    return Array.from({ length: count }, () => VendingMachineSlotFactory.create(overrides));
  },
};

// ============================================================================
// Camino Factory
// ============================================================================

export const CaminoFactory = {
  create(overrides: Partial<Camino> = {}): Camino {
    return {
      id: generateUUID(),
      nombre: `Camino ${randWord()}`,
      codigo: `CAM-${randAlphaNumeric({ length: 6 }).join('').toUpperCase()}`,
      descripcion: randText({ charCount: 100 }),
      zona_operativa: randCity(),
      region: randState(),
      estado_operativo: randomElement(['activo', 'inactivo', 'mantenimiento']),
      created_at: generateISODate({ past: true }),
      updated_at: generateISODate(),
      ...overrides,
    };
  },

  createDto(overrides: Partial<CreateCaminoDto> = {}): CreateCaminoDto {
    return {
      nombre: `Camino ${randWord()}`,
      codigo: `CAM-${randAlphaNumeric({ length: 6 }).join('').toUpperCase()}`,
      descripcion: randText({ charCount: 100 }),
      zona_operativa: randCity(),
      region: randState(),
      estado_operativo: randomElement(['activo', 'inactivo', 'mantenimiento']),
      ...overrides,
    };
  },

  createMany(count: number, overrides: Partial<Camino> = {}): Camino[] {
    return Array.from({ length: count }, () => CaminoFactory.create(overrides));
  },
};

// ============================================================================
// Workshop Factory
// ============================================================================

export const WorkshopFactory = {
  create(overrides: Partial<Workshop> = {}): Workshop {
    return {
      id: generateUUID(),
      service_point_id: generateUUID(),
      name: `Workshop ${randCompanyName()}`,
      description: randText({ charCount: 100 }),
      specialties: [randWord(), randWord()],
      certifications: [randWord()],
      contact_phone: randPhoneNumber(),
      contact_email: randEmail(),
      website_url: `https://www.${randCompanyName().toLowerCase().replace(/\s/g, '')}.com`,
      capacity: randomInt(5, 50),
      equipment: {},
      average_rating: randomFloat(3, 5, 1),
      total_reviews: randomInt(0, 100),
      created_at: generateISODate({ past: true }),
      updated_at: generateISODate(),
      ...overrides,
    };
  },

  createDto(overrides: Partial<CreateWorkshopDto> = {}): CreateWorkshopDto {
    return {
      service_point_id: generateUUID(),
      name: `Workshop ${randCompanyName()}`,
      description: randText({ charCount: 100 }),
      specialties: [randWord(), randWord()],
      certifications: [randWord()],
      contact_phone: randPhoneNumber(),
      contact_email: randEmail(),
      website_url: `https://www.${randCompanyName().toLowerCase().replace(/\s/g, '')}.com`,
      capacity: randomInt(5, 50),
      equipment: {},
      ...overrides,
    };
  },

  createMany(count: number, overrides: Partial<Workshop> = {}): Workshop[] {
    return Array.from({ length: count }, () => WorkshopFactory.create(overrides));
  },
};

// ============================================================================
// Review Factory
// ============================================================================

export const ReviewFactory = {
  create(overrides: Partial<Review> = {}): Review {
    return {
      id: generateUUID(),
      user_id: generateUUID(),
      service_point_id: generateUUID(),
      booking_id: generateUUID(),
      rating: randomInt(1, 5),
      comment: randText({ charCount: 100 }),
      created_at: generateISODate({ past: true }),
      updated_at: generateISODate(),
      ...overrides,
    };
  },

  createDto(overrides: Partial<CreateReviewDto> = {}): CreateReviewDto {
    return {
      user_id: generateUUID(),
      service_point_id: generateUUID(),
      booking_id: generateUUID(),
      rating: randomInt(1, 5),
      comment: randText({ charCount: 100 }),
      ...overrides,
    };
  },

  createMany(count: number, overrides: Partial<Review> = {}): Review[] {
    return Array.from({ length: count }, () => ReviewFactory.create(overrides));
  },
};

// ============================================================================
// Inventory Factory
// ============================================================================

export const InventoryFactory = {
  create(overrides: Partial<Inventory> = {}): Inventory {
    const maxStock = randomInt(50, 200);
    const minStock = randomInt(5, 20);
    const quantity = randomInt(minStock, maxStock);

    return {
      id: generateUUID(),
      service_point_id: generateUUID(),
      name: `Inventory ${randProductName()}`,
      description: randText({ charCount: 50 }),
      quantity,
      min_stock: minStock,
      max_stock: maxStock,
      created_at: generateISODate({ past: true }),
      updated_at: generateISODate(),
      ...overrides,
    };
  },

  createDto(overrides: Partial<CreateInventoryDto> = {}): CreateInventoryDto {
    return {
      service_point_id: generateUUID(),
      name: `Inventory ${randProductName()}`,
      description: randText({ charCount: 50 }),
      quantity: randomInt(10, 100),
      min_stock: randomInt(5, 20),
      max_stock: randomInt(50, 200),
      ...overrides,
    };
  },

  createMany(count: number, overrides: Partial<Inventory> = {}): Inventory[] {
    return Array.from({ length: count }, () => InventoryFactory.create(overrides));
  },
};

// ============================================================================
// InventoryItem Factory
// ============================================================================

export const InventoryItemFactory = {
  create(overrides: Partial<InventoryItem> = {}): InventoryItem {
    return {
      id: generateUUID(),
      inventory_id: generateUUID(),
      name: randProductName(),
      description: randProductDescription(),
      sku: generateSKU(),
      price: randomPrice(5, 500),
      quantity: randomInt(0, 100),
      type: randomElement(['product', 'material', 'tool', 'consumable']),
      created_at: generateISODate({ past: true }),
      updated_at: generateISODate(),
      ...overrides,
    };
  },

  createDto(overrides: Partial<CreateInventoryItemDto> = {}): CreateInventoryItemDto {
    return {
      inventory_id: generateUUID(),
      name: randProductName(),
      description: randProductDescription(),
      sku: generateSKU(),
      price: randomPrice(5, 500),
      quantity: randomInt(0, 100),
      type: randomElement(['product', 'material', 'tool', 'consumable']),
      ...overrides,
    };
  },

  createMany(count: number, overrides: Partial<InventoryItem> = {}): InventoryItem[] {
    return Array.from({ length: count }, () => InventoryItemFactory.create(overrides));
  },
};

// ============================================================================
// Favorite Factory
// ============================================================================

export const FavoriteFactory = {
  create(overrides: Partial<Favorite> = {}): Favorite {
    return {
      id: generateUUID(),
      user_id: generateUUID(),
      service_point_id: generateUUID(),
      workshop_id: Math.random() > 0.5 ? generateUUID() : undefined,
      created_at: generateISODate({ past: true }),
      ...overrides,
    };
  },

  createDto(overrides: Partial<CreateFavoriteDto> = {}): CreateFavoriteDto {
    return {
      user_id: generateUUID(),
      service_point_id: generateUUID(),
      workshop_id: Math.random() > 0.5 ? generateUUID() : undefined,
      ...overrides,
    };
  },

  createMany(count: number, overrides: Partial<Favorite> = {}): Favorite[] {
    return Array.from({ length: count }, () => FavoriteFactory.create(overrides));
  },
};

// ============================================================================
// TallerManager Factory
// ============================================================================

export const TallerManagerFactory = {
  create(overrides: Partial<TallerManager> = {}): TallerManager {
    return {
      id: generateUUID(),
      workshop_id: generateUUID(),
      user_id: generateUUID(),
      name: randFullName(),
      email: randEmail(),
      phone: randPhoneNumber({ countryCode: 'ES' }),
      role: randomElement(['manager', 'admin', 'mechanic', 'owner']),
      created_at: generateISODate({ past: true }),
      updated_at: generateISODate(),
      ...overrides,
    };
  },

  createDto(overrides: Partial<CreateTallerManagerDto> = {}): CreateTallerManagerDto {
    return {
      workshop_id: generateUUID(),
      user_id: generateUUID(),
      name: randFullName(),
      email: randEmail(),
      phone: randPhoneNumber({ countryCode: 'ES' }),
      role: randomElement(['manager', 'admin', 'mechanic', 'owner']),
      ...overrides,
    };
  },

  createMany(count: number, overrides: Partial<TallerManager> = {}): TallerManager[] {
    return Array.from({ length: count }, () => TallerManagerFactory.create(overrides));
  },
};

// ============================================================================
// Report Factory
// ============================================================================

export const ReportFactory = {
  create(overrides: Partial<Report> = {}): Report {
    return {
      id: generateUUID(),
      type: randomElement(['booking', 'revenue', 'maintenance', 'inventory', 'customer']),
      title: `Report: ${randProductName()}`,
      description: randText({ charCount: 100 }),
      service_point_id: Math.random() > 0.3 ? generateUUID() : undefined,
      user_id: generateUUID(),
      status: randomElement(['draft', 'generated', 'sent', 'archived']),
      data: { metrics: { total: randomInt(1, 1000) } },
      generated_at: generateISODate({ past: true }),
      created_at: generateISODate({ past: true }),
      updated_at: generateISODate(),
      ...overrides,
    };
  },

  createDto(overrides: Partial<CreateReportDto> = {}): CreateReportDto {
    return {
      type: randomElement(['booking', 'revenue', 'maintenance', 'inventory', 'customer']),
      title: `Report: ${randProductName()}`,
      description: randText({ charCount: 100 }),
      service_point_id: Math.random() > 0.3 ? generateUUID() : undefined,
      user_id: generateUUID(),
      status: randomElement(['draft', 'generated', 'sent', 'archived']),
      data: { metrics: { total: randomInt(1, 1000) } },
      generated_at: generateISODate({ past: true }),
      ...overrides,
    };
  },

  createMany(count: number, overrides: Partial<Report> = {}): Report[] {
    return Array.from({ length: count }, () => ReportFactory.create(overrides));
  },
};
