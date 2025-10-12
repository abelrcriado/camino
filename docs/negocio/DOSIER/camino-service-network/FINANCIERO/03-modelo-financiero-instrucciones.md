# Modelo Financiero: Instrucciones de Construcción en Excel

**Versión:** 1.0  
**Fecha:** 8 de octubre de 2025  
**Objetivo:** Guía paso a paso para construir el modelo financiero completo de Camiño Service Network en Excel o Google Sheets.

---

## 📊 ESTRUCTURA DEL MODELO (7 Pestañas)

### **Pestaña 1: INVENTARIO**

### **Pestaña 2: CAPEX**

### **Pestaña 3: OPEX**

### **Pestaña 4: INGRESOS**

### **Pestaña 5: P&L (Cuenta de Resultados)**

### **Pestaña 6: CASH FLOW**

### **Pestaña 7: ESCENARIOS**

---

## 🛠️ CONSTRUCCIÓN PASO A PASO

### PESTAÑA 1: INVENTARIO

**Objetivo:** Base de datos de todos los componentes con precios.

#### Estructura de columnas:

| ID  | Categoría | Componente | Especificación | Unidades/CSP | Proveedor | Precio Unit. | Total | Notas |
| --- | --------- | ---------- | -------------- | ------------ | --------- | ------------ | ----- | ----- |

#### Filas principales (ejemplo):

```
M1-E01 | Módulo Taller | Soporte reparación | Ajustable 30kg | 2 | Park Tool | 250 | 500 | ...
M1-H01 | Herramientas | Tronchacadenas | 9-12v | 2 | Shimano | 35 | 70 | ...
M2-V01 | Vending | Máquina vending | 30 refs | 1 | Azkoyen | 3000 | 3000 | ...
```

#### Fórmulas clave:

```excel
// Celda H (Total)
=E2*G2  // Unidades × Precio Unitario

// Subtotal por categoría (ej: Módulo 1)
=SUMAR.SI($B:$B,"Módulo Taller",$H:$H)

// Total Inventario
=SUMA(H:H)
```

#### Nombres de rango (para usar en otras pestañas):

- `Inventario_Total_Modulo1` = SUMA de todos los items del Módulo 1
- `Inventario_Total_Modulo2` = SUMA de Módulo 2
- `Inventario_Stock_Inicial` = SUMA de stock consumibles

---

### PESTAÑA 2: CAPEX

**Objetivo:** Calcular inversión inicial por modelo (CSP/CSS/CSH) y total.

#### Sección A: CAPEX por CSP (Modelo Partner)

| Concepto            | Referencia                    | Importe (€)  | Notas  |
| ------------------- | ----------------------------- | ------------ | ------ |
| Módulo Taller       | =Inventario!Subtotal_M1       | [Fórmula]    |        |
| Módulo Vending      | =Inventario!Subtotal_M2       | [Fórmula]    |        |
| Stock Inicial       | =Inventario!Stock_Inicial     | [Fórmula]    |        |
| Branding            | =Inventario!Subtotal_Branding | [Fórmula]    |        |
| Instalación         |                               | 800          | Manual |
| **TOTAL CAPEX/CSP** |                               | =SUMA(C2:C6) |        |

#### Sección B: CAPEX por CSS (Modelo Propio)

| Concepto            | Importe (€)                     |
| ------------------- | ------------------------------- |
| Base CSP            | =$C$7                           |
| Estructura Física   | =Inventario!Subtotal_Estructura |
| **TOTAL CAPEX/CSS** | =SUMA(C10:C11)                  |

#### Sección C: CAPEX Tecnológico (único)

| Componente           | Importe (€)    |
| -------------------- | -------------- |
| Desarrollo MVP       | 50000          |
| Diseño UX/UI         | 8000           |
| Testing              | 5000           |
| **TOTAL CAPEX Tech** | =SUMA(C15:C17) |

#### Sección D: RESUMEN TOTAL

**Crea una tabla de despliegue:**

| Tipo                     | Cantidad | CAPEX Unit.           | CAPEX Total         |
| ------------------------ | -------- | --------------------- | ------------------- |
| CSP                      | 15       | =$C$7                 | =B22\*C22           |
| CSS                      | 2        | =$C$13                | =B23\*C23           |
| CSH                      | 10       | =Inventario!CAPEX_CSH | =B24\*C24           |
| Tecnología               | 1        | =$C$19                | =B25\*C25           |
| **Contingencia (10%)**   |          |                       | =SUMA(D22:D25)\*0.1 |
| **TOTAL CAPEX PROYECTO** |          |                       | =SUMA(D22:D26)      |

