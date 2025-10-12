#!/bin/bash
# Script de migración automática a asyncHandler
# Sprint 6.1 - asyncHandler Migration
# Fecha: 12 de octubre de 2025

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  asyncHandler Migration Script - Sprint 6.1${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Encontrar todos los archivos API que necesitan migración
echo -e "${YELLOW}📋 Buscando endpoints para migrar...${NC}"
FILES=$(grep -rl "export default async function handler" pages/api/ | grep -v node_modules || true)

if [ -z "$FILES" ]; then
  echo -e "${GREEN}✅ No se encontraron archivos para migrar${NC}"
  exit 0
fi

# Contar archivos
FILE_COUNT=$(echo "$FILES" | wc -l | tr -d ' ')
echo -e "${BLUE}Encontrados ${FILE_COUNT} endpoints para migrar${NC}"
echo ""

# Crear directorio de backups
BACKUP_DIR="backups/async-handler-migration-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo -e "${YELLOW}📁 Backups en: $BACKUP_DIR${NC}"
echo ""

# Contadores
SUCCESS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

# Función para verificar si el archivo ya usa asyncHandler
file_uses_async_handler() {
  local file=$1
  if grep -q "asyncHandler" "$file"; then
    return 0  # Ya usa asyncHandler
  else
    return 1  # No usa asyncHandler
  fi
}

# Migrar cada archivo
for file in $FILES; do
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}🔄 Procesando: ${file}${NC}"
  
  # Verificar si ya usa asyncHandler
  if file_uses_async_handler "$file"; then
    echo -e "${GREEN}⏭️  Ya usa asyncHandler, saltando...${NC}"
    SKIP_COUNT=$((SKIP_COUNT + 1))
    continue
  fi
  
  # Crear backup
  BACKUP_FILE="$BACKUP_DIR/$(basename $file).bak"
  cp "$file" "$BACKUP_FILE"
  echo -e "  ${GREEN}✓${NC} Backup creado: $BACKUP_FILE"
  
  # Crear archivo temporal con la migración
  TMP_FILE="${file}.tmp"
  
  # NOTA: Esta es una migración MANUAL
  # El script genera la lista, pero la transformación debe hacerse manualmente
  # para evitar errores de automatización
  
  echo -e "  ${YELLOW}⚠️  Requiere migración MANUAL${NC}"
  echo -e "  ${BLUE}Pattern:${NC}"
  echo -e "    ${RED}ANTES:${NC} export default async function handler(req, res) {"
  echo -e "    ${GREEN}DESPUÉS:${NC} export default asyncHandler(async (req, res) => {"
  echo ""
  echo -e "    ${RED}ANTES:${NC} import { handleError } from '@/middlewares/error-handler';"
  echo -e "    ${GREEN}DESPUÉS:${NC} import { asyncHandler } from '@/middlewares/error-handler';"
  echo ""
  echo -e "    ${RED}ANTES:${NC} try { ... } catch (error) { return handleError(error, res); }"
  echo -e "    ${GREEN}DESPUÉS:${NC} (eliminar try/catch, asyncHandler lo maneja)"
  echo ""
  
  # Marcar como pendiente manual
  FAIL_COUNT=$((FAIL_COUNT + 1))
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Resumen de Migración${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Exitosos:       ${SUCCESS_COUNT}${NC}"
echo -e "${YELLOW}⏭️  Saltados:        ${SKIP_COUNT}${NC}"
echo -e "${RED}⚠️  Pendientes:      ${FAIL_COUNT}${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo -e "  1. Revisar archivos en pages/api/"
echo -e "  2. Migrar manualmente cada endpoint siguiendo el pattern"
echo -e "  3. Ejecutar tests después de cada migración: npm test"
echo -e "  4. Si tests fallan, revertir desde $BACKUP_DIR"
echo ""
echo -e "${BLUE}📊 Lista de archivos para migrar:${NC}"
echo "$FILES"
echo ""

# Generar lista de archivos para migración manual
OUTPUT_FILE="docs/sprints/endpoints-to-migrate.txt"
mkdir -p "$(dirname $OUTPUT_FILE)"

cat > "$OUTPUT_FILE" << EOF
# Endpoints para Migrar a asyncHandler
# Generado: $(date)
# Sprint 6.1

## Total: $FILE_COUNT archivos

$(echo "$FILES" | while read -r f; do
  echo "- [ ] $f"
done)

## Pattern de Migración

### ANTES:
\`\`\`typescript
import { handleError } from '@/middlewares/error-handler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // lógica del endpoint
    return res.status(200).json({ data: result });
  } catch (error) {
    return handleError(error, res);
  }
}
\`\`\`

### DESPUÉS:
\`\`\`typescript
import { asyncHandler } from '@/middlewares/error-handler';

export default asyncHandler(async (req, res) => {
  // lógica del endpoint (sin try/catch)
  return res.status(200).json({ data: result });
});
\`\`\`

## Validación

Después de cada migración:
1. \`npm test\` - Verificar tests pasan
2. \`npm run lint\` - Verificar lint pasa
3. Si fallan tests, revertir desde backups/

## Backups

Ubicación: $BACKUP_DIR/
EOF

echo -e "${GREEN}✅ Lista generada en: $OUTPUT_FILE${NC}"
echo ""
