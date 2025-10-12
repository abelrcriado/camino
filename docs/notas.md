
# 0. Camino

Es la **división de nivel superior** que agrupa un conjunto de **Ubicaciones** (ciudades o zonas).

Permite gestionar políticas, reporting y configuración común a varias ubicaciones.

*Campos sugeridos:* `nombre`, `código`, `zona_operativa/region`, `estado_operativo {activo, planificado, cerrado}`, `observaciones`.

---

# 1. ubicación

Contiene varios  **Service Points** .

Representa la **ciudad o zona geográfica** donde operan los puntos de servicio.

Cada **Ubicación**  **pertenece a un Camino** .

*Matices recomendados:*

* `zona_operativa` / `región` para agregación y reporting.
* `estado_operativo {activo, en_mantenimiento, cerrado_temporalmente, planificado}`.

---

# 2. service point

Tiene uno o varios  **Servicios** .

Puede estar gestionado por la **empresa** o por un  **partner** .

Puede tener uno o varios  **talleres asociados** , con **exclusividad opcional** (un taller exclusivo solo puede estar asociado a un Service Point).

*Matices recomendados:*

* **Mini-almacén local** modelado como **ubicación hija** (no solo un flag).
* `estado_operativo {activo, en_mantenimiento, cerrado_temporalmente, planificado}`.

---

# 3. servicio

Define qué tipo de servicio se ofrece (campo `tipo_servicio`).

Ejemplos de tipos:

* **VENDING**
* **ALQUILER_ESPACIO**
* **MANTENIMIENTO**

Cada servicio puede pertenecer a **uno o varios Service Points** (relación intermedia con atributos locales).

Si el servicio es de tipo  **VENDING** , puede tener **máquinas de vending** asociadas.

> **Nota:** si el servicio ofrece  **productos** , estos se gestionan exclusivamente a través de **máquinas de vending** (no hay productos fuera de este contexto).

*Matices recomendados:*

* Tabla **Servicio–ServicePoint** con atributos propios (ej.: activación local, precio local, condiciones).
* `modo_operación {manual, automatizado, vending, mixto}`.
* `estado_operativo` del servicio a nivel global y a nivel del SP (herencia con posibilidad de override local).

---

# 4. máquina de vending

Solo existe en el contexto de un  **servicio tipo VENDING** .

Tiene su propio **inventario** (productos, stock, pedidos, etc.).

Se **recarga desde almacén** mediante pedidos de material.

Cada máquina refleja el **stock real disponible** y las  **ventas pendientes de retiro** .

*Matices recomendados:*

* `estado_operativo {activa, fuera_de_servicio, en_mantenimiento}`.
* `propiedad {propia, partner, tercero}`, `fecha_instalación`, `contrato_id` (si aplica).
* `política_reserva {HARD, SOFT}` y `tiempo_expiración_reserva_min`.
* **Sincronización offline:** `estado_sync {en_sync, pendiente_sync}`.

---

# 5. producto

Se gestiona por  **categorías y subcategorías** .

Puede estar en un **almacén** o en una  **máquina de vending** .

Participa en el proceso de  **venta a través de la app** .

El **stock total del producto** se reparte entre el **almacén** y las  **máquinas** .

*Matices recomendados:*

* `unidad_medida` (u, kg, L…), `permite_lote`, `permite_serie`, `caducidad`.
* Dimensiones/capacidad para optimizar asignación a **slots** de máquina.

---

# 6. taller

Se asocia a uno o varios  **Service Points** .

Puede ser **exclusivo (1:1)** o  **compartido (N:M)** .

Los talleres exclusivos solo pueden estar vinculados a un único punto de servicio.

*Matices recomendados:*

* `tipo_servicio` del taller (mecánico, eléctrico, limpieza, instalación…), **zona de cobertura** y  **prioridad** .

---

# 7. venta (app)