#### Nombres de rango importantes:

- `CAPEX_Total` = D27 (total del proyecto)
- `CAPEX_por_CSP` = C7
- `CAPEX_por_CSS` = C13

---

### PESTAÑA 3: OPEX

**Objetivo:** Calcular gastos operativos mensuales (fijos y variables).

#### Estructura de tabla:

| Concepto               | Tipo     | Ene                     | Feb      | Mar   | ... | Dic | TOTAL          |
| ---------------------- | -------- | ----------------------- | -------- | ----- | --- | --- | -------------- |
| Salarios               | Fijo     | 8000                    | 8000     | 10400 | ... |     | =SUMA(C2:N2)   |
| Seguridad Social (30%) | Fijo     | =C2\*0.3                | =D2\*0.3 | ...   |     |     | =SUMA(C3:N3)   |
| Hosting/Cloud          | Fijo     | 800                     | 800      | 800   | ... |     | =SUMA(C4:N4)   |
| ...                    |          |                         |          |       |     |     |                |
| **SUBTOTAL FIJO**      |          | =SUMA(C2:C10)           | ...      |       |     |     | =SUMA(O2:O10)  |
|                        |          |                         |          |       |     |     |                |
| COGS Vending           | Variable | =Ingresos!C2\*0.4       | ...      |       |     |     | =SUMA(C12:N12) |
| Comisión Socios (18%)  | Variable | =Ingresos!C_Total\*0.18 | ...      |       |     |     |                |
| Marketing              | Variable | 1500                    | 2000     | ...   |     |     |                |
| **SUBTOTAL VARIABLE**  |          | =SUMA(C12:C18)          | ...      |       |     |     | =SUMA(O12:O18) |
|                        |          |                         |          |       |     |     |                |
| **TOTAL OPEX MENSUAL** |          | =C11+C19                | ...      |       |     |     | =SUMA(O2:O19)  |

#### Parámetros ajustables (en celdas aparte):

```
Margen_Vending = 60%    → COGS = (1 - Margen)
Comision_Socios = 18%
Comision_CSH = 17.5%
Salario_Base = 8000
```

#### Estacionalidad (factor multiplicador):

| Mes     | Factor OPEX Variable |
| ------- | -------------------- |
| Ene-Abr | 0.2                  |
| May-Oct | 1.0                  |
| Nov-Dic | 0.2                  |

**Fórmula en OPEX variable:**

```excel
=Ingresos!C_Total * Comision_Socios% * Factor_Estacionalidad_C
```

---

### PESTAÑA 4: INGRESOS

**Objetivo:** Proyectar ingresos mensuales por canal.

#### Parámetros del modelo (parte superior):

| Parámetro                | Valor | Notas                  |
| ------------------------ | ----- | ---------------------- |
| Ciclistas_Camino_Frances | 23600 | Ajustado según informe |
| Tasa_Adopcion_App        | 15%   | Escenario base         |
| Uso_Promedio_Usuario     | 2.1   | Transacciones/usuario  |
| Ticket_Promedio          | 18€   | Media ponderada        |
| Num_CSPs                 | 15    | Operativos desde mes 4 |
| Num_CSS                  | 2     | Operativos desde mes 6 |
| Num_CSH                  | 10    | Operativos desde mes 2 |

#### Distribución mensual de ciclistas (factor estacional):

| Mes | % Anual | Ciclistas      | Usuarios App       |
| --- | ------- | -------------- | ------------------ |
| Ene | 1%      | =Ciclistas\*B2 | =C2\*Tasa_Adopcion |
| Feb | 2%      | =Ciclistas\*B3 | =C3\*Tasa_Adopcion |
| Mar | 3%      | ...            | ...                |
| Abr | 5%      |                |                    |
| May | 12%     |                |                    |
| Jun | 18%     |                |                    |
| Jul | 20%     |                |                    |
| Ago | 19%     |                |                    |
| Sep | 12%     |                |                    |
| Oct | 6%      |                |                    |
| Nov | 1%      |                |                    |
| Dic | 1%      |                |                    |

#### Ingresos por canal (tabla principal):

