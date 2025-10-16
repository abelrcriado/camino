#!/usr/bin/env bash
set -euo pipefail

# carpeta raíz del proyecto (cámbiala si quieres)
ROOT="camino-service-network"
mkdir -p "$ROOT"

# helper: crea archivo .md con H1 dentro
mk() {
  local path="$1"
  local title="$2"
  mkdir -p "$(dirname "$path")"
  printf "# %s\n" "$title" > "$path"
}

###############################################################################
# raíz (sección fuera de partes)
###############################################################################
mk "$ROOT/00-resumen-ejecutivo.md" "Resumen ejecutivo"

###############################################################################
# PARTE I: estrategia y oportunidad de mercado
###############################################################################
PART1="$ROOT/parte-i-estrategia-y-oportunidad-de-mercado"
mkdir -p "$PART1"
mk "$PART1/01-contexto-y-oportunidad-de-negocio.md" "Contexto y oportunidad de negocio"
mk "$PART1/02-analisis-de-mercado.md" "Análisis de mercado"
mk "$PART1/03-propuesta-de-valor.md" "Propuesta de valor"

###############################################################################
# PARTE II: modelo de negocio y producto
###############################################################################
PART2="$ROOT/parte-ii-modelo-de-negocio-y-producto"
mkdir -p "$PART2"
mk "$PART2/04-modelo-de-negocio.md" "Modelo de negocio"
mk "$PART2/05-descripcion-del-producto-servicio.md" "Descripción del producto/servicio"
mk "$PART2/06-estrategia-de-partnerships.md" "Estrategia de partnerships"

###############################################################################
# PARTE III: plan operativo
###############################################################################
PART3="$ROOT/parte-iii-plan-operativo"
mkdir -p "$PART3"
mk "$PART3/07-arquitectura-tecnologica.md" "Arquitectura tecnológica"
mk "$PART3/08-plan-de-operaciones.md" "Plan de operaciones"
mk "$PART3/09-estructura-organizacional.md" "Estructura organizacional"
mk "$PART3/10-roadmap-de-ejecucion.md" "Roadmap de ejecución"
mk "$PART3/11-plan-de-lanzamiento.md" "Plan de lanzamiento"

###############################################################################
# PARTE IV: gobernanza, riesgos y crecimiento
###############################################################################
PART4="$ROOT/parte-iv-gobernanza-riesgos-y-crecimiento"
mkdir -p "$PART4"
mk "$PART4/12-estrategia-de-riesgos-y-mitigacion.md" "Estrategia de riesgos y mitigación"
mk "$PART4/13-estrategia-de-crecimiento-y-expansion.md" "Estrategia de crecimiento y expansión"
mk "$PART4/14-impacto-y-sostenibilidad.md" "Impacto y sostenibilidad"
mk "$PART4/15-estrategia-legal-y-regulatoria.md" "Estrategia legal y regulatoria"

###############################################################################
# APÉNDICES Y ANEXOS (letras)
###############################################################################
APP="$ROOT/apendices-y-anexos"
mkdir -p "$APP"
mk "$APP/A-dataset-y-analisis-de-flujo-ciclista.md" "Dataset y análisis de flujo ciclista"
mk "$APP/B-fichas-tecnicas-de-modulos-service-box.md" "Fichas técnicas de módulos (Service Box)"
mk "$APP/C-ejemplos-de-contratos-csp-csh.md" "Ejemplos de contratos (CSP / CSH)"
mk "$APP/D-mockups-de-la-app-y-dashboards.md" "Mockups de la app y dashboards"
mk "$APP/E-proyecciones-financieras-detalladas.md" "Proyecciones financieras detalladas"
mk "$APP/F-material-de-comunicacion-y-branding.md" "Material de comunicación y branding"

echo "Estructura creada en: $ROOT"

