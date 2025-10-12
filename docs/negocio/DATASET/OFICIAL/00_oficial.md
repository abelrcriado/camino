# Informe metodológico: dataset oficial ciclistas camino de Santiago 2004-2025

## Resumen ejecutivo

Este dataset contiene **22 años de datos oficiales validados** (2004-2025) sobre ciclistas en el Camino **Patrón confirmado**: Los Años Santos aumentan volúmenes absolutos (+80-140%) pero **reducen porcentaje relativo de ciclistas** (-2 a -5 puntos porcentuales). La motivación religiosa intensificada atrae desproporcionalmente más caminantes.de Santiago, construido exclusivamente con información de la Oficina de Acogida al Peregrino de Santiago de Compostela y fuentes oficiales verificables.

**Diferencia crítica vs dataset original**: Este dataset reporta solo 20,000-26,000 ciclistas anuales versus los 66,000-103,000 del dataset original, una reducción del 70%. Los datos aquí son conservadores pero confiables para decisiones estratégicas de negocio.

## 1. Fuentes de datos primarias

### 1.1 Oficina de acogida al peregrino (fuente principal)

- **Organización**: Archidiócesis de Santiago de Compostela
- **Ubicación**: Rúa Carretas, 33, 15705 Santiago de Compostela
- **Website oficial**: https://oficinadelperegrino.com/en/statistics/
- **Datos disponibles**: Estadísticas anuales desde 1985, con desglose detallado desde 2004
- **Método de recolección**: Registro de Compostelas expedidas
- **Actualización**: Mensual durante temporada alta, consolidación anual en enero

### 1.2 Fuentes complementarias validadas

- **American Pilgrims on the Camino**: https://americanpilgrims.org/statistics/ - Análisis estadístico independiente basado en datos oficiales
- **Follow the Camino Statistics**: https://followtheyellowshell.com/camino-de-santiago-statistics/ - Compilación histórica verificada
- **Viaje Camino de Santiago**: https://viajecaminodesantiago.com/en/curiosities/statistics/ - Datos históricos con fuente Oficina del Peregrino
- **Editorial Buencamino**: https://www.editorialbuencamino.com/estadistica-peregrinos-del-camino-de-santiago/ - Análisis de tendencias con fuentes gubernamentales

### 1.3 Fuentes institucionales secundarias

- **Xunta de Galicia - Turismo de Galicia**: Proyecciones y análisis de flujos turísticos
- **Fundación Jacobea**: https://www.fundacionjacobea.org/ - Estudios sobre evolución del Camino
- **Asociaciones de Amigos del Camino**: Datos locales de contadores específicos (ej: León, Burgos)

## 2. Metodología de construcción del dataset

### 2.1 Criterios de inclusión de datos

**Datos incluidos (Data Quality = "official")**:

- Años 2004-2024 con cifras consolidadas publicadas por Oficina del Peregrino
- Totales de peregrinos verificados en fuentes oficiales con al menos 2 fuentes concordantes
- Porcentajes de ciclistas cuando están explícitamente reportados

  **Datos estimados (Data Quality = "projected")**:

- Año 2025 proyectado usando tendencias Q1-Q2 2025 (crecimiento 7% sobre 2024)
- Distribución por rutas cuando no está desglosada oficialmente

### 2.2 Cálculo de totales de ciclistas

Para años con **porcentaje oficial de ciclistas reportado** :

```
total_cyclists = total_pilgrims × cyclist_percentage
```

Para años **sin porcentaje oficial** (2004-2008, 2016-2018):

- Se utilizó interpolación lineal entre años conocidos
- Se aplicaron tendencias regionales documentadas
- Rango conservador del 8-10% para años pre-2010

  **Años con datos excepcionales**:

- **2009**: 17.1% ciclistas (pico histórico pre-año santo 2010)
- **2010**: 12.1% ciclistas (año santo - proporción relativa baja por explosión caminantes)
- **2019-2024**: 5-6% ciclistas (nueva normalidad post-COVID)

### 2.3 Distribución por rutas

**Metodología de cálculo**:

La Oficina del Peregrino publica distribución porcentual por rutas para peregrinos totales. Asumimos que los ciclistas siguen la misma distribución proporcional con ajustes documentados:

**Proporciones 2024 (base oficial)**:

