/**
 * Test Utilities: Supabase Mock Builder
 *
 * Proporciona funciones helper para crear mocks consistentes del Supabase query builder.
 *
 * @see docs/TEST_FIXES_SPRINT_5.1.md para estrategias de mocking
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { jest } from "@jest/globals";

/**
 * Configuración para un mock de query chain de Supabase
 */
export interface SupabaseQueryMockConfig {
  /** Métodos de la cadena que deben retornar this (ej: select, eq, order) */
  chainMethods?: string[];
  /** Método final que resuelve la promesa con data/error */
  finalMethod: string;
  /** Data a retornar en la respuesta final */
  data?: any;
  /** Error a retornar en la respuesta final */
  error?: any;
  /** Count para queries con paginación */
  count?: number | null;
  /** Si true, el método final rechaza la promesa en lugar de resolverla con error */
  rejectPromise?: boolean;
}

/**
 * Configuración para queries con múltiples llamadas al mismo método
 */
export interface MultiCallMethodConfig {
  /** Nombre del método que se llama múltiples veces */
  method: string;
  /** Número de veces que retorna this antes de resolver */
  returnThisCount: number;
}

/**
 * Crea un mock básico de Supabase query builder con encadenamiento
 *
 * @example
 * ```typescript
 * const mockQuery = createSupabaseQueryMock({
 *   chainMethods: ['select', 'eq'],
 *   finalMethod: 'order',
 *   data: [mockSlot],
 *   error: null,
 * });
 * ```
 */
export function createSupabaseQueryMock(
  config: SupabaseQueryMockConfig
): Record<string, jest.Mock> {
  const mockQuery: Record<string, jest.Mock> = {};

  // Crear mocks para métodos de cadena (retornan this)
  if (config.chainMethods) {
    config.chainMethods.forEach((method) => {
      mockQuery[method] = jest.fn() as jest.Mock;
      mockQuery[method].mockReturnValue(mockQuery);
    });
  }

  // Crear mock para método final
  mockQuery[config.finalMethod] = jest.fn() as jest.Mock;

  // Configurar respuesta del método final
  const response: any = {
    data: config.data !== undefined ? config.data : null,
    error: config.error !== undefined ? config.error : null,
  };

  if (config.count !== undefined) {
    response.count = config.count;
  }

  if (config.rejectPromise && config.error) {
    (mockQuery[config.finalMethod].mockRejectedValue as any)(config.error);
  } else {
    (mockQuery[config.finalMethod].mockResolvedValue as any)(response);
  }

  return mockQuery;
}

/**
 * Crea un mock para queries con llamadas múltiples al mismo método
 * (ej: .order().order())
 *
 * @example
 * ```typescript
 * const mockQuery = createMultiCallQueryMock({
 *   chainMethods: ['select', 'eq'],
 *   multiCallMethod: {
 *     method: 'order',
 *     returnThisCount: 1, // Primera llamada retorna this
 *   },
 *   data: mockSlots,
 *   error: null,
 * });
 * ```
 */
export function createMultiCallQueryMock(
  config: SupabaseQueryMockConfig & { multiCallMethod: MultiCallMethodConfig }
): Record<string, jest.Mock> {
  const mockQuery: Record<string, jest.Mock> = {};

  // Crear mocks para métodos de cadena normales
  if (config.chainMethods) {
    config.chainMethods.forEach((method) => {
      mockQuery[method] = jest.fn() as jest.Mock;
      mockQuery[method].mockReturnValue(mockQuery);
    });
  }

  // Crear mock para método con múltiples llamadas
  const { method, returnThisCount } = config.multiCallMethod;
  mockQuery[method] = jest.fn() as jest.Mock;

  // Configurar llamadas que retornan this
  for (let i = 0; i < returnThisCount; i++) {
    mockQuery[method].mockReturnValueOnce(mockQuery);
  }

  // Configurar última llamada que resuelve
  const response: any = {
    data: config.data !== undefined ? config.data : null,
    error: config.error !== undefined ? config.error : null,
  };

  if (config.count !== undefined) {
    response.count = config.count;
  }

  if (config.rejectPromise && config.error) {
    (mockQuery[method].mockRejectedValueOnce as any)(config.error);
  } else {
    (mockQuery[method].mockResolvedValueOnce as any)(response);
  }

  return mockQuery;
}