| Canal                      | Ene                                 | Feb | ... | Dic | TOTAL        |
| -------------------------- | ----------------------------------- | --- | --- | --- | ------------ |
| **Vending**                | =Usuarios_Ene*Uso_Prom*Ticket\*0.4  | ... |     |     | =SUMA(C2:N2) |
| **Taller Pay-per-use**     | =Usuarios_Ene*Uso_Prom*Ticket\*0.3  | ... |     |     | =SUMA(C3:N3) |
| **Comisión CSH**           | =Num_CSH*Reparaciones_Mes*20\*0.175 | ... |     |     | =SUMA(C4:N4) |
| **Premium (Lavado/Carga)** | =(Num_CSS*30*12)                    | ... |     |     | =SUMA(C5:N5) |
| **TOTAL INGRESOS**         | =SUMA(C2:C5)                        | ... |     |     | =SUMA(C6:N6) |

#### Ajuste de rampa (para meses 1-3):

```excel
// En vez de usar directamente Usuarios_Mes, aplica factor de rampa
=Usuarios_Mes * Factor_Rampa_Mes

// Factor_Rampa:
Mes 1 (Mayo): 30%  // Bajo uso inicial, están aprendiendo
Mes 2 (Junio): 60%
Mes 3 (Julio): 85%
Mes 4+: 100%
```

---

### PESTAÑA 5: P&L (Cuenta de Resultados)

**Objetivo:** Beneficio/Pérdida mensual y anual.

#### Estructura estándar:

| Concepto                      | Ene                   | Feb | ... | Dic | TOTAL          | % s/Ventas |
| ----------------------------- | --------------------- | --- | --- | --- | -------------- | ---------- |
| **INGRESOS**                  | =Ingresos!C6          | ... |     |     | =SUMA(C2:N2)   | 100%       |
|                               |                       |     |     |     |                |            |
| **COSTE DE VENTAS**           |                       |     |     |     |                |            |
| COGS Vending                  | =OPEX!C12             | ... |     |     | =SUMA(C5:N5)   | =O5/O2     |
| Comisiones Socios             | =OPEX!C13             | ... |     |     | =SUMA(C6:N6)   | =O6/O2     |
| Comisiones CSH                | =OPEX!C14             | ... |     |     | =SUMA(C7:N7)   | =O7/O2     |
| **Total Coste Ventas**        | =SUMA(C5:C7)          | ... |     |     | =SUMA(C8:N8)   | =O8/O2     |
|                               |                       |     |     |     |                |            |
| **MARGEN BRUTO**              | =C2-C8                | ... |     |     | =SUMA(C10:N10) | =O10/O2    |
|                               |                       |     |     |     |                |            |
| **GASTOS OPERATIVOS**         |                       |     |     |     |                |            |
| Salarios + SS                 | =OPEX!C2+C3           | ... |     |     | =SUMA(C13:N13) | =O13/O2    |
| Marketing                     | =OPEX!C15             | ... |     |     | =SUMA(C14:N14) | =O14/O2    |
| Tecnología                    | =OPEX!C4              | ... |     |     | =SUMA(C15:N15) | =O15/O2    |
| Otros gastos                  | =OPEX!C_Otros         | ... |     |     | =SUMA(C16:N16) | =O16/O2    |
| **Total Gastos Operativos**   | =SUMA(C13:C16)        | ... |     |     | =SUMA(C17:N17) | =O17/O2    |
|                               |                       |     |     |     |                |            |
| **EBITDA**                    | =C10-C17              | ... |     |     | =SUMA(C19:N19) | =O19/O2    |
| Amortización (CAPEX/36 meses) | =CAPEX!CAPEX_Total/36 | ... |     |     |                |            |
| **EBIT**                      | =C19-C20              | ... |     |     | =SUMA(C21:N21) | =O21/O2    |
|                               |                       |     |     |     |                |            |
| **RESULTADO NETO (Año 1)**    |                       |     |     |     | =O21           | =O21/O2    |

#### Formato condicional:

- **EBITDA positivo:** Verde
- **EBITDA negativo < -10k€:** Amarillo
- **EBITDA negativo > -10k€:** Rojo

---

### PESTAÑA 6: CASH FLOW

**Objetivo:** Proyección de saldo de caja mes a mes.

#### Tabla principal:

