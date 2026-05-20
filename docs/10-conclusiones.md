# 10 - Conclusiones

---

## 1. Evaluación crítica respecto a los objetivos iniciales

El proyecto se planteó con siete objetivos obligatorios y dos opcionales. A continuación se evalúa honestamente el grado de cumplimiento de cada uno de ellos.

### Objetivo 1 — Registro estructurado del ciclo de vida del contenedor

**Cumplido.** Cada transición de estado del contenedor (INACTIVO → PUERTO → CLIENTE) queda registrada, timestamp automático del servidor y código BIC del contenedor. El modelo de `Evento` y el modelo de `Ciclo` permiten reconstruir el histórico completo de cualquier contenedor en cualquier momento. La dependencia de canales informales (WhatsApp, correo, hojas de cálculo) queda eliminada para las organizaciones que adopten Fluster.

**Matiz:** la extracción automática del código BIC mediante OCR funciona correctamente en condiciones de campo favorables, pero la precisión varía con la calidad de la imagen. El fallback manual garantiza que esto nunca bloquea el flujo de trabajo, pero la robustez del OCR podría mejorarse con preprocesado de imagen (corrección de perspectiva, aumento de contraste) antes de enviarlo a Tesseract.

### Objetivo 2 — Cálculo automático de costes D&D con tarifas por tramos

**Cumplido.** El motor de cálculo implementado en el backend aplica correctamente las tarifas por tramos configuradas por naviera, tanto para demurrage como para detention. Al ser un cálculo bajo demanda, el valor devuelto siempre refleja la tarifa actualmente vigente, sin riesgo de datos desactualizados en la base de datos.

**Matiz:** el sistema soporta dos tramos por modalidad, que es la estructura tarifaria habitual en el mercado. Algunas navieras con estructuras más complejas (más de dos tramos, tarifas diferenciadas por tipo de contenedor) requerirían una extensión del modelo de datos.

### Objetivo 3 — Semáforo de riesgo visual

**Cumplido.** La página `/semaforo` clasifica todos los contenedores activos en cuatro estados: `sin_costes` (verde), `primer_tramo` (amarillo), `segundo_tramo` (rojo) e `inactivo` (gris). La clasificación se calcula en tiempo real en el backend y se actualiza en cada consulta. Desde cada tarjeta del semáforo se pueden ejecutar directamente las transiciones de estado correspondientes, lo que hace de esta página el centro de operaciones diario del gestor.

### Objetivo 4 — Generación de informes PDF

**Cumplido.** Se implementaron dos variantes de informe con jsPDF y jsPDF-AutoTable: informe individual por contenedor (con todos los ciclos y sus costes desglosados) e informe general con filtros por naviera, cliente, código BIC y rango de fechas. Cada informe generado queda registrado en el sistema para auditoría. El PDF generado es compatible con cualquier visor de documentos y puede usarse directamente para contrastar facturas de navieras.

### Objetivo 5 — Control de acceso por roles

**Cumplido.** El sistema implementa tres roles diferenciados (admin, gestor, operador) con validación en dos niveles: `authMiddleware` verifica que el token JWT es válido en cada petición y `rolMiddleware` verifica que el rol del usuario incluye permisos para la ruta solicitada. El frontend complementa esto con `RutaProtegida`, que redirige al usuario si intenta acceder a una ruta para la que su rol no tiene permiso. Las respuestas 401 y 403 del backend están correctamente diferenciadas.

### Objetivo 6 — Lectura automática de códigos BIC mediante OCR

**Cumplido con matices.** Tesseract.js extrae el código BIC de las fotografías subidas por el operador. En imágenes de buena calidad (resolución suficiente, encuadre recto, iluminación correcta) el reconocimiento es preciso. En condiciones adversas el resultado puede ser incorrecto o vacío. El diseño del flujo garantiza que el OCR es siempre una asistencia, nunca un requisito: el campo es siempre editable manualmente. Esto es el enfoque correcto para un entorno de campo real donde no siempre se pueden controlar las condiciones de la fotografía.

### Objetivo 7 — SPA accesible desde cualquier dispositivo

