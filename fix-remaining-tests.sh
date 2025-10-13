#!/bin/bash

# Script para corregir TODOS los tests restantes con los mensajes de validateUUID

echo "🔧 Corrigiendo tests restantes..."

# Función para actualizar un archivo de test
update_test_file() {
    local file=$1
    local entity=$2
    local entity_lower=$3
    
    echo "📝 Corrigiendo $file..."
    
    # Patrón 1: Array input → "ID debe ser un string"
    sed -i '' "s/\"ID de ${entity_lower} es requerido\"/\"ID debe ser un string\"/g" "$file"
    
    # Patrón 2: Invalid UUID → "${entity_lower} debe ser un UUID válido"
    sed -i '' "s/\"ID de ${entity_lower} inválido\"/\"${entity_lower} debe ser un UUID válido\"/g" "$file"
    
    # Casos especiales con mayúsculas/minúsculas
    sed -i '' "s/\"ID de ${entity} es requerido\"/\"ID debe ser un string\"/g" "$file"
    sed -i '' "s/\"ID de ${entity} inválido\"/\"${entity_lower} debe ser un UUID válido\"/g" "$file"
}

# ventas-app/usuario/[userId] - entity: usuario
update_test_file "__tests__/api/ventas-app/usuario/[userId].test.ts" "usuario" "usuario"

# ventas-app/[id] - entity: venta
update_test_file "__tests__/api/ventas-app/[id].test.ts" "venta" "venta"

# ventas-app/[id]/confirmar-retiro - entity: venta
update_test_file "__tests__/api/ventas-app/[id]/confirmar-retiro.test.ts" "venta" "venta"

# ubicaciones/[id] - entity: ubicación
update_test_file "__tests__/api/ubicaciones/[id].test.ts" "ubicación" "ubicación"

# ubicaciones/[id]/service-points - entity: ubicación
update_test_file "__tests__/api/ubicaciones/[id]/service-points.test.ts" "ubicación" "ubicación"

# vending-machines/[id]/slots/index - entity: vending machine
file="__tests__/api/vending-machines/[id]/slots/index.test.ts"
echo "📝 Corrigiendo $file..."
sed -i '' 's/"ID de vending machine es requerido"/"ID debe ser un string"/g' "$file"
sed -i '' 's/"ID de vending machine inválido"/"vending machine debe ser un UUID válido"/g' "$file"

# vending-machines/[id]/slots/reabastecer - múltiples IDs
file="__tests__/api/vending-machines/[id]/slots/reabastecer.test.ts"
echo "📝 Corrigiendo $file..."
# machineId validations
sed -i '' 's/"ID de vending machine es requerido"/"ID debe ser un string"/g' "$file"
sed -i '' 's/"ID de vending machine inválido"/"vending machine debe ser un UUID válido"/g' "$file"
# slotId validations
sed -i '' 's/"ID de slot es requerido"/"ID debe ser un string"/g' "$file"
sed -i '' 's/"ID de slot inválido"/"slot debe ser un UUID válido"/g' "$file"

# precios/[id] - Ya lo corregimos manualmente antes, pero por si acaso
file="__tests__/api/precios/[id].test.ts"
echo "📝 Verificando $file..."
sed -i '' 's/"ID de precio inválido"/"precio debe ser un UUID válido"/g' "$file"

# precios/resolver - Ya lo corregimos manualmente antes, pero verificamos producto_id
file="__tests__/api/precios/resolver.test.ts"
echo "📝 Verificando $file..."
sed -i '' 's/"producto_id inválido"/"producto debe ser un UUID válido"/g' "$file"
sed -i '' 's/"service_point_id inválido"/"service point debe ser un UUID válido"/g' "$file"
sed -i '' 's/"ubicacion_id inválido"/"ubicacion debe ser un UUID válido"/g' "$file"

echo "✅ Corrección de tests completada!"
echo "🧪 Ejecuta 'npm test' para verificar"
