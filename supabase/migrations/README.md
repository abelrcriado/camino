# Migraciones de Base de Datos

Esta carpeta contiene todas las migraciones de Supabase para el proyecto Camino Service Network.

## 📁 Estructura

### Migraciones de Esquema (Schema)

Definen la estructura de tablas y relaciones:

- `001_create_bookings_table.sql` - Tabla de reservas
- `002_create_profiles_table.sql` - Tabla de perfiles de usuario
- `003_create_csps_table.sql` - Tabla de Camino Service Points

### Migraciones de Performance

Optimizaciones de rendimiento:

- `20251009_performance_indexes_v2_CORRECT.sql` - **32 índices de rendimiento** (APLICADO)
  - 8 índices en bookings
  - 5 índices en csps
  - 3 índices en favorites
  - 5 índices en payments
  - 2 índices en profiles
  - 5 índices en reviews
  - 2 índices en workshops
  - 2 índices en inventory_items

### Scripts de Utilidad

Scripts para documentación y verificación:

- `SIMPLE_schema_documentation.sql` - Queries para documentar esquema completo
- `VERIFY_indexes_created.sql` - Verificar que los índices se aplicaron correctamente

## 🚀 Cómo Aplicar Migraciones

### Método 1: Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. SQL Editor → New Query
3. Copia el contenido del archivo SQL
4. Ejecuta

### Método 2: Supabase CLI

```bash
# Si tienes Supabase CLI instalado
supabase db push
```

## ✅ Estado de Migraciones

| Migración                                   | Estado      | Fecha      | Notas                       |
| ------------------------------------------- | ----------- | ---------- | --------------------------- |
| 001_create_bookings_table.sql               | ✅ Aplicada | -          | Tabla principal de reservas |
| 002_create_profiles_table.sql               | ✅ Aplicada | -          | Perfiles de usuario         |
| 003_create_csps_table.sql                   | ✅ Aplicada | -          | Puntos de servicio          |
| 20251009_performance_indexes_v2_CORRECT.sql | ✅ Aplicada | 9 oct 2025 | 32 índices de performance   |

## 🔍 Verificación

Para verificar que los índices se aplicaron correctamente:

```sql
-- Ejecuta en Supabase SQL Editor:
-- Copia el contenido de VERIFY_indexes_created.sql
```

Deberías ver 32 índices con el prefijo `idx_`

## 📖 Documentación Relacionada

- `docs/DATABASE_SCHEMA.md` - Esquema completo de la base de datos
- `docs/PERFORMANCE.md` - Guía de optimización de rendimiento
- `IMPLEMENTATION_SUMMARY.md` - Resumen de optimizaciones aplicadas

---

**Última actualización:** 9 de octubre de 2025