**Cumplido.** La aplicación está desplegada en Render y accesible desde cualquier navegador moderno sin instalación. El frontend es completamente responsive con adaptaciones específicas para móvil (hasta 767 px) y tablet (hasta 1023 px). El tema claro/oscuro respeta la preferencia del sistema operativo si el usuario no ha seleccionado explícitamente ninguno.

### Objetivo 8 — Geolocalización (opcional)

**No implementado.** La geolocalización fue identificada en la propuesta como una funcionalidad opcional fuera del MVP. La prioridad se asignó a consolidar el flujo principal de registro de eventos con foto y OCR antes de añadir enriquecimiento geográfico. La integración de coordenadas GPS en los eventos es técnicamente directa (la API de Geolocation del navegador y un campo adicional en el modelo `Evento`) y está documentada como mejora futura.

### Objetivo 9 — Multitenancy (opcional)

**No implementado.** La versión actual gestiona una única organización. Cada instancia de Fluster sirve a una empresa. La transformación a una arquitectura multi-tenant requiere añadir un modelo `Organizacion`, asociar cada entidad (contenedores, navieras, clientes, usuarios) a una organización y filtrar todas las consultas por el identificador de organización extraído del JWT. Es un cambio estructural significativo que se ha documentado como la mejora futura de mayor impacto comercial.

---

## 2. Grado de cumplimiento del alcance propuesto

Todos los objetivos obligatorios se entregaron. Los dos opcionales se aplazaron deliberadamente en favor de estabilidad y calidad en el núcleo del sistema.

Además de lo propuesto inicialmente, el proyecto incorporó funcionalidades no planificadas originalmente que mejoran la calidad del producto:

- **Tema claro/oscuro** con persistencia en localStorage y detección de preferencia del sistema operativo.
- **Páginas estáticas públicas** (Footer con Aviso Legal, Política de Privacidad, Política de Cookies) que acompañan a la aplicación sin necesidad de backend.
- **Arquitectura de custom hooks** (`useContenedores`, `useHistorial`) que no estaba especificada en la propuesta pero que mejoró significativamente la organización del código del frontend.
- **Suite de tests unitarios completa** (22 archivos) que supera el nivel de pruebas descrito en la propuesta inicial.
- **Mecanismo de heartbeat** para mitigar el cold start del plan gratuito de Render, no previsto en el diseño inicial.

---

## 3. Lecciones aprendidas

### Lecciones técnicas

**1. Diseñar para el despliegue desde el sprint 1.**
Desplegar la aplicación en Render durante el primer sprint —mucho antes de que hubiera funcionalidad real— fue una de las decisiones más valiosas del proyecto. Reveló inmediatamente los problemas de configuración de variables de entorno, los ajustes de CORS necesarios para un frontend y backend en dominios distintos, y el comportamiento de cold start del plan gratuito. Si estos problemas se hubieran descubierto en el sprint 5 o 6, habrían consumido días de debugging en un momento crítico del proyecto. Desplegar pronto convierte los problemas de infraestructura en problemas tempranos y baratos de resolver.

**2. La inversión en arquitectura CSS da dividendos en cada sprint.**
Configurar ITCSS y BEM en el primer sprint requirió tiempo que no producía funcionalidad visible. Sin embargo, a partir del sprint 3, cuando el número de componentes empezó a crecer rápidamente, la ausencia de conflictos de especificidad fue notable. En proyectos sin metodología explícita de CSS, el tiempo dedicado a resolver especificidades y a buscar qué clase está sobreescribiendo qué crece exponencialmente con el tamaño del proyecto. Con ITCSS, ese tiempo fue prácticamente cero en los sprints 3 al 6. La inversión inicial en metodología es siempre rentable a partir de cierto tamaño.

**3. Los campos calculados simplifican la base de datos pero exigen atención al rendimiento.**
La decisión de calcular los costes D&D bajo demanda, en lugar de almacenarlos, mantiene el esquema de datos limpio y elimina el problema de la consistencia entre datos calculados y tarifas actualizadas. Es la decisión correcta para el volumen de datos de una PYME. Sin embargo, si el sistema escalara a miles de contenedores activos simultáneos, el coste de recalcular todos los costes en cada consulta al semáforo podría convertirse en un cuello de botella. El camino correcto en ese escenario sería introducir caché o pasar a un modelo de campos calculados con invalidación explícita cuando cambia la tarifa. El diseño actual es conscientemente simple y correcto para el alcance previsto.

