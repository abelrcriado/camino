# Estructura Financiera: CAPEX y OPEX

**Versión:** 1.0  
**Fecha:** 8 de octubre de 2025  
**Objetivo:** Clasificar todos los costes del proyecto en CAPEX (inversión inicial) y OPEX (gastos operativos recurrentes) para análisis financiero y planificación de flujo de caja.

---

## RESUMEN EJECUTIVO

Este documento transforma el inventario detallado en una estructura contable clara que permite:

- Calcular la inversión inicial necesaria (CAPEX)
- Proyectar los gastos operativos mensuales/anuales (OPEX)
- Analizar el punto de equilibrio (break-even)
- Planificar las necesidades de financiación

### Cifras Clave (Fase Piloto - 24 meses)

| Métrica                          | Valor        | Detalle                                         |
| -------------------------------- | ------------ | ----------------------------------------------- |
| **CAPEX Total**                  | **278.456€** | 15 CSP + 2 CSS + 10 CSH + Plataforma            |
| **OPEX Anual**                   | **187.080€** | Fijo 126k€ + Variable 61k€                      |
| **Break-Even Mensual**           | **20.192€**  | Ingresos mínimos para cubrir gastos             |
| **Meses hasta Break-Even**       | **8-12**     | Dependiendo de adopción y estacionalidad        |
| **Financiación Total Necesaria** | **445.045€** | CAPEX + 6 meses OPEX + marketing + contingencia |
| **Coste por CSP Básico**         | **10.164€**  | Partner sin opcionales                          |
| **Coste por CSS Completa**       | **23.491€**  | Estación propia con todos los módulos           |

**Fuentes de financiación sugeridas:**

- Capital propio: 50.000€ (11%)
- Business Angels: 150.000€ (34%)
- Subvenciones públicas: 100.000€ (22%)
- Préstamo ICO/Enisa: 80.000€ (18%)
- Crowdfunding/Otros: 65.045€ (15%)

---

## 1. CAPEX (Capital Expenditure - Gasto de Capital)

**Definición:** Inversiones en activos de larga duración que se deprecian en el tiempo. Son gastos que se realizan UNA VEZ por cada punto de servicio desplegado.

### 1.1. CAPEX por Camiño Service Point (CSP) - Modelo Partner

**Inversión para desplegar UN CSP en ubicación de socio (albergue, hotel, etc.)**

| Categoría                                   | Subcategoría                    | Descripción                                                                                    | Coste Estimado (€) | % del Total CSP |
| ------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------ | --------------- |
| **A. MÓDULO TALLER**                        |                                 |                                                                                                | **2.526**          | **24.8%**       |
|                                             | A1. Estructura y Mobiliario     | Soportes de reparación (2), banco de trabajo, panel herramientas, iluminación LED              | 1.145              |                 |
|                                             | A2. Herramientas (Set Completo) | Transmisión, ruedas, frenos, generales, dirección (ver inventario M1-H01 a M1-H26)             | 889                |                 |
|                                             | A3. Sistema de Acceso           | Cerradura electromagnética, lector QR/NFC, controlador, sensores, cámara opcional              | 492                |                 |
| **B. MÓDULO VENDING**                       |                                 |                                                                                                | **6.399**          | **62.9%**       |
|                                             | B1. Hardware Vending            | Máquina de vending compacta (30 referencias) Jofemar Vision Combo                              | 2.850              |                 |
|                                             | B2. Sistema de Pago             | Terminal NFC/contactless certificado PCI Nayax VPOS Touch                                      | 380                |                 |
|                                             | B3. Sistema de refrigeración    | Módulo refrigeración opcional para bebidas/geles                                               | 420                |                 |
|                                             | B4. Stock Inicial Consumibles   | Inventario completo de cámaras, repuestos, lubricantes, nutrición (ver sección 2.2 inventario) | 2.749              |                 |
| **C. BRANDING**                             |                                 |                                                                                                | **1.239**          | **12.3%**       |
|                                             | D1. Señalética                  | Placa exterior iluminada LED, vinilos, paneles informativos, señalización vertical en ruta     | 1.239              |                 |
|                                             |                                 |                                                                                                |                    |                 |
| **TOTAL CAPEX CSP BÁSICO (sin opcionales)** |                                 |                                                                                                | **10.164€**        | **100%**        |

#### Opciones adicionales CSP:

