# Roadmap de Desarrollo: App MVP Camiño Service

**Versión:** 1.0  
**Fecha:** 8 de octubre de 2025  
**Objetivo:** Desarrollar PWA offline-first con empaquetado nativo para iOS/Android en 12 semanas.

---

## 📋 RESUMEN EJECUTIVO

### Objetivos del MVP

- ✅ **PWA offline-first:** Funciona sin conexión en zonas rurales del Camino
- ✅ **Empaquetable:** Distribuible en App Store y Google Play
- ✅ **Coste: 0€** (herramientas gratuitas + tu tiempo)
- ✅ **Timeline:** 12 semanas trabajando nights/weekends (15-20h/semana)
- ✅ **Stack:** Next.js + Supabase + Capacitor (100% open source)

### Funcionalidades Core MVP

| Funcionalidad           | Prioridad | Offline    | Semana |
| ----------------------- | --------- | ---------- | ------ |
| Registro/Login          | P0        | Parcial    | 2      |
| Mapa con CSPs           | P0        | ✅ Sí      | 3-4    |
| Ver inventario CSP      | P0        | ✅ Sí      | 4      |
| Reservar taller         | P0        | ✅ Sí      | 5      |
| Abrir CSP (QR)          | P0        | ✅ Sí      | 6      |
| Pagar vending           | P1        | ⚠️ Parcial | 7      |
| Historial compras       | P1        | ✅ Sí      | 8      |
| Buscar CSH cercano      | P1        | ✅ Sí      | 9      |
| Guías reparación        | P2        | ✅ Sí      | 10     |
| Notificaciones push     | P2        | No         | 11     |
| Empaquetado iOS/Android | P0        | -          | 12     |

---

## 🗓️ PLAN DETALLADO POR SEMANAS

### **SEMANA 1: Setup & Fundamentos**

**Objetivo:** Configurar entorno de desarrollo completo

#### Tareas Técnicas:

```bash
# 1. Crear proyecto Next.js 14 con TypeScript
npx create-next-app@latest camino-service-app \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

# 2. Instalar dependencias core
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs
npm install zustand # State management ligero
npm install workbox-webpack-plugin # Service Workers
npm install @capacitor/core @capacitor/cli

# 3. Configurar Supabase
npx supabase init
npx supabase start # Local development
```

#### Configurar Supabase:

**Schema inicial (ejecutar en Supabase SQL Editor):**

```sql
-- Tabla de CSPs (Camiño Service Points)
CREATE TABLE csp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'CSP' | 'CSS' | 'CSH'
  location GEOGRAPHY(POINT) NOT NULL,
  address TEXT,
  description TEXT,
  features TEXT[], -- ['taller', 'vending', 'lavado', 'carga_ebike']
  opening_hours JSONB,
  contact_phone TEXT,
  contact_email TEXT,
  partner_id UUID REFERENCES partners(id),
  status TEXT DEFAULT 'active', -- 'active' | 'maintenance' | 'inactive'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice geográfico para búsquedas por proximidad
CREATE INDEX csp_location_idx ON csp USING GIST(location);

-- Tabla de inventario (stock vending)
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  csp_id UUID REFERENCES csp(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  last_restock TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'consumible' | 'lubricante' | 'nutricion' | 'accesorio'
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  sku TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de reservas de taller
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  csp_id UUID REFERENCES csp(id),
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL, -- '09:00-10:00'
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'pending', -- 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE -- Para offline sync
);

-- Tabla de transacciones
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  csp_id UUID REFERENCES csp(id),
  type TEXT NOT NULL, -- 'vending' | 'taller' | 'lavado' | 'carga'
  amount DECIMAL(10,2) NOT NULL,
  items JSONB, -- [{product_id, quantity, price}]
  payment_method TEXT, -- 'stripe' | 'cash'
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'completed' | 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT FALSE
);

-- Tabla de accesos CSP (log de aperturas)
CREATE TABLE csp_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  csp_id UUID REFERENCES csp(id),
  access_code TEXT,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  synced BOOLEAN DEFAULT FALSE
);

-- Row Level Security (RLS) - Seguridad a nivel de fila
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE csp_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy: usuarios solo ven sus propias reservas
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### Configurar PWA (next-pwa):

```bash
npm install next-pwa
```

**next.config.js:**

```javascript
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "mapbox-tiles",
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "supabase-data",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24, // 1 día
        },
      },
    },
  ],
});

