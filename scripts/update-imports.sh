#!/bin/bash

# Script para actualizar imports después de reorganización de carpetas
# Fecha: 16 de octubre de 2025

echo "🔄 Actualizando imports en todo el proyecto..."

# Función para reemplazar imports
update_imports() {
    local old_path=$1
    local new_path=$2
    local description=$3
    
    echo "📝 Actualizando: $description"
    find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/.next/*" \
        -not -path "*/coverage/*" \
        -exec sed -i '' "s|@/${old_path}|@/${new_path}|g" {} \;
}

# API imports
update_imports "controllers/" "api/controllers/" "Controllers"
update_imports "services/" "api/services/" "Services"
update_imports "repositories/" "api/repositories/" "Repositories"
update_imports "middlewares/" "api/middlewares/" "Middlewares"
update_imports "schemas/" "api/schemas/" "Schemas"
update_imports "errors/" "api/errors/" "Errors"

# Shared imports
update_imports "dto/" "shared/dto/" "DTOs"
update_imports "types/" "shared/types/" "Types"
update_imports "constants/" "shared/constants/" "Constants"
update_imports "helpers/" "shared/helpers/" "Helpers"
update_imports "utils/" "shared/" "Utils"

# Dashboard imports
update_imports "components/" "dashboard/components/" "Components"
update_imports "styles/" "dashboard/styles/" "Styles"

echo "✅ Imports actualizados!"
echo "🧪 Ejecuta 'npm test' para verificar que todo funciona"