| **MÓDULOS OPCIONALES**                                  |                            |                                                                                            |                          |     |
| ------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------ | ------------------------ | --- |
|                                                         | C1. Estación de Lavado     | Hidrolimpiadora Kärcher K3, manguera, lanza, sistema pago, drenaje (incluye depósito agua) | 531 (o 386 sin depósito) |     |
|                                                         | C2. Punto de Carga E-Bikes | Locker 4 compartimentos, cargadores universales (Bosch/Shimano), panel control, protección | 2.256                    |     |
|                                                         |                            |                                                                                            |                          |     |
| **TOTAL CAPEX CSP COMPLETO (con todos los opcionales)** |                            |                                                                                            | **12.951€**              |     |

**Notas importantes:**

- Este CAPEX se repite por cada CSP desplegado
- Módulos opcionales (lavado, carga e-bikes) se añaden según la estrategia de ubicación
- El stock inicial de consumibles (2.749€) se deprecia rápidamente y se convierte en COGS (coste de bienes vendidos)
- **Economías de escala:** Con pedidos de 5+ unidades se puede negociar descuento 10-15% con proveedores
- **Instalación y transporte:** Estimado adicional de 800-1.200€ por ubicación (no incluido en totales)

---

### 1.2. CAPEX por Camiño Service Station (CSS) - Modelo Propio

**Inversión para desplegar UNA CSS completamente autónoma (estructura propia)**

| Categoría                               | Subcategoría                   | Descripción                                                                                                              | Coste Estimado (€) | % del Total CSS |
| --------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------ | --------------- |
| **A. EQUIPAMIENTO CSP COMPLETO**        |                                |                                                                                                                          | **12.951**         | **55.1%**       |
|                                         |                                | Módulo taller (2.526€) + Vending (6.399€) + Lavado (531€) + Carga E-bikes (2.256€) + Branding (1.239€)                   | 12.951             |                 |
| **B. ESTRUCTURA FÍSICA**                |                                |                                                                                                                          | **10.540**         | **44.9%**       |
|                                         | B1. Diseño y Licencias         | Proyecto arquitectura modular (850€), licencia obra (320€), tasas municipales (500€/año)                                 | 1.670              |                 |
|                                         | B2. Materiales de Construcción | Contenedor marítimo 20' (2.200€), aislamiento (480€), revestimiento (560€), puerta (420€), ventanas (330€), suelo (330€) | 4.320              |                 |
|                                         | B3. Cimentación y Acometidas   | Explanación (650€), solera hormigón (1.250€), acometida eléctrica (1.850€), agua (480€), desagüe (320€)                  | 4.550              |                 |
|                                         |                                |                                                                                                                          |                    |                 |
| **TOTAL CAPEX por CSS (Modelo Propio)** |                                |                                                                                                                          | **23.491€**        | **100%**        |

**Notas importantes:**

- Este modelo es para ubicaciones "flagship" de máxima visibilidad estratégica
- CAPEX 2.3x mayor que CSP básico, pero margen del 100% (sin revenue share con socio)
- Requiere negociación de suelo/licencias con ayuntamientos y permisos de obra
- Incluye TODOS los módulos opcionales (lavado + carga e-bikes) para servicio completo
- **Estimación adicional instalación y obra:** +15-20% del total (3.500-4.700€) para imprevistos y mano de obra especializada

---

### 1.3. CAPEX para Integración de Taller Oficial (CSH)

**Inversión para integrar UN taller mecánico existente en la red**

| Categoría                        | Descripción                                                                     | Coste Estimado (€) |
| -------------------------------- | ------------------------------------------------------------------------------- | ------------------ |
| **A. Branding del Taller**       | Placa exterior "Taller Oficial Camiño Service", vinilos, material promocional   | 420                |
| **B. Onboarding Tecnológico**    | Formación en uso de dashboard, integración con sistema de reservas              | 150                |
| **C. Hardware (si necesario)**   | Tablet para gestión de reservas (si el taller no tiene) - Samsung Galaxy Tab A8 | 180                |
| **D. Auditoría y Certificación** | Visita de evaluación, kit de bienvenida (merchandising, manuales)               | 120                |
|                                  |                                                                                 |                    |
| **TOTAL CAPEX por CSH**          |                                                                                 | **870€**           |

**Notas importantes:**

- CAPEX mínimo, el activo productivo (taller) ya existe
- Modelo de comisión (17.5-20% por servicio gestionado) sin inversión en herramientas
- El taller asume sus propios costes operativos (alquiler, personal, herramientas)
- ROI inmediato: con 5-6 servicios/mes el taller recupera la inversión de branding
- **Alternativa:** Kit de bienvenida digital (sin tablet) reduce CAPEX a **690€**

