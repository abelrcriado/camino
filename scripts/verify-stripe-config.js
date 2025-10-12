#!/usr/bin/env node

/**
 * Script de verificación de variables de entorno para Stripe
 * Ejecutar con: node scripts/verify-stripe-config.js
 */

const dotenv = require("dotenv");
const path = require("path");

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

console.log("🔍 Verificando configuración de Stripe...\n");

const checks = [
  {
    name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    envVar: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    required: true,
    pattern: /^pk_(test|live)_[a-zA-Z0-9]{24,}$/,
    description: "Publishable Key (para frontend)",
    example: "pk_test_51Abc123...",
  },
  {
    name: "STRIPE_SECRET_KEY",
    envVar: process.env.STRIPE_SECRET_KEY,
    required: true,
    pattern: /^sk_(test|live)_[a-zA-Z0-9]{24,}$/,
    description: "Secret Key (para backend)",
    example: "sk_test_51Abc123...",
  },
  {
    name: "STRIPE_WEBHOOK_SECRET",
    envVar: process.env.STRIPE_WEBHOOK_SECRET,
    required: true,
    pattern: /^whsec_[a-zA-Z0-9]{32,}$/,
    description: "Webhook Secret (para verificar webhooks)",
    example: "whsec_abc123...",
  },
];

let allValid = true;
let warnings = [];

checks.forEach((check) => {
  const status = check.envVar ? "✅" : "❌";
  console.log(`${status} ${check.name}`);
  console.log(`   Descripción: ${check.description}`);

  if (!check.envVar) {
    if (check.required) {
      console.log(`   ⚠️  ERROR: Variable no definida`);
      console.log(
        `   💡 Agrégala a .env.local: ${check.name}=${check.example}`
      );
      allValid = false;
    }
  } else if (check.envVar.includes("REEMPLAZAR")) {
    console.log(`   ⚠️  WARNING: Debes reemplazar con tu key real de Stripe`);
    console.log(`   📖 Sigue la guía: docs/STRIPE_KEYS_SETUP.md`);
    warnings.push(check.name);
    allValid = false;
  } else if (check.pattern && !check.pattern.test(check.envVar)) {
    console.log(`   ⚠️  WARNING: Formato incorrecto`);
    console.log(`   Esperado: ${check.example}`);
    console.log(`   Recibido: ${check.envVar.substring(0, 15)}...`);
    warnings.push(check.name);
  } else {
    const prefix = check.envVar.substring(0, 10);
    const isTest = check.envVar.includes("test");
    const mode = isTest ? "🧪 TEST MODE" : "💰 LIVE MODE";
    console.log(`   ✅ Formato válido: ${prefix}... (${mode})`);
  }

  console.log("");
});

// Verificar que Supabase también esté configurado
console.log("📊 Verificando Supabase (opcional)...\n");

const supabaseChecks = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    envVar: process.env.NEXT_PUBLIC_SUPABASE_URL,
    pattern: /^https:\/\/[a-z0-9]+\.supabase\.co$/,
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    envVar: process.env.SUPABASE_SERVICE_ROLE_KEY,
    pattern: /^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/,
  },
];

supabaseChecks.forEach((check) => {
  const status = check.envVar ? "✅" : "⚠️ ";
  console.log(
    `${status} ${check.name}: ${
      check.envVar ? "Configurado" : "No configurado"
    }`
  );
});

console.log("\n" + "=".repeat(60) + "\n");

// Resumen final
if (allValid && warnings.length === 0) {
  console.log("✅ ¡CONFIGURACIÓN CORRECTA!");
  console.log("   Todas las variables de Stripe están configuradas.");
  console.log("   Puedes empezar a probar la integración.");
  console.log("\n💡 Siguiente paso:");
  console.log("   1. Reinicia el servidor: npm run dev");
  console.log("   2. Prueba crear un Payment Intent");
  console.log("   3. Revisa la documentación: docs/STRIPE_KEYS_SETUP.md");
} else if (warnings.length > 0) {
  console.log("⚠️  CONFIGURACIÓN INCOMPLETA");
  console.log(`   ${warnings.length} variable(s) necesitan actualización:`);
  warnings.forEach((w) => console.log(`   - ${w}`));
  console.log("\n📖 Sigue estos pasos:");
  console.log("   1. Ve a https://dashboard.stripe.com");
  console.log("   2. Activa Test Mode");
  console.log("   3. Ve a Developers → API keys");
  console.log("   4. Copia tus keys y actualiza .env.local");
  console.log("   5. Vuelve a ejecutar este script");
  console.log("\n📚 Guía detallada: docs/STRIPE_KEYS_SETUP.md");
} else {
  console.log("❌ CONFIGURACIÓN FALTANTE");
  console.log("   Algunas variables críticas no están definidas.");
  console.log("\n📖 Para configurar Stripe:");
  console.log("   1. Lee la guía: docs/STRIPE_KEYS_SETUP.md");
  console.log("   2. Crea una cuenta en https://stripe.com");
  console.log("   3. Obtén tus API keys en modo Test");
  console.log("   4. Agrégalas a .env.local");
  console.log("   5. Vuelve a ejecutar: node scripts/verify-stripe-config.js");
}

console.log("\n" + "=".repeat(60) + "\n");

// Exit code
process.exit(allValid ? 0 : 1);