| Mes    | Saldo Inicial | Entradas Operativas | Entradas Financ. | Total Entradas | Salidas OPEX  | Salidas CAPEX | Total Salidas | Saldo Final | Runway              |
| ------ | ------------- | ------------------- | ---------------- | -------------- | ------------- | ------------- | ------------- | ----------- | ------------------- |
| Ene-26 | 0             | 0                   | 150000           | =C2+D2         | 0             | 0             | =F2+G2        | =B2+E2-H2   | =I2/PROMEDIO(H2:H4) |
| Feb-26 | =I2           | 0                   | 0                | =C3+D3         | 21300         | 0             | =F3+G3        | =B3+E3-H3   | =I3/PROMEDIO(H2:H4) |
| Mar-26 | =I3           | 0                   | 0                |                | 41000         | 0             |               |             |                     |
| ...    |               |                     |                  |                |               |               |               |             |                     |
| May-26 | =I5           | =Ingresos!C6        | 50000            |                | =OPEX!C_Total | 0             |               |             |                     |
| Jun-26 | =I6           | =Ingresos!D6        | 0                |                | =OPEX!D_Total | 0             |               |             |                     |
| Jul-26 | =I7           | =Ingresos!E6        | 120000           |                | =OPEX!E_Total | 45000         |               |             |                     |
| ...    |               |                     |                  |                |               |               |               |             |                     |

#### Calendario de CAPEX (en columna aparte para claridad):

| Mes | CAPEX del Mes | Descripción                  |
| --- | ------------- | ---------------------------- |
| Mar | 30000         | Compra módulos 5 CSPs piloto |
| Abr | 15000         | Instalación 5 CSPs           |
| Jul | 30000         | Compra 10 CSPs expansión     |
| Ago | 15000         | Instalación 10 CSPs          |
| Oct | 70000         | Construcción 2 CSS           |

**Vincular con tabla principal:**

```excel
// Columna G (Salidas CAPEX)
=BUSCARV(A2, Calendario_CAPEX, 2, 0)
// Si no encuentra, devuelve 0
=SI.ERROR(BUSCARV(A2, Calendario_CAPEX, 2, 0), 0)
```

#### Alertas visuales (formato condicional):

- **Saldo Final < 30k€:** Rojo
- **Saldo Final 30-60k€:** Amarillo
- **Runway < 3 meses:** Rojo (columna Runway)

#### Gráfico recomendado:

- **Tipo:** Línea + Columnas
- **Eje Y izquierdo:** Saldo Final (línea azul)
- **Eje Y derecho:** Entradas vs. Salidas (columnas apiladas)
- **Línea de referencia horizontal:** 30,000€ (nivel crítico)

---

### PESTAÑA 7: ESCENARIOS

**Objetivo:** Comparar Optimista, Realista, Pesimista en una vista.

#### Estructura:

**Tabla de parámetros variables:**

| Variable        | Pesimista | Realista | Optimista |
| --------------- | --------- | -------- | --------- |
| Adopción App    | 8%        | 15%      | 25%       |
| Ticket Promedio | 12€       | 18€      | 24€       |
| Margen Vending  | 50%       | 60%      | 65%       |
| Comisión Socios | 25%       | 18%      | 15%       |
| CAC             | 8€        | 4€       | 2€        |
| Flujo Ciclistas | -10%      | Base     | +15%      |

**Tabla de resultados comparativos (Año 1):**

| Métrica              | Pesimista           | Realista           | Optimista           |
| -------------------- | ------------------- | ------------------ | ------------------- |
| **Ingresos**         | =Ingresos_Pesimista | =Ingresos_Realista | =Ingresos_Optimista |
| **OPEX**             | ...                 | ...                | ...                 |
| **EBITDA**           | ...                 | ...                | ...                 |
| **Cash Flow Neto**   | ...                 | ...                | ...                 |
| **Saldo Final Caja** | ...                 | ...                | ...                 |

**Cómo funciona:**

1. Cada escenario tiene sus propias pestañas ocultas:
   - `Ingresos_Pesimista`
   - `Ingresos_Realista`
   - `Ingresos_Optimista`
2. Usan los parámetros de la tabla de arriba
3. La pestaña "ESCENARIOS" solo muestra el resumen

**Fórmula ejemplo para Ingresos en escenario pesimista:**

```excel
=Ciclistas * (1 + Variacion_Flujo_Pesimista) * Adopcion_Pesimista * Uso_Prom * Ticket_Pesimista
```

#### Gráfico de tornado (sensibilidad):

**Datos para el gráfico:**

| Variable        | Impacto en EBITDA (variación ±20%) |
| --------------- | ---------------------------------- |
| Adopción App    | ±45,000€                           |
| Ticket Promedio | ±32,000€                           |
| Margen Vending  | ±12,000€                           |
| ...             | ...                                |

**Tipo gráfico:** Barras horizontales divergentes (tornado chart)

---