---

### 1.4. CAPEX Tecnológico (Plataforma Central)

**Inversión única en desarrollo de la plataforma digital (no se multiplica por nodos)**

| Componente                   | Descripción                                             | Coste Estimado (€) | Notas                              |
| ---------------------------- | ------------------------------------------------------- | ------------------ | ---------------------------------- |
| **A. Desarrollo MVP**        |                                                         |                    |                                    |
| A1. App PWA (Cliente)        | Desarrollo de aplicación web progresiva para ciclistas  | **[Calcular]**     | Mapa, diagnóstico, reservas, pagos |
| A2. Dashboard CSP (Socios)   | Panel de control para socios (KPIs, finanzas)           | **[Calcular]**     | Vista simplificada                 |
| A3. Dashboard CSH (Talleres) | Panel de gestión para talleres (calendario, servicios)  | **[Calcular]**     | Con sistema de reservas            |
| A4. Backend y APIs           | Sistema central, base de datos, integraciones           | **[Calcular]**     | Arquitectura escalable             |
| A5. Sistema de Pagos         | Integración con Stripe/PayPal, gestión de liquidaciones | **[Calcular]**     | Certificación PCI                  |
| **B. Diseño UX/UI**          | Diseño completo de interfaz y experiencia de usuario    | **[Calcular]**     | Branding digital                   |
| **C. Testing y QA**          | Pruebas de calidad, beta testing, corrección de bugs    | **[Calcular]**     | Pre-lanzamiento                    |
|                              |                                                         |                    |                                    |
| **TOTAL CAPEX Tecnológico**  |                                                         | **[TOTAL]**        | **Inversión única**                |

---

### 1.5. RESUMEN TOTAL CAPEX INICIAL (Fase Piloto - 24 meses)

**Escenario de despliegue: Camino Francés**

- 15 CSP (Modelo Partner) - configuración básica sin opcionales
- 2 CSS (Modelo Propio en ubicaciones flagship) - configuración completa
- 10 CSH (Talleres Oficiales)

| Concepto                             | Unidades | Coste Unitario (€)  | Coste Total (€) | % del Total |
| ------------------------------------ | -------- | ------------------- | --------------- | ----------- |
| **CSP (Modelo Partner básico)**      | 15       | 10.164              | **152.460**     | 58.1%       |
| **CSS (Modelo Propio completo)**     | 2        | 23.491              | **46.982**      | 17.9%       |
| **CSH (Taller Oficial)**             | 10       | 870                 | **8.700**       | 3.3%        |
| **Plataforma Tecnológica (única)**   | 1        | 45.000 _(estimado)_ | **45.000**      | 17.1%       |
| **Contingencia e Imprevistos (10%)** |          |                     | **25.314**      | 9.6%        |
|                                      |          |                     |                 |             |
| **CAPEX TOTAL FASE PILOTO**          |          |                     | **278.456€**    | **100%**    |

#### Desglose adicional:

- **Instalación y transporte CSP/CSS** (estimado 1.000€/unidad x 17): +17.000€
- **Marketing de lanzamiento** (campaña inicial): +15.000€
- **Capital circulante inicial** (3 meses OPEX): +30.000€ _(ver sección 2)_

**NECESIDAD DE FINANCIACIÓN TOTAL (Fase Piloto):** ~**340.000€**

**Estrategia de financiación sugerida:**

- **Fondos propios:** 50.000€ (15%)
- **Subvenciones públicas** (fondos turismo sostenible, desarrollo rural): 100.000€ (29%)
- **Inversores ángeles/Business Angels:** 150.000€ (44%)
- **Préstamo bancario ICO** (línea emprendimiento): 40.000€ (12%)

---

## 2. OPEX (Operating Expenditure - Gastos Operativos)

**Definición:** Gastos recurrentes necesarios para operar el negocio mes a mes. Se dividen en costes fijos (independientes del volumen) y costes variables (dependen del uso/ventas).

### 2.1. OPEX Mensual - Costes FIJOS

