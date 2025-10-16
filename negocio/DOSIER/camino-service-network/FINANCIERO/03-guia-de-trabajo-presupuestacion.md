# Guía de Trabajo: Presupuestación y Control de Costes

**Versión:** 1.0  
**Fecha:** 8 de octubre de 2025  
**Objetivo:** Proporcionar un flujo de trabajo paso a paso para completar la presupuestación del proyecto Camiño Service Network.

---

## 📋 RESUMEN DEL SISTEMA DE DOCUMENTOS

Has recibido 3 documentos que funcionan como un sistema integrado:

### 1. **Inventario Detallado** (`01-inventario-detallado-service-point.md`)

- **Qué es:** Lista exhaustiva de TODO lo que necesitas comprar
- **Nivel de detalle:** Especificaciones técnicas, cantidades, proveedores sugeridos
- **Para qué:** Ir a buscar presupuestos y rellenar precios

### 2. **Estructura CAPEX/OPEX** (`02-estructura-capex-opex.md`)

- **Qué es:** Clasificación contable de los costes (inversión vs. gastos recurrentes)
- **Nivel de detalle:** Agrupación por categorías financieras y modelos operativos
- **Para qué:** Análisis financiero, punto de equilibrio, plan de financiación

### 3. **Esta Guía** (`03-guia-de-trabajo-presupuestacion.md`)

- **Qué es:** Manual de instrucciones para usar los dos documentos anteriores
- **Para qué:** No perderte en el proceso y seguir un orden lógico

---

## 🎯 WORKFLOW: Cómo Presupuestar el Proyecto en 7 Fases

### **FASE 1: Priorización y Estrategia de Despliegue**

**Objetivo:** Decidir EXACTAMENTE qué vas a desplegar en la fase piloto.

**Tareas:**

1. Define el escenario de despliegue:
   - ¿Cuántos CSP (modelo partner)? → Recomendación: 15 en Camino Francés
   - ¿Cuántos CSS (modelo propio)? → Recomendación: 2 en ubicaciones flagship
   - ¿Cuántos CSH (talleres oficiales)? → Recomendación: 10
2. Para cada CSP/CSS, decide qué módulos incluyes:
   - Todos tendrán: Módulo 1 (Taller) + Módulo 2 (Vending)
   - Opcionales según ubicación:
     - ✅ Módulo 3 (Lavado): ¿En cuántos? (ej: 5 de 17 puntos)
     - ✅ Módulo 4 (Carga e-bikes): ¿En cuántos? (ej: 8 de 17 puntos)

3. Crea tu "Tabla de Despliegue":

   | ID Punto | Ubicación (Ejemplo)    | Tipo | Módulo 1 | Módulo 2 | Módulo 3 | Módulo 4 |
   | -------- | ---------------------- | ---- | -------- | -------- | -------- | -------- |
   | CSP-01   | Albergue Roncesvalles  | CSP  | ✅       | ✅       | ❌       | ✅       |
   | CSP-02   | Hotel Pamplona         | CSP  | ✅       | ✅       | ✅       | ✅       |
   | CSS-01   | Estación León (propia) | CSS  | ✅       | ✅       | ✅       | ✅       |
   | ...      | ...                    | ...  | ...      | ...      | ...      | ...      |

**Deliverable:** Documento `04-estrategia-de-despliegue.md` con la tabla completa.

---

### **FASE 2: Investigación de Proveedores**

**Objetivo:** Identificar y contactar proveedores para cada categoría de producto.

**Método de Trabajo:**

1. **Abre** `01-inventario-detallado-service-point.md`

2. **Para cada sección** (Módulo 1, Módulo 2, etc.):
   - Identifica las líneas con "Proveedor Sugerido" vacío
   - Busca 2-3 proveedores alternativos para cada componente
   - Añade links a sus páginas web/contacto

