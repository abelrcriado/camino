# 🏗️ Opciones de Arquitectura: API + Dashboard

**Fecha:** 16 de octubre de 2025  
**Contexto:** Separar proyecto actual en 2 sub-proyectos independientes

---

## 📊 Situación Actual

**Proyecto monolítico** con Next.js 14 (Pages Router):

```
camino/
├── pages/
│   ├── api/          ← API REST (102 endpoints)
│   └── dashboard/    ← Dashboard Admin
├── src/              ← Shared (controllers, services, repositories)
└── package.json      ← Single build/deployment
```

**Problemas:**

- ❌ Mezcladas responsabilidades API + UI
- ❌ Un solo build para todo (deploy innecesario de dashboard al cambiar API)
- ❌ Dependencias compartidas (React solo necesario para dashboard)
- ❌ Escalado: Si API necesita más recursos, dashboard también escala
- ❌ Testing: Tests de API mezclados con tests de UI

---

## 🎯 Opciones Arquitectónicas

### Opción 1: Monorepo con Turborepo (⭐ RECOMENDADO)

**Estructura:**

```
camino-workspace/
├── apps/
│   ├── api/                    ← Next.js API-only (o Express/Fastify)
│   │   ├── pages/api/
│   │   ├── src/
│   │   └── package.json
│   └── dashboard/              ← Next.js App Router
│       ├── app/
│       ├── components/
│       └── package.json
├── packages/
│   ├── shared/                 ← Código compartido
│   │   ├── dto/
│   │   ├── types/
│   │   └── constants/
│   ├── database/               ← Supabase client, migrations
│   └── config/                 ← ESLint, TypeScript configs
├── package.json                ← Root workspace
├── turbo.json                  ← Build orchestration
└── pnpm-workspace.yaml
```

**Ventajas:**

- ✅ **Separación total** de concerns (API ≠ Dashboard)
- ✅ **Builds independientes:** Solo rebuilds lo que cambió
- ✅ **Deploy independiente:** API puede actualizar sin tocar Dashboard
- ✅ **Cache inteligente:** Turbo cachea builds (~10x faster)
- ✅ **Shared packages:** DTOs, types, utils compartidos
- ✅ **Escalado independiente:** API puede tener más replicas que Dashboard
- ✅ **Dependencies optimizadas:** API no necesita React/Recharts

**Desventajas:**

- ⚠️ **Migración compleja:** 2-3 días de trabajo
- ⚠️ **Curva de aprendizaje:** Turborepo + pnpm workspaces
- ⚠️ **Configuración inicial:** Setup de monorepo desde cero

**Herramientas:**

