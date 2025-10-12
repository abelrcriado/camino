# 🤝 Contributing to Camino Service Backend

Gracias por tu interés en contribuir al proyecto **Camino Service Backend**! Este documento proporciona guías detalladas para asegurar contribuciones de calidad y consistencia.

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#-código-de-conducta)
- [Cómo Contribuir](#-cómo-contribuir)
- [Setup del Entorno](#-setup-del-entorno)
- [Workflow de Desarrollo](#-workflow-de-desarrollo)
- [Conventional Commits](#-conventional-commits)
- [Code Style Guidelines](#-code-style-guidelines)
- [Testing Requirements](#-testing-requirements)
- [Pull Request Process](#-pull-request-process)
- [Reglas Críticas](#-reglas-críticas)

---

## 📜 Código de Conducta

Este proyecto y todos sus participantes están sujetos a un código de conducta. Al participar, se espera que mantengas este código. Por favor reporta comportamiento inaceptable a [soporte@camino.app](mailto:soporte@camino.app).

### Nuestros Compromisos

- Usar lenguaje acogedor e inclusivo
- Respetar diferentes puntos de vista y experiencias
- Aceptar críticas constructivas con gracia
- Enfocarse en lo mejor para la comunidad
- Mostrar empatía hacia otros miembros

---

## 🚀 Cómo Contribuir

### Tipos de Contribuciones

- **Bug Reports**: Reporta errores con detalles reproducibles
- **Feature Requests**: Propón nuevas funcionalidades
- **Code Contributions**: Envía código (bug fixes, features, refactoring)
- **Documentation**: Mejora docs existentes o crea nuevas
- **Tests**: Añade o mejora cobertura de tests

### Reportar Bugs

1. **Busca** en [Issues](https://github.com/tu-usuario/camino-backend/issues) si ya existe
2. Si no existe, **crea nuevo issue** con:
   - Título descriptivo
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Versión de Node.js, npm, sistema operativo

**Template:**
```markdown
## Descripción
Descripción clara del bug

## Pasos para Reproducir
1. Paso 1
2. Paso 2
3. ...

## Comportamiento Esperado
Lo que debería pasar

## Comportamiento Actual
Lo que realmente pasa

## Environment
- Node: v20.x
- npm: 9.x
- OS: macOS Sonoma 14.x
```

### Proponer Features

1. **Busca** en Issues si ya fue propuesta
2. **Crea issue** con label `enhancement`:
   - Descripción detallada de la feature
   - Caso de uso (por qué es necesaria)
   - Propuesta de implementación (opcional)
   - Mockups/wireframes (si es UI)

---

## 🛠️ Setup del Entorno

### Prerrequisitos

- **Node.js 18+** (recomendado: 20.x LTS)
- **npm 9+**
- **Git 2.x**

### Fork & Clone

```bash
# 1. Fork el repositorio en GitHub (botón "Fork")

# 2. Clonar tu fork
git clone https://github.com/TU-USUARIO/camino-backend.git
cd camino-backend

# 3. Agregar upstream remoto
git remote add upstream https://github.com/ORIGINAL-USUARIO/camino-backend.git

# 4. Verificar remotes
git remote -v
# origin    https://github.com/TU-USUARIO/camino-backend.git (fetch)
# origin    https://github.com/TU-USUARIO/camino-backend.git (push)
# upstream  https://github.com/ORIGINAL-USUARIO/camino-backend.git (fetch)
# upstream  https://github.com/ORIGINAL-USUARIO/camino-backend.git (push)
```

### Instalar Dependencias

```bash
npm install
```

### Configurar Environment

```bash
# Copiar template
cp .env.example .env.local

# Editar con tus credenciales
nano .env.local
```

Ver [README.md](README.md#configuración) para detalles de variables.

### Verificar Setup

```bash
# Tests pasando
npm test
# → 2421 tests passing

# Lint clean
npm run lint
# → 0 errors, 0 warnings

# Dev server funcionando
npm run dev
# → http://localhost:3000
```

---

## 💻 Workflow de Desarrollo

### 1. Sincronizar con Upstream

```bash
# Obtener últimos cambios
git fetch upstream
git checkout master
git merge upstream/master

# Push a tu fork
git push origin master
```

### 2. Crear Feature Branch

```bash
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/nombre-bug
# o
git checkout -b docs/actualizar-readme
```

**Naming conventions:**
- `feature/`: Nuevas características
- `fix/`: Bug fixes
- `docs/`: Documentación
- `refactor/`: Refactoring sin cambio de funcionalidad
- `test/`: Añadir o mejorar tests
- `chore/`: Tareas de mantenimiento

### 3. Implementar Cambios

Sigue [Clean Architecture de 5 capas](docs/ARCHITECTURE.md):

#### Crear Nueva Entidad

```bash
# Layer 1: DTO
touch src/dto/entity.dto.ts

# Layer 2: Repository
touch src/repositories/entity.repository.ts

# Layer 3: Service
touch src/services/entity.service.ts

# Layer 4: Controller
touch src/controllers/entity.controller.ts

# Layer 5: Endpoint
touch pages/api/entity.ts
```

#### Crear Tests

```bash
# Schema validation
touch __tests__/schemas/entity.schema.test.ts

# Repository tests
touch __tests__/repositories/entity.repository.test.ts

# Service tests
touch __tests__/services/entity.service.test.ts

# Controller tests
touch __tests__/controllers/entity.controller.test.ts

# Integration tests
touch __tests__/api/entity.test.ts
```

### 4. Ejecutar Tests Continuamente

```bash
# Watch mode mientras desarrollas
npm run test:watch

# Coverage antes de commit
npm run test:coverage
```

### 5. Commit con Conventional Commits

```bash
# Agregar cambios
git add .

# Commit con Commitizen (recomendado)
npm run commit
# → CLI interactivo guía el formato

# O commit manual con formato correcto
git commit -m "feat: agregar endpoint de entity"
```

Ver [Conventional Commits](#-conventional-commits) para detalles.

### 6. Push y Pull Request

```bash
# Push a tu fork
git push origin feature/nombre-descriptivo

# Crear PR en GitHub
# → Botón "Compare & pull request" aparecerá
```

---

## 📝 Conventional Commits

Este proyecto usa **[Conventional Commits](https://www.conventionalcommits.org/)** con validación automática vía **Commitlint + Husky**.

### Formato

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Ejemplos:**
```
feat: agregar endpoint de ventas
feat(api): agregar paginación a service-points
fix: corregir validación UUID en productos
docs: actualizar ROADMAP.md con Sprint 6
refactor: centralizar error messages
test: añadir tests para booking service
```

### Types Permitidos

| Type       | Descripción                                        | Ejemplo                                        |
| ---------- | -------------------------------------------------- | ---------------------------------------------- |
| `feat`     | Nueva característica                               | `feat: agregar endpoint de reviews`            |
| `fix`      | Bug fix                                            | `fix: corregir cálculo de precios`             |
| `docs`     | Cambios en documentación                           | `docs: actualizar README con nuevos comandos`  |
| `style`    | Cambios de formato (no afectan lógica)             | `style: formatear código con prettier`         |
| `refactor` | Refactoring (ni fix ni feature)                    | `refactor: extraer lógica a utility function`  |
| `perf`     | Mejoras de performance                             | `perf: optimizar query de inventario`          |
| `test`     | Añadir o corregir tests                            | `test: añadir tests de integración`            |
| `build`    | Cambios en build system o dependencias             | `build: actualizar dependencias`               |
| `ci`       | Cambios en CI/CD                                   | `ci: configurar GitHub Actions`                |
| `chore`    | Otras tareas de mantenimiento                      | `chore: actualizar .gitignore`                 |

### Scope (Opcional)

Especifica el área afectada:
- `api`: Endpoints
- `db`: Base de datos
- `dto`: DTOs
- `repo`: Repositories
- `service`: Services
- `controller`: Controllers
- `test`: Tests
- `docs`: Documentación

### Subject

- Usa imperativo: "agregar" no "agregado"
- Minúsculas (salvo nombres propios)
- Sin punto final
- Máximo 100 caracteres

### Body (Opcional)

Explica **qué** y **por qué**, no **cómo**:

```
feat: agregar sistema de notificaciones

Implementa sistema de notificaciones push para alertas de stock bajo.
Usa Firebase Cloud Messaging para envío multiplataforma.
Incluye endpoints para registrar dispositivos y enviar notificaciones.
```

### Footer (Opcional)

Referencias a issues:

```
fix: corregir bug en reservas

Closes #123
See also #456
```

### Usar Commitizen

```bash
npm run commit
```

CLI interactivo que guía el formato:
1. Selecciona type
2. Ingresa scope (opcional)
3. Escribe subject
4. Escribe body (opcional)
5. Lista breaking changes (opcional)
6. Referencias issues (opcional)

### Breaking Changes

Si el commit rompe compatibilidad, añade `!` después del type:

```
feat!: cambiar formato de respuesta de precios

BREAKING CHANGE: El endpoint /api/precios ahora retorna 
{ precio, nivel, jerarquia } en lugar de { precio }
```

---

## 🎨 Code Style Guidelines

### TypeScript

- **Strict mode**: Siempre habilitado
- **Zero `any` types**: Usa tipos específicos o `unknown`
- **Path aliases**: Usa `@/` para imports de `src/`

```typescript
// ✅ CORRECTO
import { UserService } from "@/services/user.service";
import { ErrorMessages } from "@/constants/error-messages";

// ❌ INCORRECTO
import { UserService } from "../../services/user.service";
```

### Naming Conventions

```typescript
// Clases: PascalCase
class UserService extends BaseService<User> {}

// Interfaces: PascalCase
interface User {
  id: string;
  nombre: string;
}

// Variables/Funciones: camelCase
const userName = "Test";
function getUserById(id: string) {}

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = "https://api.example.com";

// Archivos: kebab-case
user.service.ts
error-messages.ts
validate-uuid.ts
```

### Error Handling

Siempre usa constantes centralizadas:

```typescript
import { ErrorMessages } from "@/constants/error-messages";

// ✅ CORRECTO
throw new BusinessError(ErrorMessages.USER_NOT_FOUND);
return res.status(404).json({ error: ErrorMessages.PRODUCTO_NOT_FOUND });

// ❌ INCORRECTO
throw new Error("Usuario no encontrado");
return res.status(404).json({ error: "Producto no encontrado" });
```

### UUID Validation

Usa middleware centralizado:

```typescript
import { validateUUID } from "@/middlewares/validate-uuid";

// ✅ CORRECTO
const error = validateUUID(id, "usuario");
if (error) {
  return res.status(400).json({ error });
}

// ❌ INCORRECTO
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(id)) {
  return res.status(400).json({ error: "UUID inválido" });
}
```

### Paginación

Usa utilidades centralizadas:

```typescript
import { parsePaginationParams, createPaginatedResponse } from "@/utils/pagination";

// ✅ CORRECTO
const { page, limit } = parsePaginationParams(req.query);
const offset = calculateOffset(page, limit);
const { data, total } = await service.findAll({ offset, limit });
return res.status(200).json(createPaginatedResponse(data, total, page, limit));

// ❌ INCORRECTO
const page = parseInt(req.query.page as string) || 1;
const limit = parseInt(req.query.limit as string) || 10;
const offset = (page - 1) * limit;
// ... manual pagination logic
```

### Response Format

```typescript
// ✅ GET - Retornar objeto o array directo
return res.status(200).json({ data: users });

// ✅ POST/PUT - Siempre array con single item
return res.status(201).json({ data: [newUser] });

// ✅ DELETE - Retornar mensaje
return res.status(200).json({ message: "Usuario eliminado" });
```

---

## 🧪 Testing Requirements

### Mandatory Rules

1. **Todo código nuevo DEBE tener tests**
2. **Coverage mínimo: 99%** (actual: 99.72%)
3. **Todos los tests DEBEN pasar** antes de commit
4. **Tests DEBEN usar dependency injection** para mocking

### Test Coverage

```bash
# Verificar coverage
npm run test:coverage

# Requisitos mínimos
Statements: 50%
Branches: 40%
```

### Escribir Tests

#### Repository Test

```typescript
import { UserRepository } from "@/repositories/user.repository";
import { SupabaseClient } from "@supabase/supabase-js";

describe("UserRepository", () => {
  let repository: UserRepository;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    } as any as SupabaseClient;

    repository = new UserRepository(mockSupabase);
  });

  it("debe retornar usuario por ID", async () => {
    mockSupabase.single.mockResolvedValue({
      data: { id: "123", nombre: "Test" },
      error: null,
    });

    const result = await repository.findById("123");

    expect(result).toEqual({ id: "123", nombre: "Test" });
  });
});
```

#### Service Test

```typescript
import { UserService } from "@/services/user.service";

describe("UserService", () => {
  let service: UserService;
  let mockRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as any;
    service = new UserService(mockRepo);
  });

  it("debe fallar si email ya existe", async () => {
    mockRepo.findByEmail.mockResolvedValue({ id: "123" });

    await expect(
      service.createUser({ email: "test@example.com" })
    ).rejects.toThrow("Email ya registrado");
  });
});
```

### Testing Best Practices

- **Mock external dependencies** (Supabase, Stripe)
- **Test error cases** además de happy paths
- **Use descriptive test names**: `debe [acción esperada] cuando [condición]`
- **Arrange-Act-Assert** pattern
- **One assertion per test** (cuando sea posible)

---

## 📥 Pull Request Process

### Antes de Crear PR

**Checklist:**
- [ ] Código sigue Clean Architecture de 5 capas
- [ ] Tests creados para TODO código nuevo
- [ ] Todos los tests pasan: `npm test` → 100%
- [ ] Lint clean: `npm run lint` → 0 errors
- [ ] Build exitoso: `npm run build`
- [ ] Commits siguen Conventional Commits
- [ ] Documentación actualizada (si aplica)
- [ ] Migraciones de BD incluidas (si aplica)

### Crear PR

1. **Push a tu fork**
   ```bash
   git push origin feature/nombre-descriptivo
   ```

2. **Abrir PR en GitHub**
   - Click "Compare & pull request"
   - Base: `master` ← Compare: `feature/nombre-descriptivo`

3. **Completar Template de PR**

```markdown
## Descripción
Descripción clara de los cambios

## Tipo de Cambio
- [ ] Bug fix (fix)
- [ ] Nueva feature (feat)
- [ ] Breaking change (feat! / fix!)
- [ ] Documentación (docs)
- [ ] Refactoring (refactor)

## Checklist
- [ ] Tests pasando (npm test)
- [ ] Lint clean (npm run lint)
- [ ] Build exitoso (npm run build)
- [ ] Documentación actualizada
- [ ] Commits siguen Conventional Commits

## Tests
Describe los tests añadidos/modificados

## Screenshots (si aplica)
[Agrega screenshots si es cambio visual]

## Related Issues
Closes #123
See also #456
```

### Revisión de Código

**Reviewers verificarán:**
- Adherencia a Clean Architecture
- Calidad y cobertura de tests
- Code style y conventions
- Performance implications
- Security considerations
- Documentation completeness

**Responder a feedback:**
- Responde a todos los comentarios
- Haz commits adicionales si es necesario
- Re-request review cuando esté listo

### Merge

Una vez aprobado:
1. **Squash and merge** (preferido)
2. Mensaje de commit final debe seguir Conventional Commits
3. Delete branch después de merge

---

## ⚠️ Reglas Críticas

### Mandatory Alignment Rule

**SI CAMBIAS CUALQUIER ENTIDAD O CAMPO, ALINEAR TODO:**

1. **Database schema** (migration)
2. **DTO interfaces** (`src/dto/`)
3. **Zod schemas** (`src/schemas/`)
4. **Repository** (table name, columns)
5. **Service** (business logic)
6. **Controller** (validation, field mapping)
7. **Tests** (create if missing, update existing)
8. **Dashboard/UI** (if applicable)

**NO INCONSISTENCIAS PERMITIDAS** - cambiar algo = cambiar todo.

### Testing Mandatory Rule

**SI UN TEST FALLA, SE ARREGLA ANTES DE CONTINUAR**

- No ignorar tests fallidos
- No comentar tests problemáticos
- No pushear con tests fallidos

**SI UN COMPONENTE NO TIENE TESTS, CREARLOS PRIMERO**

- Repository sin tests? Crear `__tests__/repositories/entity.repository.test.ts`
- Service sin tests? Crear `__tests__/services/entity.service.test.ts`
- Controller sin tests? Crear `__tests__/controllers/entity.controller.test.ts`

### Database Migration Rules

**SIEMPRE crear backup antes de migraciones:**

```bash
mkdir -p backups
pg_dump "postgresql://..." > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

**Naming convention:** `YYYYMMDD_HHMMSS_description.sql`

**Test migrations** en environment de desarrollo primero.

---

## 🎓 Recursos Adicionales

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Clean Architecture detallada
- **[ROADMAP.md](docs/ROADMAP.md)**: Próximos sprints y features
- **[README.md](README.md)**: Setup y quick start
- **[Conventional Commits](https://www.conventionalcommits.org/)**: Spec completa
- **[Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)**: Uncle Bob's original article

---

## 📞 Preguntas?

- **GitHub Issues**: [Crear issue](https://github.com/tu-usuario/camino-backend/issues/new)
- **Email**: [soporte@camino.app](mailto:soporte@camino.app)
- **Discussions**: [GitHub Discussions](https://github.com/tu-usuario/camino-backend/discussions)

---

**Gracias por contribuir! 🙏**

Tu trabajo ayuda a mejorar la experiencia de peregrinos en el Camino de Santiago 🏔️✨