3. **Crea un documento de seguimiento** `05-proveedores-contactados.md`:

   ```markdown
   ## Componente: Soporte de reparación profesional (M1-E01)

   ### Proveedor 1: Park Tool

   - Contacto: ventas@parktool.es
   - Fecha contacto: 10/10/2025
   - Estado: ⏳ Esperando respuesta
   - Precio cotizado: -

   ### Proveedor 2: Feedback Sports

   - Contacto: info@feedbacksports.com
   - Fecha contacto: 10/10/2025
   - Estado: ✅ Presupuesto recibido
   - Precio cotizado: 285€/ud (descuento 10% a partir de 5 uds)

   ### Decisión Final: [Pendiente]
   ```

4. **Solicita presupuestos formales** (no te conformes con precios web):
   - Menciona que es para un proyecto de 15-20 ubicaciones
   - Pregunta por descuentos por volumen
   - Solicita condiciones de pago (60-90 días si es posible)
   - Pregunta por garantías y servicio post-venta

**Deliverable:** Documento `05-proveedores-contactados.md` actualizado semanalmente.

---

### **FASE 3: Rellenar Precios en el Inventario**

**Objetivo:** Completar todas las columnas "Precio Unit." y "Total" del inventario.

**Método:**

1. **Conforme recibas presupuestos**, actualiza `01-inventario-detallado-service-point.md`:
   - Columna "Precio Unit. (€)": Precio por unidad negociado
   - Columna "Total (€)": Precio Unit. × Unidades
   - Añade nota con fecha de cotización y proveedor elegido

2. **Usa un código de color mental** (o real si usas Notion/Excel):
   - 🟢 Verde: Presupuesto confirmado por escrito
   - 🟡 Amarillo: Estimación basada en web/similar
   - 🔴 Rojo: Falta cotizar

3. **Para componentes sin respuesta** (más de 2 semanas):
   - Usa precio de mercado + 15% de margen de seguridad
   - Marca en amarillo y anota "ESTIMACIÓN"

4. **Calcula subtotales por módulo**:
   - Al final de cada sección (Módulo 1, Módulo 2, etc.), suma todos los "Total"
   - Ejemplo:
     ```
     TOTAL MÓDULO 1 (Taller): 4,750€
     TOTAL MÓDULO 2 (Vending): 3,200€
     ```

**Deliverable:** `01-inventario-detallado-service-point.md` completado al 100%.

---

### **FASE 4: Calcular CAPEX Total**

**Objetivo:** Trasladar los costes del inventario a la estructura CAPEX del documento 02.

**Método:**

1. **Abre** `02-estructura-capex-opex.md`

2. **Sección 1.1 (CAPEX por CSP)**:
   - Línea A1 "Estructura y Mobiliario": Suma de M1-E01 a M1-E06 del inventario
   - Línea A2 "Herramientas (Set Completo)": Suma de M1-H01 a M1-H26
   - Línea A3 "Sistema de Acceso": Suma de M1-S01 a M1-S05
   - ... y así sucesivamente

3. **Calcula el "TOTAL CAPEX por CSP"**:
   - Suma de todas las líneas A1 + A2 + A3 + B1 + B2 + ... + E2
   - Este es el coste de desplegar **UN** CSP completo

4. **Sección 1.2 (CAPEX por CSS)**:
   - Copia el "TOTAL CSP" de 1.1
   - Añade los costes de la sección 5 del inventario (Estructura Física)
   - Calcula "TOTAL CAPEX por CSS"

5. **Sección 1.5 (RESUMEN TOTAL)**:
   - Multiplica:
     - CAPEX CSP × 15 unidades
     - CAPEX CSS × 2 unidades
     - CAPEX CSH × 10 unidades
     - CAPEX Tecnológico × 1 (único)
   - Añade 10% de contingencia
   - **Este es tu CAPEX TOTAL**

**Deliverable:** `02-estructura-capex-opex.md` sección 1 completada con totales.

---

### **FASE 5: Estimar OPEX Mensual**

**Objetivo:** Calcular los gastos operativos recurrentes.

**Método:**