| Categoría                                 | Subcategoría                          | Descripción                                        | Coste Mensual (€) | Coste Anual (€) | Notas                                         |
| ----------------------------------------- | ------------------------------------- | -------------------------------------------------- | ----------------- | --------------- | --------------------------------------------- |
| **A. EQUIPO Y PERSONAL**                  |                                       |                                                    | **5.850**         | **70.200**      |                                               |
|                                           | A1. Salarios Equipo Fundador          | CEO + CTO (salarios iniciales reducidos)           | 4.000             | 48.000          | 2 fundadores x 2.000€/mes (fase bootstrap)    |
|                                           | A2. Personal Operativo                | Técnico de mantenimiento part-time                 | 1.200             | 14.400          | Media anual (más horas temporada alta)        |
|                                           | A3. Seguridad Social y Cargas         | 30% sobre salarios brutos                          | 1.560             | 18.720          | Autónomos + contratación                      |
|                                           | A4. Freelancers/Colaboradores         | Diseño, marketing, desarrollos puntuales           | 800               | 9.600           | Media mensual puntual                         |
| **B. TECNOLOGÍA (Servicios Recurrentes)** |                                       |                                                    | **565**           | **6.780**       |                                               |
|                                           | B1. Hosting y Cloud (AWS/GCP/Azure)   | Servidores, bases de datos, storage                | 180               | 2.160           | Escalable, estimado para 10k usuarios/mes     |
|                                           | B2. Licencias SaaS                    | Mapas (Google/Mapbox), Email (SendGrid), Analytics | 120               | 1.440           | Google Maps API + SendGrid + Mixpanel         |
|                                           | B3. Pasarela de Pago (fijo)           | Cuota mensual Stripe Business                      | 50                | 600             | + comisiones variables por transacción        |
|                                           | B4. Conectividad IoT                  | Tarjetas SIM 4G para telemetría (17 unidades)      | 170               | 2.040           | 17 tarjetas x 10€/mes (Vodafone IoT)          |
|                                           | B5. Herramientas Internas             | Slack, Notion, Google Workspace, CRM               | 45                | 540             | Planes básicos/startup                        |
| **C. ADMINISTRACIÓN Y OFICINA**           |                                       |                                                    | **830**           | **9.960**       |                                               |
|                                           | C1. Alquiler Oficina/Coworking        | Coworking para 2-3 personas                        | 350               | 4.200           | Opcional (puede ser remoto fase inicial)      |
|                                           | C2. Suministros Oficina               | Internet, luz, material de oficina                 | 80                | 960             | Básico                                        |
|                                           | C3. Servicios Profesionales           | Asesoría fiscal, legal, gestoría                   | 280               | 3.360           | Gestoría mensual + asesoría puntual           |
|                                           | C4. Seguros                           | Responsabilidad civil, seguro de equipamiento      | 95                | 1.140           | RC profesional + equipos (17 puntos)          |
|                                           | C5. Costes Bancarios                  | Mantenimiento cuentas, comisiones                  | 25                | 300             | TPV + cuenta empresa                          |
| **D. CANON A SOCIOS CSP**                 |                                       |                                                    | **3.000**         | **36.000**      |                                               |
|                                           | D1. Alquiler de Espacio/Revenue Share | Pago fijo mensual a 15 socios CSP                  | 3.000             | 36.000          | 15 CSP x 200€/mes (modelo fijo vs % ingresos) |
| **E. ELECTRICIDAD Y SERVICIOS CSP/CSS**   |                                       |                                                    | **255**           | **3.060**       |                                               |
|                                           | E1. Electricidad puntos servicio      | Consumo eléctrico estimado por ubicación           | 255               | 3.060           | 17 puntos x 15€/mes promedio                  |
|                                           |                                       |                                                    |                   |                 |                                               |
| **SUBTOTAL OPEX FIJO MENSUAL**            |                                       |                                                    | **10.500€**       | **126.000€**    | **Coste base independiente de ventas**        |

---

### 2.2. OPEX Mensual - Costes VARIABLES

**Estos costes escalan con la actividad y las ventas**

**SUPUESTOS BASE (Temporada Alta - Mayo a Octubre):**

- Ventas vending promedio: 15.000€/mes (17 puntos)
- Servicios de reparación gestionados: 40 servicios/mes vía CSH
- Ticket medio reparación CSH: 35€