Se asocia a una  **máquina de vending** , que a su vez pertenece a un  **servicio tipo VENDING** .

Controla dos tipos de stock:

* **Stock real:** el que está físicamente en la máquina.
* **Stock reservado:** el que ya fue vendido pero aún no retirado por el usuario.

La **disponibilidad real de venta** se calcula como: **Stock disponible = Stock real – Stock reservado.**

*Matices recomendados:*

* `modo_pago {tarjeta, wallet, prepago, QR, …}`, `estado_pago {pendiente, confirmado, reembolsado}`.
* **Tiempo máximo de reserva** configurable por máquina/servicio.
* **Fuente de precio** aplicada en la venta (base, override ubicación, override SP, override máquina) y  **versión de precio** .

---

# 8. precios (servicios y productos)

Un mismo **servicio** puede estar disponible en **varios Service Points** con  **precios diferentes** .

Lo mismo aplica a **productos** dispensados por máquinas de vending.

## 8.1. dónde se define el precio

**Precio base (obligatorio):**

* **Servicio:** se define a nivel de **Servicio** (válido por defecto para todos los Service Points donde esté activo).
* **Producto:** se define a nivel de **Producto** (válido por defecto para todos los Service Points/máquinas).

**Sobrescrituras (opcionales):**

* **Por ubicación (ciudad)**
* **Por Service Point**
* **(Opcional) Por máquina** — si necesitas granularidad máxima en vending.

## 8.2. prioridad de precios (resolución)

Cuando el sistema calcula el precio a mostrar o cobrar:

1. **Sobrescritura por máquina** (si existe)
2. **Sobrescritura por Service Point** (si existe)
3. **Sobrescritura por ubicación** (si existe)
4. **Precio base** (Servicio o Producto)

> Regla general: el nivel más específico  **prevalece** .

*(Opcional futuro: capa de “precio promocional” con fechas de validez y prioridad máxima).*

## 8.3. consideraciones recomendadas

* **Moneda e impuestos:** guardar moneda, impuestos incluidos/excluidos, y reglas fiscales por ubicación.
* **Vigencia y versionado:** `fecha_inicio`, `fecha_fin`, `activo`,  **versión de precio** .
* **Herencia explícita:** si no hay override en máquina → hereda de SP; si no hay en SP → hereda de ubicación; si no hay en ubicación →  **base** .
* **Fuente aplicada en venta:** registrar `fuente_precio` para auditoría.

## 8.4. ejemplos rápidos

**Servicio “ALQUILER_ESPACIO”**

* Base: **100 €**
* Ubicación Madrid: **110 €**
* SP “Atocha”: **115 €** → **precio final en Atocha = 115 €**
* SP “Chamartín” (sin override SP) → **precio final = 110 €** (override de Madrid)

**Producto “Guantes Nitrilo”**

* Base: **4,00 €**
* Sin override de ubicación
* SP “Sevilla-Centro”: **3,80 €** → **precio final en Sevilla-Centro = 3,80 €**
* SP “Sevilla-Norte” (sin override) → **precio final = 4,00 €**
* (Opcional) Máquina “SV-CTR-02”: **3,70 €** → **precio en esa máquina = 3,70 €**

---

# 9. inventario y stock

El **inventario** controla dónde está cada producto, en qué cantidad y en qué estado.

El sistema debe permitir gestionar el stock tanto en **almacenes** como en **máquinas de vending** y, si aplica, en zonas intermedias de cada  **Service Point** .

## 9.1. tipos de ubicaciones de inventario

* **Almacén central o regional:** stock general.
* **Service Point:** puede tener stock local de apoyo (mini almacén).
* **Máquina de vending:** stock destinado a la venta automática.
* **Ubicaciones lógicas internas:** subdivisiones dentro de un almacén o máquina (p. ej., “pasillo A”, “slot 3”).

