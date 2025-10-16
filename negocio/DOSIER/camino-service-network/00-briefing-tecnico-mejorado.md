# Camiño Service - Briefing Técnico Mejorado

## 📋 Visión General

Camiño Service es una plataforma digital y red física de asistencia para peregrinos en bicicleta en el Camino de Santiago. La app (PWA offline-first) conecta puntos de servicio (CSPs), talleres oficiales, vending, lavado y carga, permitiendo reservas, compras y acceso seguro mediante QR, incluso sin conexión.

### Objetivo Principal

Facilitar el acceso a servicios esenciales en ruta, garantizando autonomía, seguridad y soporte profesional, con una experiencia digital robusta y una red física confiable.

---

## 🎯 Tipos de Usuario y Roles

### 1. Usuario (Peregrino)

- Acceso público (sin login):
  - Mapa interactivo con todos los CSPs y talleres
  - Visualización de inventario y servicios por ubicación
  - Guías de reparación y ayuda offline
  - Información general, contacto y FAQ
- Acceso autenticado:
  - Reserva de servicios (taller, lavado, carga, workshops)
  - Compra de productos (Stripe integrado)
  - Historial de reservas y compras
  - Generación y uso de QR para acceso y pago
  - Perfil, configuración, favoritos y reviews
  - Recepción de notificaciones push

### 2. Partner (Socio)

- Gestión de sus propios CSPs (alta/baja, configuración de módulos)
- Visualización de estadísticas de uso y ventas
- Gestión de inventario y reposición
- Reportes de ventas y reservas

### 3. Gestor de Taller

- Gestión de su taller y servicios
- Calendario de reservas y disponibilidad

## 🖥️ Pantallas y Vistas por Rol (Mobile y Desktop)

### 1. Usuario (Peregrino)

#### Mobile (Tabs inferiores)

- **Mapa**
- Historial de servicios prestados
- Comunicación con clientes (mensajes, notificaciones)
- Panel para facturación y liquidación de comisiones

- **Reservas**

### 4. Superadmin

- Gestión global de CSPs, talleres, socios y usuarios
- Configuración de la plataforma (roles, permisos, precios base)
- **Compras**
- Analytics y estadísticas avanzadas
- Moderación de reviews y contenido
- Gestión de incidencias y soporte
- Control de webhooks y automatizaciones
- **Guías**

---

- **Perfil**

## 🏗️ Arquitectura Técnica

- **Frontend:** Next.js 15, React 19, Tailwind CSS v4, shadcn/ui, SWR
- **Backend:** Supabase (PostgreSQL, Auth, Storage), Next.js API Routes
- **Offline:** IndexedDB, Service Worker, Background Sync

#### Desktop (Sidebar ocultable)

- Sidebar con las mismas secciones: Mapa, Reservas, Compras, Guías, Perfil
- Panel principal con cards, tablas y modales para detalles
- Sub-vistas: edición de perfil, gestión avanzada de reservas/compras, visualización ampliada de mapa

#### Acceso público (sin login)

- Tabs: Mapa, Guías, Info, Login
- Solo visualización, sin acceso a reservas, compras ni perfil

---

### 2. Partner (Socio)

#### Mobile (Tabs inferiores)

- **Dashboard**
- **Integraciones:** Stripe (pagos), Mapbox (mapas), Push notifications
- **Seguridad:** RLS en todas las tablas, JWT, cookies httpOnly, validación de roles
- **CSPs**

---

- **Inventario**

## 🗄️ Base de Datos y Modelos Clave

- **profiles:** usuarios, socios, gestores, admin
- **Reportes**
- **csps:** puntos de servicio, tipo, ubicación, módulos, horarios, estado
- **workshops:** talleres y servicios, precios, disponibilidad
- **bookings:** reservas, usuario, taller, fecha, QR, estado
- **Perfil**
- **vending_machines:** máquinas por CSP, estado
- **inventory_items:** productos por máquina, stock, precio, alertas
- **reviews:** rating y comentarios por CSP/taller