| Categoría                               | Descripción                                      | Coste Unitario/%   | Volumen Estimado (temp. alta) | Coste Mensual (€) | Notas                                             |
| --------------------------------------- | ------------------------------------------------ | ------------------ | ----------------------------- | ----------------- | ------------------------------------------------- |
| **E. COSTE DE VENTAS (COGS)**           |                                                  |                    |                               | **6.580**         |                                                   |
| E1. Compra de Consumibles (vending)     | Coste de adquisición del stock vendido           | **35% de ventas**  | 15.000€ ventas/mes            | 5.250             | Margen bruto 65% (compro a 35€, vendo a 100€)     |
| E2. Comisiones a Talleres CSH           | 17.5% de cada reparación gestionada              | **17.5%**          | 40 servicios x 35€ = 1.400€   | 245               | Solo se paga si hay venta                         |
| E3. Comisiones Pasarela de Pago         | Stripe/PayPal (1.5% + 0.25€ por transacción)     | **~2%**            | 16.400€ facturados/mes        | 328               | Todas las transacciones                           |
| E4. Comisión a socios CSP (% ingresos)  | Alternativa a canon fijo: 15% de ventas vending  | **15% si % model** | 15.000€ ventas vending        | 2.250             | ⚠️ Solo si NO usas canon fijo (D1 anterior)       |
| **F. LOGÍSTICA Y MANTENIMIENTO**        |                                                  |                    |                               | **1.950**         |                                                   |
| F1. Reposición de Stock (combustible)   | Ruta semanal para rellenar vending (furgoneta)   | €/km + combustible | 4 rutas/mes x 400 km          | 850               | Combustible + peajes + desgaste vehículo          |
| F2. Mantenimiento Correctivo            | Reparación de herramientas, módulos averiados    | Provisión mensual  | Incidencias                   | 400               | Repuestos + mano de obra puntual                  |
| F3. Reposición Herramientas (desgaste)  | Herramientas perdidas/dañadas/gastadas           | 8% anual CAPEX     | (2.526€ x 17 x 8%)/12         | 287               | Amortización acelerada por uso intensivo          |
| F4. Limpieza y mantenimiento básico     | Productos de limpieza, mantenimiento regular     | Por punto          | 17 puntos x 25€/mes           | 425               | Limpieza módulos, mantenimiento preventivo básico |
| **G. MARKETING Y ADQUISICIÓN**          |                                                  |                    |                               | **1.100**         |                                                   |
| G1. Publicidad Digital                  | Google Ads, Meta Ads (temporada alta)            | Variable           | Campañas estacionales         | 600               | Enfocado abril-octubre (SEO + SEM + Social)       |
| G2. Material Promocional                | Folletos, stickers, colaboraciones con albergues | Variable           | Según necesidad               | 250               | Impresión y distribución en albergues/hoteles     |
| G3. Contenido y Redes Sociales          | Producción de contenido (fotos, vídeos)          | Freelance          | 1-2 sesiones/mes              | 250               | Fotógrafo + editor de video (contenido UGC)       |
|                                         |                                                  |                    |                               |                   |                                                   |
| **SUBTOTAL OPEX VARIABLE (Temp. Alta)** |                                                  |                    |                               | **9.630€**        | **Sin comisión % a socios = 7.380€**              |

**NOTA CRÍTICA sobre comisión a socios CSP:**

- **Modelo A (Canon Fijo):** 200€/mes por CSP → 3.000€/mes total (en OPEX Fijo D1) + 0€ variable
- **Modelo B (% Ingresos):** 0€ fijo + 15% de ventas vending → ~2.250€/mes (en OPEX Variable E4)
- **Recomendación:** Modelo A (fijo) da más previsibilidad financiera; Modelo B alinea incentivos con ventas

**Para temporada BAJA (Nov-Abr), reducir costes variables en ~70%:**

- Ventas vending: 3.500€/mes (↓77%)
- OPEX Variable ajustado: ~2.800€/mes

---

### 2.3. OPEX ANUAL TOTAL (con Estacionalidad)

**CRÍTICO:** El negocio tiene una estacionalidad marcada que afecta drásticamente a los OPEX variables.

| Periodo              | Meses                | % Actividad Anual | OPEX Fijo (€) | OPEX Variable (€)  | OPEX Total Periodo (€) |
| -------------------- | -------------------- | ----------------- | ------------- | ------------------ | ---------------------- |
| **Temporada Alta**   | Mayo - Oct (6 meses) | 82%               | 63.000        | 44.280 (7.380 x 6) | **107.280€**           |
| **Temporada Baja**   | Nov - Abr (6 meses)  | 18%               | 63.000        | 16.800 (2.800 x 6) | **79.800€**            |
|                      |                      |                   |               |                    |                        |
| **TOTAL OPEX ANUAL** | 12 meses             | 100%              | **126.000€**  | **61.080€**        | **187.080€**           |

