# 2. Descripción del sistema

## 1. Descripción general del sistema

Fluster es una aplicación web de página única (SPA) orientada a pequeñas y medianas empresas del sector logístico marítimo. Su objetivo principal es centralizar el control de los costes de **Demurrage** (sobreestadía en puerto) y **Detention** (detención fuera de puerto) que generan los contenedores durante su ciclo de vida.

En la logística de importación y exportación, los armadores (navieras) conceden un número determinado de días libres para que el importador retire el contenedor del puerto y lo devuelva vacío. Cuando se superan esos días, comienzan a acumularse penalizaciones económicas escalonadas. Fluster registra cada contenedor, configura las tarifas por naviera, sigue en tiempo real el estado de cada unidad y calcula automáticamente el coste acumulado según los tramos tarifarios configurados.

La aplicación está construida sobre una arquitectura cliente-servidor. El **frontend** es una SPA desarrollada con React y Vite, que se comunica con el **backend** mediante una API REST desarrollada con Node.js y Express, respaldada por una base de datos MongoDB. La autenticación se gestiona mediante JWT almacenado en localStorage.

Los usuarios de Fluster se organizan en tres roles con permisos diferenciados:

| Rol | Descripción |
|---|---|
| **admin** | Gestiona los usuarios de la plataforma y asigna roles. |
| **gestor** | Configura navieras, tarifas y clientes; sigue el semáforo de riesgo; gestiona el almacén y genera informes PDF. |
| **operador** | Registra contenedores (con o sin OCR) y consulta su propio listado. |

---

## 2. Funcionalidades principales

### 2.1 Autenticación y gestión de sesión

El acceso a Fluster está protegido por autenticación JWT. Al iniciar sesión en `/login`, el servidor valida las credenciales y devuelve un token que el cliente almacena en localStorage. Cada petición posterior incluye ese token en la cabecera `Authorization`.

El registro de nuevos usuarios se realiza en `/registro`. Durante el registro, el usuario elige su rol pulsando uno de los dos botones disponibles («Soy un Operador» o «Soy Gestor de Operaciones»); el formulario no permite crear la cuenta sin seleccionar uno. El enrutamiento de la aplicación distingue entre rutas públicas (`RutaPublica`) y rutas protegidas (`RutaProtegida`), redirigiendo automáticamente según el estado de la sesión y el rol del usuario.

**Endpoints relacionados:** `POST /api/auth/registro`, `POST /api/auth/login`.

### 2.2 Gestión de navieras y tarifas

Desde la página `/tarifas`, el gestor puede consultar, editar y eliminar las navieras registradas, así como configurar las tarifas de D&D de cada una. Cada naviera define:

- Días libres de **detention** y días libres de **demurrage**.
- Dos tramos tarifarios para cada modalidad: el primero va del día 1 hasta un día límite configurable, con un precio por día; el segundo cubre el resto de días con un precio distinto.

La estructura de tramos sigue el esquema `{ desdeDia, hastaDia, precioPorDia }` almacenado en los arrays `diasDetention` y `diasDemurrage` de cada naviera. Los cambios se aplican en línea sobre la tabla sin necesidad de navegar a otra pantalla.

**Endpoints relacionados:** `GET/POST/PUT/DELETE /api/navieras`.

### 2.3 Gestión de clientes

Los clientes se crean automáticamente cuando el gestor registra la entrada a puerto de un contenedor: en el modal de entrada se introduce el nombre del cliente y el sistema lo crea si no existe. También es posible gestionar clientes de forma directa. Cada contenedor en fase de detention queda asociado a un cliente para facilitar la imputación de costes.

**Endpoints relacionados:** `GET/POST/PUT/DELETE /api/clientes`.

### 2.4 Registro de contenedores

Los operadores registran nuevos contenedores desde `/meter-contenedor`. El formulario solicita el código BIC del contenedor y opcionalmente la fecha de inicio del período libre. El código BIC puede introducirse de forma manual o mediante **OCR**: el operador sube una fotografía del contenedor y la aplicación invoca Tesseract.js en el backend para extraer automáticamente el código de once caracteres. Si el OCR no obtiene resultado, el campo queda disponible para introducción manual sin interrumpir el flujo.