#### Desktop (Sidebar ocultable)

- Sidebar con: Dashboard, CSPs, Inventario, Reportes, Perfil
- Paneles con gráficos interactivos, tablas editables, formularios avanzados
- Sub-vistas: gestión masiva de inventario, configuración de horarios y precios, reportes personalizados

---

### 3. Gestor de Taller

#### Mobile (Tabs inferiores)

- **Dashboard**
- **favorites:** CSPs favoritos por usuario
- **partners:** datos de socios
- **Reservas**
- **taller_managers:** datos de gestores de taller

---

- **Workshops**

## 🗺️ Estructura de Rutas y Flujos

- **Historial**

### Rutas Públicas (sin login)

- **Perfil**
- `/` Home con hero y features
- `/map` Mapa con CSPs y talleres (solo visualización)
- `/guides` Guías de reparación y ayuda

#### Desktop (Sidebar ocultable)

- Sidebar con: Dashboard, Reservas, Workshops, Historial, Perfil
- Paneles con calendario ampliado, gestión avanzada de servicios, facturación y reportes
- Sub-vistas: edición masiva de disponibilidad, gestión de incidencias, comunicación con clientes

---

### 4. Superadmin

#### Mobile (Tabs inferiores)

- **Dashboard**
- `/info` Información general y FAQ
- `/inventory` Inventario visible por ubicación
- **CSPs**

### Rutas de Usuario Autenticado

- **Talleres**

- `/map` Mapa con opciones de reserva y compra
- `/shop` Tienda con compra directa (Stripe)
- **Usuarios**
- `/bookings` Historial de reservas
- `/purchases` Historial de compras
- **Inventario**
- `/profile` Perfil y configuración
- `/workshops` Talleres y servicios disponibles
- **Analytics**

### Rutas de Partner

- **Moderación**

- `/partner/dashboard` Panel de gestión de CSPs

#### Desktop (Sidebar ocultable)

- Sidebar con: Dashboard, CSPs, Talleres, Usuarios, Inventario, Analytics, Moderación
- Paneles con gráficos avanzados, logs de actividad, formularios de gestión masiva
- Sub-vistas: configuración global, gestión de webhooks, logs de seguridad, reportes personalizados

---

### Detalles adicionales

- Todas las vistas deben ser responsive y accesibles.
- Sidebar en desktop debe poder ocultarse/expandirse.
- Tabs en mobile siempre visibles y accesibles.
- Cada rol solo ve sus pestañas y vistas, sin confusión ni acceso cruzado.
- Los paneles deben mostrar indicadores de estado (online/offline, alertas, notificaciones).
- Sub-vistas y acciones clave deben estar claramente diferenciadas y documentadas para cada rol.
- `/partner/inventory` Gestión de inventario y reposición
- `/partner/stats` Estadísticas y reportes

### Rutas de Gestor de Taller

- `/taller/dashboard` Panel de gestión de taller
- `/taller/bookings` Gestión de reservas
- `/taller/workshops` Gestión de servicios y precios
- `/taller/calendar` Calendario de disponibilidad

### Rutas de Admin

- `/admin/dashboard` Panel global
- `/admin/csps` Gestión de CSPs
- `/admin/workshops` Gestión de talleres
- `/admin/inventory` Inventario global
- `/admin/analytics` Analytics avanzados
- `/admin/users` Gestión de usuarios y roles

---

## 📱 Funcionalidades Detalladas

### 1. Mapa interactivo

- Visualización de todos los CSPs y talleres
- Filtros por tipo de servicio, distancia, horario, disponibilidad
- Geolocalización y cálculo de rutas
- Modal de detalle con inventario, servicios, horarios y contacto
- Marcado de favoritos y reviews
- Acceso offline a datos esenciales

### 2. Sistema de reservas

