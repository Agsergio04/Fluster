# Propuesta de Proyecto — Fluster : Control de Demurrage y Detention para Pymes Logísticas

## Indice

1. [Identificación de necesidades (Criterio 1c)](#1-identificación-de-necesidades-criterio-1c)  
2. [Oportunidades de negocio (Criterio 1d)](#2-oportunidades-de-negocio-criterio-1d)  
3. [Tipo de proyecto (Criterio 1e)](#3-tipo-de-proyecto-criterio-1e)  
4. [Características específicas (Criterio 1f)](#4-características-específicas-criterio-1f)  
5. [Obligaciones legales y prevención (Criterio 1g)](#5-obligaciones-legales-y-prevención-criterio-1g)  
6. [Ayudas y subvenciones (Criterio 1h)](#6-ayudas-y-subvenciones-criterio-1h)  
7. [Guion de trabajo (Criterio 1i)](#7-guion-de-trabajo-criterio-1i)  
8. [Conclusión](#8-conclusión)  



## 1 Identificación de necesidades (Criterio 1c)

### 1.1. Descripción del problema o necesidad

La necesidad detectada surge en pequeños y medianos importadores, transitarios y transportistas que trabajan con contenedores marítimos y no disponen de un sistema fiable para controlar los costes de demurrage y detention (D&D) asociados a cada unidad.  

En muchos casos, este control se lleva a cabo con hojas de cálculo, fotos sueltas en el móvil o procesos manuales dispersos, lo que provoca errores, falta de trazabilidad y sobrecostes diarios muy elevados por no tener visibilidad de los free days y de los eventos clave del contenedor (entrada, salida, devolución).  

Los sistemas disponibles en el mercado (plataformas de gestión completas y soluciones OCR con cámaras fijas) están orientados a grandes operadores, requieren integraciones complejas o infraestructura cara y dejan fuera a PYMEs que no pueden asumir estos costes.  

La ausencia de un control estructurado de eventos de contenedor genera una cadena de problemas:

| Categoría    | Problema |
|-------------|----------|
| **Operativa** | Sobreestancias por devoluciones tardías, falta de alertas cuando se agotan los free days, errores humanos al vincular fotos y contenedores. |
| **Información** | Dificultad para reconstruir el ciclo de vida de un contenedor, información dispersa entre Excel, correos y WhatsApp. |
| **Económica** | Sobrecostes diarios acumulados en conceptos de D&D, imposibilidad de anticipar cargos y negociarlos con la naviera. |
| **Crecimiento** | Imposibilidad de escalar el volumen de contenedores gestionados sin aumentar de forma descontrolada el riesgo de errores y costes. |

Fluster propone registrar de forma estructurada los eventos de cada contenedor (con foto, timestamp y ubicación), asociarlos a su código BIC y calcular automáticamente días y costes de D&D para cada caso.  

### 1.2. Detección de la necesidad

La necesidad se identifica a partir de la observación de cómo las PYMEs logísticas gestionan hoy los contenedores: controles manuales, uso intensivo de Excel y ausencia de alertas o cálculos automáticos de D&D.  

Además, el análisis de soluciones existentes muestra que las herramientas actuales están enfocadas a grandes operadores con volúmenes muy altos y presupuestos elevados, dejando a las PYMEs con una brecha tecnológica clara.  

Se refuerza esta necesidad revisando plataformas del sector (Cargoo, CocoonDEM, Decklar, Windward) que se centran en visibilidad de contenedores, cálculo de D&D y automatización, pero que no ofrecen una alternativa sencilla y asequible basada únicamente en un navegador o smartphone del usuario final.  

### 1.3. Usuarios y beneficiarios

El usuario objetivo es la PYME logística (importador, transitario o transportista) que maneja un número significativo de contenedores pero no dispone de un TMS/ERP avanzado ni de sistemas propios de automatización de D&D.  

Se identifican dos perfiles principales:

- **Administrador / Gestor de Operaciones**: Configura navieras, puertos, tarifas de D&D y gestiona el alta de contenedores; revisa los informes y negocia con las navieras posibles discrepancias en facturas.  
- **Operador / Personal de campo**: Registra eventos de los contenedores desde el móvil (entrada/salida de puerto, llegada a almacén, devolución) subiendo fotos y datos mínimos, sin necesidad de comprender la complejidad del cálculo de D&D.  

Ambos perfiles se benefician de un panel unificado donde se visualiza el estado de cada contenedor y un “semáforo” de riesgo que indica si se está dentro del free time, cerca de agotarlo o ya en sobrecoste.  


## 2 Oportunidades de negocio (Criterio 1d)

### 2.1. Análisis del mercado: soluciones existentes

En el mercado existen soluciones que dan visibilidad a contenedores y free days, con alertas de límites de D&D, así como software que calcula automáticamente estos costes y permite verificar facturas en tiempo real.  

Ejemplos: plataformas como Cargoo, CocoonDEM, Decklar o Windward ofrecen cálculo automático, reducción de riesgos y automatización de la gestión de D&D considerando tarifas, free days y condiciones de puerto.  

Sin embargo, estas soluciones suelen ser servicios cloud orientados a grandes operadores, con modelos comerciales y niveles de integración que no encajan con pequeños transitarios o importadores que solo requieren un control básico pero fiable usando dispositivos ya disponibles (PC o smartphone).  

### 2.2. Valor diferencial de Fluster

| Diferencial | Descripción |
|------------|-------------|
| **Enfoque PYME** | Pensado específicamente para pequeños y medianos operadores que hoy trabajan con Excel y fotos, sin necesidad de infraestructuras especiales. |
| **Baja complejidad técnica** | El usuario final solo necesita un ordenador o móvil con navegador para registrar eventos mediante fotos o entrada manual. |
| **Coste de entrada reducido** | El stack se basa en tecnologías de código abierto (React, Node.js, MongoDB Atlas en plan freemium), reduciendo costes de licencia. |
| **Registro estructurado de eventos** | Asocia fotos, timestamps, ubicación y tipo de evento al contenedor correcto, minimizando errores humanos y facilitando auditorías. |
| **Cálculo automático de D&D** | Motor de cálculo de días y costes basado en eventos y tablas de tarifas configurables por usuario, con estados visuales de riesgo. |

Fluster se posiciona como una alternativa ligera a los grandes sistemas de gestión de D&D, centrada en cubrir la “zona desatendida” del mercado formada por pequeñas empresas logísticas.  

### 2.3. Potencial y escalabilidad

A medio plazo, Fluster puede evolucionar hacia un modelo SaaS con planes por número de contenedores activos o por usuarios, manteniendo siempre un coste muy inferior a las plataformas enterprise.  

El uso de una arquitectura API REST y de MongoDB Atlas facilita el escalado horizontal, pudiendo servir a varios clientes (multi-tenant) sin rediseñar el sistema.  



## 3 Tipo de proyecto (Criterio 1e)

### 3.1. Definición del tipo de aplicación

Fluster se desarrollará como una **aplicación web de página única (SPA)** con React en el frontend y Node.js + Express en el backend, expuesto como API REST.  

Se prioriza una experiencia de panel web accesible desde cualquier navegador moderno, tanto en escritorio como en dispositivos móviles, evitando dependencias de stores y manteniendo la lógica de negocio centralizada en el servidor.  

### 3.2. Justificación de la elección

Una SPA permite ofrecer una interfaz fluida para la gestión de contenedores, eventos y reportes, con actualizaciones en tiempo real del estado y del semáforo de riesgo.  

El backend REST facilita futuras integraciones con otros sistemas logísticos o ERPs, así como la emisión de informes en otros formatos (PDF, CSV) sin modificar el cliente principal.  

### 3.3. Arquitectura propuesta

La arquitectura propuesta sigue el patrón **cliente-servidor REST**:

```text
┌──────────────────────────────┐
│        FRONTEND (SPA)        │
│ React · ITCSS · JWT Storage  │
└──────────────┬───────────────┘
               │ HTTP / REST (JSON)
               │ Authorization: Bearer <JWT>
┌──────────────▼───────────────┐
│         BACKEND (API)        │
│ Node.js · Express · Bcrypt   │
│ JWT · Cálculo Días/Costes    │
└──────────────┬───────────────┘
               │ MongoDB Atlas (Cloud)
┌──────────────▼───────────────┐
│       BASE DE DATOS          │
│  MongoDB Atlas (colecciones  │
│  usuarios, contenedores,     │
│  eventos, tarifas D&D)       │
└──────────────────────────────┘
```

El entorno de desarrollo y despliegue se orquestará con **Docker Compose**, levantando servicios de frontend, backend y base de datos de manera coordinada.  



## 4 Características específicas (Criterio 1f)

### 4.1. Funcionalidades principales (MVP)

El Producto Mínimo Viable de Fluster incluye:

#### 4.1.1. Gestión de usuarios y autenticación

- Registro y login de usuarios con contraseñas cifradas mediante **Bcrypt**.  
- Autenticación basada en **JWT** para control de sesiones y acceso a la API.  
- Roles básicos (por ejemplo, Gestor de Operaciones / Personal de campo) para diferenciar quién configura tarifas y quién solo registra eventos.  

#### 4.1.2. Gestión de contenedores

- Alta de contenedores con su código BIC, permitiendo introducción manual o reconocimiento mediante OCR.  
- Asociación de cada contenedor a naviera y puerto, con definición de fecha de inicio de free time.  
- Configuración de tarifas de D&D (demurrage y detention) personalizadas por el gestor de Operaciones.


#### 4.1.3. Gestion de eventos de los contenedores

- Subida de fotos en diferentes momentos del ciclo de vida: entrada/salida de puerto, llegada a almacén, devolución vacía (aunque el seguimiento se asignaria de manera manual).  
- Registro de timestamp y tipo de evento manual.  
- Procesamiento de la imagen en el backend usando **Tesseract OCR con Tess4J** para leer y validar el código del contenedor, vinculando la foto al contenedor correcto.  

#### 4.1.4. Motor de cálculo de días y costes

- Cálculo de días de demurrage (contenedor en terminal) y de detention (contenedor fuera de puerto) a partir de los eventos y de la fecha de free time.  
- Cálculo del coste acumulado según las tablas de tarifas configuradas.  
- Actualización automática del estado del contenedor y de un “semáforo” (verde/ámbar/rojo) según el riesgo respecto al free time disponible.  

#### 4.1.5. Panel de monitorización

- Listado de contenedores activos con indicadores de riesgo y filtros por estado, naviera o cliente.  
- Vista de detalle por contenedor con línea temporal de eventos y desglose de días y costes asociados.  

#### 4.1.6. Informes, historial y auditoría

- Generación de informes en **PDF** usando jsPDF + jsPDF-AutoTable, permitiendo exportar por rango de fechas, naviera o cliente.  
- Consulta del histórico de contenedores cerrados, sus eventos y costes finales para auditoría interna y comparación con facturas de naviera.  

### 4.2. Priorización de funcionalidades

| Prioridad | Funcionalidad | Justificación |
|----------|---------------|--------------|
| **Obligatoria** | Gestión de usuarios y autenticación JWT | Necesaria para controlar el acceso a datos sensibles y separar roles. |
| **Obligatoria** | Gestión de contenedores  | Sin contenedores, no hay unidad de control de D&D. |
| **Obligatoria** | Registro de eventos con timestamp | Es el núcleo de la trazabilidad y del cálculo posterior. |
| **Obligatoria** | Motor de cálculo de días y costes D&D | Genera el valor principal del producto: saber cuánto se está pagando o se va a pagar. |
| **Obligatoria** | Panel de monitorización y semáforo de riesgo | Permite a la empresa actuar antes de que se generen sobrecostes. |
| **Obligatoria** | Generación de informes con filtros por fechas/naviera/cliente | Imprescindible para comparar con las facturas de la naviera y justificar costes frente a terceros. |
| **Opcional** | Geolocalización de contenedores | Mejora la trazabilidad, pero la lógica base funciona sin ella. |
| **Opcional** | MCP para IAS / acceso externo | Pensado como evolución para automatizar aún más el reporting vertical. |


### 4.3. Requisitos técnicos

- **Frontend**: React SPA, estilos organizados mediante **ITCSS** para escalabilidad del CSS en el panel web.  
- **Backend**: Node.js + Express.js, API REST para autenticación, gestión de contenedores, eventos, cálculo y generación de informes.  
- **Base de datos**: MongoDB Atlas, con colecciones para usuarios, contenedores, eventos (fotos + metadata) y tablas de tarifas de D&D.  
- **Seguridad**: JWT + Bcrypt para login seguro y gestión de roles; variables de entorno para secretos y credenciales.  
- **Infraestructura de desarrollo**: Docker Compose para orquestar frontend, backend y base de datos, facilitando despliegue y homogeneidad de entornos.  
- **DevOps y diseño**: GitHub Actions / GitHub Project para integración continua y gestión de tareas, Figma para diseño de interfaces.  


## 5 Obligaciones legales y prevención (Criterio 1g)

### 5.1. Normativa aplicable

Fluster gestiona datos de usuarios (identificadores, credenciales) y datos de operación asociados a contenedores que pueden estar ligados a clientes o proveedores concretos.  

Será de aplicación:

- **RGPD** y **LOPDGDD**, por el tratamiento de datos personales de usuarios del sistema.  
- **LSSI-CE**, al ofrecer un servicio accesible por vía electrónica.  
- Posible normativa sectorial o contractual relacionada con la conservación de documentación y trazabilidad de operaciones logísticas y de facturación.  

El diseño se orientará al principio de minimización de datos, almacenando solo la información necesaria para la funcionalidad (usuarios, contenedores, eventos y tarifas), sin datos personales excesivos.  

### 5.2. Medidas de seguridad y protección de datos

Medidas previstas:

- Cifrado de contraseñas con **Bcrypt**, nunca en texto plano.  
- Autenticación con **JWT** y control de expiración de tokens.  
- Gestión de secretos y credenciales mediante variables de entorno.  
- Definición de roles para limitar el acceso a operaciones sensibles (por ejemplo, configuración de tarifas vs. simple registro de eventos).  
- Política de privacidad accesible desde la aplicación, describiendo finalidades, base jurídica y plazos de conservación.  

### 5.3. Accesibilidad web

La SPA de Fluster se desarrollará siguiendo buenas prácticas de accesibilidad (uso de etiquetas correctas, contraste suficiente, navegación por teclado), tomando como referencia **WCAG 2.1 nivel AA** y las obligaciones del Real Decreto 1112/2018 para servicios digitales.  

Se realizarán comprobaciones básicas con herramientas como **Lighthouse**, **Wave** y **TAW** para validar el cumplimiento.  
  



## 6 Ayudas y subvenciones (Criterio 1h)

### 6.1. Ayudas disponibles para proyectos tecnológicos

El proyecto **Fluster** se alinea con iniciativas de digitalización de PYMEs, especialmente en sectores industriales y logísticos donde la mejora de procesos y la reducción de costes operativos son prioritarias.  

Potenciales líneas de ayuda:

- Programas nacionales y autonómicos de **digitalización de PYMEs** (por ejemplo, ayudas similares a Kit Digital) orientados a la **gestión de procesos**.  
- Programas sectoriales de **innovación logística y portuaria** que incentiven la adopción de soluciones de control de costes y trazabilidad en operaciones con contenedores.  

### 6.2. Recursos de bajo coste y Open Source

Para reducir barreras de entrada, el stack tecnológico se apoya en herramientas y servicios de bajo coste o gratuitos:

| Recurso | Tipo | Justificación técnica |
|--------|------|-----------------------|
| **MongoDB Atlas (plan gratuito)** | Base de datos | Permite desplegar rápidamente sin coste inicial, con opciones de escalado posterior. |
| **Node.js / Express** | Backend | Ecosistema maduro, libre y ampliamente soportado para construir APIs REST. |
| **React** | Frontend | Framework open source con gran comunidad y soporte para SPA. |
| **Tesseract OCR + Tess4J** | OCR | Sistema gratuito para extraer el código de contenedor desde una foto. |
| **jsPDF + jsPDF-AutoTable** | Informes | Generación de reportes PDF sin licencias de pago. |
| **Docker Compose** | Infraestructura | Orquestación local sin coste, facilita despliegue y replicación del entorno. |
| **GitHub Actions / Project** | DevOps / Gestión | CI/CD y planificación visual sin coste para repositorios públicos. |


## 7 Guion de trabajo (Criterio 1i)

### 7.1. Metodología de gestión

Se utilizará una metodología **Scrum**: sprints cortos (1–2 semanas) y uso de GitHub Projects para visualizar tareas pendientes, en curso y finalizadas. El desarrollo se planifica para una duración aproximada de **10 semanas**, finalizando con la defensa del proyecto.

### 7.2. Cronograma orientativo

> Fechas adaptables según la carga de trabajo que tenga en esas semanas.

- **Sprint 1 – Planificación, stack y despliegue inicial**  
    - Creación de la estructura del repositorio y configuración inicial de Docker Compose .  
    - Definición del modelo de datos (colecciones `usuarios`, `contenedores`, `eventos`, `tarifasDND...`) y atributos principales.  
    - Configuración base del proyecto React (routing, layout principal, tema de estilos ITCSS) y del backend Express (estructura de carpetas, middlewares genéricos, conexión con Mongo).  
    - Despliegue básico en Render del backend y frontend junto al cluster de MongoDB Atlas.  
  - **Objetivo a completar**: Entorno preparado (repositorio + Docker + Render + conexión a MongoDB) y arquitectura mínima lista para empezar a desarrollar funcionalidades reales.

- **Sprint 2 – Implementación del backend y lógica de negocio básica**  
    - Implementación del sistema de usuarios: registro, login y cifrado de contraseñas con Bcrypt.  
    - Implementación de autenticación y autorización basada en JWT (middleware para proteger rutas y lectura de rol).  
    - Diseño e implementación del CRUD básico de contenedores: alta, listado, detalle y actualización de datos principales (código BIC, naviera, puerto, fechas de free time...).  
    - Creación de documentación interactiva de la API con Swagger UI para las rutas de usuarios y contenedores.  
    - Integración mínima en el frontend: pantallas de login/registro y listado simple de contenedores consumiendo la API.  
  - **Objetivo a completar**: Backend funcional para usuarios y contenedores con seguridad básica, y frontend capaz de autenticarse y listar contenedores.

- **Sprint 3 – Modelo de tarifas y motor de cálculo D&D**  
    - Diseño y creación de la colección/estructura de **tarifas de D&D** por naviera/puerto/cliente (tramos de días y precio por día).  
    - Implementación del motor de cálculo: funciones que, dada la fecha de free time y los eventos, calculan días de demurrage y detention y su coste total.  
    - Endpoints para obtener el coste actual y el estado de un contenedor (dentro de free time, en zona ámbar, en sobrecoste).  
    - Integración de los resultados de cálculo en el backend de contenedores y del riesgo.  
  - **Objetivo a completar**: Cálculo automático de días y costes de D&D funcionando y disponible vía API para ser consumido por el panel.

- **Sprint 4 – Eventos con foto y OCR**  
    - Diseño del modelo de eventos: tipo de evento (entrada/salida puerto, llegada almacén, devolución), `timestamp`, ubicación y referencia al contenedor.  
    - Implementación de endpoints para registrar eventos, incluyendo subida de foto (almacenamiento en disco/S3/Cloudinary o similar, según el alcance del proyecto).  
      - Integración del OCR (Tesseract OCR con Tess4J) en el backend para leer el código BIC desde la foto y validar que el evento se vincula al contenedor correcto.  
    - Lógica de actualización automática del contenedor al registrar eventos (recalcular estado, días y costes).  
    - En React, creación de un formulario de alta de eventos con subida de imagen y visualización básica de la línea temporal de eventos por contenedor.  
  - **Objetivo a completar**: Poder registrar eventos con foto y que el sistema vincule y recalcule automáticamente la situación de cada contenedor.

- **Sprint 5 – Panel React y generación de informes PDF**  
  - Desarrollo del panel principal en React:  
    - Listado de contenedores activos con indicadores de riesgo tipo semáforo (verde/ámbar/rojo).  
    - Filtros por estado, naviera, cliente o rango de fechas.  
    - Vista de detalle de contenedor con timeline de eventos y desglose de días/costes.  
    - Implementación de la parte de informes:  
      - Endpoint para obtener datos agregados (por rango de fechas, naviera, cliente).  
      - Botón “Exportar informe” en el panel que genera un PDF con jsPDF + jsPDF-AutoTable.  
    - Ajustes de estilos con ITCSS para asegurar una interfaz consistente y mantenible.  
  - **Objetivo a completar**: Panel de monitorización usable, con vista de lista y detalle, y generación de informes PDF listos para comparar con facturas de naviera.

- **Sprint 6 – Refinos, pruebas, documentación y demo final**  
    - Pruebas end-to-end básicas del flujo completo: alta de contenedor → registro de eventos → cálculo de D&D → visualización en panel → exportación de informe.  
    - Corrección de bugs, mejoras de validaciones (formularios, mensajes de error claros) y pequeños refinos de UX/UI.  
    - Documentación técnica del proyecto (arquitectura, endpoints, modelos de datos) y guía rápida de uso para un usuario no técnico.  
    - Preparación de la demo final:  
      - Datos de ejemplo que ilustren varios casos de D&D.  
      - Guion de presentación y, si se requiere, grabación en vídeo del flujo principal usando OBS.  
  - **Objetivo a completar**: Proyecto estable, documentado, con caso de uso de principio a fin listo para demostrar en la defensa.

### 7.3. Herramientas de seguimiento

- **GitHub Projects**: Tablero Kanban para gestión de tareas y visualización del avance por sprint.  
- **Toggl Track**: Para medir el tiempo real dedicado a cada funcionalidad y ajustar el esfuerzo.  
- **Herramienta de grabación (OBS o similar)**: Para generar vídeos de las demos parciales o de la demo final.  



## 8 Conclusión

Fluster nace para dar respuesta a una necesidad concreta de las PYMEs logísticas: controlar de forma sencilla los costes de demurrage y detention sin recurrir a plataformas complejas o infraestructura especializada.  

Mediante una SPA basada en React y un backend Node.js + Express con MongoDB Atlas, el proyecto propone un registro estructurado del ciclo de vida del contenedor, el cálculo automático de días y costes y un panel visual de riesgo que permite anticiparse a los sobrecostes.  

El uso de tecnologías abiertas, el enfoque en la simplicidad para el usuario final y una hoja de ruta realista hacen que Fluster sea un candidato sólido para el proyecto de 2º DAW y una solución potencialmente viable para su implantación en PYMEs del sector logístico.  