**4. El OCR no es una solución, es una asistencia.**
Integrar Tesseract.js con la expectativa de que reconocería automáticamente todos los códigos BIC sin intervención humana habría sido un error. La realidad del campo —fotos tomadas desde ángulos, con luz variable, desde teléfonos de gama media— hace que ningún OCR sea fiable al 100% en estas condiciones. El aprendizaje es que las tecnologías de reconocimiento automático deben diseñarse siempre como aceleradores del trabajo humano, nunca como sustitutos. El fallback manual no es una concesión; es parte integral del diseño correcto de la funcionalidad.

**5. Las restricciones del plan gratuito son restricciones reales que hay que planificar.**
MongoDB Atlas M0 (512 MB de almacenamiento) y los cold starts de Render son limitaciones concretas que afectan a la experiencia de usuario. El heartbeat mitiga los cold starts, pero no los elimina completamente. Documentar estas limitaciones explícitamente —tanto en la documentación técnica como en el manual de usuario— es más honesto y útil que fingir que no existen. Cualquier organización que quiera usar Fluster en producción real debería considerar un plan de pago en ambas plataformas.

**6. Los custom hooks mejoran la testabilidad y la reutilización.**
Antes de extraer `useContenedores` como hook, la lógica de fetch estaba duplicada en dos páginas diferentes. Tras la extracción, el código se centralizó, se eliminó la duplicación y la lógica de carga quedó en un lugar con una única responsabilidad. Como beneficio adicional, el hook es más fácil de probar de forma aislada que la misma lógica dispersa en un componente de página. Este patrón debería aplicarse desde el principio en cualquier proyecto React que tenga más de una página que cargue los mismos datos.

### Lecciones de proceso

**1. Commit pequeño, commit descriptivo.**
Mantener la disciplina de Conventional Commits —un commit por tarea, con prefijo semántico— hizo que el historial de git fuera genuinamente útil durante el desarrollo. En más de una ocasión, `git log` o `git blame` permitió identificar exactamente en qué commit se había introducido un comportamiento incorrecto, sin necesidad de bisect manual. Un historial de commits limpio es una herramienta de debugging, no solo un registro de cambios.

**2. La documentación aplazada es documentación perdida.**
Escribir toda la documentación técnica en el sprint 6 fue significativamente más costoso que habrían sido escribirla de forma incremental a lo largo del proyecto. Las decisiones tomadas en el sprint 2 ya no estaban frescas en el sprint 6; algunas razones de diseño tuvieron que reconstruirse desde los commits y el código. La lección es escribir la justificación de cada decisión técnica en el momento en que se toma, aunque sea en forma de comentarios en el código o de notas breves en el tablero de GitHub Projects.

**3. El CI desde el primer día previene la acumulación de deuda técnica.**
Tener el workflow de CI ejecutando tests en cada push desde el sprint 1 —incluso cuando solo había un test de ejemplo— estableció desde el principio la expectativa de que el código en `main` siempre debe pasar los tests. Esto previno la tentación de fusionar código con tests en rojo "temporalmente" y acumular deuda que después es difícil de pagar.

---

## 4. Mejoras futuras propuestas

Las siguientes mejoras están ordenadas por impacto estimado en la utilidad del producto:

### 1. Multitenancy y modelo SaaS

Añadir un modelo `Organizacion` al que se asocien todos los recursos del sistema. Cada usuario pertenece a una organización; las navieras, clientes, contenedores y tarifas son privados por organización. Este cambio convertiría Fluster en una plataforma SaaS que podría servir a múltiples empresas desde una única instancia desplegada, con una pantalla de registro de organización y un modelo de suscripción opcional.

### 2. Tests de frontend y E2E

Implementar tests de componentes React con React Testing Library para las páginas y organismos críticos (semáforo, formularios de transición de estado, generación de informes). Añadir tests end-to-end con Playwright que simulen los flujos de usuario completos (ciclo de contenedor, login/logout, OCR) en un navegador real contra el entorno de staging.

### 3. Notificaciones push y alertas automáticas

