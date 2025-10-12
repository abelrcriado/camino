#!/bin/bash

# Script para probar creación de Payment Intent
# Asegúrate de que el servidor esté corriendo en http://localhost:3000

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Probando creación de Payment Intent...${NC}\n"

# Paso 1: Crear Payment Intent
echo -e "${BLUE}📤 POST /api/payments${NC}"
echo -e "Request Body:"
cat << 'EOF'
{
  "booking_id": "00000000-0000-0000-0000-000000000001",
  "user_id": "00000000-0000-0000-0000-000000000002",
  "service_point_id": "00000000-0000-0000-0000-000000000003",
  "amount": 2500,
  "currency": "EUR",
  "description": "Test payment - Reparación básica",
  "payment_method": "card"
}
EOF

echo -e "\n${BLUE}Enviando request...${NC}\n"

response=$(curl -s -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "00000000-0000-0000-0000-000000000001",
    "user_id": "00000000-0000-0000-0000-000000000002",
    "service_point_id": "00000000-0000-0000-0000-000000000003",
    "amount": 2500,
    "currency": "EUR",
    "description": "Test payment - Reparación básica",
    "payment_method": "card"
  }')

echo -e "${GREEN}Response:${NC}"
echo "$response" | jq '.' 2>/dev/null || echo "$response"

# Verificar si tiene client_secret (señal de éxito)
if echo "$response" | grep -q "client_secret"; then
  echo -e "\n${GREEN}✅ Payment Intent creado exitosamente!${NC}"
  
  # Extraer el client_secret
  client_secret=$(echo "$response" | jq -r '.client_secret' 2>/dev/null)
  payment_id=$(echo "$response" | jq -r '.payment_id' 2>/dev/null)
  
  echo -e "\n${BLUE}📋 Datos importantes:${NC}"
  echo -e "  Payment ID: ${GREEN}$payment_id${NC}"
  echo -e "  Client Secret: ${GREEN}${client_secret:0:30}...${NC}"
  echo -e "\n${BLUE}💡 Próximo paso:${NC}"
  echo -e "  Usa este client_secret en tu frontend para confirmar el pago"
else
  echo -e "\n${RED}❌ Error al crear Payment Intent${NC}"
  echo -e "${RED}Verifica:${NC}"
  echo -e "  1. Servidor corriendo en http://localhost:3000"
  echo -e "  2. Variables de entorno configuradas (.env.local)"
  echo -e "  3. Datos de prueba creados en Supabase"
fi
