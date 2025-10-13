#!/bin/bash

# Script para corregir tests donde ID es undefined (query: {})
# Estos deben esperar "ID de X es requerido", NO "ID debe ser un string"

echo "🔧 Corrigiendo tests de ID undefined..."

# ventas-app/[id]
file="__tests__/api/ventas-app/[id].test.ts"
echo "📝 Corrigiendo $file..."
# Mantener el que ya corregimos, ahora corregir el otro caso en línea 174
sed -i '' '174s/ID debe ser un string/ID de venta es requerido/' "$file"

# ventas-app/[id]/confirmar-retiro
file="__tests__/api/ventas-app/[id]/confirmar-retiro.test.ts"
echo "📝 Corrigiendo $file..."
# Buscar y reemplazar donde query: {} espera "ID debe ser un string"
sed -i '' 's/expect(data.error).toContain("ID debe ser un string");.*\/\/ query: {}/expect(data.error).toContain("ID de venta es requerido");/g' "$file"
# Alternativa más general para este archivo
awk '/query: \{\}/ {in_test=1} in_test && /ID debe ser un string/ {sub(/ID debe ser un string/, "ID de venta es requerido")} {print} in_test && /\}\);/ {in_test=0}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"

# ubicaciones/[id]
file="__tests__/api/ubicaciones/[id].test.ts"
echo "📝 Corrigiendo $file..."
# Dos casos: uno en GET, otro en validación general
awk '/query: \{\}/ {in_test=1} in_test && /ID debe ser un string/ {sub(/ID debe ser un string/, "ID de ubicación es requerido")} {print} in_test && /\}\);/ {in_test=0}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"

# ubicaciones/[id]/service-points
file="__tests__/api/ubicaciones/[id]/service-points.test.ts"
echo "📝 Corrigiendo $file..."
awk '/query: \{\}/ {in_test=1} in_test && /ID debe ser un string/ {sub(/ID debe ser un string/, "ID de ubicación es requerido")} {print} in_test && /\}\);/ {in_test=0}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"

# vending-machines/[id]/slots/index
file="__tests__/api/vending-machines/[id]/slots/index.test.ts"
echo "📝 Corrigiendo $file..."
awk '/query: \{\}/ {in_test=1} in_test && /ID debe ser un string/ {sub(/ID debe ser un string/, "ID de vending machine es requerido")} {print} in_test && /\}\);/ {in_test=0}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"

# vending-machines/[id]/slots/reabastecer - Este tiene DOS casos: machineId y slotId
file="__tests__/api/vending-machines/[id]/slots/reabastecer.test.ts"
echo "📝 Corrigiendo $file (múltiples casos)..."
# Caso 1: machineId undefined
awk '/debe retornar 400 si el ID de vending machine no está presente/,/\}\);/ {
    if (/ID debe ser un string/) {
        sub(/ID debe ser un string/, "ID de vending machine es requerido")
    }
}
/debe retornar 400 si slot_id no está presente/,/\}\);/ {
    if (/ID debe ser un string/) {
        sub(/ID debe ser un string/, "ID de slot es requerido")
    }
}
{print}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"

# ventas-app/usuario/[userId]
file="__tests__/api/ventas-app/usuario/[userId].test.ts"
echo "📝 Corrigiendo $file..."
awk '/query: \{\}/ {in_test=1} in_test && /ID debe ser un string/ {sub(/ID debe ser un string/, "ID de usuario es requerido")} {print} in_test && /\}\);/ {in_test=0}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"

# precios/resolver - Casos especiales
file="__tests__/api/precios/resolver.test.ts"
echo "📝 Corrigiendo $file..."
# producto_id faltante
awk '/debe retornar 400 si falta producto_id/,/\}\);/ {
    if (/ID debe ser un string/) {
        sub(/ID debe ser un string/, "ID de producto es requerido")
    }
}
{print}' "$file" > "$file.tmp" && mv "$file.tmp" "$file"

echo "✅ Corrección de tests undefined completada!"
echo "🧪 Ejecuta 'npm test' para verificar"