module.exports = withPWA({
  reactStrictMode: true,
  // ... resto de config
});
```

**Entregables Semana 1:**

- ✅ Proyecto Next.js configurado y corriendo
- ✅ Supabase local funcionando
- ✅ Schema de base de datos creado
- ✅ PWA configurado (manifest + service worker básico)

**Tiempo estimado:** 12-15 horas

---

### **SEMANA 2: Autenticación & Diseño UI**

**Objetivo:** Sistema de login/registro + diseño base de la app

#### Tareas:

**1. Autenticación con Supabase:**

```typescript
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signUp, signIn, signOut };
}
```

**2. Páginas de autenticación:**

- `src/app/login/page.tsx` → Login con email/password
- `src/app/register/page.tsx` → Registro nuevo usuario
- `src/app/auth/callback/route.ts` → Callback después de verificar email

**3. Instalar shadcn/ui (componentes):**

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add toast
```

**4. Diseño base responsive:**

- Bottom navigation para móvil (Home, Mapa, Reservas, Perfil)
- Theme system (light/dark mode)
- Loading states
- Error handling

**Entregables Semana 2:**

- ✅ Login/Registro funcional
- ✅ Sistema de componentes UI (shadcn/ui)
- ✅ Navigation structure
- ✅ Protected routes (middleware)

**Tiempo estimado:** 15-18 horas

---

### **SEMANA 3-4: Mapa Offline con CSPs**

**Objetivo:** Mapa interactivo con CSPs que funcione offline

#### Tecnología: Mapbox GL JS + Offline Tiles

**Instalación:**

```bash
npm install mapbox-gl
npm install @turf/turf # Cálculos geográficos
```

**Implementación:**

```typescript
// src/components/Map.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface CSP {
  id: string;
  name: string;
  type: "CSP" | "CSS" | "CSH";
  coordinates: [number, number]; // [lng, lat]
  features: string[];
}

export function Map({ csps }: { csps: CSP[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Inicializar mapa centrado en Camino de Santiago
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12", // Estilo outdoor para rutas
      center: [-7.557, 42.881], // Sarria (inicio común)
      zoom: 10,
      attributionControl: false,
    });

    // Obtener ubicación del usuario
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];
        setUserLocation(coords);

        // Centrar mapa en usuario
        map.current?.flyTo({ center: coords, zoom: 13 });

        // Marker de usuario
        new mapboxgl.Marker({ color: "#3b82f6" })
          .setLngLat(coords)
          .addTo(map.current!);
      });
    }

    // Añadir markers de CSPs
    csps.forEach((csp) => {
      const el = document.createElement("div");
      el.className = "csp-marker";
      el.style.backgroundImage = `url(/markers/${csp.type.toLowerCase()}.svg)`;
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.backgroundSize = "100%";

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold">${csp.name}</h3>
          <p class="text-sm text-gray-600">${csp.type}</p>
          <div class="flex gap-1 mt-2">
            ${csp.features
              .map((f) => `<span class="badge">${f}</span>`)
              .join("")}
          </div>
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat(csp.coordinates)
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Pre-cargar tiles del Camino para offline
    map.current.on("load", () => {
      // Definir área del Camino de Santiago (bounding box)
      const caminoBounds: [number, number, number, number] = [
        -9.2,
        42.3, // SW
        -6.5,
        43.2, // NE
      ];

      // Esto pre-carga tiles de zoom 8 a 14 (se cachean automáticamente)
      for (let z = 8; z <= 14; z++) {
        map.current?.setZoom(z);
      }
    });
  }, [csps]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Botón "Mi ubicación" */}
      <button
        onClick={() => {
          if (userLocation && map.current) {
            map.current.flyTo({ center: userLocation, zoom: 14 });
          }
        }}
        className="absolute bottom-4 right-4 bg-white rounded-full p-3 shadow-lg"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
```

**Estrategia Offline:**

1. **Tiles cacheados:** Mapbox cachea automáticamente tiles visitados
2. **GeoJSON local:** CSPs guardados en IndexedDB
3. **Fallback:** Si no hay conexión, muestra último estado conocido

