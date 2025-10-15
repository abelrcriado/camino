// jest.setup.js
process.env.STRIPE_SECRET_KEY = "sk_test_example_key_for_testing";
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test_anon_key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test_service_role_key";
