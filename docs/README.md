# 📚 Documentación - Camino Service Backend

Documentación técnica del proyecto. **Última actualización:** 16 de octubre de 2025

---

## 🎯 Arquitectura de Dos Sub-Proyectos

**PRINCIPIO CRÍTICO:** Este proyecto consiste en dos sub-proyectos independientes:

1. **API REST** (`pages/api/` + `src/`)
   - Sirve datos a la app móvil (futura)
   - Prioridad ALTA - Desarrollo en Fase 1
   - Backend completo: controllers, services, repositories

2. **Dashboard/Admin** (`pages/dashboard/`)
   - Configura datos servidos por la API
   - Prioridad BAJA - Desarrollo en Fase 2 (después de API)
   - UI administrativa que consume la API

**Ver:** `ROADMAP.md` para orden de desarrollo y prioridades.

---

## 📋 Documentación Activa

### Planificación y Roadmap

- **[ROADMAP.md](ROADMAP.md)** 🎯 **PRINCIPAL**
  - Backlog priorizado de funcionalidades
  - Métricas actuales del proyecto
  - Próximas features a implementar
  - Optimizaciones pendientes

### Arquitectura

- **[CLEAN_ARCHITECTURE.md](CLEAN_ARCHITECTURE.md)**
  - Guía completa de 5 capas
  - Flujo de peticiones
  - Patrones y convenciones
  - Ejemplos prácticos

- **[ARCHITECTURE.md](ARCHITECTURE.md)**
  - Arquitectura general del sistema
  - Modelo de datos
  - Integraciones (Supabase, Stripe)
  - Decisiones arquitectónicas

- **[DASHBOARD_ARCHITECTURE.md](DASHBOARD_ARCHITECTURE.md)**
  - Arquitectura del dashboard admin
  - Componentes React
  - Estructura de navegación
  - Patrones UI

### Modelo de Negocio

- **[notas.md](notas.md)**
  - Modelo de negocio del sistema
  - Jerarquía: Camino → Ubicación → Service Point
  - Vending machines y productos
  - Precios, comisiones y márgenes

---

##  Archivo Histórico

Ubicado en `archive/`:

- Análisis completados (ingeniería, gaps, funcionalidades)
- Sprints completados (Sprints 1-6, Issue #11)
- Guías de migración completadas (asyncHandler, AppError)
- BACKLOG y COMPLETED_SPRINTS antiguos
- Documentación de análisis arquitectónico inicial

**No modificar archivos en `archive/`.** Son solo referencia histórica.

---

## 🎯 Flujo de Trabajo

### Para Nueva Funcionalidad

1. Consultar `ROADMAP.md` para prioridades
2. Seguir patrones en `CLEAN_ARCHITECTURE.md`
3. Implementar feature (ver Copilot instructions: `.github/copilot-instructions.md`)
4. Actualizar `ROADMAP.md` (mover de BACKLOG a COMPLETADO)
5. `npm run release` para generar CHANGELOG

### Para Consultas Arquitectónicas

1. **Clean Architecture:** Ver `CLEAN_ARCHITECTURE.md`
2. **Modelo de datos:** Ver `ARCHITECTURE.md` o `notas.md`
3. **Dashboard UI:** Ver `DASHBOARD_ARCHITECTURE.md`

---

## 📌 Nota Importante

**Este proyecto NO usa documentación de sprints individuales.**

- ✅ **Historial de cambios:** Ver `CHANGELOG.md` (raíz del proyecto)
- ✅ **Commits de git:** Toda la historia del código
- ✅ **Trabajo pendiente:** Solo en `ROADMAP.md`

La documentación se mantiene mínima y enfocada en:
- 🎯 **Qué falta hacer** (ROADMAP.md)
- 🏗️ **Cómo hacerlo** (CLEAN_ARCHITECTURE.md, ARCHITECTURE.md)
- 📖 **Por qué funciona así** (notas.md, guides/)

---

**Última revisión:** 16 de octubre de 2025