- [Turborepo](https://turbo.build/) - Build system
- [pnpm workspaces](https://pnpm.io/workspaces) - Package manager
- Next.js 14+ para ambas apps

**Migración estimada:** 2-3 días

---

### Opción 2: Monorepo con Nx (Alternativa Enterprise)

**Estructura similar** a Turborepo pero con más features:

```
camino-workspace/
├── apps/
│   ├── api/
│   └── dashboard/
├── libs/              ← Shared libraries (igual que packages/)
└── nx.json            ← Orchestration config
```

**Ventajas adicionales sobre Turborepo:**

- ✅ **Dependency graph visual:** `nx graph`
- ✅ **Affected commands:** Solo testea/builda lo afectado
- ✅ **Plugins oficiales:** Next.js, React, Node
- ✅ **Generators:** Create new apps/libs con CLI

**Desventajas:**

- ⚠️ **Más complejo** que Turborepo (overkill para 2 apps)
- ⚠️ **Mayor overhead** de configuración
- ⚠️ **Curva de aprendizaje** más pronunciada

**Migración estimada:** 3-4 días

---

### Opción 3: Separar en 2 Repositorios

**Estructura:**

```
camino-api/              ← Repo 1 (API REST)
├── pages/api/
├── src/
└── package.json

camino-dashboard/        ← Repo 2 (Dashboard)
├── app/
├── components/
└── package.json

camino-shared/           ← Repo 3 (DTOs compartidos)
├── dto/
├── types/
└── package.json (published to npm private)
```

**Ventajas:**

- ✅ **Separación total:** Git, CI/CD, deploys completamente independientes
- ✅ **Equipos independientes:** Frontend team ≠ Backend team
- ✅ **Versioning granular:** API v2.0 + Dashboard v1.3

**Desventajas:**

- ❌ **Sincronización manual:** Cambios en DTOs requieren publish + update
- ❌ **Overhead de gestión:** 3 repos, 3 CI/CD, 3 deploys
- ❌ **Duplicación:** Configs de ESLint, TypeScript repetidas
- ❌ **Desarrollo lento:** Cambiar un DTO = publish package + update dependencia

**Migración estimada:** 4-5 días (más gestión a largo plazo)

---

### Opción 4: Mantener Monolito (Status Quo Mejorado)

**Estructura actual con organización clara:**

```
camino/
├── pages/
│   ├── api/          ← API (PRIORITY 1)
│   └── dashboard/    ← Dashboard (PRIORITY 2)
├── src/
│   ├── api/          ← Código solo API (controllers, services, repos)
│   ├── dashboard/    ← Código solo Dashboard (components, hooks)
│   └── shared/       ← DTOs, types, utils
└── package.json
```

**Mejoras a implementar:**

- ✅ **Separación clara** de carpetas `src/api/` vs `src/dashboard/`
- ✅ **Scripts separados:** `npm run dev:api` vs `npm run dev:dashboard`
- ✅ **ESLint rules:** Prohibir imports de dashboard en API
- ✅ **Tests separados:** `npm test:api` vs `npm test:dashboard`

**Ventajas:**

- ✅ **Zero migration:** Continuar trabajando hoy
- ✅ **Simple:** No overhead de monorepo
- ✅ **Fast iteration:** Cambios rápidos sin complejidad

**Desventajas:**

- ❌ **Single build:** Cambio en API rebuilds dashboard
- ❌ **Single deploy:** No puedes deployar solo API
- ❌ **Dependencies bloat:** Dashboard deps en API bundle

**Esfuerzo:** 1 día (reorganizar carpetas + scripts)

---

## 🎯 Recomendación Final

### Para AHORA (Fase 1-2): **Opción 4 - Mantener Monolito Mejorado**

**Razón:**

- Estás en fase de desarrollo rápido (Issue #12, features core)
- El overhead de migrar a monorepo **no justifica el beneficio** aún
- No tienes equipos separados (frontend/backend)
- Deploy independiente no es crítico en desarrollo

**Implementar:**

1. Reorganizar `src/` en `api/` y `dashboard/` (1 hora)
2. Añadir scripts `dev:api` y `dev:dashboard` (30 min)
3. ESLint rules para evitar imports cruzados (1 hora)
4. Documentar separación en Copilot instructions (30 min)

**Total:** ~1 día de trabajo

---

### Para FUTURO (Fase 3+): **Opción 1 - Migrar a Turborepo**

**Cuándo migrar:**

- ✅ Features core completadas (Issue #12, Notifications, Reviews, etc.)
- ✅ Dashboard funcional en producción
- ✅ Necesitas deploy independiente (API actualiza 10x más que Dashboard)
- ✅ Equipo crece (frontend dev + backend dev)

**Plan de migración (Sprint dedicado 2-3 días):**

1. Setup Turborepo workspace
2. Migrar API a `apps/api/`
3. Migrar Dashboard a `apps/dashboard/`
4. Extraer shared a `packages/shared/`
5. Configurar CI/CD para ambas apps
6. Documentar nuevo workflow

**Beneficio:** Builds 10x más rápidos, deploys independientes, mejor escalabilidad

---

## 📋 Comparativa Rápida

| Criterio                 | Monolito Mejorado | Turborepo | Nx         | 2 Repos        |
| ------------------------ | ----------------- | --------- | ---------- | -------------- |
| **Esfuerzo migración**   | 1 día ✅          | 2-3 días  | 3-4 días   | 4-5 días       |
| **Build speed**          | Lento ⚠️          | Rápido ✅ | Rápido ✅  | Rápido ✅      |
| **Deploy independiente** | No ❌             | Sí ✅     | Sí ✅      | Sí ✅          |
| **Shared code**          | Fácil ✅          | Fácil ✅  | Fácil ✅   | Complejo ❌    |
| **Overhead gestión**     | Bajo ✅           | Medio     | Alto       | Alto ❌        |
| **Learning curve**       | Zero ✅           | Media     | Alta       | Baja           |
| **Best for**             | MVP/Early ✅      | Growth    | Enterprise | Multiple teams |

---

## 🚀 Plan de Acción Recomendado

### Fase 1: AHORA (Octubre 2025)

- [ ] **Opción 4:** Reorganizar monolito con separación clara
- [ ] Actualizar Copilot instructions con arquitectura 2 sub-proyectos
- [ ] Continuar con Issue #12 y features core

### Fase 2: Cuando Dashboard esté en producción (Enero 2026?)

- [ ] **Evaluar migración a Turborepo**
- [ ] Si deploy independiente es necesario → Migrar
- [ ] Si monolito funciona bien → Postponer

### Fase 3: Growth (2026+)

- [ ] Si equipo crece → Turborepo/Nx
- [ ] Si equipos separados → Considerar 2 repos

---

## 📚 Referencias

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Nx Docs](https://nx.dev/)
- [Monorepo vs Polyrepo](https://monorepo.tools/)
- [Next.js Monorepo Example](https://github.com/vercel/turborepo/tree/main/examples/with-nextjs)

---

**Decisión pendiente:** ¿Proceder con Opción 4 (monolito mejorado) por ahora?
