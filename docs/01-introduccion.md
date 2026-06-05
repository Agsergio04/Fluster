# 01. Introducción

## 1. Origen de la idea y motivación

Las pequeñas y medianas empresas del sector logístico —importadores, transitarios y transportistas— operan a diario con contenedores marítimos cuya gestión depende, en la mayoría de los casos, de hojas de cálculo, correos electrónicos y fotos enviadas por WhatsApp. Este modelo de trabajo disperso genera una problemática concreta y costosa: la pérdida de control sobre los plazos acordados con las navieras.

Cuando un contenedor supera los **días libres** pactados —el periodo en el que no se aplica ningún coste adicional— comienzan a acumularse dos tipos de penalizaciones:

- **Demurrage**: coste por cada día que el contenedor permanece en el puerto sin ser retirado.
- **Detention**: coste por cada día que el contenedor está fuera del puerto (en instalaciones del cliente o del transportista) sin ser devuelto a la naviera.

Estos costes pueden ascender fácilmente a cientos de euros por contenedor y por día. Sin un sistema de seguimiento centralizado, las empresas suelen detectar el problema cuando ya reciben la factura de la naviera, sin posibilidad de actuar a tiempo ni de verificar si los importes son correctos.

La información necesaria para controlar estos plazos está habitualmente repartida entre múltiples canales: confirmaciones de llegada por correo, avisos de descarga por teléfono, fotos del contenedor por mensajería instantánea y fechas estimadas anotadas en hojas de cálculo. No existe ningún punto único de control, ni alertas automáticas, ni cálculo proactivo de costes acumulados.

Las soluciones existentes en el mercado —como **Cargoo**, **CocoonDEM**, **Decklar** o **Windward**— están orientadas a grandes operadores logísticos con infraestructura IT propia, procesos de integración complejos (EDI, API de navieras) y presupuestos elevados. Ninguna de ellas está diseñada para ser adoptada por una PYME sin departamento técnico, sin presupuesto para licencias enterprise y sin tiempo para integraciones prolongadas.

**Fluster** nace para cubrir ese hueco: una herramienta sencilla, accesible desde el navegador, que centraliza el ciclo de vida de los contenedores, calcula automáticamente los costes D&D y avisa con antelación suficiente para poder actuar.

---

## 2. Objetivos del proyecto

El proyecto persigue los siguientes objetivos específicos:

1. **Registro estructurado del ciclo de vida del contenedor** — Permitir registrar cada evento relevante (llegada al puerto, entrega al cliente, devolución) con foto adjunta, timestamp automático y código BIC del contenedor, eliminando la dependencia de canales informales.

2. **Cálculo automático de costes D&D** — Implementar un motor de cálculo que, a partir de tablas de tarifas por tramos configurables por naviera y de los días libres asignados a cada contenedor, calcule en tiempo real el coste acumulado de demurrage y detention.

3. **Semáforo de riesgo visual** — Ofrecer una vista de semáforo (verde / naranja / rojo) que refleje el nivel de riesgo de cada contenedor en función de los días libres restantes, permitiendo una gestión proactiva sin necesidad de revisar cada expediente individualmente.

4. **Generación de informes PDF** — Proporcionar la capacidad de exportar un resumen de costes por contenedor en formato PDF, de manera que el gestor pueda contrastar los importes calculados por Fluster con las facturas emitidas por la naviera.

5. **Control de acceso por roles** — Implementar un sistema de autenticación y autorización con tres roles diferenciados (admin, gestor y operador), de forma que cada perfil acceda únicamente a las funciones que le corresponden.

6. **Lectura automática de códigos BIC mediante OCR** — Integrar reconocimiento óptico de caracteres (Tesseract.js) para extraer y validar el código BIC del contenedor directamente desde la foto adjunta, reduciendo errores de transcripción manual.

7. **Despliegue como SPA + API REST accesible desde cualquier dispositivo** — Publicar la aplicación como una Single Page Application con backend REST, accesible desde cualquier navegador o dispositivo móvil sin necesidad de instalación.

---

## 3. Análisis comparativo de aplicaciones similares

Antes de definir el alcance de Fluster se realizó un análisis de las principales herramientas disponibles en el mercado para la gestión de costes D&D:

| Aplicación | Enfoque | Precio estimado | Integración requerida | Apto para PYME |
|------------|---------|-----------------|----------------------|----------------|
| **Fluster** | PYME logística, control D&D básico | Código abierto (gratuito) | Solo navegador | Sí |
| **Cargoo** | Transitarios y grandes cargadores | Licencia enterprise (precio a consulta) | Integración con TMS/ERP | No |
| **CocoonDEM** | Operadores portuarios y navieras | Suscripción enterprise | API naviera + EDI | No |
| **Decklar** | Grandes importadores/exportadores | Precio a consulta | Conectores propietarios | No |
| **Windward** | Inteligencia marítima y visibilidad de flota | Licencia enterprise | AIS + integración de datos | No |

Las soluciones analizadas comparten un patrón común: están diseñadas para organizaciones con equipos técnicos dedicados, procesos de integración de semanas o meses, y presupuestos que no son asumibles para una PYME. Ninguna ofrece una versión accesible, autónoma y operativa desde el primer día sin configuración adicional.

---

## 4. Alcance del MVP

El MVP (Producto Mínimo Viable) de Fluster cubre el conjunto de funcionalidades necesarias para que una empresa PYME pueda controlar sus costes D&D de principio a fin, sin depender de herramientas externas.

### Incluido en el MVP

- Autenticación con JWT y gestión de tres roles: admin, gestor y operador.
- CRUD completo de navieras, clientes y tarifas D&D (con tramos de precio configurables).
- Registro del ciclo de vida del contenedor con sus tres estados: INACTIVO, PUERTO y CLIENTE.
- Subida de foto en cada transición de estado con extracción OCR del código BIC.
- Cálculo automático de costes D&D en tiempo real en el backend.
- Vista de semáforo de riesgo con filtros por estado y naviera.
- Exportación de informe de costes en PDF.
- Interfaz responsive con tema claro y oscuro.
- API REST documentada con Swagger UI.
- Suite de tests unitarios en el backend (Jest).
- Despliegue continuo con GitHub Actions y publicación en Render.

### No incluido en el MVP

- **Geolocalización** — No se registra la posición GPS del contenedor ni del camión.
- **Multitenancy** — La aplicación gestiona una única empresa; no hay aislamiento de datos entre distintos clientes.
- **Aplicación móvil nativa** — La interfaz es responsive pero no existe una app para iOS o Android.
- **Integración con ERP o TMS** — No hay conectores con sistemas de gestión empresarial externos.
- **Conexión directa con navieras** — Las tarifas y los eventos se introducen manualmente; no hay sincronización automática con los sistemas de las navieras.
- **Notificaciones push o por correo electrónico** — Las alertas de riesgo se visualizan en la aplicación pero no se envían notificaciones externas.

---

## 5. Usuarios objetivo

Fluster está diseñado para dos perfiles de usuario dentro de una empresa PYME de logística:

### Gestor de Operaciones

Responsable de la configuración del sistema y del seguimiento económico de los contenedores. Sus tareas principales en Fluster son:

- Configurar navieras, clientes y tablas de tarifas D&D.
- Supervisar el estado de todos los contenedores activos mediante la vista de semáforo.
- Revisar los costes acumulados y generar informes PDF para contrastar facturas.
- Gestionar los usuarios de la plataforma (junto con el admin).

Este perfil accede habitualmente desde un ordenador de escritorio o portátil, en horario de oficina. Necesita una visión global rápida y la posibilidad de profundizar en el detalle de cualquier expediente.

### Operador / Personal de campo

Responsable del registro de los eventos físicos del contenedor. Sus tareas principales en Fluster son:

- Dar de alta nuevos contenedores en el sistema.
- Registrar las transiciones de estado (llegada al puerto, entrega al cliente, devolución) subiendo la foto correspondiente.
- Verificar que el código BIC leído por OCR es correcto antes de confirmar el evento.

Este perfil trabaja frecuentemente desde un teléfono móvil o una tablet en el almacén o en el muelle. Necesita una interfaz ágil, con el mínimo de pasos posible para registrar un evento y continuar con su trabajo.
