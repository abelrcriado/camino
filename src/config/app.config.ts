import { z } from 'zod';

/**
 * Configuration Schema with Zod Validation
 * 
 * This file centralizes all environment variables with type-safe validation.
 * Fails fast at startup if required configuration is missing or invalid.
 * 
 * Usage:
 *   import { config } from '@/config/app.config';
 *   const supabaseUrl = config.supabase.url;
 *   const stripeKey = config.stripe.secretKey;
 */

const configSchema = z.object({
  supabase: z.object({
    url: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
    anonKey: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
    serviceRoleKey: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  }),
  stripe: z.object({
    secretKey: z
      .string()
      .startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_')
      .optional()
      .default('sk_test_mock'),
    webhookSecret: z
      .string()
      .startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_')
      .optional()
      .default('whsec_test_mock'),
    publishableKey: z
      .string()
      .startsWith('pk_', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_')
      .optional(),
  }),
  app: z.object({
    env: z.enum(['development', 'production', 'test']),
    port: z.coerce.number().positive().default(3000),
    logLevel: z
      .enum(['error', 'warn', 'info', 'debug'])
      .default('info'),
  }),
});

/**
 * Validated Configuration Object
 * 
 * This will throw a detailed Zod error at startup if any required
 * environment variable is missing or invalid.
 */
export const config = configSchema.parse({
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  app: {
    env: process.env.NODE_ENV as 'development' | 'production' | 'test',
    port: process.env.PORT,
    logLevel: process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug' | undefined,
  },
});

/**
 * Type inference from Zod schema
 * Use this type for type-safe configuration access
 */
export type AppConfig = z.infer<typeof configSchema>;

/**
 * Helper: Check if running in production
 */
export const isProduction = config.app.env === 'production';

/**
 * Helper: Check if running in development
 */
export const isDevelopment = config.app.env === 'development';

/**
 * Helper: Check if running in test
 */
export const isTest = config.app.env === 'test';
