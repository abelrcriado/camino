#!/usr/bin/env node
/**
 * Auto-migrate endpoints to asyncHandler
 * Sprint 6.1 - Automatic transformation script
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files to migrate (from script output)
const filesToMigrate = [
  'pages/api/vending-machines/[id].ts',
  'pages/api/vending-machines/index.ts',
  'pages/api/workshops/[id].ts',
  'pages/api/workshops/index.ts',
  'pages/api/subcategories/[id].ts',
  'pages/api/subcategories/index.ts',
  'pages/api/report.ts',
  'pages/api/payments/confirm.ts',
  'pages/api/payments/refund.ts',
  'pages/api/payments/stats.ts',
  'pages/api/payments/[id].ts',
  'pages/api/payments/cancel.ts',
  'pages/api/payments/index.ts',
  'pages/api/warehouses/[id].ts',
  'pages/api/warehouses/index.ts',
  'pages/api/products/brands.ts',
  'pages/api/products/[id].ts',
  'pages/api/products/sku/[sku].ts',
  'pages/api/products/index.ts',
  'pages/api/products/tags.ts',
  'pages/api/bookings/index.ts',
  'pages/api/bookings/[id]/reschedule.ts',
  'pages/api/bookings/[id]/cancel.ts',
  'pages/api/bookings/[id]/approve.ts',
  'pages/api/service-types/[id].ts',
  'pages/api/service-types/index.ts',
  'pages/api/service-assignments.ts',
  'pages/api/service-points/stats.ts',
  'pages/api/service-points/[id].ts',
  'pages/api/service-points/index.ts',
  'pages/api/service-points/[id]/revenue.ts',
  'pages/api/vending-machine-slots.ts',
  'pages/api/locations/[id].ts',
  'pages/api/locations/index.ts',
  'pages/api/vending-machine-slots/create-for-machine.ts',
  'pages/api/vending-machine-slots/stock-operations.ts',
  'pages/api/vending-machine-slots/assign-product.ts',
  'pages/api/geolocation/[...path].ts',
  'pages/api/users/[id].ts',
  'pages/api/users/index.ts',
  'pages/api/stock-requests/in-transit.ts',
  'pages/api/stock-requests/stats.ts',
  'pages/api/stock-requests/[id].ts',
  'pages/api/stock-requests/index.ts',
  'pages/api/stock-requests/[id]/prepare.ts',
  'pages/api/stock-requests/[id]/deliver.ts',
  'pages/api/stock-requests/[id]/ship.ts',
  'pages/api/stock-requests/[id]/cancel.ts',
  'pages/api/stock-requests/[id]/consolidate.ts',
  'pages/api/stock-requests/requiring-action.ts',
  'pages/api/productos.ts',
  'pages/api/precios.ts',
  'pages/api/categories/reorder.ts',
  'pages/api/categories/[id].ts',
  'pages/api/categories/index.ts',
  'pages/api/services/[id].ts',
  'pages/api/services/by-status.ts',
  'pages/api/services/needing-maintenance.ts',
  'pages/api/services/index.ts',
  'pages/api/services/[id]/schedule-maintenance.ts',
  'pages/api/services/[id]/status.ts',
  'pages/api/services/[id]/usage.ts',
  'pages/api/services/[id]/complete-maintenance.ts',
  'pages/api/warehouse-inventory/locations.ts',
  'pages/api/warehouse-inventory/low-stock.ts',
  'pages/api/warehouse-inventory/value.ts',
  'pages/api/warehouse-inventory/summary.ts',
  'pages/api/warehouse-inventory/transfer.ts',
  'pages/api/warehouse-inventory/product/[id].ts',
  'pages/api/warehouse-inventory/purchase.ts',
  'pages/api/warehouse-inventory/adjust.ts',
  'pages/api/warehouse-inventory/warehouse/[id].ts',
  'pages/api/warehouse-inventory/movements.ts',
];

// Backup directory
const backupDir = `backups/auto-async-handler-${new Date().toISOString().replace(/[:.]/g, '-')}`;
fs.mkdirSync(backupDir, { recursive: true });

console.log('🔄 Starting automatic migration to asyncHandler\n');
console.log(`📁 Backups: ${backupDir}\n`);

let success = 0;
let failed = 0;
let skipped = 0;

function transformFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  console.log(`[${success + failed + skipped + 1}/${filesToMigrate.length}] Processing: ${filePath}`);
  
  if (!fs.existsSync(fullPath)) {
    console.log('  ⚠️  File not found, skipping\n');
    skipped++;
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Skip if already uses asyncHandler
  if (content.includes('asyncHandler')) {
    console.log('  ⏭️  Already uses asyncHandler, skipping\n');
    skipped++;
    return;
  }
  
  // Skip if doesn't match pattern
  if (!content.includes('export default async function handler')) {
    console.log('  ⏭️  Different pattern, skipping\n');
    skipped++;
    return;
  }
  
  // Create backup
  const backupPath = path.join(backupDir, path.basename(filePath));
  fs.copyFileSync(fullPath, backupPath);
  
  // Transform content
  let newContent = content;
  
  // 1. Add import if not present
  if (!newContent.includes('@/middlewares/error-handler')) {
    // Find the last import line
    const lines = newContent.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, 'import { asyncHandler } from "@/middlewares/error-handler";');
      newContent = lines.join('\n');
    }
  }
  
  // 2. Replace export default async function handler
  // Pattern: export default async function handler(\n  req: NextApiRequest,\n  res: NextApiResponse\n) {
  // Result: export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  
  // Match multiline function declaration
  const functionPattern = /export default async function handler\s*\(\s*req:\s*NextApiRequest,\s*res:\s*NextApiResponse\s*\)\s*\{/s;
  
  if (functionPattern.test(newContent)) {
    newContent = newContent.replace(
      functionPattern,
      'export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {'
    );
    
    // 3. Find and close the asyncHandler wrapper
    // Find the last closing brace of the function
    const lines = newContent.split('\n');
    let braceCount = 0;
    let inHandler = false;
    let closingBraceIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('export default asyncHandler')) {
        inHandler = true;
      }
      
      if (inHandler) {
        for (const char of line) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
          
          if (braceCount === 0 && closingBraceIndex === -1) {
            closingBraceIndex = i;
            break;
          }
        }
      }
    }
    
    if (closingBraceIndex !== -1) {
      // Replace the closing brace with });
      lines[closingBraceIndex] = lines[closingBraceIndex].replace(/^\}/, '});');
      newContent = lines.join('\n');
    }
    
    // Write transformed content
    fs.writeFileSync(fullPath, newContent, 'utf8');
    
    console.log('  ✅ Transformed successfully\n');
    success++;
  } else {
    console.log('  ❌ Pattern not matched, skipping\n');
    failed++;
  }
}

// Process files in batches
const BATCH_SIZE = 10;
for (let i = 0; i < filesToMigrate.length; i += BATCH_SIZE) {
  const batch = filesToMigrate.slice(i, i + BATCH_SIZE);
  
  console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(filesToMigrate.length / BATCH_SIZE)}\n`);
  
  for (const file of batch) {
    transformFile(file);
  }
  
  // Run tests after each batch
  console.log('🧪 Running tests for batch validation...\n');
  
  try {
    execSync('npm test -- --silent --maxWorkers=4', { 
      stdio: 'inherit',
      timeout: 120000 // 2 minutes timeout
    });
    console.log('\n✅ Tests passed for batch\n');
  } catch (error) {
    console.log('\n❌ Tests failed for batch');
    console.log('Rolling back batch...\n');
    
    // Rollback batch
    for (const file of batch) {
      const fullPath = path.join(process.cwd(), file);
      const backupPath = path.join(backupDir, path.basename(file));
      
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, fullPath);
      }
    }
    
    console.log('Batch rolled back. Fix issues and re-run script.');
    process.exit(1);
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 MIGRATION SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Total files: ${filesToMigrate.length}`);
console.log(`✅ Successfully migrated: ${success}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log(`❌ Failed: ${failed}`);
console.log(`\n📁 Backups: ${backupDir}\n`);

if (success > 0) {
  console.log('✅ Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Review changes: git diff');
  console.log('2. Run full test suite: npm test');
  console.log('3. Commit: git add . && git commit -m "refactor: migrate endpoints to asyncHandler"\n');
} else {
  console.log('⚠️  No files were migrated\n');
}
