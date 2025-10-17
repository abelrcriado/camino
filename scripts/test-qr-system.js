/**
 * Script de prueba del sistema QR Offline-First
 * 
 * Genera un QR code firmado con HMAC y lo valida contra el API
 */

const crypto = require('crypto');

// Datos de prueba (de la BD)
const TEST_DATA = {
  transaction_id: '50000000-0000-0000-0000-000000000001',
  user_id: '00000000-0000-0000-0000-000000000001',
  qr_secret: '71deff0eca9ee0d99485a43c6e5f11baa65b06eb81e76f12663a8f83cdac8c09', // Obtener de BD
  service_point_id: '30000000-0000-0000-0000-000000000001',
  items: [
    {
      type: 'product',
      id: '40000000-0000-0000-0000-000000000001',
      name: 'Bocadillo jamón',
      quantity: 1,
      price: 3.50
    },
    {
      type: 'product',
      id: '40000000-0000-0000-0000-000000000002',
      name: 'Agua 500ml',
      quantity: 2,
      price: 1.50
    }
  ]
};

/**
 * Paso 1: Generar QR code (simula app móvil offline)
 */
function generateQRCode() {
  console.log('\n=== PASO 1: GENERAR QR CODE (APP MÓVIL OFFLINE) ===\n');
  
  const timestamp = Date.now();
  
  // Payload del QR
  const payload = {
    transaction_id: TEST_DATA.transaction_id,
    user_id: TEST_DATA.user_id,
    items: TEST_DATA.items,
    timestamp,
    version: '1.0'
  };
  
  // Generar firma HMAC-SHA256
  const dataToSign = JSON.stringify({
    transaction_id: payload.transaction_id,
    user_id: payload.user_id,
    items: payload.items,
    timestamp: payload.timestamp
  });
  
  const signature = crypto
    .createHmac('sha256', TEST_DATA.qr_secret)
    .update(dataToSign)
    .digest('hex');
  
  payload.signature = signature;
  
  // Codificar a base64 (como estaría en el QR real)
  const qrData = Buffer.from(JSON.stringify(payload)).toString('base64');
  
  console.log('✅ QR Code generado:');
  console.log('   Transaction ID:', payload.transaction_id);
  console.log('   User ID:', payload.user_id);
  console.log('   Items:', payload.items.length);
  console.log('   Total:', payload.items.reduce((sum, item) => sum + (item.price * item.quantity), 0), 'EUR');
  console.log('   Timestamp:', new Date(payload.timestamp).toISOString());
  console.log('   Firma HMAC:', signature.substring(0, 20) + '...');
  console.log('   QR Data (base64):', qrData.substring(0, 60) + '...\n');
  
  return qrData;
}

/**
 * Paso 2: Escanear y validar QR (simula CSP online)
 */
async function verifyQRCode(qrData) {
  console.log('=== PASO 2: VALIDAR QR CODE (CSP CON INTERNET) ===\n');
  
  const verifyRequest = {
    qr_data: qrData,
    location_id: TEST_DATA.service_point_id,
    scanned_by: '00000000-0000-0000-0000-000000000002' // Partner de prueba
  };
  
  console.log('📡 Enviando request a POST /api/access/verify-qr');
  console.log('   Location:', TEST_DATA.service_point_id);
  console.log('   Scanned by:', verifyRequest.scanned_by);
  console.log('\nPara probar manualmente con curl:\n');
  console.log(`curl -X POST http://localhost:3001/api/access/verify-qr \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(verifyRequest, null, 2).replace(/'/g, "'\\''")}'`);
  console.log('\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/access/verify-qr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verifyRequest)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ QR VÁLIDO - Acceso autorizado\n');
      console.log('   Transaction ID:', result.transaction.id);
      console.log('   Items:', result.transaction.items.length);
      console.log('   Total:', result.transaction.total, 'EUR');
      console.log('   Message:', result.message);
    } else {
      console.log('❌ QR INVÁLIDO\n');
      console.log('   Status:', response.status);
      console.log('   Error:', result.error);
    }
    
    return result;
  } catch (error) {
    console.log('❌ Error en request:', error.message);
    console.log('\n⚠️  Asegúrate de que el servidor está corriendo: npm run dev\n');
    return null;
  }
}

/**
 * Paso 3: Consultar logs de acceso
 */
async function checkAccessLogs() {
  console.log('\n=== PASO 3: CONSULTAR LOGS DE ACCESO ===\n');
  
  try {
    const response = await fetch(
      `http://localhost:3000/api/access/logs?transaction_id=${TEST_DATA.transaction_id}`
    );
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Logs consultados:');
      console.log('   Total:', result.pagination.total);
      
      if (result.data.length > 0) {
        const log = result.data[0];
        console.log('\n   Último escaneo:');
        console.log('      Resultado:', log.validation_result);
        console.log('      Timestamp:', log.timestamp);
        console.log('      Location:', log.location_id);
      }
    }
  } catch (error) {
    console.log('⚠️  No se pudieron consultar logs:', error.message);
  }
}

/**
 * Obtener qr_secret desde la BD
 */
async function getQRSecret() {
  console.log('🔍 Obteniendo qr_secret desde la base de datos...\n');
  
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  try {
    const command = `echo "SELECT qr_secret FROM profiles WHERE id = '${TEST_DATA.user_id}';" | psql "postgresql://postgres.vjmwoqwqwblllrdbnkod:D3s4rr0ll0.@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require"`;
    
    const { stdout } = await execPromise(command);
    const match = stdout.match(/([a-f0-9]{64})/);
    
    if (match) {
      TEST_DATA.qr_secret = match[1];
      console.log('✅ QR Secret obtenido:', TEST_DATA.qr_secret.substring(0, 20) + '...\n');
      return true;
    } else {
      console.log('❌ No se pudo obtener qr_secret\n');
      return false;
    }
  } catch (error) {
    console.log('❌ Error al obtener qr_secret:', error.message);
    console.log('⚠️  Usando valor por defecto del script\n');
    return false;
  }
}

/**
 * Main
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   🎫 TEST SISTEMA QR OFFLINE-FIRST                    ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  // Obtener qr_secret real de la BD
  await getQRSecret();
  
  // Paso 1: Generar QR (offline)
  const qrData = generateQRCode();
  
  // Paso 2: Validar QR (online)
  const validationResult = await verifyQRCode(qrData);
  
  // Paso 3: Consultar logs
  if (validationResult) {
    await checkAccessLogs();
  }
  
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   ✅ TEST COMPLETADO                                   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
}

// Ejecutar
main().catch(console.error);