## 🎨 DISEÑO Y FORMATO

### Paleta de Colores:

- **Títulos principales:** Azul oscuro (#1F4788)
- **Subtotales:** Gris (#7F7F7F), negrita
- **Totales:** Azul (#4472C4), negrita
- **Entradas de efectivo:** Verde claro (#A9D18E)
- **Salidas de efectivo:** Rojo claro (#F4B084)
- **Parámetros editables:** Amarillo claro (#FFE699)

### Bordes y Separadores:

- Línea doble bajo totales importantes
- Línea simple entre secciones
- Sombreado alternado en filas (10%)

### Validación de Datos:

**Celdas de parámetros (amarillas) con validación:**

```
Adopción App: Entre 5% y 40% (Lista desplegable)
Ticket Promedio: Entre 8€ y 35€
Margen Vending: Entre 40% y 75%
```

**Mensaje de error personalizado:**
"El valor introducido está fuera del rango razonable. Revisar supuestos."

---

## 🔐 PROTECCIÓN Y VERSIONADO

### Proteger el Modelo:

1. **Desbloquear solo celdas de parámetros** (amarillas)
2. **Proteger todas las pestañas** con contraseña
3. **Permitir:**
   - Ordenar y filtrar
   - Usar tablas dinámicas
   - Seleccionar celdas bloqueadas/desbloqueadas

### Control de Versiones:

**Añadir en celda A1 de cada pestaña:**

```
Versión: 1.0 | Fecha: 08/10/2025 | Autor: [Nombre]
```

**Histórico de cambios (nueva pestaña):**

| Versión | Fecha    | Autor    | Cambios                    |
| ------- | -------- | -------- | -------------------------- |
| 1.0     | 08/10/25 | [Nombre] | Modelo inicial             |
| 1.1     | 15/10/25 | [Nombre] | Ajuste margen vending real |
| ...     |          |          |                            |

---

## 📈 DASHBOARDS Y VISUALIZACIÓN

### Dashboard Ejecutivo (nueva pestaña):

**Crear un panel visual con:**

1. **KPIs principales (con iconos):**

   ```
   [📊 INGRESOS AÑO 1]    [💰 EBITDA AÑO 1]    [🏦 SALDO CAJA ACTUAL]
        133,812€               -126,374€              52,827€
   ```

2. **Gráfico de cascada (Waterfall):**
   - Ingresos → COGS → OPEX → EBITDA
3. **Gráfico de línea Cash Flow:**

   - Evolución de saldo 12 meses
   - Con banda de "zona segura" (> 30k€)

4. **Tabla resumen de escenarios:**

   - 3 columnas (Pes/Real/Opt)
   - 5 métricas clave

5. **Indicadores de semáforo:**
   ```
   Adopción vs. Objetivo:  🟢 (15.2% vs. 15%)
   Burn Rate:              🟡 (16k€ vs. 15k€ target)
   Runway:                 🟢 (4.2 meses vs. 3 min)
   ```

### Cómo crear gráficos avanzados:

**Gráfico de Waterfall (Excel 2016+):**

1. Seleccionar datos: Ingresos, -COGS, -OPEX, =EBITDA
2. Insertar → Gráfico de Cascada
3. Configurar columna "EBITDA" como "Total"

**Gráfico de Tornado (Análisis de Sensibilidad):**

1. Crear tabla de impactos (positivo y negativo)
2. Insertar gráfico de barras apiladas
3. Ocultar barra del medio (transparente)
4. Invertir orden de datos negativos

---

## 🔄 AUTOMATIZACIÓN CON MACROS (Opcional)

### Macro 1: Actualizar Todo el Modelo

```vba
Sub ActualizarModelo()
    ' Recalcular todas las fórmulas
    Application.CalculateFull

    ' Actualizar fecha de última actualización
    Sheets("Dashboard").Range("B2").Value = Now()

    ' Mensaje de confirmación
    MsgBox "Modelo actualizado correctamente", vbInformation
End Sub
```

### Macro 2: Cambiar de Escenario

```vba
Sub CambiarEscenario(escenario As String)
    Select Case escenario
        Case "Pesimista"
            Range("Parametros_Escenario").Value = Range("Parametros_Pesimista").Value
        Case "Realista"
            Range("Parametros_Escenario").Value = Range("Parametros_Realista").Value
        Case "Optimista"
            Range("Parametros_Escenario").Value = Range("Parametros_Optimista").Value
    End Select

    ActualizarModelo
End Sub
```

### Macro 3: Exportar Informe PDF

```vba
Sub ExportarInforme()
    Dim ruta As String
    ruta = ThisWorkbook.Path & "\Informe_Financiero_" & Format(Date, "yyyymmdd") & ".pdf"

    ' Exportar pestañas clave
    Sheets(Array("Dashboard", "P&L", "Cash Flow")).Select
    ActiveSheet.ExportAsFixedFormat Type:=xlTypePDF, Filename:=ruta

    MsgBox "Informe exportado: " & ruta, vbInformation
End Sub
```

**Crear botones en el Dashboard:**

- Botón "Actualizar" → Ejecuta `ActualizarModelo`
- Botones "Pesimista / Realista / Optimista" → Ejecutan `CambiarEscenario`
- Botón "Exportar PDF" → Ejecuta `ExportarInforme`

---

## ✅ CHECKLIST DE VALIDACIÓN

### Antes de usar el modelo, verifica:

**Consistencia de datos:**

- [ ] Todas las fórmulas apuntan a las celdas correctas
- [ ] No hay errores #REF!, #DIV/0!, #N/A
- [ ] Totales de inventario coinciden con CAPEX
- [ ] OPEX mensual suma correctamente
- [ ] Cash Flow: Saldo Final Mes N = Saldo Inicial Mes N+1

**Lógica de negocio:**

- [ ] Ingresos coherentes con usuarios y ticket promedio
- [ ] COGS no excede ingresos de vending
- [ ] Comisiones calculadas sobre base correcta
- [ ] Estacionalidad aplicada correctamente (mayo-oct alta)
- [ ] CAPEX solo en meses correctos (no recurrente)

**Escenarios:**

- [ ] Cada escenario tiene parámetros distintos
- [ ] Resultados varían lógicamente entre escenarios
- [ ] Pesimista siempre < Realista < Optimista

**Usabilidad:**

- [ ] Celdas de parámetros identificables (color amarillo)
- [ ] Gráficos actualizan automáticamente
- [ ] Dashboard muestra métricas en tiempo real
- [ ] Protección activada (solo parámetros editables)

---

## 📚 RECURSOS Y PLANTILLAS

### Plantillas de Excel Recomendadas:

1. **Startup Financial Model** (por Eloquens):

   - https://eloquens.com/tool/LaMBkE3X/startup/financial-model
   - Adaptable a tu estructura

2. **SaaS Financial Model** (adaptado para modelo de plataforma):

   - https://www.vertex42.com/ExcelTemplates/saas-financial-model.html

3. **Three Statement Model** (para inversores):
   - P&L + Balance + Cash Flow integrados

### Vídeos Tutorial:

- "How to Build a Startup Financial Model" - Y Combinator (YouTube)
- "Cash Flow Forecasting in Excel" - Corporatefinanceinstitute.com
- "Sensitivity Analysis & Scenario Planning" - Excel Campus

### Libros de Referencia:

- "Financial Modeling" - Simon Benninga (MIT Press)
- "The Startup Owner's Manual" - Steve Blank (Cap. 7: Financial Plan)

---

## 🚀 PRÓXIMOS PASOS

### Semana 1:

1. Construir pestañas 1-3 (Inventario, CAPEX, OPEX)
2. Rellenar con datos reales de proveedores

### Semana 2:

3. Construir pestañas 4-5 (Ingresos, P&L)
4. Validar lógica con datos históricos (si los hay)

### Semana 3:

5. Construir pestaña 6 (Cash Flow)
6. Integrar calendario de financiación

### Semana 4:

7. Construir pestaña 7 (Escenarios)
8. Crear Dashboard ejecutivo
9. Preparar presentación para inversores

---

## 📞 SOPORTE

**Si tienes dudas al construir el modelo:**

1. **Errores de fórmula:** Revisar referencias circulares (Fórmulas → Auditoría)
2. **Gráficos no actualizan:** Verificar que el rango de datos es dinámico (usar TABLAS)
3. **Modelo lento:** Reducir fórmulas volátiles (NOW(), RAND()), usar cálculo manual

**Contacto:**

- Email: [tu_email]
- Revisión semanal: Viernes 16:00h

---

**Última actualización:** 8 de octubre de 2025  
**Versión del documento:** 1.0  
**Próxima actualización:** Post-validación con primeros datos reales

---

**¡Éxito construyendo tu modelo financiero! Recuerda: un buen modelo es simple, robusto y fácil de explicar a un inversor en 5 minutos.**