1. **OPEX Fijo (Sección 2.1 del documento 02)**:

   **A. Equipo y Personal:**
   - Define salarios del equipo fundador (brutos mensuales)
   - Calcula Seguridad Social (30-35% sobre brutos)
   - Estima freelancers (media mensual)

   **B. Tecnología:**
   - Cotiza hosting con AWS/Google Cloud (usa calculadoras online)
   - Lista licencias SaaS necesarias (Google Maps API, SendGrid, etc.)
   - Calcula tarjetas SIM IoT: 17 puntos × 10€/mes = 170€/mes

   **C. Administración:**
   - Alquiler oficina (o €0 si trabajas desde casa inicialmente)
   - Asesoría fiscal: cotiza con 2-3 gestorías
   - Seguros: cotiza seguro de responsabilidad civil

   **D. Canon a Socios:**
   - Define modelo de revenue share con socios CSP
   - Opción A: % de ingresos (15-20%)
   - Opción B: Cuota fija mensual (150-300€/mes)

   **Suma todo → OPEX FIJO MENSUAL**

2. **OPEX Variable (Sección 2.2)**:

   **E. Coste de Ventas:**
   - Define margen objetivo del vending (ej: vender a 100€ lo que compras a 40€ = 60% margen)
   - Esto te da el COGS variable

   **F. Logística:**
   - Calcula coste de una ruta de reposición:
     - Km recorridos × precio combustible
     - Horas de trabajo × salario/hora del operario
   - Estima frecuencia (ej: 1 ruta/semana en temporada alta)

   **G. Marketing:**
   - Define presupuesto mensual de ads (ej: 500€/mes en temporada alta)

   **Suma todo → OPEX VARIABLE MENSUAL (en temporada alta)**

3. **Ajusta por estacionalidad (Sección 2.3)**:
   - Temporada alta (mayo-oct): OPEX fijo + OPEX variable al 100%
   - Temporada baja (nov-abril): OPEX fijo + OPEX variable al 20%

**Deliverable:** `02-estructura-capex-opex.md` sección 2 completada.

---

### **FASE 6: Análisis de Punto de Equilibrio**

**Objetivo:** Calcular cuánto tienes que facturar mensualmente para cubrir gastos.

**Método:**

1. **Calcula el Margen de Contribución Promedio**:
   - Suma ingresos de todos los canales en un mes tipo
   - Resta todos los costes variables (COGS, comisiones, etc.)
   - Divide resultado entre ingresos totales → % de margen

2. **Aplica la fórmula del Break-Even**:

   ```
   Ventas necesarias/mes = OPEX Fijo Mensual / Margen de Contribución (%)
   ```

3. **Distribúyelo por canal** (Sección 3.2 del documento 02):
   - Si break-even es 30,000€/mes y el vending es el 40% de tus ingresos:
     - Vending debe generar: 12,000€/mes
     - Si tienes 17 puntos: 706€/mes por punto
     - Si el ticket promedio es 15€: necesitas 47 transacciones/mes/punto

4. **Valida si es realista**:
   - ¿Tiene sentido con el flujo de ciclistas estimado?
   - Si no, ajusta estructura de costes o estrategia de precios

**Deliverable:** `02-estructura-capex-opex.md` sección 3 completada con análisis.

---

### **FASE 7: Plan de Financiación**

**Objetivo:** Definir cómo vas a conseguir el dinero necesario.

**Método:**

1. **Calcula Necesidad Total de Capital** (Sección 4.1):

   ```
   CAPEX Total (de Fase 4)
   + Capital de Trabajo (6 meses de OPEX fijo, de Fase 5)
   + Contingencia (15% de la suma anterior)
   = FINANCIACIÓN TOTAL NECESARIA
   ```

2. **Diversifica las Fuentes** (Sección 4.2):

   **Fuentes no dilutivas (prioridad):**
   - Subvenciones (INCIBE, Xunta de Galicia, Cámaras de Comercio)
   - Préstamos ENISA (participativo, sin garantías)
   - Financiación ICO

   **Fuentes dilutivas:**
   - Capital propio (founders)
   - FFF (Family, Friends, Fools)
   - Inversores ángeles (para equity)

   **Fuentes creativas:**
   - Crowdfunding (pre-venta de acceso premium + validación de mercado)
   - Acuerdos con proveedores (pago diferido a 90 días)

