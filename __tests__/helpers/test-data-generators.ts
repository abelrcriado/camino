/**
 * Test Data Generators
 * Utilidades para generar datos de test consistentes usando @ngneat/falso
 * 
 * @module test-data-generators
 */

import { 
  rand,
  randUuid,
  randEmail,
  randFullName,
  randPhoneNumber,
  randUrl,
  randNumber,
  randFloat,
  randPastDate,
  randFutureDate,
  randRecentDate,
  randText,
  randStreetName,
  randCity,
  randCountry,
  randLatitude,
  randLongitude,
  randAlphaNumeric,
  randBoolean,
} from "@ngneat/falso";

/**
 * Generadores de datos comunes
 */
export const TestDataGenerators = {
  /**
   * Genera un UUID válido v4
   */
  uuid: (): string => randUuid(),

  /**
   * Genera múltiples UUIDs únicos
   */
  uuids: (count: number): string[] => {
    return Array.from({ length: count }, () => randUuid());
  },

  /**
   * Genera un email válido
   */
  email: (): string => randEmail(),

  /**
   * Genera múltiples emails únicos
   */
  emails: (count: number): string[] => {
    return Array.from({ length: count }, () => randEmail());
  },

  /**
   * Genera un nombre completo
   */
  fullName: (): string => randFullName(),

  /**
   * Genera un número de teléfono
   */
  phone: (): string => randPhoneNumber({ countryCode: "ES" }),

  /**
   * Genera una URL válida
   */
  url: (): string => randUrl(),

  /**
   * Genera un número entero en un rango
   */
  number: (options?: { min?: number; max?: number }): number => {
    return randNumber({ min: options?.min ?? 1, max: options?.max ?? 100 });
  },

  /**
   * Genera un número decimal (float)
   */
  float: (options?: { min?: number; max?: number; fraction?: number }): number => {
    return randFloat({ 
      min: options?.min ?? 1, 
      max: options?.max ?? 100,
      fraction: options?.fraction ?? 2,
    });
  },

  /**
   * Genera una fecha pasada en formato ISO 8601
   */
  pastDate: (): string => {
    return randPastDate().toISOString();
  },

  /**
   * Genera una fecha futura en formato ISO 8601
   */
  futureDate: (): string => {
    return randFutureDate().toISOString();
  },

  /**
   * Genera una fecha reciente en formato ISO 8601
   */
  recentDate: (): string => {
    return randRecentDate().toISOString();
  },

  /**
   * Genera texto aleatorio
   */
  text: (length?: number): string => {
    return randText({ charCount: length ?? 50 });
  },

  /**
   * Genera una descripción larga
   */
  description: (): string => {
    return randText({ charCount: 200 });
  },

  /**
   * Genera un nombre de calle
   */
  streetName: (): string => randStreetName(),

  /**
   * Genera una dirección completa
   */
  address: (): string => {
    return `${randStreetName()}, ${randCity()}`;
  },

  /**
   * Genera un nombre de ciudad
   */
  city: (): string => randCity(),

  /**
   * Genera un nombre de país
   */
  country: (): string => randCountry(),

  /**
   * Genera una latitud válida
   */
  latitude: (): number => randLatitude(),

  /**
   * Genera una longitud válida
   */
  longitude: (): number => randLongitude(),

  /**
   * Genera una cadena alfanumérica
   */
  alphanumeric: (length: number = 10): string => {
    return randAlphaNumeric({ length }).join("");
  },

  /**
   * Genera un booleano aleatorio
   */
  boolean: (): boolean => randBoolean(),

  /**
   * Selecciona un elemento aleatorio de un array
   */
  oneOf: <T>(items: T[]): T => {
    return rand(items);
  },

  /**
   * Selecciona múltiples elementos aleatorios de un array
   */
  someOf: <T>(items: T[], count: number): T[] => {
    return rand(items, { length: count });
  },
};

/**
 * Generadores específicos para schemas
 */