Una vez confirmado, el contenedor se crea en estado `INACTIVO` asociado al operador que lo registró.

**Endpoints relacionados:** `POST /api/contenedores`, `POST /api/ocr/extraer-bic`.

### 2.5 Transiciones de estado

El ciclo de vida de un contenedor sigue cuatro estados gestionados por el gestor desde el semáforo o el almacén:

```
INACTIVO → PUERTO (entrada a puerto, demurrage)
         → CLIENTE (salida a cliente, detention)
         → VUELTA_PUERTO (devolución al puerto)
```

Cada transición registra la fecha correspondiente:
- **Entrada a puerto** (`INACTIVO → PUERTO`): se asocia un cliente y se inicia el cómputo de demurrage.
- **Salida a cliente** (`PUERTO → CLIENTE`): el contenedor sale del terminal hacia el cliente, iniciando el cómputo de detention. Esta transición puede revertirse (`CLIENTE → PUERTO`) si se registró por error.
- **Devolución** (`CLIENTE → VUELTA_PUERTO`): el contenedor es devuelto vacío, cerrando el ciclo.
- **Cancelar ciclo**: anula el ciclo activo devolviendo el contenedor a `INACTIVO`.

**Endpoints relacionados:** `PATCH /api/contenedores/:id/entrada-puerto`, `/salida-puerto`, `/devolucion`, `/revertir-salida-puerto`, `/cancelar-ciclo`.

### 2.6 Semáforo de riesgo

La página `/semaforo` es la vista operativa principal del gestor. Muestra todos los contenedores activos agrupados en cuatro columnas según su situación de coste:

| Columna | Significado | Color |
|---|---|---|
| **Sin costes** | Dentro del periodo de días libres | Verde |
| **Primer tramo** | Superados los días libres, dentro del primer tramo tarifario | Amarillo |
| **Segundo tramo** | En el segundo tramo tarifario (coste más elevado) | Rojo |
| **Inactivos** | Contenedores sin ciclo activo | Gris |

Cada tarjeta muestra el código BIC, el coste acumulado, el cliente asociado y la última operación registrada. Desde cada tarjeta se pueden ejecutar directamente las transiciones de estado correspondientes y editar la fecha de inicio del período libre.

**Endpoint relacionado:** `GET /api/semaforo`.

### 2.7 Historial del contenedor

Accediendo a `/almacen/historial/:id`, el gestor visualiza el historial completo de ciclos de un contenedor concreto. Para cada ciclo se muestra:

- Periodo de demurrage: fecha de inicio, fecha de fin y coste calculado por tramos.
- Periodo de detention: misma información para la fase con el cliente.
- Posibilidad de editar manualmente las fechas de inicio y fin de cada tramo mediante un modal (`ModalEditarTramo`), lo que recalcula el coste automáticamente.

Desde esta misma página se puede generar un informe PDF individual del contenedor.

**Endpoints relacionados:** `GET /api/eventos/contenedor/:id`, `PATCH /api/ciclos/:id/demurrage`, `PATCH /api/ciclos/:id/detention`.

### 2.8 Generación de informes PDF

Fluster permite generar informes en formato PDF mediante la biblioteca jsPDF con el complemento jsPDF-AutoTable. Existen dos variantes:

- **Informe individual** (desde `/almacen/historial/:id`): detalla todos los ciclos de un contenedor específico, con fechas y costes de demurrage y detention.
- **Informe general** (desde `/almacen`): agrega los ciclos de múltiples contenedores filtrados por rango de fechas, fecha específica, naviera, cliente o código BIC, con opciones de ordenación ascendente, descendente o alfabética.

Cada informe generado queda registrado en el sistema.

**Endpoints relacionados:** `GET /api/informes`, `POST /api/informes`.

### 2.9 Panel de control (admin)

La página `/panel-de-control` está reservada al rol `admin`. Desde ella se puede:

- Consultar el listado de todos los usuarios registrados, con búsqueda por nombre o correo.
- Cambiar el rol de cualquier usuario (gestor, operador, admin). No es posible cambiar el propio rol.
- Eliminar cuentas de usuario.

**Endpoints relacionados:** `GET/PUT/DELETE/PATCH /api/usuarios`.

### 2.10 Perfil de usuario

Todos los usuarios autenticados pueden acceder a `/perfil` para:

- Cambiar su nombre de visualización.
- Actualizar su contraseña (requiere introducir la contraseña actual).
- Subir o cambiar su foto de perfil (almacenada en base64).
- Cerrar sesión, limpiando el token de localStorage.

### 2.11 Tema visual

La interfaz soporta modo claro y modo oscuro. El tema se controla mediante el atributo `data-theme` en el elemento `:root` del DOM y se persiste en localStorage a través del hook `useTema`. Si el usuario no ha seleccionado ningún tema, la aplicación respeta la preferencia del sistema operativo mediante la media query `prefers-color-scheme`.

---

## 3. Interfaz de usuario y experiencia (UI/UX)

### 3.1 Arquitectura de estilos: ITCSS

Los estilos de Fluster siguen la metodología **ITCSS** (Inverted Triangle CSS), que organiza las hojas de estilo en siete capas de especificidad creciente:

| Capa | Directorio | Contenido |
|---|---|---|
| **00 Settings** | `styles/00-settings/` | Variables Sass y custom properties CSS. Sin output CSS propio. |
| **01 Tools** | `styles/01-tools/` | Mixins reutilizables (breakpoints, flex, tipografía, accesibilidad). Sin output CSS propio. |
| **02 Generic** | `styles/02-generic/` | Reset y normalización de estilos base. |
| **03 Elements** | `styles/03-elements/` | Estilos de etiquetas HTML sin clases (headings, links, inputs). |
| **04 Layout** | `styles/04-layout/` | Estructura de página y patrones de rejilla reutilizables. |
| **05 Components** | `styles/05-components/` | Estilos específicos de cada componente, organizados por fichero. |
| **06 Utilities** | `styles/06-utilities/` | Clases de apoyo de alta especificidad. |

### 3.2 Atomic Design

Los componentes React se organizan según la metodología **Atomic Design**:

- **Átomos** (`components/atomos/`): unidades mínimas e indivisibles como botones, inputs, notificaciones o etiquetas de estado.
- **Moléculas** (`components/moleculas/`): combinaciones de átomos con una función concreta, como formularios de credenciales, tarjetas individuales o cabeceras de sección.
- **Organismos** (`components/organismos/`): bloques funcionales completos como el `Header`, `TablaTarifas`, `ConjuntoCards`, `SubirFotoOcr` o `HistorialCiclosContenedor`.
- **Páginas** (`pages/`): cada ruta de la aplicación monta los organismos necesarios y gestiona el estado de la vista.

### 3.3 Nomenclatura BEM

Todos los nombres de clase CSS siguen la convención **BEM** (Block Element Modifier): `bloque__elemento--modificador`. Por ejemplo: `card-semaforo__titulo`, `btn-editar--disabled`, `semaforo__contenido`.

### 3.4 Sistema de design tokens

Las variables CSS cubren las siguientes categorías:

- **Color**: `--color-primary`, `--color-secondary`, `--color-bg`, `--color-surface`, `--color-text`, `--color-border`, más las cuatro variantes de semáforo (`--color-sin_costes`, `--color-primer_tramo`, `--color-segundo_tramo`, `--color-inactivo`).
- **Tipografía**: `--font-heading` (Crimson Text, serif), `--font-body` (Poppins, sans-serif), escala de tamaños en base 8 px (`--text-8` a `--text-64`).
- **Espaciado**: escala en base 8 px (`--space-8` a `--space-96`).
- **Formas**: `--radius` (12 px), cuatro niveles de sombra (`--shadow-sm` a `--shadow-xl`).
- **Movimiento**: tres velocidades de transición (`--transition-fast`, `--transition-base`, `--transition-slow`).

### 3.5 Diseño responsive