3. **Crea un Timeline de Financiación**:
   ```
   Mes 1-2: Solicitud subvenciones
   Mes 2-3: Pitch a inversores ángeles
   Mes 3: Campaña de crowdfunding
   Mes 4: Confirmación ENISA
   ```

**Deliverable:** `02-estructura-capex-opex.md` sección 4 completada.

---

## 🛠️ HERRAMIENTAS RECOMENDADAS

### Para Gestión de Proveedores:

- **Notion** o **Airtable**: Base de datos de proveedores con estados
- **Google Sheets**: Comparativas de precios lado a lado

### Para Cálculos Financieros:

- **Excel/Google Sheets**: Modelo financiero con fórmulas
- **Template sugerido**: Busca "startup financial model template" en Google

### Para Timeline y Seguimiento:

- **Trello** o **Asana**: Tablero Kanban con fases de presupuestación
- **Google Calendar**: Recordatorios de seguimiento a proveedores

---

## 📊 PLANTILLA: Modelo Financiero en Excel/Sheets

**Estructura de pestañas recomendada:**

1. **INVENTARIO**: Copia del inventario detallado con fórmulas
2. **CAPEX**: Resumen por modelo (CSP/CSS/CSH) con multiplicadores
3. **OPEX**: Costes fijos y variables con estacionalidad
4. **INGRESOS**: Proyección de ventas por canal y por mes
5. **P&L (Cuenta de Resultados)**: Ingresos - OPEX = Beneficio mensual
6. **CASH FLOW**: Movimientos de caja (cobros, pagos, saldo acumulado)
7. **BALANCE**: Activos, Pasivos, Patrimonio (si es necesario para inversores)
8. **ESCENARIOS**: Optimista / Realista / Pesimista

**Fórmulas clave:**

```excel
// CAPEX Total
=SUMA(Inventario!Total_Modulo1 : Inventario!Total_Modulo4) * Num_CSPs

// OPEX Mensual
=OPEX_Fijo + (OPEX_Variable * Factor_Estacionalidad)

// Break-Even
=OPEX_Fijo / Margen_Contribucion

// Cash Flow Acumulado
=Saldo_Mes_Anterior + Ingresos_Mes - (OPEX_Mes + CAPEX_Mes)
```

---

## ✅ CHECKLIST DE PROGRESO

Usa esta checklist para trackear tu avance:

### Fase 1: Estrategia

- [ ] Definida cantidad de CSPs, CSS y CSH a desplegar
- [ ] Decidido qué módulos opcionales en cada ubicación
- [ ] Creada tabla de despliegue completa

### Fase 2: Proveedores

- [ ] Identificados proveedores para Módulo 1 (Taller)
- [ ] Identificados proveedores para Módulo 2 (Vending)
- [ ] Identificados proveedores para Módulos 3 y 4 (opcionales)
- [ ] Identificados proveedores para Estructura (si CSS)
- [ ] Identificados proveedores para Tecnología
- [ ] Enviados emails de solicitud de presupuesto (mínimo 2 por categoría)

### Fase 3: Precios

- [ ] Recibidos presupuestos para 80% de componentes
- [ ] Rellenadas columnas de precio en inventario
- [ ] Calculados subtotales por módulo
- [ ] Estimados precios faltantes con margen de seguridad

### Fase 4: CAPEX

- [ ] Calculado CAPEX por CSP (modelo partner)
- [ ] Calculado CAPEX por CSS (modelo propio)
- [ ] Calculado CAPEX por CSH (taller oficial)
- [ ] Calculado CAPEX tecnológico (plataforma)
- [ ] Calculado CAPEX TOTAL con contingencia

### Fase 5: OPEX