/**
 * Crea un mock de error para testing de error handling
 *
 * @example
 * ```typescript
 * const mockQuery = createSupabaseQueryMock({
 *   chainMethods: ['select', 'eq'],
 *   finalMethod: 'order',
 *   ...createSupabaseErrorMock('Database connection failed'),
 * });
 * ```
 */
export function createSupabaseErrorMock(message: string): {
  data: null;
  error: { message: string };
} {
  return {
    data: null,
    error: { message },
  };
}

/**
 * Crea un mock para query con paginación (usando count)
 *
 * @example
 * ```typescript
 * const mockQuery = createPaginatedQueryMock({
 *   chainMethods: ['select', 'eq', 'order'],
 *   finalMethod: 'range',
 *   data: mockItems,
 *   count: 25,
 * });
 * ```
 */
export function createPaginatedQueryMock(
  config: Omit<SupabaseQueryMockConfig, "count"> & { count: number }
): Record<string, jest.Mock> {
  return createSupabaseQueryMock({
    ...config,
    count: config.count,
  });
}

/**
 * Crea un mock para RPC (Remote Procedure Call) de Supabase
 *
 * @example
 * ```typescript
 * mockSupabase.rpc = createSupabaseRpcMock({
 *   data: 10, // número de slots creados
 *   error: null,
 * });
 * ```
 */
export function createSupabaseRpcMock(response: {
  data: any;
  error: any;
}): jest.Mock {
  const rpcMock = jest.fn() as jest.Mock;
  (rpcMock.mockResolvedValue as any)(response);
  return rpcMock;
}

/**
 * Crea un mock para query con .single() (retorna un solo elemento)
 *
 * @example
 * ```typescript
 * const mockQuery = createSingleItemQueryMock({
 *   chainMethods: ['select', 'eq'],
 *   data: mockSlot,
 *   error: null,
 * });
 * ```
 */
export function createSingleItemQueryMock(
  config: Omit<SupabaseQueryMockConfig, "finalMethod">
): Record<string, jest.Mock> {
  return createSupabaseQueryMock({
    ...config,
    finalMethod: "single",
  });
}

/**
 * Crea un mock para query que retorna "not found" (PGRST116)
 *
 * @example
 * ```typescript
 * const mockQuery = createNotFoundQueryMock(['select', 'eq']);
 * ```
 */
export function createNotFoundQueryMock(
  chainMethods: string[]
): Record<string, jest.Mock> {
  return createSingleItemQueryMock({
    chainMethods,
    data: null,
    error: { code: "PGRST116" },
  });
}

/**
 * Helper para verificar llamadas a métodos de query
 *
 * @example
 * ```typescript
 * expectQueryMethodCalls(mockQuery, {
 *   select: ['*'],
 *   eq: [['machine_id', validUUID]],
 *   order: [['slot_number', { ascending: true }]],
 * });
 * ```
 */
export function expectQueryMethodCalls(
  mockQuery: Record<string, jest.Mock>,
  expectedCalls: Record<string, Array<any[]>>
): void {
  Object.entries(expectedCalls).forEach(([method, calls]) => {
    calls.forEach((args, index) => {
      if (mockQuery[method].mock.calls[index]) {
        expect(mockQuery[method].mock.calls[index]).toEqual(args);
      }
    });
  });
}

/**
 * Crea un mock completo de SupabaseClient con from() configurado
 *
 * @example
 * ```typescript
 * const mockSupabase = createSupabaseClientMock();
 * const mockQuery = createSupabaseQueryMock({ ... });
 * mockSupabase.from.mockReturnValue(mockQuery);
 * ```
 */
export function createSupabaseClientMock(): {
  from: jest.Mock;
  rpc: jest.Mock;
} {
  return {
    from: jest.fn() as jest.Mock,
    rpc: jest.fn() as jest.Mock,
  };
}