La aplicación es completamente responsive con dos puntos de ruptura definidos:

- **Mobile**: hasta 767 px — navegación colapsada en menú hamburguesa, columnas apiladas.
- **Tablet**: hasta 1023 px — disposición intermedia con ajustes de espaciado y tamaño de tarjeta.

### 3.6 Sistema de notificaciones y estados de carga

Todas las operaciones asíncronas muestran un componente `Notificacion` al completarse con éxito o error. Las páginas que realizan peticiones al arrancar muestran un estado de carga textual (`Cargando contenedores...`, `Cargando tarifas...`, etc.) mientras esperan respuesta del servidor. Los errores de red o validación del backend se capturan y presentan en texto legible para el usuario, nunca como mensajes técnicos de la API.

---

## 4. Usuarios objetivo y casos de uso

### 4.1 Perfiles de usuario

| Rol | Perfil típico | Acceso |
|---|---|---|
| **Admin** | Responsable TI o jefe de operaciones | Panel de control: gestión de usuarios y roles |
| **Gestor** | Encargado de logística | Semáforo, almacén, historial, tarifas, informes |
| **Operador** | Agente de operaciones | Registro de contenedores, consulta propia |

### 4.2 Casos de uso principales

#### Caso de uso 1: Gestor configura una naviera y revisa el semáforo

1. El gestor accede a `/tarifas` y localiza la naviera que quiere configurar.
2. Activa la edición de la fila, actualiza los días libres y los precios por tramo de demurrage y detention.
3. Guarda los cambios. La nueva tarifa se aplica a todos los contenedores futuros de esa naviera.
4. Navega a `/semaforo` para revisar el estado actual de todos los contenedores.
5. Identifica contenedores en segundo tramo (columna roja) y actúa: registra devoluciones o genera un informe desde el almacén para documentar los costes.

#### Caso de uso 2: Operador registra un contenedor con OCR

1. El operador accede a `/meter-contenedor`.
2. Selecciona una fotografía del contenedor desde su dispositivo.
3. La aplicación envía la imagen al endpoint `/api/ocr/extraer-bic`; Tesseract.js detecta y devuelve el código BIC.
4. Si el código es correcto, el operador confirma el registro. Si el OCR falla, escribe el código manualmente.
5. El contenedor queda registrado en estado `INACTIVO` y aparece en el listado de `/contenedores`.

#### Caso de uso 3: Admin gestiona usuarios y asigna roles

1. El administrador accede a `/panel-de-control`.
2. Localiza al usuario recién registrado mediante el buscador.
3. Cambia su rol a `gestor` u `operador` según corresponda.
4. El usuario puede ahora acceder a las secciones correspondientes a su nuevo rol.

---

## 5. Arquitectura de componentes

La jerarquía de componentes sigue el flujo de enrutamiento hacia abajo:

```
AppRouter
├── RutaPublica          — accesible sin sesión (redirige si ya hay token)
│   ├── Home             /
│   ├── Login            /login
│   └── Registro         /registro
└── RutaProtegida        — requiere token válido + rol permitido
    ├── Semaforo         /semaforo            (gestor)
    ├── Tarifas          /tarifas             (gestor)
    ├── Almacen          /almacen             (gestor)
    │   └── HistorialContenedor  /almacen/historial/:id
    ├── Contenedores     /contenedores        (operador)
    ├── MeterContenedor  /meter-contenedor    (operador)
    ├── PanelDeControl   /panel-de-control    (admin)
    └── Perfil           /perfil              (todos)
```

Cada página monta un `Header` (organismo de navegación con toggle de tema), el contenido principal a base de organismos reutilizables (`ConjuntoCards`, `TablaTarifas`, `PanelGenerarInforme`, etc.) y un componente `Notificacion` para el feedback de operaciones. Los organismos se componen de moléculas (`CardSemaforo`, `FilaNavieraTarifas`, `TarjetaCicloContenedor`, etc.) que a su vez agrupan átomos (`BotonEditar`, `CeldaTabla`, `Input`, `Notificacion`, etc.).