```typescript
// src/lib/offline-storage.ts
import { openDB, DBSchema, IDBPDatabase } from "idb";

interface CaminoDB extends DBSchema {
  csps: {
    key: string;
    value: CSP;
    indexes: { "by-type": string };
  };
  "map-tiles": {
    key: string;
    value: {
      url: string;
      blob: Blob;
      timestamp: number;
    };
  };
}

let db: IDBPDatabase<CaminoDB>;

export async function initDB() {
  db = await openDB<CaminoDB>("camino-service-db", 1, {
    upgrade(db) {
      // Store para CSPs
      const cspStore = db.createObjectStore("csps", { keyPath: "id" });
      cspStore.createIndex("by-type", "type");

      // Store para tiles de mapa
      db.createObjectStore("map-tiles", { keyPath: "url" });
    },
  });
  return db;
}

export async function saveCSPs(csps: CSP[]) {
  const db = await initDB();
  const tx = db.transaction("csps", "readwrite");
  await Promise.all(csps.map((csp) => tx.store.put(csp)));
}

export async function getCSPs(): Promise<CSP[]> {
  const db = await initDB();
  return db.getAll("csps");
}

export async function getCSPsNearby(
  userLat: number,
  userLng: number,
  radiusKm: number = 10
): Promise<CSP[]> {
  const allCSPs = await getCSPs();

  // Filtrar por distancia usando fórmula de Haversine
  return allCSPs.filter((csp) => {
    const distance = calculateDistance(
      userLat,
      userLng,
      csp.coordinates[1],
      csp.coordinates[0]
    );
    return distance <= radiusKm;
  });
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
```

**Entregables Semana 3-4:**

- ✅ Mapa interactivo con Mapbox
- ✅ Markers de CSPs (CSP/CSS/CSH con iconos diferentes)
- ✅ Geolocalización del usuario
- ✅ CSPs guardados en IndexedDB para offline
- ✅ Búsqueda de CSPs cercanos

**Tiempo estimado:** 20-25 horas

---

### **SEMANA 5: Ver Inventario & Reservar Taller**

**Objetivo:** Ver stock disponible + sistema de reservas offline

#### Página de detalle de CSP:

```typescript
// src/app/csp/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCSPById, saveBooking } from "@/lib/offline-storage";

interface Inventory {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  category: string;
}

export default function CSPDetailPage({ params }: { params: { id: string } }) {
  const [csp, setCSP] = useState<CSP | null>(null);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    loadCSPData();

    // Detectar cambios de conexión
    window.addEventListener("online", () => setIsOffline(false));
    window.addEventListener("offline", () => setIsOffline(true));
  }, [params.id]);

  async function loadCSPData() {
    try {
      if (navigator.onLine) {
        // Online: cargar desde Supabase
        const { data: cspData } = await supabase
          .from("csp")
          .select("*")
          .eq("id", params.id)
          .single();

        const { data: inventoryData } = await supabase
          .from("inventory")
          .select(
            `
            product_id,
            quantity,
            products (
              name,
              price,
              category
            )
          `
          )
          .eq("csp_id", params.id)
          .gt("quantity", 0);

        setCSP(cspData);
        setInventory(inventoryData || []);

        // Guardar en IndexedDB para offline
        await saveCSPToLocal(cspData, inventoryData);
      } else {
        // Offline: cargar desde IndexedDB
        const localData = await getCSPById(params.id);
        setCSP(localData.csp);
        setInventory(localData.inventory);
      }
    } catch (error) {
      console.error("Error loading CSP:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleBookTaller(date: string, timeSlot: string) {
    const booking = {
      id: crypto.randomUUID(),
      user_id: user.id,
      csp_id: params.id,
      booking_date: date,
      time_slot: timeSlot,
      status: "pending",
      synced: navigator.onLine,
      created_at: new Date().toISOString(),
    };

    if (navigator.onLine) {
      // Online: guardar en Supabase
      await supabase.from("bookings").insert(booking);
    } else {
      // Offline: guardar localmente
      await saveBooking(booking);
      // Se sincronizará cuando vuelva la conexión
    }

    toast.success("Taller reservado correctamente");
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto p-4">
      {/* Indicador offline */}
      {isOffline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="font-bold">Modo Offline</p>
          <p className="text-sm">
            Mostrando última información disponible. Las reservas se
            sincronizarán cuando vuelvas a tener conexión.
          </p>
        </div>
      )}

      {/* Info del CSP */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{csp.name}</h1>
        <p className="text-gray-600 mb-4">{csp.address}</p>

        <div className="flex gap-2 mb-4">
          {csp.features.map((feature) => (
            <span
              key={feature}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {feature}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Horario</p>
            <p className="font-medium">9:00 - 20:00</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Teléfono</p>
            <p className="font-medium">{csp.contact_phone}</p>
          </div>
        </div>
      </div>

      {/* Inventario Vending */}
      {inventory.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Productos Disponibles</h2>
          <div className="grid gap-4">
            {inventory.map((item) => (
              <div
                key={item.product_id}
                className="flex justify-between items-center border-b pb-3"
              >
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{item.price}€</p>
                  <p className="text-sm text-gray-500">
                    Stock: {item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reservar Taller */}
      {csp.features.includes("taller") && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Reservar Taller</h2>
          <BookingForm onSubmit={handleBookTaller} />
        </div>
      )}
    </div>
  );
}
```