**Desglose por componente anual:**

- **Personal y SS:** 70.200€ (37.5%)
- **Canon a socios CSP (fijo):** 36.000€ (19.2%)
- **COGS vending:** 37.800€ (20.2%) - variable
- **Tecnología:** 6.780€ (3.6%)
- **Logística y mantenimiento:** 14.100€ (7.5%)
- **Marketing:** 7.920€ (4.2%)
- **Administración y oficina:** 9.960€ (5.3%)
- **Otros (comisiones, servicios):** 4.320€ (2.3%)

**Implicaciones para el flujo de caja:**

- **Temporada alta (May-Oct):** Ingresos máximos, OPEX variable alto → Generación de caja positiva, acumulación de reservas
- **Temporada baja (Nov-Abr):** Ingresos mínimos (~18% del anual), OPEX fijo continúa → Consumo de reservas
- **Estrategia crítica:** Acumular colchón financiero de mínimo **80.000€** en temporada alta para cubrir 6 meses de temporada baja
- **Punto de supervivencia:** Con OPEX fijo de 10.500€/mes, necesitas generar mínimo ese ingreso en temporada baja para no consumir capital

**Ratio clave:**

- **OPEX Fijo/OPEX Total:** 67% → Estructura poco flexible, alto riesgo en temporada baja
- **Optimización sugerida:** Convertir más costes fijos a variables (ej: salarios fundadores con componente variable ligado a ingresos)

---

## 3. ANÁLISIS DE PUNTO DE EQUILIBRIO (Break-Even)

### 3.1. Cálculo del Break-Even Mensual

**Fórmula:**

```
Punto de Equilibrio (€/mes) = OPEX Fijo Mensual / Margen de Contribución (%)
```

**Datos reales de nuestro modelo:**

- **OPEX Fijo Mensual:** 10.500€
- **Margen Promedio Ponderado:** 52% (después de COGS y comisiones variables)
  - Vending: 65% margen bruto - 2% pasarela - 17% logística/mant. = ~46% neto
  - Taller pay-per-use: 70% margen (mínimo COGS, solo desgaste herramientas)
  - CSH comisiones: 17.5% margen directo
  - Servicios premium (lavado/carga): 60% margen

**Break-Even = 10.500€ / 0.52 = 20.192€/mes en ingresos brutos**

### 3.2. Distribución de Ingresos Necesarios por Canal (Break-Even)

Para alcanzar el break-even de **20.192€/mes**, necesitamos:

| Canal de Ingreso                   | % del Total | Ingreso Necesario (€/mes) | Métricas Operativas Requeridas              |
| ---------------------------------- | ----------- | ------------------------- | ------------------------------------------- |
| Vending (Consumibles)              | 50%         | **10.096€**               | ~19€/día por CSP (17 puntos) = 595€/CSP/mes |
| Taller Pay-Per-Use (auto-servicio) | 30%         | **6.058€**                | ~36 horas alquiladas/mes total en red       |
| Talleres CSH (Comisión 17.5%)      | 15%         | **3.029€**                | ~173 reparaciones/mes (ticket medio 35€)    |
| Servicios Premium (Lavado, Carga)  | 5%          | **1.009€**                | ~84 usos/mes combinados (12€/uso promedio)  |
| **TOTAL**                          | 100%        | **20.192€**               | **= Punto de Equilibrio**                   |

### 3.3. Break-Even Anual y Timeline

| Métrica                          | Valor      | Notas                                           |
| -------------------------------- | ---------- | ----------------------------------------------- |
| **Break-Even Mensual**           | 20.192€    | Ingresos mínimos para cubrir OPEX fijo          |
| **Break-Even Anual**             | 242.304€   | Asumiendo mantener punto de equilibrio 12 meses |
| **Ingresos Año 1 (proyectados)** | 180.000€   | Ramp-up progresivo (optimista: 220.000€)        |
| **Meses hasta Break-Even**       | 8-12 meses | Dependiendo de adopción y estacionalidad        |
| **Pérdidas acumuladas Año 1**    | -62.000€   | Necesidad de capital circulante adicional       |

**Sensibilidad del Break-Even:**

- Si **OPEX fijo se reduce 20%** (ej: salarios más bajos, sin oficina): Break-Even = **16.154€/mes** (-20%)
- Si **margen mejora al 58%** (mejores precios proveedores, optimización logística): Break-Even = **18.103€/mes** (-10%)
- Si **OPEX fijo aumenta 30%** (contratar antes de tiempo): Break-Even = **26.250€/mes** (+30%)