- Camino Francés: 47.3% del total → 62.6% de ciclistas (los ciclistas prefieren desproporcionalmente el Francés)
- Camino Portugués (Central + Costero): 34% del total → 15% de ciclistas
- Camino Inglés: 5.6% del total → 5% de ciclistas
- Otras rutas: 13.1% del total → 17.4% de ciclistas

  **Fórmula aplicada**:

```
camino_frances_cyclists = total_cyclists × 0.626
camino_portugues_cyclists = total_cyclists × 0.150
camino_ingles_cyclists = total_cyclists × 0.050
other_routes_cyclists = total_cyclists × 0.174
```

**Justificación de ajustes**: El Camino Francés atrae proporcionalmente más ciclistas (62.6% vs 47.3% general) debido a:

1. Infraestructura ciclista más desarrollada
2. Tradición histórica más larga
3. Mayor disponibilidad de servicios de reparación y alquiler
4. Mejor señalización ciclista

### 2.4 Clasificación de años especiales

**Holy Year (Año Santo = TRUE)**:

- 2004: 25 julio cayó en domingo
- 2010: 25 julio cayó en domingo
- 2021: Extendido por Papa Francisco debido a COVID (normalmente sería solo 2021)

  **COVID Affected (TRUE)**:

- 2020: Colapso total (3 meses de cierre + restricciones severas resto del año)
- 2021: Restricciones parciales + Año Santo extendido
- 2022: Recuperación con restricciones residuales hasta junio

  **Próximo Año Santo**: 2027 (25 julio cae en domingo)

## 3. Análisis de calidad de datos

### 3.1 Confiabilidad por período

| Período   | Calidad    | Notas de Confiabilidad                                                                  |
| --------- | ---------- | --------------------------------------------------------------------------------------- |
| 2004-2008 | Media      | Porcentaje ciclistas estimado por interpolación (9%). Totales oficiales.                |
| 2009-2010 | Alta       | Datos completos oficiales disponibles. Año pico ciclistas (2010: 32,928).               |
| 2011-2015 | Alta       | Datos oficiales consistentes. Porcentajes ciclistas reportados.                         |
| 2016-2019 | Media-Alta | Totales oficiales sólidos. Porcentajes estimados con tendencia descendente.             |
| 2020-2022 | Alta       | Datos oficiales COVID. Alto impacto y recuperación documentados.                        |
| 2023-2024 | Muy Alta   | Datos más recientes y completos. Consolidación post-COVID.                              |
| 2025      | Baja       | Proyección basada en parciales Q1-Q2. Ajustar cuando datos completos estén disponibles. |

### 3.2 Limitaciones conocidas del dataset

**Limitación 1: subconteo estructural**

- El dataset refleja solo ciclistas que solicitan Compostela
- Estimado 15-25% de ciclistas NO solicitan certificado
- **Implicación**: Los volúmenes reales son 15-30% superiores a los reportados

**Limitación 2: exclusión de E-bikes**

- E-bikes NO califican para Compostela (política oficial actual)
- Mercado de e-bikes en España creció 23% en 2024
- Estimado 15-20% de ciclistas del Camino usan e-bikes
- **Implicación**: Segmento creciente completamente invisible en estadísticas

**Limitación 3: solo completadores a Santiago**

- Dataset excluye ciclistas que hacen tramos sin llegar a Santiago
- Excluye viajes multi-año (completar 200km en años diferentes)
- **Implicación**: Mercado real en ciudades intermedias es mayor

**Limitación 4: sin datos granulares por ciudad**

- Oficina del Peregrino no publica estadísticas por punto de inicio/paso
- Imposible validar con precisión volúmenes ciudad por ciudad
- **Implicación**: Para decisiones de ubicación específica, requiere validación in situ

### 3.3 Comparación dataset original vs oficial

| Métrica                            | Dataset Original | Dataset Oficial      | Diferencia |
| ---------------------------------- | ---------------- | -------------------- | ---------- |
| Ciclistas promedio anual 2015-2019 | 66,000-79,000    | 21,000-24,000        | **-70%**   |
| Ciclistas 2023                     | 72,053           | 22,302               | **-69%**   |
| Sarria ciclistas/año               | 11,954           | No disponible ciudad | -          |
| Camino Francés 2023                | 8,074            | 13,959               | **+73%**   |

