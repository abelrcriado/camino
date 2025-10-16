**Propuesta de Nueva Estructura para la Sección 4.3**

###  4.3. Estructura de costes

Nuestra filosofía financiera se basa en la eficiencia de capital y un diseño operativo _lean_. Para lograr una estructura de costes transparente y controlada, hemos desglosado cada componente de gasto del proyecto. A continuación, se detallan todos los costes previstos, que posteriormente se agruparán en las categorías contables de CAPEX (Gasto de Capital) y OPEX (Gasto Operativo).

**A. Desglose de costes por área funcional**

**1. Costes asociados a la infraestructura física (los "Service Points")**

- **1.1. Módulos de servicio principales:**
  - **Módulo de taller Pay-Per-Use:** coste de adquisición del soporte de reparación, juego completo de herramientas profesionales, sistema de iluminación LED.
  - **Módulo de Vending:** coste de adquisición de la máquina expendedora inteligente (incluyendo hardware de telemetría y sistema de pago _contactless_).
  - **Sistema de acceso y seguridad:** coste del hardware para el control de acceso (cerradura electromagnética, lector QR/NFC) y posibles cámaras de seguridad.
- **1.2. Módulos de servicio opcionales:**
  - **Estación de lavado:** coste del equipo de lavado a presión de bajo consumo.
  - **Punto de carga para e-bikes:** coste del módulo de taquillas metálicas seguras y el panel de pago centralizado.
- **1.3. Estructura física (solo para modelo CSS - Propio):**
  - **Diseño y licencias:** costes de arquitectura para el diseño del "Service Box" y posibles licencias de obra menores.
  - **Construcción y materiales:** coste de la estructura (ej. madera contralaminada, paneles), aislamiento, cristalera.
  - **Cimentación y acometidas:** costes para la preparación del terreno, conexión a la red eléctrica y, si aplica, a la red de agua y desagüe.
- **1.4. Branding y señalética:**
  - Coste de producción de la placa exterior de marca, vinilos interiores y cualquier otro elemento de branding físico en cada nodo.

**2. Costes asociados a la plataforma tecnológica**

- **2.1. Desarrollo inicial (MVP - Producto Mínimo Viable):**
  - **Desarrollo de software:** coste de las horas de desarrollo (interno o externo) para la creación de la PWA del cliente, los dashboards para socios y el backend central.
- **2.2. Infraestructura tecnológica (costes recurrentes):**
  - **Hosting y servicios en la nube:** coste mensual de proveedores como AWS, Google Cloud o Azure (servidores, bases de datos, etc.).
  - **Dominios y certificados SSL:** coste anual del registro de dominios web y los certificados de seguridad.
  - **Servicios de comunicación:** coste de APIs para el envío de emails transaccionales (ej. SendGrid) o notificaciones push.
- **2.3. Licencias y APIs de terceros (costes recurrentes):**
  - **Pasarelas de pago:** coste por transacción de servicios como Stripe o PayPal (generalmente un fijo + un porcentaje sobre la venta).
  - **Servicios de mapas:** coste de las APIs de geolocalización y mapas (ej. Google Maps API, Mapbox), que suele tener un nivel gratuito y luego un coste por uso.
  - **Software de gestión interna:** licencias para herramientas de productividad, gestión de proyectos o CRM (ej. Slack, Jira, HubSpot).

**3. Costes asociados a las operaciones y logística**

- **3.1. Adquisición de inventario inicial:**
  - **Stock de consumibles:** coste de la primera compra de inventario (cámaras de aire, geles, herramientas, etc.) para llenar las máquinas de vending de los primeros nodos.
- **3.2. Logística y reposición (costes recurrentes):**
  - **Transporte:** coste de las rutas de entrega para reponer el stock en los nodos (combustible, servicio de mensajería, etc.).
  - **Embalaje:** coste de los materiales para preparar los envíos de reposición.
- **3.3. Mantenimiento y reparaciones (costes recurrentes):**
  - Presupuesto para la reparación o sustitución de herramientas desgastadas o dañadas y para el mantenimiento preventivo de los módulos.

**4. Costes asociados al equipo y la estructura central**

- **4.1. Personal:**
  - **Salarios del equipo fundador/clave:** remuneración del personal a tiempo completo.
  - **Servicios freelance y consultoría externa:** presupuesto para contratar especialistas de forma puntual (diseñadores gráficos, asesores legales, contables, etc.).
  - **Seguridad Social y otros impuestos sobre el personal.**
- **4.2. Gastos generales y de administración (G&A):**
  - **Alquiler de oficina/espacio de trabajo central** (si aplica).
  - **Suministros:** electricidad, internet (WiFi), etc., de la oficina central.
  - **Servicios profesionales:** gestoría contable y fiscal, asesoría legal.
  - **Costes bancarios y seguros:** comisiones de mantenimiento de cuentas, seguro de responsabilidad civil.

**5. Costes asociados a marketing y ventas**

- **5.1. Creación de activos de marketing:**
  - Coste de desarrollo de la página web corporativa.
  - Coste de producción de contenido inicial (fotografía, vídeo, artículos de blog).
- **5.2. Publicidad y promoción (costes recurrentes):**
  - Presupuesto para campañas de publicidad digital (Google Ads, Social Ads).
  - Coste de material de marketing para partners (folletos, pegatinas).
- **5.3. Gastos de representación y desarrollo de negocio:**
  - Costes de desplazamiento para reuniones con potenciales socios y talleres.

---

**Siguientes pasos:**

Una vez que tengas esta estructura, el siguiente paso sería ir punto por punto y asignar una estimación de coste (o un rango de costes) a cada ítem. Cuando lo hayas hecho, podremos construir las tablas de **CAPEX** y **OPEX** de forma muy sólida, simplemente agrupando estos gastos desglosados en la categoría correcta.

Por ejemplo:

- Todos los costes del punto 1 ("Infraestructura física") y 2.1 ("Desarrollo inicial") irían principalmente a **CAPEX**.
- Todos los costes de los puntos 2.2, 2.3, 3.2, 3.3, 4 y 5.2 irían principalmente a **OPEX**.

¿Qué te parece esta estructura como punto de partida para detallar tus costes?
