#!/usr/bin/env node

/**
 * Script para limpiar y regenerar datos de prueba con UUIDs válidos
 * 
 * IMPORTANTE: Solo usar en desarrollo/testing
 * Este script ELIMINA todos los datos y los regenera
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configuración Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos');
  console.error('Asegúrate de tener el archivo .env.local con las variables configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`),
};

// Generar QR secret (64 chars hex = 32 bytes)
function generateQRSecret() {
  return crypto.randomBytes(32).toString('hex');
}

async function cleanDatabase() {
  log.section('PASO 1: Limpiando base de datos');
  
  const tablesToClean = [
    // QR System tables (orden importante por FKs)
    'access_logs',
    'returns',
    'transactions',
    
    // Business tables
    'ventas_app',
    'bookings',
    'stock_requests',
    'warehouse_inventory',
    'inventory_items',
    'vending_machines',
    'service_points',
    'productos',
    'product_categories',
    'ubicaciones',
    'caminos',
    
    // Users (al final porque tiene FKs desde muchas tablas)
    // NO limpiamos profiles porque tiene auth dependencies
  ];

  for (const table of tablesToClean) {
    try {
      log.info(`Limpiando ${table}...`);
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows to delete
        log.error(`Error limpiando ${table}: ${error.message}`);
      } else {
        log.success(`${table} limpiado`);
      }
    } catch (err) {
      log.error(`Error limpiando ${table}: ${err.message}`);
    }
  }
}

async function createTestUsers() {
  log.section('PASO 2: Creando usuarios de prueba');
  
  const users = [
    {
      id: crypto.randomUUID(),
      email: 'peregrino.test@camino.com',
      full_name: 'Peregrino Test',
      role: 'user',
      phone: '+34600111111',
      preferred_language: 'es',
      qr_secret: generateQRSecret(),
    },
    {
      id: crypto.randomUUID(),
      email: 'partner.test@camino.com',
      full_name: 'Partner Test',
      role: 'partner',
      phone: '+34600222222',
      preferred_language: 'es',
      qr_secret: generateQRSecret(),
    },
    {
      id: crypto.randomUUID(),
      email: 'admin.test@camino.com',
      full_name: 'Admin Test',
      role: 'admin',
      phone: '+34600333333',
      preferred_language: 'es',
      qr_secret: generateQRSecret(),
    },
  ];

  const createdUsers = [];
  
  for (const user of users) {
    try {
      // Actualizar usuario existente con qr_secret
      const { data, error } = await supabase
        .from('profiles')
        .upsert(user, { onConflict: 'email' })
        .select()
        .single();
      
      if (error) {
        log.error(`Error creando ${user.email}: ${error.message}`);
      } else {
        log.success(`Usuario creado: ${user.email} (ID: ${data.id})`);
        createdUsers.push(data);
      }
    } catch (err) {
      log.error(`Error creando usuario: ${err.message}`);
    }
  }

  return createdUsers;
}

async function createCaminos() {
  log.section('PASO 3: Creando caminos');
  
  const caminos = [
    {
      id: crypto.randomUUID(),
      nombre: 'Camino Francés (Test)',
      codigo: 'CF-TEST',
      descripcion: 'Camino de prueba para testing',
      longitud_total_km: 780,
      duracion_estimada_dias: 30,
      dificultad: 'media',
    },
    {
      id: crypto.randomUUID(),
      nombre: 'Camino Portugués (Test)',
      codigo: 'CP-TEST',
      descripcion: 'Camino portugués de prueba',
      longitud_total_km: 240,
      duracion_estimada_dias: 12,
      dificultad: 'facil',
    },
  ];

  const createdCaminos = [];
  
  for (const camino of caminos) {
    const { data, error } = await supabase.from('caminos').insert(camino).select().single();
    
    if (error) {
      log.error(`Error creando camino: ${error.message}`);
    } else {
      log.success(`Camino creado: ${camino.nombre}`);
      createdCaminos.push(data);
    }
  }

  return createdCaminos;
}

async function createUbicaciones(caminos) {
  log.section('PASO 4: Creando ubicaciones');
  
  if (!caminos.length) {
    log.error('No hay caminos disponibles');
    return [];
  }

  const ubicaciones = [
    {
      id: crypto.randomUUID(),
      nombre: 'Sarria (Test)',
      camino_id: caminos[0].id,
      descripcion: 'Ubicación de prueba - Sarria',
      latitud: 42.7792,
      longitud: -7.4158,
      altitud_m: 450,
      poblacion: 'Sarria',
      provincia: 'Lugo',
      comunidad: 'Galicia',
    },
    {
      id: crypto.randomUUID(),
      nombre: 'Portomarín (Test)',
      camino_id: caminos[0].id,
      descripcion: 'Ubicación de prueba - Portomarín',
      latitud: 42.8089,
      longitud: -7.6156,
      altitud_m: 350,
      poblacion: 'Portomarín',
      provincia: 'Lugo',
      comunidad: 'Galicia',
    },
  ];

  const createdUbicaciones = [];
  
  for (const ubicacion of ubicaciones) {
    const { data, error } = await supabase.from('ubicaciones').insert(ubicacion).select().single();
    
    if (error) {
      log.error(`Error creando ubicación: ${error.message}`);
    } else {
      log.success(`Ubicación creada: ${ubicacion.nombre}`);
      createdUbicaciones.push(data);
    }
  }

  return createdUbicaciones;
}

async function createServicePoints(ubicaciones, users) {
  log.section('PASO 5: Creando service points');
  
  if (!ubicaciones.length || !users.length) {
    log.error('No hay ubicaciones o usuarios disponibles');
    return [];
  }

  const partner = users.find(u => u.role === 'partner');
  
  const servicePoints = [
    {
      id: crypto.randomUUID(),
      name: 'Albergue Sarria Test',
      ubicacion_id: ubicaciones[0].id,
      partner_id: partner?.id,
      address: 'Calle Mayor 1, Sarria',
      city: 'Sarria',
      postal_code: '27600',
      service_type: 'CSP',
      contact_email: 'albergue.sarria@test.com',
      contact_phone: '+34982530000',
    },
    {
      id: crypto.randomUUID(),
      name: 'Refugio Portomarín Test',
      ubicacion_id: ubicaciones[1].id,
      partner_id: partner?.id,
      address: 'Plaza del Conde 5, Portomarín',
      city: 'Portomarín',
      postal_code: '27170',
      service_type: 'CSS',
      contact_email: 'refugio.portomarin@test.com',
      contact_phone: '+34982545000',
    },
  ];

  const createdServicePoints = [];
  
  for (const sp of servicePoints) {
    const { data, error } = await supabase.from('service_points').insert(sp).select().single();
    
    if (error) {
      log.error(`Error creando service point: ${error.message}`);
    } else {
      log.success(`Service Point creado: ${sp.name}`);
      createdServicePoints.push(data);
    }
  }

  return createdServicePoints;
}

async function createProductCategories() {
  log.section('PASO 6: Creando categorías de productos');
  
  const categories = [
    {
      id: crypto.randomUUID(),
      code: 'ALIM-TEST',
      name: 'Alimentos (Test)',
      description: 'Categoría de prueba - Alimentos y bebidas',
    },
    {
      id: crypto.randomUUID(),
      code: 'SERV-TEST',
      name: 'Servicios (Test)',
      description: 'Categoría de prueba - Servicios de albergue',
    },
  ];

  const createdCategories = [];
  
  for (const cat of categories) {
    const { data, error } = await supabase.from('product_categories').insert(cat).select().single();
    
    if (error) {
      log.error(`Error creando categoría: ${error.message}`);
    } else {
      log.success(`Categoría creada: ${cat.name}`);
      createdCategories.push(data);
    }
  }

  return createdCategories;
}

async function createProducts(categories) {
  log.section('PASO 7: Creando productos');
  
  if (!categories.length) {
    log.error('No hay categorías disponibles');
    return [];
  }

  const products = [
    {
      id: crypto.randomUUID(),
      nombre: 'Bocadillo Jamón Test',
      descripcion: 'Bocadillo de jamón serrano de prueba',
      category_id: categories[0].id,
      precio_venta: 4.50,
      costo_base: 2.00,
      sku: `BOC-JAM-${Date.now()}`,
      is_active: true,
    },
    {
      id: crypto.randomUUID(),
      nombre: 'Agua 500ml Test',
      descripcion: 'Botella de agua mineral de prueba',
      category_id: categories[0].id,
      precio_venta: 1.50,
      costo_base: 0.50,
      sku: `AGU-500-${Date.now()}`,
      is_active: true,
    },
    {
      id: crypto.randomUUID(),
      nombre: 'Litera Compartida Test',
      descripcion: 'Alojamiento en litera compartida de prueba',
      category_id: categories[1].id,
      precio_venta: 12.00,
      costo_base: 5.00,
      sku: `ALO-LIT-${Date.now()}`,
      is_active: true,
    },
  ];

  const createdProducts = [];
  
  for (const prod of products) {
    const { data, error } = await supabase.from('productos').insert(prod).select().single();
    
    if (error) {
      log.error(`Error creando producto: ${error.message}`);
    } else {
      log.success(`Producto creado: ${prod.nombre} (${prod.precio_venta}€)`);
      createdProducts.push(data);
    }
  }

  return createdProducts;
}

async function createTestTransaction(users, products, servicePoints) {
  log.section('PASO 8: Creando transacción de prueba');
  
  if (!users.length || !products.length || !servicePoints.length) {
    log.error('Faltan datos para crear transacción');
    return null;
  }

  const user = users.find(u => u.role === 'user');
  const transaction = {
    id: crypto.randomUUID(),
    user_id: user.id,
    items: [
      {
        type: 'product',
        id: products[0].id,
        name: products[0].nombre,
        quantity: 1,
        price: products[0].precio_venta,
      },
      {
        type: 'product',
        id: products[1].id,
        name: products[1].nombre,
        quantity: 2,
        price: products[1].precio_venta,
      },
    ],
    total: products[0].precio_venta + (products[1].precio_venta * 2),
    status: 'pending',
    qr_used: false,
  };

  const { data, error } = await supabase.from('transactions').insert(transaction).select().single();
  
  if (error) {
    log.error(`Error creando transacción: ${error.message}`);
    return null;
  } else {
    log.success(`Transacción creada: ${transaction.total}€`);
    return data;
  }
}

async function printTestSummary(users, caminos, ubicaciones, servicePoints, categories, products, transaction) {
  log.section('RESUMEN DE DATOS DE PRUEBA CREADOS');
  
  console.log(`${colors.green}USUARIOS (${users.length}):${colors.reset}`);
  users.forEach(u => {
    console.log(`  • ${u.email} (${u.role})`);
    console.log(`    ID: ${u.id}`);
    console.log(`    QR Secret: ${u.qr_secret.substring(0, 20)}...`);
  });

  console.log(`\n${colors.green}CAMINOS (${caminos.length}):${colors.reset}`);
  caminos.forEach(c => console.log(`  • ${c.nombre} (${c.codigo}) - ID: ${c.id}`));

  console.log(`\n${colors.green}UBICACIONES (${ubicaciones.length}):${colors.reset}`);
  ubicaciones.forEach(u => console.log(`  • ${u.nombre} - ID: ${u.id}`));

  console.log(`\n${colors.green}SERVICE POINTS (${servicePoints.length}):${colors.reset}`);
  servicePoints.forEach(sp => console.log(`  • ${sp.name} (${sp.service_type}) - ID: ${sp.id}`));

  console.log(`\n${colors.green}CATEGORÍAS (${categories.length}):${colors.reset}`);
  categories.forEach(c => console.log(`  • ${c.name} (${c.code}) - ID: ${c.id}`));

  console.log(`\n${colors.green}PRODUCTOS (${products.length}):${colors.reset}`);
  products.forEach(p => console.log(`  • ${p.nombre} - ${p.precio_venta}€ (ID: ${p.id})`));

  if (transaction) {
    console.log(`\n${colors.green}TRANSACCIÓN DE PRUEBA:${colors.reset}`);
    console.log(`  • ID: ${transaction.id}`);
    console.log(`  • Total: ${transaction.total}€`);
    console.log(`  • Items: ${transaction.items.length}`);
  }

  // Generar comando de prueba QR
  if (users.length && products.length && servicePoints.length && transaction) {
    const user = users.find(u => u.role === 'user');
    
    log.section('COMANDO DE PRUEBA QR');
    
    console.log(`${colors.yellow}Generar y verificar QR:${colors.reset}\n`);
    console.log(`node << 'EOF'
const crypto = require('crypto');

const userId = '${user.id}';
const secret = '${user.qr_secret}';
const transactionId = '${transaction.id}';
const locationId = '${servicePoints[0].id}';
const scannedBy = '${users.find(u => u.role === 'partner')?.id || user.id}';

const payload = {
  transaction_id: transactionId,
  user_id: userId,
  items: ${JSON.stringify(transaction.items, null, 2).split('\n').join('\n  ')},
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

console.log('\\n=== VERIFICAR QR ===\\n');
console.log(\`curl -X POST http://localhost:3000/api/access/verify-qr \\\\
  -H "Content-Type: application/json" \\\\
  -d '\${JSON.stringify({qr_data: qrData, location_id: locationId, scanned_by: scannedBy})}' | jq .\\n\`);
EOF`);
  }
}

async function main() {
  console.log(`${colors.magenta}
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   SCRIPT DE LIMPIEZA Y REGENERACIÓN DE DATOS DE PRUEBA   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

  log.warning('Este script eliminará TODOS los datos de prueba y los regenerará');
  log.warning('Solo ejecutar en entorno de desarrollo/testing');
  
  // Esperar 3 segundos para que el usuario pueda cancelar
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    // 1. Limpiar base de datos
    await cleanDatabase();
    
    // 2. Crear usuarios
    const users = await createTestUsers();
    
    // 3. Crear caminos
    const caminos = await createCaminos();
    
    // 4. Crear ubicaciones
    const ubicaciones = await createUbicaciones(caminos);
    
    // 5. Crear service points
    const servicePoints = await createServicePoints(ubicaciones, users);
    
    // 6. Crear categorías
    const categories = await createProductCategories();
    
    // 7. Crear productos
    const products = await createProducts(categories);
    
    // 8. Crear transacción de prueba
    const transaction = await createTestTransaction(users, products, servicePoints);
    
    // 9. Mostrar resumen
    await printTestSummary(users, caminos, ubicaciones, servicePoints, categories, products, transaction);
    
    log.section('PROCESO COMPLETADO CON ÉXITO ✓');
    
  } catch (error) {
    log.error(`Error fatal: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
main();