export const SchemaDataGenerators = {
  /**
   * Genera datos para user schema
   */
  user: {
    id: () => TestDataGenerators.uuid(),
    email: () => TestDataGenerators.email(),
    fullName: () => TestDataGenerators.fullName(),
    phone: () => TestDataGenerators.phone(),
    avatarUrl: () => TestDataGenerators.url(),
    preferredLanguage: () => TestDataGenerators.oneOf(["es", "en", "fr", "de", "pt"]),
    role: () => TestDataGenerators.oneOf(["admin", "manager", "user", "guest", "mechanic"]),
  },

  /**
   * Genera datos para payment schema
   */
  payment: {
    id: () => TestDataGenerators.uuid(),
    userId: () => TestDataGenerators.uuid(),
    bookingId: () => TestDataGenerators.uuid(),
    servicePointId: () => TestDataGenerators.uuid(),
    amount: () => TestDataGenerators.number({ min: 100, max: 50000 }),
    currency: () => "eur",
    paymentMethod: () => TestDataGenerators.oneOf(["card", "bank_transfer", "wallet", "cash"]),
    status: () => TestDataGenerators.oneOf([
      "pending",
      "processing",
      "succeeded",
      "failed",
      "canceled",
      "refunded",
      "partially_refunded",
    ]),
    description: () => TestDataGenerators.text(100),
    metadata: () => ({ key: "value" }),
  },

  /**
   * Genera datos para booking schema
   */
  booking: {
    id: () => TestDataGenerators.uuid(),
    userId: () => TestDataGenerators.uuid(),
    servicePointId: () => TestDataGenerators.uuid(),
    workshopId: () => TestDataGenerators.uuid(),
    serviceType: () => TestDataGenerators.oneOf(["maintenance", "repair", "inspection"]),
    startTime: () => TestDataGenerators.futureDate(),
    endTime: () => TestDataGenerators.futureDate(),
    status: () => TestDataGenerators.oneOf([
      "pending",
      "confirmed",
      "cancelled",
      "completed",
      "no_show",
    ]),
  },

  /**
   * Genera datos para CSP (Camino Service Point) schema
   */
  csp: {
    id: () => TestDataGenerators.uuid(),
    name: () => `Estación ${TestDataGenerators.city()}`,
    latitude: () => TestDataGenerators.latitude(),
    longitude: () => TestDataGenerators.longitude(),
    description: () => TestDataGenerators.description(),
    address: () => TestDataGenerators.address(),
    cspType: () => TestDataGenerators.oneOf([
      "bike_station",
      "repair_shop",
      "rest_area",
      "information_point",
      "accommodation",
    ]),
    openingHours: () => "Lunes a Viernes: 8:00-20:00",
  },

  /**
   * Genera datos para camino schema
   */
  camino: {
    id: () => TestDataGenerators.uuid(),
    nombre: () => `Camino ${TestDataGenerators.oneOf(["Francés", "del Norte", "Portugués", "Primitivo"])}`,
    codigo: () => TestDataGenerators.alphanumeric(5).toUpperCase(),
    zonaOperativa: () => TestDataGenerators.text(50),
    region: () => TestDataGenerators.text(50),
    estadoOperativo: () => TestDataGenerators.oneOf(["activo", "inactivo", "mantenimiento", "planificado"]),
  },

  /**
   * Genera datos para precio schema
   */
  precio: {
    id: () => TestDataGenerators.uuid(),
    entidadTipo: () => TestDataGenerators.oneOf(["producto", "servicio"]),
    entidadId: () => TestDataGenerators.uuid(),
    precio: () => TestDataGenerators.number({ min: 100, max: 10000 }),
    precioEuros: () => TestDataGenerators.float({ min: 1, max: 100, fraction: 2 }),
    nivel: () => TestDataGenerators.oneOf(["base", "ubicacion", "service_point"]),
    ubicacionId: () => TestDataGenerators.uuid(),
    servicePointId: () => TestDataGenerators.uuid(),
    fechaInicio: () => TestDataGenerators.futureDate().split("T")[0],
    fechaFin: () => TestDataGenerators.futureDate().split("T")[0],
  },

  /**
   * Genera datos para vending machine schema
   */
  vendingMachine: {
    id: () => TestDataGenerators.uuid(),
    machineId: () => TestDataGenerators.uuid(),
    slotNumber: () => TestDataGenerators.number({ min: 1, max: 50 }),
    productoId: () => TestDataGenerators.uuid(),
    capacidadMaxima: () => TestDataGenerators.number({ min: 5, max: 50 }),
    stockDisponible: () => TestDataGenerators.number({ min: 0, max: 50 }),
    stockReservado: () => TestDataGenerators.number({ min: 0, max: 10 }),
    activo: () => TestDataGenerators.boolean(),
  },
};

/**
 * Generadores para valores inválidos (útil para tests negativos)
 */
export const InvalidDataGenerators = {
  /**
   * Genera un UUID inválido
   */
  invalidUuid: () => "invalid-uuid",

  /**
   * Genera múltiples UUIDs inválidos
   */
  invalidUuids: () => ["not-a-uuid", "123", "abc-def-ghi"],

  /**
   * Genera un email inválido
   */
  invalidEmail: () => "invalid-email",

  /**
   * Genera múltiples emails inválidos
   */
  invalidEmails: () => ["invalid", "no-at-sign", "@nodomain.com", "spaces in email@test.com"],

  /**
   * Genera una URL inválida
   */
  invalidUrl: () => "not-a-url",

  /**
   * Genera un número negativo
   */
  negativeNumber: () => -Math.abs(TestDataGenerators.number()),

  /**
   * Genera texto que excede un límite
   */
  tooLongText: (maxLength: number) => "A".repeat(maxLength + 1),

  /**
   * Genera texto demasiado corto
   */
  tooShortText: (minLength: number) => "A".repeat(Math.max(0, minLength - 1)),
};