**Sistema de sincronización offline:**

```typescript
// src/lib/sync.ts
import { supabase } from "./supabase";
import { getPendingBookings, markBookingAsSynced } from "./offline-storage";

export async function syncPendingData() {
  if (!navigator.onLine) return;

  try {
    // Sincronizar reservas pendientes
    const pendingBookings = await getPendingBookings();

    for (const booking of pendingBookings) {
      const { error } = await supabase.from("bookings").insert({
        ...booking,
        synced: true,
      });

      if (!error) {
        await markBookingAsSynced(booking.id);
      }
    }

    console.log(`Sincronizadas ${pendingBookings.length} reservas`);
  } catch (error) {
    console.error("Error en sincronización:", error);
  }
}

// Ejecutar sync automáticamente cuando vuelve conexión
window.addEventListener("online", () => {
  syncPendingData();
});

// Sync periódico cada 5 minutos si hay conexión
setInterval(() => {
  if (navigator.onLine) {
    syncPendingData();
  }
}, 5 * 60 * 1000);
```

**Entregables Semana 5:**

- ✅ Página de detalle CSP con inventario
- ✅ Sistema de reservas de taller
- ✅ Sincronización automática online/offline
- ✅ Indicadores visuales de estado de conexión

**Tiempo estimado:** 18-20 horas

---

### **SEMANA 6: Sistema de Acceso QR**

**Objetivo:** Generar códigos QR para abrir CSP (funciona offline)

#### Flujo:

1. Usuario reserva taller → Recibe código QR
2. En el CSP, escanea QR (o introduce código manual)
3. Sistema valida → Abre cerradura electromagnética
4. Se registra log de acceso (online) o se guarda localmente (offline)

**Implementación:**

```typescript
// src/lib/access-codes.ts
import { createHmac } from "crypto";

// Generar código de acceso único y temporal
export function generateAccessCode(
  userId: string,
  cspId: string,
  bookingId: string,
  validUntil: Date
): string {
  const payload = {
    userId,
    cspId,
    bookingId,
    validUntil: validUntil.toISOString(),
  };

  // Crear hash HMAC para seguridad
  const secret = process.env.ACCESS_CODE_SECRET!;
  const hmac = createHmac("sha256", secret);
  hmac.update(JSON.stringify(payload));

  const hash = hmac.digest("hex").substring(0, 8).toUpperCase();

  // Código formato: AB12-CD34 (fácil de leer)
  return `${hash.substring(0, 4)}-${hash.substring(4, 8)}`;
}

// Validar código de acceso
export function validateAccessCode(
  code: string,
  expectedPayload: {
    userId: string;
    cspId: string;
    bookingId: string;
    validUntil: string;
  }
): boolean {
  const regeneratedCode = generateAccessCode(
    expectedPayload.userId,
    expectedPayload.cspId,
    expectedPayload.bookingId,
    new Date(expectedPayload.validUntil)
  );

  // Verificar que el código coincide y no ha expirado
  if (code !== regeneratedCode) return false;
  if (new Date(expectedPayload.validUntil) < new Date()) return false;

  return true;
}
```

