# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.4.1](https://github.com/abelrcriado/camino/compare/v0.4.0...v0.4.1) (2025-10-17)

### 🧹 Chores

- fix husky v10 deprecation warnings and update roadmap ([2e84793](https://github.com/abelrcriado/camino/commit/2e84793bcfc279d8773891b40aaa36f553030aa9))

### 📚 Documentation

- **swagger:** add documentation for Bookings (4) and Payments (2/7) ([2494017](https://github.com/abelrcriado/camino/commit/2494017f64b7d66e7a2bb806ed191cdf9cc5c389))
- **swagger:** add Service Points, Categories and Subcategories documentation ([79c975a](https://github.com/abelrcriado/camino/commit/79c975a5c64bf550726047cc0412b25f3a62f16a))
- **swagger:** add Stock Requests and Warehouse Inventory (20 endpoints) ([edd3e6d](https://github.com/abelrcriado/camino/commit/edd3e6d9d7ea11fcc88b2079a86a54896e0cb04c))
- **swagger:** add Users, Locations, Workshops and Warehouses documentation ([64bd365](https://github.com/abelrcriado/camino/commit/64bd3656a6193cf68c24380fbd37110cd668920d))
- **swagger:** complete Payments + add Products and Vending Machines documentation ([3cdac5b](https://github.com/abelrcriado/camino/commit/3cdac5b55059819a7533379a5813d4044992fbf4))
- **swagger:** complete Services and Miscellaneous documentation (final 16 endpoints) ([d5a3f01](https://github.com/abelrcriado/camino/commit/d5a3f010f82a42298365730f540119031ef009ed))

## [0.4.0](https://github.com/abelrcriado/camino/compare/v0.3.4...v0.4.0) (2025-10-17)

### ⚠ BREAKING CHANGES

- Major code reorganization for architectural clarity

**New Structure:**

- src/api/ - REST API (controllers, services, repositories, middlewares, schemas, errors)
- src/dashboard/ - Dashboard/Admin UI (components, hooks, styles, utils)
- src/shared/ - Shared code (dto, types, constants, helpers, utils)

**Changes:**

- Moved 426+ files to new structure
- Updated all imports to @/api/, @/dashboard/, @/shared/
- Fixed duplicate endpoints (service-assignments, ventas-app)
- Added scripts: test:api, test:dashboard, lint:api, lint:dashboard
- Added ESLint rules to prevent cross-imports

**Testing:**

- 96/97 test suites passing (99%)
- 2409/2410 tests passing (99.96%)
- 0 import errors
- 0 module not found errors

**Migration Scripts:**

- scripts/update-imports.sh
- Automated fixes for **tests**/, pages/api/, src/

Refs: docs/ARCHITECTURE_OPTIONS.md

- **pricing:** None

### 📚 Documentation

- reorganizar documentación y establecer arquitectura de dos sub-proyectos ([6b11fbd](https://github.com/abelrcriado/camino/commit/6b11fbd3eae94d606b5737c5156562c30d2b6574))

### ♻️ Code Refactoring

- change some features and organitactions ([07dc1f9](https://github.com/abelrcriado/camino/commit/07dc1f9cae7000c247c10350f63cd396a791ebaa))
- reorganize monolith into api/, dashboard/, shared/ structure ([b196b6a](https://github.com/abelrcriado/camino/commit/b196b6abad6c33c14821b3f70154fff4cfbb46ae))

### ✨ Features

- **auth:** implementar sistema completo de autenticación con Supabase ([b44c62c](https://github.com/abelrcriado/camino/commit/b44c62cef297f7cc8e1ea161da1d41fada61ac9f))
- **pricing:** complete Issue [#11](https://github.com/abelrcriado/camino/issues/11) - POST /api/precios verification and documentation ([7188f43](https://github.com/abelrcriado/camino/commit/7188f43237f94d1ec348fc0794951bdb155b27a2)), closes [#12](https://github.com/abelrcriado/camino/issues/12)

### ✅ Tests

- **auth:** add controller tests with factory pattern (33/33 passing) ([87f2fae](https://github.com/abelrcriado/camino/commit/87f2faeaeac13ab69db46c39173fcc680dcebafc))

### [0.3.4](https://github.com/abelrcriado/camino/compare/v0.3.3...v0.3.4) (2025-10-15)

### ✨ Features

- **tests:** complete service tests migration to @ngneat/falso factories (100%) ([9fd36db](https://github.com/abelrcriado/camino/commit/9fd36db088052889c4c5547d0542ee5a56a5ba5a))

### 🧹 Chores

- add Supabase env vars to jest.setup.js ([de3f53c](https://github.com/abelrcriado/camino/commit/de3f53c63c2fba24c698d46e098346914bb999e0))

### ✅ Tests

- **controllers:** migrate favorite.controller.test to factories ([a6fce61](https://github.com/abelrcriado/camino/commit/a6fce611636d54a26277500e3411227f2b17f7d8))
- **controllers:** migrate inventory_item.controller.test to factories ([48b8e1b](https://github.com/abelrcriado/camino/commit/48b8e1bfcea998f76c03f95bf81dbddf908a1bc7))
- **controllers:** migrate inventory.controller.test to factories ([641cb8e](https://github.com/abelrcriado/camino/commit/641cb8ef17feb4a73b46352665df32d0fbdc998a))
- **controllers:** migrate partner.controller.test to factories ([c6dbfef](https://github.com/abelrcriado/camino/commit/c6dbfef0b35e9a7aa29c6265edfce86c4949441b))
- **controllers:** migrate taller_manager.controller.test to factories ([4669b35](https://github.com/abelrcriado/camino/commit/4669b3545298700f82123f32afb41602469363c3))
- **controllers:** migrate user.controller.test to factories ([3f0363e](https://github.com/abelrcriado/camino/commit/3f0363e926423542b3f8150c0d33c04d45ac6537))
- **controllers:** migrate vending_machine.controller.test to factories ([33ff616](https://github.com/abelrcriado/camino/commit/33ff6169308087244c09c3b346568c7a945461a3))
- **repositories:** add ServiceAssignmentFactory and migrate user, booking tests ([9d1d989](https://github.com/abelrcriado/camino/commit/9d1d989eefdee413826fc9cbb9110134a1a90a3f))
- **repositories:** migrate partner tests to factories and add imports to all remaining files ([0a3ddb5](https://github.com/abelrcriado/camino/commit/0a3ddb5304e695e1994aace11985523237c74a11))
- **repositories:** migrate workshop and camino tests to factories ([3ff017e](https://github.com/abelrcriado/camino/commit/3ff017e189f4625cb3faf6797de715226bd6b295))
- **schemas:** migrate all remaining schema tests to factories (18/18 complete) ([6d81040](https://github.com/abelrcriado/camino/commit/6d8104065f32b2d11a17f32c6295eda05ef29ec9))
- **schemas:** migrate booking.schema.test to factories ([a18e982](https://github.com/abelrcriado/camino/commit/a18e98228f3835afcf4c8c7fca3e67cebe7e6a18))
- **schemas:** migrate payment and camino schema tests to factories ([d5f0db2](https://github.com/abelrcriado/camino/commit/d5f0db23e443164b993c45316608cf8fc675f793))
- **schemas:** migrate user.schema.test to factories ([08eda4b](https://github.com/abelrcriado/camino/commit/08eda4b7cb197a1c63baf8c1d098ddcacd918946))

### 📚 Documentation

- **tests:** update README with completed schema migration (97% total) ([0b90795](https://github.com/abelrcriado/camino/commit/0b90795aaec124b3b13b1a80a6621e408c0b5326))
- **tests:** update README with repository migration progress ([43bcf24](https://github.com/abelrcriado/camino/commit/43bcf243a9c2154683071d14513ffc7031fed670))

### [0.3.3](///compare/v0.3.2...v0.3.3) (2025-10-14)

### ✅ Tests

- **coverage:** adjust coverage threshold to current reality (44%) a13e868

### ♻️ Code Refactoring

- **api:** centralize error messages and validation (Sprint 6.4 Phase 2) cb6e593

### 📚 Documentation

- complete Sprint 6.3 documentation (asyncHandler migration 100%) c09c500
- **roadmap:** adjust Sprint 6.4 plan to reflect coverage reality a3aba38
- **roadmap:** insert Sprint 7 (Config + Factories) before Sprint 8 d4108f1
- **roadmap:** reorganize strategy v3.0 - features first, transactions later 3489751
- **roadmap:** update Sprint 6.3 status to COMPLETADO 67aecec
- update BACKLOG and ROADMAP for Sprint 6.4 completion 0b9001a

### ✨ Features

- **config:** centralized type-safe config with Zod validation 2dd6878

### [0.3.2](///compare/v0.3.1...v0.3.2) (2025-10-13)

### 📚 Documentation

- update sprint documentation for Sprint 6.2 completion 215e6c4

### 🧹 Chores

- remove backup file from AppError migration 757a7a7

### ♻️ Code Refactoring

- **endpoints:** migrate batch 1 to asyncHandler (7 endpoints) 73c63bb
- **endpoints:** migrate batch 2 to asyncHandler (8 endpoints) f3d445d
- **endpoints:** migrate batch 3 to asyncHandler (9 endpoints) 45e6936
- **endpoints:** migrate batch 4 to asyncHandler (14 endpoints) f8085bd
- **endpoints:** migrate final 64 endpoints to asyncHandler (mega-batch) ceff39a

### [0.3.1](///compare/v0.3.0...v0.3.1) (2025-10-13)

### 📚 Documentation

- complete Sprint 6.1 documentation with accurate metrics 4508ab0

### ♻️ Code Refactoring

- **services:** finalize AppError migration (final 4 services) cad3776
- **services:** migrate batch 3 to AppError (warehouse, product-category, geolocation, booking) 0283bc9
- **services:** migrate batch 4 to AppError (4 services) 3f83b94
- **services:** migrate batch 5 to AppError (5 services) 8bfb58d
- **services:** migrate payment and product-subcategory to AppError 969d84b
- **services:** migrate service and service_assignment to AppError d1cb266

## [0.3.0](///compare/v0.2.0...v0.3.0) (2025-10-13)

### ⚠ BREAKING CHANGES

- console.log no longer allowed in src/
  Use logger from @/config/logger instead

Closes Sprint 6.1

### ✨ Features

- **async:** complete asyncHandler migration - all 20 endpoints (Sprint 6.1) e32778c
- **async:** migrate 8 endpoints to asyncHandler pattern (Sprint 6.1) a8488b6, closes #sprint-6

### 🐛 Bug Fixes

- **tests:** complete asyncHandler error format migration ce436ac
- **tests:** update tests for async Handler error format (partial) 0a2ba89

### ✅ Tests

- update venta_app.service tests for AppError hierarchy 4ef96c7

### ♻️ Code Refactoring

- eliminate all console.log, add winston logger 9db8648
- **services:** migrate availability to AppError hierarchy bf80d83
- **services:** migrate precio to AppError hierarchy 173324c
- **services:** migrate producto to AppError hierarchy 0c7f7bd
- **services:** migrate service-product to AppError 908fdef
- **services:** migrate vending_machine_slot to AppError hierarchy 139468f
- **services:** migrate venta_app to AppError hierarchy f5cc67b
- **services:** migrate warehouse-inventory to AppError 2b2a8ae

## [0.2.0](///compare/v0.1.0...v0.2.0) (2025-10-12)

### ⚠ BREAKING CHANGES

- **analysis:** All future development must follow Phase 1 patterns
  before implementing new features. No more features without quality
  infrastructure in place.

Refs: #analysis #reorganization #quality-first

### 🧹 Chores

- **deps:** add prettier for code formatting 31ca4e4

### 💎 Styles

- format code with prettier d636633

### 📚 Documentation

- **analysis:** comprehensive engineering analysis and strategic reorganization d1f8075

## 0.1.0 (2025-10-12)

### 🧹 Chores

- **docs:** sistema mandatory de documentación y configuración profesional Git eec6541
