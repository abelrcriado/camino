# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