```typescript
// src/components/QRAccessCode.tsx
"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";

interface Props {
  bookingId: string;
  cspId: string;
  cspName: string;
  validUntil: Date;
}

export function QRAccessCode({ bookingId, cspId, cspName, validUntil }: Props) {
  const [accessCode, setAccessCode] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    // Generar código de acceso (llamada a API)
    fetchAccessCode();

    // Actualizar contador regresivo
    const interval = setInterval(() => {
      const now = new Date();
      const diff = validUntil.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining("Expirado");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function fetchAccessCode() {
    const response = await fetch("/api/access-code", {
      method: "POST",
      body: JSON.stringify({ bookingId, cspId }),
    });
    const data = await response.json();
    setAccessCode(data.code);
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
      <h3 className="text-xl font-bold mb-4">Tu código de acceso</h3>
      <p className="text-gray-600 mb-4">{cspName}</p>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <QRCodeSVG
          value={JSON.stringify({
            type: "csp-access",
            code: accessCode,
            cspId,
            bookingId,
          })}
          size={200}
          level="H"
        />
      </div>

      {/* Código manual (por si falla QR scanner) */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Código manual:</p>
        <p className="text-3xl font-mono font-bold tracking-wider">
          {accessCode}
        </p>
      </div>

      {/* Tiempo restante */}
      <div
        className={`text-sm ${
          timeRemaining === "Expirado" ? "text-red-600" : "text-green-600"
        }`}
      >
        Válido por: {timeRemaining}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Escanea el código QR en el panel del CSP o introduce el código manual
      </p>
    </div>
  );
}
```

**Entregables Semana 6:**

- ✅ Generador de códigos QR únicos
- ✅ Sistema de validación de códigos
- ✅ Interfaz para mostrar QR al usuario
- ✅ Log de accesos (online/offline sync)

**Tiempo estimado:** 15 horas

---

### **SEMANA 7: Pagos con Stripe**

**Objetivo:** Integrar Stripe para pagos (con fallback offline)

```bash
npm install @stripe/stripe-js stripe
```

```typescript
// src/app/api/create-payment-intent/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(request: Request) {
  const { amount, items, cspId } = await request.json();

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a céntimos
      currency: "eur",
      metadata: {
        cspId,
        items: JSON.stringify(items),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Modo offline (IOU - "te debo"):**

Cuando no hay conexión, se genera un "pagaré virtual" que se cobra cuando sincroniza:

```typescript
// src/lib/offline-payments.ts
export async function createOfflinePayment(
  userId: string,
  cspId: string,
  amount: number,
  items: any[]
) {
  const payment = {
    id: crypto.randomUUID(),
    user_id: userId,
    csp_id: cspId,
    amount,
    items,
    type: "offline-pending",
    status: "pending",
    created_at: new Date().toISOString(),
  };

  // Guardar en IndexedDB
  await saveOfflinePayment(payment);

  // Cuando vuelva conexión, se procesará con Stripe
  return payment;
}

// Procesar pagos offline pendientes
export async function processOfflinePayments() {
  const pendingPayments = await getPendingOfflinePayments();

  for (const payment of pendingPayments) {
    try {
      const response = await fetch("/api/charge-offline-payment", {
        method: "POST",
        body: JSON.stringify(payment),
      });

      if (response.ok) {
        await markPaymentAsProcessed(payment.id);
      }
    } catch (error) {
      console.error("Error processing offline payment:", error);
    }
  }
}
```

**Entregables Semana 7:**

- ✅ Integración con Stripe Checkout
- ✅ Sistema de pagos offline (IOU)
- ✅ Procesamiento automático cuando vuelve conexión
- ✅ Historial de transacciones

**Tiempo estimado:** 12-15 horas

---

### **SEMANA 8: Historial & Perfil Usuario**

**Objetivo:** Pantalla de perfil con historial completo

- Lista de reservas pasadas/futuras
- Transacciones y gastos
- Ajustes de cuenta
- Modo offline: todo guardado localmente

**Entregables Semana 8:**

- ✅ Página de perfil
- ✅ Historial de reservas
- ✅ Historial de compras
- ✅ Estadísticas (km recorridos, CSPs visitados, etc.)

**Tiempo estimado:** 10-12 horas

---

### **SEMANA 9: Buscar Talleres CSH**

**Objetivo:** Directorio de talleres oficiales con filtros

- Búsqueda por ubicación
- Filtros (abierto ahora, distancia, servicios)
- Llamar directo desde app
- Funciona offline (última data cacheada)

**Entregables Semana 9:**

- ✅ Lista de CSH con búsqueda
- ✅ Mapa de CSH
- ✅ Botones de contacto (call, direcciones)

**Tiempo estimado:** 10 horas

---

### **SEMANA 10: Guías de Reparación (Contenido)**

**Objetivo:** Tutoriales offline de reparaciones comunes

- "Cómo cambiar una cámara"
- "Ajustar frenos de disco"
- "Limpiar cadena"
- Videos cortos (guardados offline)
- Checklist pre-Camino

**Entregables Semana 10:**

- ✅ 10 guías de reparación con imágenes
- ✅ Sistema de caching de contenido

**Tiempo estimado:** 8-10 horas

---

### **SEMANA 11: Notificaciones Push**

**Objetivo:** Avisos importantes

- Reserva confirmada
- Recordatorio 1 hora antes
- Stock bajo en CSP cercano
- Ofertas especiales
- Funciona offline (se encolan y envían cuando hay conexión)

```bash
npm install firebase
```

**Entregables Semana 11:**

- ✅ Firebase Cloud Messaging configurado
- ✅ Permisos de notificaciones
- ✅ Sistema de notificaciones programadas

**Tiempo estimado:** 8 horas

---

### **SEMANA 12: Empaquetado iOS/Android con Capacitor**

**Objetivo:** Convertir PWA en apps nativas

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init
```