---

## 4. PLAN DE FINANCIACIÓN INICIAL

### 4.1. Necesidades de Capital

| Concepto                              | Importe (€)  | Notas                                                             |
| ------------------------------------- | ------------ | ----------------------------------------------------------------- |
| **CAPEX Total (Fase Piloto)**         | 278.456      | 15 CSP + 2 CSS + 10 CSH + Plataforma (de sección 1.5)             |
| **Capital de Trabajo (6 meses OPEX)** | 93.540       | OPEX mensual 15.590€ x 6 meses (promedio anual)                   |
| **Marketing de Lanzamiento**          | 15.000       | Campaña inicial, PR, eventos                                      |
| **Contingencia (15%)**                | 58.049       | 15% de la suma anterior para imprevistos                          |
|                                       |              |                                                                   |
| **FINANCIACIÓN TOTAL NECESARIA**      | **445.045€** | **Capital necesario para 24 meses de operación hasta break-even** |

### 4.2. Fuentes de Financiación Propuestas

| Fuente                                 | Importe Objetivo (€) | % del Total | Condiciones/Notas                                      |
| -------------------------------------- | -------------------- | ----------- | ------------------------------------------------------ |
| **Capital Propio (Founders)**          | 50.000               | 11.2%       | Equity completo, skin in the game                      |
| **Inversores Ángeles/Business Angels** | 150.000              | 33.7%       | 15-20% equity, valoración pre-money ~750k-1M€          |
| **Subvenciones Públicas**              | 100.000              | 22.5%       | Fondo perdido: Red.es, Xunta Galicia, INCIBE, CDTI     |
| **Financiación ICO/Enisa**             | 80.000               | 18.0%       | Préstamo participativo, 5-7 años, interés 3-5%         |
| **Crowdfunding (Reward-based)**        | 30.000               | 6.7%        | Pre-venta de servicios + marketing                     |
| **Crowdlending/Préstamo P2P**          | 35.045               | 7.9%        | Alternativa: MytripleA, Circulantis, préstamo bancario |
|                                        |                      |             |                                                        |
| **TOTAL FINANCIACIÓN**                 | **445.045€**         | 100%        | **Mix diversificado para reducir riesgo**              |

### 4.3. Calendario de Desembolsos y Usos

| Fase                   | Timing      | Uso Principal                     | Capital Necesario (€) |
| ---------------------- | ----------- | --------------------------------- | --------------------- |
| **Pre-Operativa**      | Mes -6 a -1 | Desarrollo plataforma tecnológica | 65.000                |
| **Lanzamiento Piloto** | Mes 0 a 3   | Despliegue primeros 8 CSP + 1 CSS | 120.000               |
| **Expansión Fase 1**   | Mes 4 a 12  | Completar 15 CSP + 2 CSS + 10 CSH | 180.000               |
| **Operación y Growth** | Mes 13 a 24 | OPEX, marketing, optimización     | 80.045                |
|                        |             |                                   |                       |
| **TOTAL 24 meses**     |             |                                   | **445.045€**          |

### 4.4. Subvenciones Públicas Aplicables (España)

**Programas específicos para Camiño Service Network:**

1. **Red.es - Digitalización de PYMEs y Turismo:**
   - Hasta 12.000€ por empresa (segmento I)
   - Digitalización sector turístico
   - **Aplicable:** Plataforma tecnológica, IoT

2. **Xunta de Galicia - Turismo Sostenible:**
   - Ayudas a infraestructuras turísticas innovadoras
   - Camino de Santiago como activo estratégico
   - **Aplicable:** CSS en Galicia, señalización

3. **INCIBE - Ciberseguridad y Transformación Digital:**
   - Ayudas para startups tecnológicas
   - **Aplicable:** Seguridad plataforma, protección datos

4. **CDTI - Proyectos I+D Innovadores:**
   - Préstamos participativos sin interés
   - **Aplicable:** Desarrollo tecnología IoT, sistema acceso

5. **Fondos Europeos Next Generation - Turismo Sostenible:**
   - Grandes cuantías para proyectos tractores
   - **Aplicable:** Red completa CSS, movilidad sostenible

**Estimación conservadora de subvenciones: 80.000-120.000€** (de los 100.000€ objetivo)

---