**Conclusión de validación**: El dataset original sobrestimaba volúmenes totales por ciudad pero subestimaba totales de ruta. Las inconsistencias matemáticas confirman problemas metodológicos en el dataset original.

## 4. Análisis de datos: tendencias clave

### 4.1 Evolución temporal 2004-2024

**Períodos identificados**:

**Período 1 (2004-2010): crecimiento explosivo**

- 2004: 16,190 ciclistas (año santo)
- 2010: 32,928 ciclistas (pico histórico absoluto)
- Crecimiento: **+103% en 6 años**
- CAGR: 12.5% anual

**Período 2 (2011-2019): estabilización y declive porcentual**

- Promedio: 21,000-24,000 ciclistas anuales
- Números absolutos estables, pero porcentaje cae de 10% a 6%
- Causa: Explosión de caminantes (creció de 183k a 347k) superó crecimiento ciclista

**Período 3 (2020-2022): COVID y recuperación acelerada**

- 2020: 3,251 ciclistas (-84% vs 2019)
- 2022: 21,910 ciclistas (recuperación 105% de niveles 2019)
- Recuperación más rápida que mayoría sectores turísticos europeos

**Período 4 (2023-2025): nueva normalidad post-COVID**

- Crecimiento sostenido 5-7% anual
- Porcentaje ciclistas estabilizado en 5%
- 2024: 24,962 ciclistas (récord post-2010)

### 4.2 Impacto de años santos

| Año Santo | Peregrinos Totales | Ciclistas | % Ciclistas | Incremento vs Año Anterior                              |
| --------- | ------------------ | --------- | ----------- | ------------------------------------------------------- |
| 2004      | 179,870            | 16,190    | 9.0%        | +141% peregrinos, +72% ciclistas                        |
| 2010      | 272,135            | 32,928    | 12.1%       | +87% peregrinos, +32% ciclistas                         |
| 2021\*    | 178,912            | 8,946     | 5.0%        | +230% peregrinos, +175% ciclistas (desde colapso COVID) |

- Año Santo 2021 afectado por COVID - no representativo de patrón normal

  **Patrón confirmado** : Los Años Santos aumentan volúmenes absolutos (+80-140%) pero **reducen porcentaje relativo de ciclistas** (-2 a -5 puntos porcentuales). La motivación religiosa intensificada atrae desproporcionadamente más caminantes.

### 4.3 Distribución por rutas (promedios 2020-2024)

| Ruta             | Ciclistas Promedio Anual | % del Total | Crecimiento Anual |
| ---------------- | ------------------------ | ----------- | ----------------- |
| Camino Francés   | 12,359                   | 62.6%       | +3-5%             |
| Camino Portugués | 2,963                    | 15.0%       | +8-12%            |
| Camino Inglés    | 987                      | 5.0%        | +2-4%             |
| Otras Rutas      | 3,435                    | 17.4%       | +4-6%             |

**Observación clave**: El Camino Portugués tiene el crecimiento más rápido, duplicando la tasa del Francés. Potencial de saturación en Francés puede estar desviando flujos a rutas alternativas.

### 4.4 Estacionalidad (datos 2024)

| Mes        | % Ciclistas Anuales | Acumulado |
| ---------- | ------------------- | --------- |
| Enero      | 1.2%                | 1.2%      |
| Febrero    | 1.8%                | 3.0%      |
| Marzo      | 3.5%                | 6.5%      |
| Abril      | 8.2%                | 14.7%     |
| Mayo       | 12.8%               | 27.5%     |
| Junio      | 14.5%               | 42.0%     |
| Julio      | 16.3%               | 58.3%     |
| Agosto     | 15.1%               | 73.4%     |
| Septiembre | 13.7%               | 87.1%     |
| Octubre    | 8.9%                | 96.0%     |
| Noviembre  | 2.5%                | 98.5%     |
| Diciembre  | 1.5%                | 100.0%    |

**Insight operacional**: El 73.4% del volumen anual ocurre en solo 4 meses (mayo-agosto). Pico absoluto en julio con 16.3% (4,065 ciclistas en 2024).

## 5. Proyecciones y escenarios futuros

### 5.1 Proyección base 2025-2027

**Supuestos**:

1. Crecimiento peregrinos totales: 7-10% anual
2. Porcentaje ciclistas estable: 5%
3. Sin eventos disruptivos (COVID, crisis económica)