Implementar un sistema de alertas proactivas que notifique al gestor cuando un contenedor se aproxima al límite de días libres o entra en un tramo de mayor coste. Las notificaciones podrían enviarse por correo electrónico (con un servicio como Resend o SendGrid) o mediante Web Push Notifications en el navegador. Esta funcionalidad transformaría el uso de Fluster de reactivo a proactivo: el gestor no necesitaría revisar el semáforo cada día; el sistema le avisaría cuando hay algo que requiere atención.

### 4. Geolocalización en eventos

Registrar las coordenadas GPS del dispositivo en cada evento de transición de estado. Esto permite documentar no solo cuándo ocurrió cada movimiento del contenedor, sino también dónde, lo que es especialmente valioso para resolver disputas con navieras sobre fechas de devolución.

### 5. Integración con APIs de navieras

Conectar con las APIs públicas de las principales navieras para importar automáticamente las fechas de llegada, los días libres asignados y las tarifas D&D vigentes. Esto eliminaría la necesidad de introducir manualmente estos datos y reduciría el margen de error humano en la configuración de tarifas.

### 6. Gestión documental por contenedor

Asociar a cada contenedor sus documentos de importación/exportación: Bill of Lading, Declaración de Aduanas (DUA), certificados de inspección. El almacenamiento de documentos en base64 o en un bucket de objetos (como Cloudflare R2 o AWS S3) permitiría tener todo el expediente del contenedor en un único lugar.

### 7. Dashboard de analítica

Añadir una sección con gráficos de tendencia de costes D&D: evolución mensual por naviera, comparativa de coste medio por cliente, ranking de contenedores con mayor coste acumulado. Esta vista transformaría Fluster de una herramienta operativa en una herramienta de gestión estratégica, permitiendo identificar patrones y negociar mejores condiciones con las navieras basándose en datos históricos.

### 8. Exportación a Excel

Complementar la generación de PDF con exportación a formato CSV o XLSX, que es el formato que los departamentos de contabilidad y finanzas utilizan para la conciliación de facturas y la integración con software de gestión empresarial.

---

## 5. Reflexión final

Fluster es el resultado concreto de aplicar en un proyecto real las tecnologías y metodologías estudiadas a lo largo del ciclo formativo. Resuelve un problema genuino: las PYME del sector logístico no tienen acceso a herramientas de control D&D accesibles y adaptadas a su escala. Las soluciones existentes en el mercado están diseñadas para grandes operadores con equipos técnicos y presupuestos de licencia que una empresa mediana no puede asumir. Fluster no pretende competir con ellas; pretende ser lo que necesitan las empresas que no pueden permitirse ninguna de ellas: algo que funcione desde el primer día, sin integraciones complejas, sin coste de licencia y sin necesidad de un departamento TI.

Lo que este proyecto ha enseñado sobre el desarrollo de software no es principalmente técnico. La parte técnica —React, Express, MongoDB, JWT, Jest, Docker— es acumulable y transferible; se aprende leyendo documentación y escribiendo código. Lo que es más difícil de aprender sin construir algo real de principio a fin es la toma de decisiones con información incompleta: decidir qué complejidad es prematura y cuál es necesaria, cuándo invertir en arquitectura y cuándo avanzar, qué deuda técnica es aceptable y cuál se convertirá en un bloqueo. Cada una de las decisiones documentadas en este proyecto —el cálculo bajo demanda, el JWT en localStorage, ITCSS desde el sprint 1, el heartbeat para los cold starts— fue una respuesta a una restricción real en un momento concreto, no una elección abstracta en un entorno ideal.

La inversión en metodología de estilos (ITCSS y BEM) merece una mención especial por su impacto práctico. Es fácil encontrar argumentos para posponerla ("ya refactorizaré los estilos cuando tenga más código") y difícil cuantificar su valor hasta que el proyecto tiene suficiente tamaño. En Fluster, esa inversión en el sprint 1 permitió añadir componentes en los sprints 4 y 5 sin ningún conflicto de especificidad, lo que habría sido impensable con un enfoque de estilos ad hoc. La misma lógica aplica al CI desde el primer commit: la disciplina de mantener el código que llega a `main` siempre verde no tiene coste visible cuando el proyecto es pequeño, pero es lo que hace posible trabajar con confianza cuando el proyecto ha crecido. Ambas son prácticas de ingeniería que este proyecto ha convencido de adoptar sistemáticamente en cualquier trabajo futuro.