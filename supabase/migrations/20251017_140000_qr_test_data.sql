-- Migration: QR System - Test Data
-- Date: 2025-10-17
-- Description: Crea datos de prueba para validar el sistema QR completo

-- 1. Crear ubicación (camino + service_point)
DO $$
DECLARE
  test_camino_id UUID := '10000000-0000-0000-0000-000000000001';
  test_service_point_id UUID := '30000000-0000-0000-0000-000000000001';
BEGIN
  -- Camino de prueba
  INSERT INTO caminos (id, nombre, codigo, descripcion)
  VALUES (
    test_camino_id,
    'Camino Francés (Test)',
    'CF-TEST',
    'Camino de prueba para sistema QR'
  ) ON CONFLICT (id) DO NOTHING;

  -- Service Point de prueba
  INSERT INTO service_points (
    id, 
    name, 
    type, 
    description, 
    is_active,
    contact_email,
    contact_phone
  )
  VALUES (
    test_service_point_id,
    'Albergue Sarria (Test)',
    'albergue',
    'Punto de servicio para validación de QR codes',
    true,
    'test@sarria.com',
    '+34600000000'
  ) ON CONFLICT (id) DO NOTHING;
END $$;

-- 2. Crear productos de prueba
DO $$
DECLARE
  test_product_1 UUID := '40000000-0000-0000-0000-000000000001';
  test_product_2 UUID := '40000000-0000-0000-0000-000000000002';
  test_product_3 UUID := '40000000-0000-0000-0000-000000000003';
BEGIN
  -- Producto 1: Bocadillo
  INSERT INTO productos (id, sku, nombre, descripcion, precio_venta, is_active)
  VALUES (
    test_product_1,
    'BOCADILLO-JAMON-001',
    'Bocadillo de jamón',
    'Bocadillo tradicional de jamón serrano',
    3.50,
    true
  ) ON CONFLICT (id) DO NOTHING;

  -- Producto 2: Bebida
  INSERT INTO productos (id, sku, nombre, descripcion, precio_venta, is_active)
  VALUES (
    test_product_2,
    'AGUA-500ML-001',
    'Agua mineral 500ml',
    'Botella de agua mineral',
    1.50,
    true
  ) ON CONFLICT (id) DO NOTHING;

  -- Producto 3: Snack
  INSERT INTO productos (id, sku, nombre, descripcion, precio_venta, is_active)
  VALUES (
    test_product_3,
    'BARRITA-ENERGIA-001',
    'Barrita energética',
    'Barrita de cereales y frutos secos',
    2.00,
    true
  ) ON CONFLICT (id) DO NOTHING;
END $$;

-- 3. Asegurar que el usuario de prueba tiene qr_secret
UPDATE profiles 
SET qr_secret = encode(gen_random_bytes(32), 'hex')
WHERE id = '00000000-0000-0000-0000-000000000001'
  AND (qr_secret IS NULL OR qr_secret = '');

-- 4. Crear transacción de prueba (compra offline)
DO $$
DECLARE
  test_transaction_id UUID := '50000000-0000-0000-0000-000000000001';
  test_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  INSERT INTO transactions (
    id,
    user_id,
    items,
    total,
    status,
    created_at,
    qr_used,
    qr_invalidated
  ) VALUES (
    test_transaction_id,
    test_user_id,
    '[
      {
        "type": "product",
        "id": "40000000-0000-0000-0000-000000000001",
        "name": "Bocadillo de jamón",
        "quantity": 1,
        "price": 3.50
      },
      {
        "type": "product",
        "id": "40000000-0000-0000-0000-000000000002",
        "name": "Agua mineral 500ml",
        "quantity": 2,
        "price": 1.50
      }
    ]'::jsonb,
    6.50,
    'pending',
    NOW() - INTERVAL '10 minutes',
    false,
    false
  ) ON CONFLICT (id) DO NOTHING;
END $$;

-- 5. Información de prueba
SELECT '=== DATOS DE PRUEBA CREADOS ===' as info;

SELECT 'CAMINO' as tipo, id, nombre FROM caminos WHERE id = '10000000-0000-0000-0000-000000000001';
SELECT 'SERVICE POINT' as tipo, id, name as nombre FROM service_points WHERE id = '30000000-0000-0000-0000-000000000001';

SELECT 'PRODUCTOS' as info;
SELECT id, nombre, precio_venta
FROM productos 
WHERE id IN (
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000003'
);

SELECT 'USUARIO TEST' as info;
SELECT id, email, LENGTH(qr_secret) as secret_length 
FROM profiles 
WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 'TRANSACCIÓN TEST' as info;
SELECT id, user_id, total, status, qr_used, created_at 
FROM transactions 
WHERE id = '50000000-0000-0000-0000-000000000001';

-- 6. Script de ejemplo para generar QR (info)
SELECT '=== PARA GENERAR QR CODE ===' as info;
SELECT 
  'User ID: ' || id as paso_1,
  'QR Secret: ' || SUBSTRING(qr_secret, 1, 20) || '...' as paso_2
FROM profiles 
WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 'Transaction ID: 50000000-0000-0000-0000-000000000001' as paso_3;
SELECT 'Service Point ID: 30000000-0000-0000-0000-000000000001' as paso_4;
SELECT 'Total: 6.50 EUR' as paso_5;