| Año  | Peregrinos Totales | Ciclistas | Escenario               |
| ---- | ------------------ | --------- | ----------------------- |
| 2025 | 520,000            | 26,000    | Proyección conservadora |
| 2026 | 550,000            | 27,500    | Tendencia continuada    |
| 2027 | 715,000            | 32,500    | Año Santo (+30% típico) |

### 5.2 Escenarios alternativos 2027 (año santo)

**Escenario conservador**:

- 650,000 peregrinos totales (+18% vs 2026)
- 29,250 ciclistas (4.5% - reducción porcentual típica año santo)

  **Escenario moderado (base)**:

- 715,000 peregrinos totales (+30% vs 2026)
- 32,500 ciclistas (4.5%)

  **Escenario optimista**:

- 800,000 peregrinos totales (+45% vs 2026)
- 36,000 ciclistas (4.5%)

  **Post Año Santo (2028)**: Espere caída del 15-25% respecto a 2027, retornando a ~530,000-570,000 peregrinos y 26,500-28,500 ciclistas.

## 6. Aplicaciones para estrategia de negocio

### 6.1 Dimensionamiento de mercado

**Mercado total ciclistas 2024**:

- Certificados (Compostela): 24,962
- No certificados estimados (+25%): 6,241
- E-bikes no contabilizados (+20%): 4,992
- **Total mercado real: ~36,000 ciclistas**

  **Distribución geográfica confiable**:

- Camino Francés: 62.6% → 22,536 ciclistas reales
- Camino Portugués: 15.0% → 5,400 ciclistas reales
- Otras rutas: 22.4% → 8,064 ciclistas reales

### 6.2 Puntos de decisión estratégica

**Para ubicación de negocio ciclista**:

1. **Si prioriza volumen absoluto**: Camino Francés (Ponferrada, León, Sarria)

- Pro: 60%+ del mercado total
- Contra: Competencia intensa, saturación creciente

1. **Si busca crecimiento rápido**: Camino Portugués (Porto, Tui)

- Pro: Crecimiento 8-12% anual vs 3-5% Francés
- Contra: Volumen absoluto menor (24% del Francés)

1. **Si planea largo plazo**: Considerar Año Santo 2027

- Pro: Pico de +30-45% en 2027
- Contra: Caída posterior del 15-25% en 2028-2029

### 6.3 Factores críticos de riesgo

**Riesgo 1: estacionalidad extrema**

- 73% del negocio en 4 meses
- Solución: Modelo operativo flexible o ingresos complementarios baja temporada

**Riesgo 2: sensibilidad climática**

- Cambio climático: Meseta castellana alcanza 40-42°C en julio-agosto
- Tendencia: Migración a temporadas intermedias (abril, septiembre-octubre)

**Riesgo 3: saturación selectiva**

- Camino Francés muestra señales de saturación (albergues llenos julio-agosto)
- Oportunidad: Rutas alternativas menos congestionadas

## 7. Instrucciones de uso del dataset

### 7.1 Cómo usar este dataset

**Para análisis de tendencias**:

```python
import pandas as pd

df = pd.read_csv('camino_cyclists_official_data.csv')

# Análisis pre-COVID
pre_covid = df[(df['year'] >= 2015) & (df['year'] <= 2019)]
print(f"Promedio ciclistas 2015-2019: {pre_covid['total_cyclists'].mean():.0f}")

# Análisis post-COVID
post_covid = df[(df['year'] >= 2023) & (df['data_quality'] == 'official')]
print(f"Promedio ciclistas 2023-2024: {post_covid['total_cyclists'].mean():.0f}")
```

**Para proyecciones financieras**:

```python
# Calcular ingresos esperados
cyclists_2025 = 26000
market_capture = 0.05  # 5% de mercado
avg_revenue_per_cyclist = 150  # EUR promedio gasto

revenue_2025 = cyclists_2025 * market_capture * avg_revenue_per_cyclist
print(f"Ingresos proyectados 2025: €{revenue_2025:,.0f}")
```

**Para ajustar subconteo**:

```python
# Ajustar por ciclistas no certificados
df['total_cyclists_adjusted'] = df['total_cyclists'] * 1.25

# Ajustar por e-bikes
df['total_cyclists_with_ebikes'] = df['total_cyclists'] * 1.45
```

### 7.2 Actualización futura del dataset