> Todas las ubicaciones deben tener un identificador único y una relación jerárquica (`ubicación_padre`).
>
> Para consistencia, modela **almacén/SP/máquina** como una **misma entidad “UbicaciónInventario”** con tipo.

## 9.2. estados de stock

* **Disponible** ,  **Reservado** ,  **En tránsito** ,  **Averiado/Bloqueado** ,  **Caducado** .
* (Recomendado) **Stock teórico** vs **stock físico último conteo** para auditorías y alertas.

## 9.3. movimientos de stock

Tipos de movimiento:  **Entrada** ,  **Salida** ,  **Transferencia** ,  **Reserva/Desreserva** ,  **Ajuste** .

Cada movimiento registra: fecha/hora, producto, origen/destino (ubicaciones), cantidad, usuario/proceso, referencia externa.

## 9.4. control de inventario en máquinas

* Stock por **producto** y por **slot** (capacidad máxima, stock actual).
* Registro de  **stock total** ,  **por slot** , **reservado** e  **histórico de movimientos** .
* **Sincronización** con estado `estado_sync` para entornos offline.

## 9.5. reposición y pedidos de material

Estados:  **borrador** ,  **solicitado** ,  **en tránsito** ,  **recibido** ,  **cerrado** ,  **cancelado** .

Pasos: solicitud → preparación (salida de origen) → tránsito → recepción (entrada en destino) → cierre.

*(Añade `origen_tipo`/`destino_tipo`: {ALMACÉN, SP, MÁQUINA} y responsables de preparación/recepción.)*

## 9.6. reglas de reposición

`min`, `max`, `punto_pedido`, `lead_time`, **estrategia de picking** (FEFO/FIFO/LIFO/serie), proveedor preferente.

## 9.7. auditoría y ajustes

Conteos cíclicos por riesgo/rotación; motivos predefinidos (caducidad, rotura, error de carga, robo…).

Ajustes con responsable, fecha, motivo y evidencia.

---

# 10. integración operativa (flujos principales)

Conecta  **almacenes, Service Points, máquinas** , productos, precios y ventas, manteniendo trazabilidad.

## 10.1. flujo general (visión global)

1. Almacén central/regional → 2) distribución a SP → 3) asignación a máquina (si VENDING) → 4) venta (app) → 5) reposición → 6) ciclo continuo.

## 10.2. flujo 1: aprovisionamiento almacén → service point

Necesidad → pedido material → salida en almacén → **en tránsito** → recepción en SP → cierre.

(Considera **validación manual de recepción** y conciliación cantidades.)

## 10.3. flujo 2: distribución service point → máquina

Chequeo min/max → pedido reposición → carga física → salida en SP y entrada en máquina → inventario actualizado.

(Si viene directo de almacén, combina con 10.2.)

## 10.4. flujo 3: venta (app)

Reserva → **stock disponible** se recalcula → retiro →  **salida/consumo** .

Si expira:  **desreserva** .

Registrar  **modo/estado de pago** , **fuente/versión de precio** y  **vigencia** .

## 10.5. flujo 4: transferencia entre SP o máquinas

Generar **transferencia interna** → salida origen → **en tránsito** → entrada destino.

Permisos/validación (técnico responsable, medio de transporte).

## 10.6. flujo 5: devolución o ajuste

Devolución a almacén, ajustes por conteo, averías: movimiento con motivo y responsable.

## 10.7. flujo 6: auditoría y conciliación

Conteos físicos → comparación → ajustes (+/–) → registro y frecuencia de conteos por ubicación.

## 10.8. flujo 7: integración con precios y ventas

Identificar SP/ubicación/máquina → resolver precio con jerarquía → registrar venta (precio efectivo, fuente y versión) → actualizar inventario → reporting de márgenes.

## 10.9. flujo 8: ciclo completo de operación

Abastecimiento → venta → reposición → transferencia → auditoría → **sincronización** (batch/tiempo real) para evitar inconsistencias.