- Calendario con slots disponibles por taller/CSP
- Reserva de servicios y workshops
- Confirmación por email y push
- Generación de QR para acceso y pago
- Historial y cancelación de reservas
- Sincronización offline/online

### 3. Sistema de compras

- Catálogo de productos por CSP (stock real)
- Carrito y checkout con Stripe
- Confirmación y registro de compra
- Webhooks para actualización de inventario y notificaciones
- Historial de compras y facturas
- Soporte para pagos offline (IOU, sincronización posterior)

### 4. Inventario y gestión de productos

- Visualización y filtrado por categoría, precio y stock
- Alertas automáticas de stock bajo
- Reposición y actualización por partner/admin
- Sincronización de inventario en tiempo real y offline

### 5. Reviews y favoritos

- Calificación y comentarios por CSP/taller
- Moderación por admin
- Promedio de rating visible
- Marcado y gestión de favoritos

### 6. Paneles de gestión

- Partner: gestión de CSPs, inventario, horarios, reportes
- Taller: gestión de reservas, servicios, calendario, facturación
- Admin: control global, analytics, moderación, incidencias

### 7. Seguridad y privacidad

- RLS en todas las tablas
- Validación de roles y permisos en middleware
- Cookies seguras, tokens JWT
- Protección de datos personales y cumplimiento RGPD

### 8. Offline-first y sincronización

- IndexedDB para datos clave
- Service Worker para assets y API responses
- Background sync de reservas, compras y favoritos
- Resolución automática de conflictos (last-write-wins)
- Indicador visual de estado online/offline

### 9. Pagos y Stripe

- Checkout seguro con Stripe
- Webhooks para confirmación y actualización de inventario
- Soporte para pagos fallidos y reintentos
- Registro de transacciones y facturas

### 10. Notificaciones y comunicación

- Push notifications para confirmaciones, recordatorios y alertas
- Mensajería interna para comunicación con talleres y soporte
- Emails transaccionales automáticos

### 11. Analítica y métricas

- Dashboards con KPIs clave por rol
- Métricas de uso, ventas, reservas, ratings
- Reportes exportables (CSV, PDF)

### 12. Integraciones y extensibilidad

- API REST/GraphQL para integraciones externas
- Webhooks para Stripe, logística, emails
- Sistema modular para añadir nuevos servicios y partners

---

## 🛠️ Detalles que no deben quedar en el aire

- ¿Qué pasa si el usuario pierde conexión? Puede consultar mapa, inventario y guías, reservar y comprar (se sincroniza al volver online).
- ¿Cómo se gestiona el acceso físico? QR único por reserva/compra, validación en el CSP/taller.
- ¿Cómo se actualiza el inventario? Webhook Stripe + panel partner/admin + sincronización offline.
- ¿Cómo se liquidan comisiones? Panel de taller/partner con reportes y facturación automática.
- ¿Cómo se protege la privacidad? RLS, cifrado, RGPD, solo acceso a datos propios.
- ¿Cómo se gestiona el soporte? Mensajería interna + emails + panel de incidencias admin.
- ¿Cómo se escalan los servicios? Sistema modular, API pública, licenciamiento y franquicias.
- ¿Cómo se gestiona la seguridad? Validación de roles, logs de acceso, protección de rutas y datos sensibles.
- ¿Cómo se gestiona la estacionalidad? Métricas y reportes para ajustar inventario y servicios según demanda.

---

## 📞 Soporte y Contacto

- FAQ y ayuda en `/info`
- Formulario de contacto en la app
- Email: support@caminoservice.com
- Panel de incidencias para usuarios y partners

---

## 📄 Licencia y créditos

- Licencia a definir
- Desarrollado para facilitar la experiencia de los peregrinos del Camino de Santiago
- Stack: Next.js 15, React 19, Supabase, Stripe, Mapbox, Tailwind CSS v4

---

_Última actualización: Octubre 2025_