**Configuración:**

```json
// capacitor.config.json
{
  "appId": "com.caminoservice.app",
  "appName": "Camiño Service",
  "webDir": "out",
  "bundledWebRuntime": false,
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#3b82f6"
    },
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
    }
  }
}
```

**Build para producción:**

```bash
# Build Next.js
npm run build

# Sync con Capacitor
npx cap sync

# Abrir en Xcode (iOS)
npx cap open ios

# Abrir en Android Studio
npx cap open android
```

**Entregables Semana 12:**

- ✅ App compilada para iOS (IPA)
- ✅ App compilada para Android (APK/AAB)
- ✅ Iconos y splash screens
- ✅ Configuración de stores (metadata)

**Tiempo estimado:** 12-15 horas

---

## 📱 RESULTADO FINAL

### Características Implementadas:

✅ **PWA completa** con capacidades offline  
✅ **Mapa interactivo** con CSPs (funciona offline)  
✅ **Reservas de taller** (sync automático)  
✅ **Pagos con Stripe** (con fallback offline)  
✅ **Sistema de acceso QR** a CSPs  
✅ **Historial y perfil** completo  
✅ **Guías de reparación** offline  
✅ **Notificaciones push**  
✅ **Apps nativas iOS/Android**

### Tiempo Total: **~150-180 horas** (12-15 semanas a 12-15h/semana)

### Coste Total: **0€** (solo tu tiempo + 99€/año Apple Developer + 25€ Google Play)

---

## 🚀 DEPLOYMENT

### Hosting Gratuito:

**Opción 1: Vercel (RECOMENDADO)**

```bash
npm install -g vercel
vercel deploy --prod
```

- Free tier: Gratis hasta 100GB bandwidth
- Dominio incluido: camino-service.vercel.app
- Auto-deploy desde GitHub

**Opción 2: Netlify**

- Similar a Vercel
- También tiene free tier generoso

### Supabase Hosting:

- Free tier: 500MB database, 2GB bandwidth/mes
- Suficiente para primeros 1.000-2.000 usuarios
- Upgrade a $25/mes cuando crezcas

### Dominio Propio:

- caminoservice.app → 15€/año (Namecheap)

---

## 📊 PRÓXIMOS PASOS DESPUÉS DEL MVP

### Versión 1.1 (Post-MVP):

- [ ] Modo offline más robusto (ServiceWorker más complejo)
- [ ] Gamificación (badges, achievements)
- [ ] Sistema de reviews/ratings de CSPs
- [ ] Chat en tiempo real con soporte
- [ ] Integración con Strava/Komoot

### Versión 2.0 (Escalado):

- [ ] Machine Learning para predicción de averías
- [ ] RA (Realidad Aumentada) para guías de reparación
- [ ] Integración con smartwatches
- [ ] Marketplace de productos (no solo vending)

---

## 💡 CONSIDERACIONES TÉCNICAS IMPORTANTES

### Performance:

- **Lighthouse score objetivo:** 95+ en todas las métricas
- **Bundle size:** <500KB inicial (con code splitting)
- **Offline functionality:** 100% de features core funcionan offline

### Seguridad:

- **Auth:** Supabase Auth (OAuth + Magic Links)
- **Pagos:** PCI compliant via Stripe
- **Data encryption:** HTTPS everywhere + encrypted local storage
- **API keys:** Nunca exponer en frontend (usar Edge Functions)

### Escalabilidad:

- **Database:** Supabase escala automáticamente hasta 8GB
- **CDN:** Vercel Edge Network global
- **Caching:** Aggressive caching con Service Workers

---

**¿Quieres que empiece a generar el código base del proyecto ahora?** Puedo crear la estructura inicial de carpetas y archivos principales para que arranques directamente. 🚀