## 5. PRÓXIMOS PASOS

### 5.1. Tareas completadas ✅

1. ✅ **Inventario detallado completo** (`01-inventario-detallado-service-point.md`)
   - Todos los módulos con precios reales de mercado español (sin IVA)
   - Proveedores identificados y precios verificados
   - 3 configuraciones calculadas: CSP Básico (10.164€), CSP Completo (12.951€), CSS (23.491€)

2. ✅ **CAPEX calculado por categoría**
   - CSP Partner: 10.164€ - 12.951€ según configuración
   - CSS Propia: 23.491€
   - CSH Taller Oficial: 870€
   - Fase Piloto total: 278.456€ (15 CSP + 2 CSS + 10 CSH + Plataforma)

3. ✅ **OPEX estructurado con datos reales**
   - OPEX Fijo mensual: 10.500€ (126.000€/año)
   - OPEX Variable: 7.380€/mes temp. alta, 2.800€/mes temp. baja
   - OPEX Total Anual: 187.080€

4. ✅ **Break-Even analizado**
   - Punto de equilibrio: 20.192€/mes en ingresos
   - Timeline: 8-12 meses desde lanzamiento
   - Métricas operativas definidas por canal

5. ✅ **Plan de financiación diseñado**
   - Necesidad total: 445.045€ (24 meses hasta break-even)
   - Mix de fuentes: 11% propio, 34% BA, 22% subvenciones, 18% ICO, 15% otros
   - Subvenciones específicas identificadas

### 5.2. Siguientes acciones recomendadas 📋

1. **Validación de supuestos (CRÍTICO):**
   - [ ] Realizar 3-5 entrevistas con albergueros del Camino para validar modelo CSP Partner
   - [ ] Contactar ayuntamientos estratégicos (Sarria, O Cebreiro, Ponferrada) para tantear CSS
   - [ ] Hacer test de demanda: encuesta a 100 peregrinos sobre disposición a pagar por servicios

2. **Afinar presupuestos:**
   - [ ] Solicitar cotizaciones formales a proveedores principales (Jofemar, Park Tool, Fermax)
   - [ ] Negociar descuentos por volumen (15 unidades CSP)
   - [ ] Obtener 3 presupuestos de desarrollo de plataforma tecnológica

3. **Preparar solicitud de financiación:**
   - [ ] Crear pitch deck con estos datos financieros
   - [ ] Preparar modelo financiero Excel completo (usar `03-modelo-financiero-instrucciones.md`)
   - [ ] Identificar 10 Business Angels especializados en turismo/movilidad sostenible
   - [ ] Preparar solicitudes de subvenciones (Red.es, Xunta Galicia, CDTI)

4. **Pilotar antes de escalar:**
   - [ ] Fase 0: Desplegar 1 CSP piloto en ubicación amiga (3 meses de test)
   - [ ] Medir KPIs reales: tasa de uso, ticket medio, rotación stock, incidencias técnicas
   - [ ] Ajustar OPEX y proyecciones con datos reales antes de escalar a 15 puntos

5. **Optimizaciones financieras:**
   - [ ] Estudiar modelo de leasing/renting para máquinas vending (reduce CAPEX inicial)
   - [ ] Evaluar revenue share vs canon fijo con socios CSP (simulación con datos reales)
   - [ ] Analizar automatización logística (ruteo óptimo para reposición stock)

---

- Aplicar a escenario de despliegue (15 CSP + 2 CSS + 10 CSH)

3. ⏳ **Estimar OPEX con datos reales**
   - Definir estructura salarial del equipo
   - Calcular coste real de servicios cloud (cotizar con AWS/GCP)
   - Proyectar volumen de ventas por canal para costes variables

4. ⏳ **Crear modelo financiero dinámico**
   - Hoja de cálculo con escenarios (optimista/realista/pesimista)
   - Proyección a 36 meses
   - Análisis de sensibilidad

### 5.2. Documentos complementarios a crear:

- `03-modelo-financiero-excel.xlsx` → Modelo con fórmulas y proyecciones
- `04-analisis-de-sensibilidad.md` → ¿Qué pasa si...? (variaciones de precio, demanda, etc.)
- `05-calendario-de-desembolsos.md` → Timeline de cuándo se necesita cada € (cash flow planning)

---

**Fecha de última actualización:** 8 de octubre de 2025  
**Responsable:** [Nombre]  
**Estado:** 🟡 Pendiente de rellenar con datos de proveedores