- [ ] Definida estructura salarial del equipo
- [ ] Cotizados servicios tecnológicos recurrentes
- [ ] Calculado OPEX fijo mensual
- [ ] Estimado OPEX variable (COGS, logística, marketing)
- [ ] Ajustado OPEX por estacionalidad (alta vs. baja)

### Fase 6: Break-Even

- [ ] Calculado margen de contribución promedio
- [ ] Calculado punto de equilibrio mensual
- [ ] Distribuido break-even por canal de ingresos
- [ ] Validada viabilidad con datos de mercado

### Fase 7: Financiación

- [ ] Calculada necesidad total de capital
- [ ] Identificadas fuentes de financiación (subvenciones, inversores, etc.)
- [ ] Creado timeline de fundraising
- [ ] Preparado elevator pitch con datos financieros clave

---

## 🚨 ERRORES COMUNES A EVITAR

1. **Subestimar costes de instalación y transporte**
   - ❌ "El módulo cuesta 3,000€"
   - ✅ "El módulo cuesta 3,000€ + 400€ envío + 600€ instalación = 4,000€ total"

2. **Olvidar el IVA**
   - ❌ Presupuestar con precios sin IVA si no eres gran empresa
   - ✅ Añadir 21% en España (recuperable si eres autónomo/SL, pero impacta cash flow inicial)

3. **No considerar la estacionalidad en el cash flow**
   - ❌ "Gano 30k€/mes, puedo pagar 15k€ de OPEX todo el año"
   - ✅ "Gano 45k€/mes 6 meses y 5k€/mes otros 6 meses, debo ahorrar en temporada alta"

4. **Inflexibilidad ante la realidad**
   - ❌ Aferrarse a un número de CSPs si el presupuesto no da
   - ✅ Empezar con 8 CSPs bien equipados mejor que 15 a medio gas

5. **Falta de contingencia**
   - ❌ Gastar el 100% del capital en CAPEX
   - ✅ Reservar 15-20% para imprevistos (siempre los hay)

---

## 📅 TIMELINE SUGERIDO

**Semana 1-2:**

- Completar Fase 1 (Estrategia de despliegue)
- Iniciar Fase 2 (Contacto con proveedores)

**Semana 3-4:**

- Continuar Fase 2 (Seguimiento de presupuestos)
- Iniciar Fase 3 (Rellenar precios en inventario)

**Semana 5-6:**

- Completar Fase 3 (Inventario al 100%)
- Ejecutar Fase 4 (Cálculo de CAPEX)

**Semana 7-8:**

- Ejecutar Fase 5 (Estimación de OPEX)
- Ejecutar Fase 6 (Análisis de break-even)

**Semana 9-10:**

- Ejecutar Fase 7 (Plan de financiación)
- Crear modelo financiero en Excel/Sheets
- Preparar pitch deck con datos financieros

---

## 🎯 OBJETIVO FINAL

Al terminar este proceso, tendrás:

1. ✅ **Inventario valorado** con precios reales de mercado
2. ✅ **CAPEX total calculado** por modelo de despliegue
3. ✅ **OPEX mensual estimado** con estacionalidad
4. ✅ **Punto de equilibrio conocido** (cuánto necesitas facturar)
5. ✅ **Plan de financiación definido** (cuánto dinero necesitas y de dónde)
6. ✅ **Modelo financiero en Excel** con proyecciones a 36 meses
7. ✅ **Confianza total** para hablar con inversores, socios y proveedores

---

**Recuerda:** Esto no es un documento estático. Actualízalo conforme:

- Cambien los precios de proveedores
- Modifiques la estrategia de despliegue
- Recibas feedback de potenciales inversores
- El mercado te dé nueva información

**La planificación financiera es un proceso iterativo, no un evento único.**

---

**¿Dudas o necesitas ayuda en alguna fase específica?**  
Vuelve a consultar esta guía y los documentos de inventario y estructura CAPEX/OPEX.

**¡Éxito con tu presupuestación! 🚀**
