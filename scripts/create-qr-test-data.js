#!/usr/bin/env node

/**
 * Script simplificado para crear datos mínimos de prueba QR
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function generateQRSecret() {
  return crypto.randomBytes(32).toString('hex');
}

async function main() {
  console.log('\n=== CREANDO DATOS PARA TEST QR ===\n');
  
  // 1. Obtener o crear usuario de prueba
  console.log('1. Usuario de prueba...');
  let user = null;
  
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', 'abelrcriado@gmail.com')
    .single();
  
  if (existingUser) {
    user = existingUser;
    console.log(`   ✓ Usuario existente: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   QR Secret: ${user.qr_secret?.substring(0, 20)}...`);
  } else {
    console.log('   ✗ Usuario no encontrado');
    return;
  }
  
  // 2. Crear service point de prueba
  console.log('\n2. Service Point de prueba...');
  const servicePointId = crypto.randomUUID();
  
  const { data: sp, error: spError } = await supabase
    .from('service_points')
    .insert({
      id: servicePointId,
      name: 'Test QR Service Point',
      address: 'Calle Test 123',
      city: 'Santiago',
      service_type: 'CSP',
      contact_email: 'test@qr.com',
      contact_phone: '+34600000000',
    })
    .select()
    .single();
  
  if (spError) {
    console.log(`   ✗ Error: ${spError.message}`);
    return;
  }
  
  console.log(`   ✓ Service Point creado: ${sp.name}`);
  console.log(`   ID: ${sp.id}`);
  
  // 3. Crear transacción de prueba
  console.log('\n3. Transacción de prueba...');
  const transactionId = crypto.randomUUID();
  const productId1 = crypto.randomUUID();
  const productId2 = crypto.randomUUID();
  
  const items = [
    {
      type: 'product',
      id: productId1,
      name: 'Bocadillo Jamón Test',
      quantity: 1,
      price: 4.50,
    },
    {
      type: 'product',
      id: productId2,
      name: 'Agua 500ml Test',
      quantity: 2,
      price: 1.50,
    },
  ];
  
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert({
      id: transactionId,
      user_id: user.id,
      items: items,
      total: total,
      status: 'pending',
      qr_used: false,
    })
    .select()
    .single();
  
  if (txError) {
    console.log(`   ✗ Error: ${txError.message}`);
    return;
  }
  
  console.log(`   ✓ Transacción creada: ${transaction.total}€`);
  console.log(`   ID: ${transaction.id}`);
  console.log(`   Items: ${transaction.items.length}`);
  
  // 4. Generar comando de prueba
  console.log('\n=== COMANDO DE PRUEBA QR ===\n');
  
  const scannedBy = crypto.randomUUID();
  
  console.log(`node << 'EOF'
const crypto = require('crypto');

const userId = '${user.id}';
const secret = '${user.qr_secret}';
const transactionId = '${transaction.id}';
const locationId = '${sp.id}';
const scannedBy = '${scannedBy}';

const payload = {
  transaction_id: transactionId,
  user_id: userId,
  items: ${JSON.stringify(items, null, 2)},
  timestamp: Date.now(),
  version: '1.0'
};

const dataToSign = JSON.stringify({
  transaction_id: payload.transaction_id,
  user_id: payload.user_id,
  items: payload.items,
  timestamp: payload.timestamp
});

payload.signature = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex');
const qrData = Buffer.from(JSON.stringify(payload)).toString('base64');

console.log('curl -X POST http://localhost:3000/api/access/verify-qr \\\\');
console.log('  -H "Content-Type: application/json" \\\\');
console.log('  -d \\'' + JSON.stringify({qr_data: qrData, location_id: locationId, scanned_by: scannedBy}) + '\\' | jq .');
EOF
`);
  
  console.log('\n✓ Datos de prueba creados correctamente\n');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
