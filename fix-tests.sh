#!/bin/bash
# Script para corregir mensajes de error en tests después de refactorización con utilidades

# Función para actualizar test con patrón específico
update_test() {
    local file=$1
    local old_msg=$2
    local new_msg=$3
    
    if [ -f "$file" ]; then
        sed -i '' "s|$old_msg|$new_msg|g" "$file"
    fi
}

# Patrón 1: Cuando query: {} (sin ID) - mensaje debe ser "ID de {entity} es requerido"
# Patrón 2: Cuando query: { id: [array] } (no es string) - mensaje debe ser "ID debe ser un string"  
# Patrón 3: Cuando query: { id: "invalid" } (no es UUID) - mensaje debe ser "{entity} debe ser un UUID válido"

echo "Corrigiendo __tests__/api/caminos/[id]/stats.test.ts..."
update_test "__tests__/api/caminos/[id]/stats.test.ts" \
    '"error": "ID de camino es requerido"' \
    '"error": "ID debe ser un string"'
update_test "__tests__/api/caminos/[id]/stats.test.ts" \
    '"error": "ID de camino inválido"' \
    '"error": "camino debe ser un UUID válido"'

echo "Corrigiendo __tests__/api/precios/[id].test.ts..."
# En este archivo, el primer test (query: {}) debe quedar como está
# Solo cambiamos el segundo test (query: { id: [array] }) y el tercero
update_test "__tests__/api/precios/[id].test.ts" \
    '"error": "ID de precio inválido"' \
    '"error": "precio debe ser un UUID válido"'

echo "Corrigiendo __tests__/api/precios/resolver.test.ts..."
update_test "__tests__/api/precios/resolver.test.ts" \
    '"error": "producto_id es requerido"' \
    '"error": "ID debe ser un string"'
update_test "__tests__/api/precios/resolver.test.ts" \
    '"error": "producto_id inválido"' \
    '"error": "producto debe ser un UUID válido"'
update_test "__tests__/api/precios/resolver.test.ts" \
    '"error": "service_point_id inválido"' \
    '"error": "service point debe ser un UUID válido"'
update_test "__tests__/api/precios/resolver.test.ts" \
    '"error": "ubicacion_id inválido"' \
    '"error": "ubicación debe ser un UUID válido"'

echo "Corrigiendo __tests__/api/ventas-app/[id].test.ts..."
update_test "__tests__/api/ventas-app/[id].test.ts" \
    '"error": "ID de venta es requerido"' \
    '"error": "ID debe ser un string"'
update_test "__tests__/api/ventas-app/[id].test.ts" \
    '"error": "ID de venta inválido"' \
    '"error": "venta debe ser un UUID válido"'

echo "Corrigiendo __tests__/api/ventas-app/[id]/confirmar-retiro.test.ts..."
update_test "__tests__/api/ventas-app/[id]/confirmar-retiro.test.ts" \
    '"error": "ID de venta es requerido"' \
    '"error": "ID debe ser un string"'
update_test "__tests__/api/ventas-app/[id]/confirmar-retiro.test.ts" \
    '"error": "ID de venta inválido"' \
    '"error": "venta debe ser un UUID válido"'

echo "Corrigiendo __tests__/api/ventas-app/usuario/[userId].test.ts..."
update_test "__tests__/api/ventas-app/usuario/[userId].test.ts" \
    '"error": "ID de usuario es requerido"' \
    '"error": "ID debe ser un string"'
update_test "__tests__/api/ventas-app/usuario/[userId].test.ts" \
    '"error": "ID de usuario inválido"' \
    '"error": "usuario debe ser un UUID válido"'

echo "Corrigiendo __tests__/api/ubicaciones/[id].test.ts..."
update_test "__tests__/api/ubicaciones/[id].test.ts" \
    '"error": "ID de ubicación es requerido"' \
    '"error": "ID debe ser un string"'

echo "Corrigiendo __tests__/api/ubicaciones/[id]/service-points.test.ts..."
update_test "__tests__/api/ubicaciones/[id]/service-points.test.ts" \
    '"error": "ID de ubicación es requerido"' \
    '"error": "ID debe ser un string"'
update_test "__tests__/api/ubicaciones/[id]/service-points.test.ts" \
    '"error": "ID de ubicación inválido"' \
    '"error": "ubicación debe ser un UUID válido"'

echo "Corrigiendo __tests__/api/vending-machines/[id]/slots/index.test.ts..."
update_test "__tests__/api/vending-machines/[id]/slots/index.test.ts" \
    '"error": "ID de vending machine es requerido"' \
    '"error": "ID debe ser un string"'
update_test "__tests__/api/vending-machines/[id]/slots/index.test.ts" \
    '"error": "ID de vending machine inválido"' \
    '"error": "vending machine debe ser un UUID válido"'

echo "Corrigiendo __tests__/api/vending-machines/[id]/slots/reabastecer.test.ts..."
update_test "__tests__/api/vending-machines/[id]/slots/reabastecer.test.ts" \
    '"error": "ID de vending machine es requerido"' \
    '"error": "ID debe ser un string"'
update_test "__tests__/api/vending-machines/[id]/slots/reabastecer.test.ts" \
    '"error": "ID de vending machine inválido"' \
    '"error": "vending machine debe ser un UUID válido"'
update_test "__tests__/api/vending-machines/[id]/slots/reabastecer.test.ts" \
    '"error": "ID de slot es requerido"' \
    '"error": "ID debe ser un string"'
update_test "__tests__/api/vending-machines/[id]/slots/reabastecer.test.ts" \
    '"error": "ID de slot inválido"' \
    '"error": "slot debe ser un UUID válido"'
update_test "__tests__/api/vending-machines/[id]/slots/reabastecer.test.ts" \
    '"error": "Slot no encontrado en esta vending machine"' \
    '"error": "Slot no encontrado en este vending machine"'

echo "✅ Correcciones completadas"