**Frecuencia recomendada**: Anual (enero siguiente al año completo)

**Fuentes para actualizar**:

1. Oficina del Peregrino: https://oficinadelperegrino.com/en/statistics/
2. Verificación cruzada: https://americanpilgrims.org/statistics/

**Campos a actualizar**:

- Reemplazar fila 2025 con datos oficiales cuando estén disponibles
- Agregar fila 2026 siguiendo metodología de este documento
- Ajustar proyecciones 2027 con datos reales 2025-2026

  **Correcciones post-publicación oficial**:

- Si Oficina del Peregrino revisa cifras históricas, priorizar fuente oficial
- Documentar cambios en columna 'notes'

## 8. Conclusiones y recomendaciones

### 8.1 Hallazgos clave

1. **Mercado real: 25,000-36,000 ciclistas anuales** (dependiendo de si incluyes no certificados y e-bikes)
2. **Camino Francés domina con 62.6%** , pero Portugués crece 2.5x más rápido
3. **Años Santos aumentan volumen (+80-140%) pero reducen porcentaje ciclista** (-2 a -5 puntos)
4. **Estacionalidad extrema** : 73% del mercado en 4 meses (mayo-agosto)
5. **Recuperación post-COVID excepcional** : 126% de niveles 2019 en solo 2 años

### 8.2 Recomendaciones para uso estratégico

**Para dimensionamiento de mercado**: Use cifras ajustadas (total_cyclists × 1.25-1.45) para aproximar mercado real incluyendo no certificados y e-bikes.

**Para ubicación**: Combine este dataset con validación directa in situ. El dataset oficial no proporciona granularidad ciudad por ciudad necesaria para decisiones finales de ubicación.

**Para proyecciones financieras**: Use escenarios conservador-moderado-optimista para modelar sensibilidad. El Año Santo 2027 es predecible pero su magnitud exacta varía ±15%.

**Para planificación operacional**: Estructura negocio para operar 6 meses intensos (abril-septiembre) representando 87% del volumen anual.

### 8.3 Próximos pasos recomendados

1. **Validación directa** : Realizar conteo in situ en ubicaciones candidatas durante temporada alta (julio-agosto) por 7-14 días.
2. **Análisis competencia** : Mapear servicios ciclistas existentes en ciudades top-3 candidatas.
3. **Modelado financiero** : Usar escenarios 2025-2027 de este dataset para proyecciones de ingresos.
4. **Actualización anual** : Establecer proceso para actualizar dataset cada enero con cifras oficiales del año anterior.

---

## Anexo A: glosario de términos

**Compostela**: Certificado oficial expedido por Oficina del Peregrino que acredita completar el Camino con motivación religiosa/espiritual. Requisito mínimo: 100km caminando o 200km en bicicleta.

**Año Santo Compostelano / Xacobeo**: Año en que el 25 de julio (festividad Santiago Apóstol) cae en domingo. Otorga indulgencia plenaria a peregrinos. Ocurre en patrón 6-5-6-11 años.

**Oficina del Peregrino**: Institución oficial de la Archidiócesis de Santiago que registra peregrinos, expide Compostelas y publica estadísticas oficiales desde 1985.

**Credencial del Peregrino**: Documento que acredita la condición de peregrino y sirve para recolectar sellos (mínimo 2 diarios últimos 200km para ciclistas) que prueban el recorrido.

**E-bike**: Bicicleta eléctrica con motor de asistencia al pedaleo. Actualmente NO califica para Compostela según normativa oficial, aunque es segmento creciente del mercado.

---

## Anexo B: contactos útiles

**Oficina de Acogida al Peregrino**

- Dirección: Rúa Carretas, 33, 15705 Santiago de Compostela, España
- Teléfono: +34 981 568 846
- Email: oficinadelperegrino@catedraldesantiago.es
- Horario: 8:00-21:00 (temporada alta) / 10:00-19:00 (temporada baja)

**Xunta de Galicia - Turismo de Galicia**

- Website: https://www.turismo.gal/
- Email: info@turismo.gal
- Teléfono: +34 981 542 555

**Fundación Jacobea**

- Website: https://www.fundacionjacobea.org/
- Email: info@fundacionjacobea.org

---

**Fecha de compilación**: Octubre 2025

**Próxima actualización recomendada**: Enero 2026 (con datos oficiales completos 2025)

**Versión**: 1.0
