# 05. Diseño del Sistema

## Documentación de Diseño de Interfaces Web — Recuperación

Los siguientes documentos desarrollan cada Resultado de Aprendizaje del módulo **Diseño de Interfaces Web** aplicado al proyecto Fluster:

| RA | Documento | Contenido |
|---|---|---|
| RA1.a | [Comunicación visual](./diseño/RA1a-comunicacion-visual.md) | Los 5 principios visuales: jerarquía, contraste, alineación, proximidad y repetición |
| RA1.f | [Plantillas de diseño](./diseño/RA1f-plantillas-diseno.md) | Átomos, moléculas, organismos, layout global y Style Guide |
| RA2.a | [Modificar etiquetas HTML](./diseño/RA2a-etiquetas-html.md) | Selectores de elemento, de clase BEM y combinados |
| RA2.c | [Estilos globales](./diseño/RA2c-estilos-globales.md) | Variables Sass, CSS Custom Properties en `:root` y layout global |
| RA2.d | [Hojas alternativas — temas](./diseño/RA2d-hojas-alternativas.md) | Sistema light/dark con `[data-theme]`, `prefers-color-scheme` y `useTema` |
| RA2.e | [Redefinir estilos](./diseño/RA2e-redefinir-estilos.md) | Reset, estados interactivos y modificadores BEM |
| RA2.f | [Propiedades de elementos](./diseño/RA2f-propiedades-elementos.md) | HTML semántico, landmarks ARIA y jerarquía de encabezados |
| RA2.g | [Clases de estilos](./diseño/RA2g-clases-estilos.md) | Catálogo de 76 componentes BEM, variantes y estados |
| RA2.j | [Preprocesadores de estilos](./diseño/RA2j-preprocesadores.md) | SCSS, arquitectura ITCSS, 8 mixins y compilación con Vite |
| RA3.b | [Formatos multimedia](./diseño/RA3b-formatos-multimedia.md) | PNG, SVG y JPEG: criterios de elección y comparativa |
| RA3.c | [Herramientas multimedia](./diseño/RA3c-herramientas-multimedia.md) | Vite, SVGO, Squoosh y Tesseract.js |
| RA3.d | [Tratamiento de imagen](./diseño/RA3d-tratamiento-imagen.md) | Optimización antes/después, tabla de resultados y responsividad |
| RA3.f | [Importar/exportar multimedia](./diseño/RA3f-multimedia-formatos.md) | `<picture>`, `srcset`, `loading="lazy"` y exportación PDF |
| RA3.g | [Animaciones CSS](./diseño/RA3g-animaciones-css.md) | `@keyframes` spinner y notificación, transiciones y micro-interacciones |
| RA3.h | [Aplicación de guía de estilo](./diseño/RA3h-guia-estilo.md) | Atomic Design, BEM, Style Guide y consistencia total |
| RA4.a | [Tecnologías multimedia](./diseño/RA4a-tecnologias-multimedia.md) | `<picture>`, `srcset`, `sizes`, `loading="lazy"` y soporte de navegadores |
| RA4.e | [Agregar multimedia](./diseño/RA4e-agregar-multimedia.md) | SVG como componente, PNG con atributos completos, fotos dinámicas y PDF |

---

## Índice

1. [Diagrama entidad-relación de la base de datos](#1-diagrama-entidad-relación-de-la-base-de-datos)
2. [Diagrama de casos de uso](#2-diagrama-de-casos-de-uso)
3. [Diagramas de flujo de los procesos principales](#3-diagramas-de-flujo-de-los-procesos-principales)
4. [Arquitectura de la aplicación](#4-arquitectura-de-la-aplicación)
5. [Diseño de la API (endpoints, métodos, respuestas)](#5-diseño-de-la-api-endpoints-métodos-respuestas)

---

## 1. Diagrama entidad-relación de la base de datos

La base de datos utilizada es **MongoDB Atlas** (plan gratuito M0). El modelo sigue un esquema orientado a documentos con 7 colecciones. Los campos calculados (días de demurrage, coste acumulado, semáforo de riesgo) no se persisten — se calculan en el backend bajo demanda para mantener las colecciones ligeras.

### Diagrama Entidad-Relación

```mermaid
erDiagram
    usuarios {
        ObjectId _id PK
        String   nombre
        String   correo    "Unique"
        String   contrasena
        String   rol       "admin | gestor | operador"
        Date     creadoEn
    }
    navieras {
        ObjectId _id PK
        String   nombre
        String   codigo               "Unique"
        Number   diasLibresDemurrage
        Number   diasLibresDetention
        Array    diasDemurrage        "tramos embebidos"
        Array    diasDetention        "tramos embebidos"
    }
    clientes {
        ObjectId _id PK
        String   nombre
    }
    contenedores {
        ObjectId _id              PK
        String   codigoBIC
        String   foto
        String   tipo
        String   estado           "INACTIVO | PUERTO | CLIENTE"
        ObjectId navieraId        FK
        Date     fechaInicioLibre
        Date     fechaEntradaPuerto
        Date     fechaSalidaPuerto
        Date     fechaDevolucion
        ObjectId creadoPor        FK
        Date     creadoEn
    }
    ciclos {
        ObjectId _id           PK
        ObjectId contenedorId  FK
        ObjectId clienteId     FK
        Object   demurrage     "tramo embebido"
        Object   detention     "tramo embebido"
        Number   costeTotal
        Date     fechaCierre
        Date     creadoEn
    }
    eventos {
        ObjectId _id           PK
        ObjectId contenedorId  FK
        String   tipo
        Date     timestamp
        String   fotoUrl
        String   codigoBIC     "leído por OCR"
        Boolean  ocrValidado
        ObjectId registradoPor FK
    }
    informes {
        ObjectId _id          PK
        ObjectId contenedorId FK
        ObjectId cicloId      FK
        String   codigoBIC    "snapshot"
        String   cliente      "snapshot"
        ObjectId generadoPor  FK
        Date     generadoEn
    }

    usuarios     ||--o{ contenedores : "crea (creadoPor)"
    usuarios     ||--o{ eventos      : "registra (registradoPor)"
    usuarios     ||--o{ informes     : "genera (generadoPor)"
    navieras     ||--o{ contenedores : "propietaria (navieraId)"
    contenedores ||--o{ ciclos       : "acumula (contenedorId)"
    clientes     ||--o{ ciclos       : "asociado (clienteId)"
    contenedores ||--o{ eventos      : "ciclo de vida (contenedorId)"
    contenedores ||--o{ informes     : "exporta (contenedorId)"
    ciclos       ||--o{ informes     : "documenta (cicloId)"
```

### Diccionario de datos

#### `usuarios`

Almacena los usuarios del sistema. El rol controla el acceso a cada funcionalidad. Siempre debe existir al menos un usuario con rol `admin`.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| _id | ObjectId | PK | Identificador generado por MongoDB. |
| nombre | String | Not Null | Nombre completo del usuario. |
| correo | String | Unique, Not Null | Correo electrónico de acceso. |
| contrasena | String | Not Null | Hash bcrypt de la contraseña. |
| rol | Enum | `admin`, `gestor`, `operador` | Admin gestiona roles; gestor maneja tramos y PDFs; operador registra contenedores. |
| creadoEn | Date | Not Null | Fecha de alta. |

---

#### `navieras`

Catálogo de navieras. **La tarifa D&D va embebida en el propio documento de la naviera** (no es una colección aparte): los días libres y los tramos de precio de demurrage y detention son subdocumentos de la naviera. Cada contenedor pertenece a una naviera y hereda su tarifa.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| _id | ObjectId | PK | Identificador de la naviera. |
| nombre | String | Not Null | Nombre comercial (ej: MSC, Maersk). |
| codigo | String | Unique, Not Null | Código identificador de la naviera (prefijo BIC). |
| diasLibresDemurrage | Number | Not Null | Días de free time en puerto antes de generar demurrage. |
| diasLibresDetention | Number | Not Null | Días de free time con el cliente antes de generar detention. |
| diasDemurrage | Array | Not Null | Tramos de demurrage embebidos: `[{ desdeDia, hastaDia, precioPorDia }]` |
| diasDetention | Array | Not Null | Tramos de detention embebidos: `[{ desdeDia, hastaDia, precioPorDia }]` |

**Ejemplo de `diasDemurrage` (tramos):**
```json
[
  { "desdeDia": 1,  "hastaDia": 5,    "precioPorDia": 50  },
  { "desdeDia": 6,  "hastaDia": 10,   "precioPorDia": 75  },
  { "desdeDia": 11, "hastaDia": null, "precioPorDia": 120 }
]
```

---

#### `clientes`

Empresas o personas asociadas a los contenedores. Se utilizan como referencia en informes.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| _id | ObjectId | PK | Identificador del cliente. |
| nombre | String | Not Null | Nombre del cliente o empresa. |

---

#### `ciclos`

Registra cada ciclo completo de un contenedor (INACTIVO → PUERTO → CLIENTE → INACTIVO). Es la entidad **central del cálculo D&D**: guarda el cliente del ciclo y los dos tramos (demurrage y detention) como subdocumentos embebidos, cada uno con sus días y coste. Un contenedor puede acumular varios ciclos a lo largo de su vida útil.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| _id | ObjectId | PK | Identificador del ciclo. |
| contenedorId | ObjectId | FK `contenedores._id` | Contenedor del ciclo. |
| clienteId | ObjectId | FK `clientes._id` | Cliente asignado a este ciclo. |
| demurrage | Object | Subdocumento | Tramo en puerto: `diasLibres`, `fechaInicio`, `fechaFin`, `diasTranscurridos`, `diasFacturables`, `costeTotal`. |
| detention | Object | Subdocumento | Tramo con el cliente: misma estructura que demurrage. |
| costeTotal | Number | Nullable | Suma de ambos tramos; se rellena al cerrar el ciclo. |
| fechaCierre | Date | Nullable | Fecha de cierre del ciclo (transición CLIENTE → INACTIVO). |
| creadoEn | Date | Not Null | Fecha de apertura del ciclo. |

---

#### `contenedores`

Entidad central del sistema. Registra los datos de alta y las fechas clave de cada tramo. El cliente, los días libres y los costes **no se guardan aquí**: el cliente y los costes viven en el `ciclo`, y los días libres y las tarifas en la `naviera`. Los costes y el semáforo de riesgo se calculan en el backend a partir de esas fechas y de la tarifa de la naviera.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| _id | ObjectId | PK | Identificador del contenedor. |
| codigoBIC | String | Not Null, uppercase | Código BIC del contenedor (ej: MSCU1234567). |
| foto | String | Nullable | Foto del contenedor (data URL). |
| tipo | String | Nullable | Tipo de contenedor (20ft, 40ft, Reefer…). |
| estado | Enum | Default `INACTIVO` | `INACTIVO` → `PUERTO` → `CLIENTE` → `INACTIVO` |
| navieraId | ObjectId | FK `navieras._id` | Naviera propietaria (también aporta la tarifa). |
| fechaInicioLibre | Date | Default ahora | Inicio del período de free time. |
| fechaEntradaPuerto | Date | Nullable | Inicio del tramo En Puerto (activa demurrage). |
| fechaSalidaPuerto | Date | Nullable | Inicio del tramo Con Cliente (activa detention). |
| fechaDevolucion | Date | Nullable | Devolución del contenedor (cierre del ciclo). |
| creadoPor | ObjectId | FK `usuarios._id` | Operador que registró el contenedor. |
| creadoEn | Date | Not Null | Fecha de alta. |

**Estados del contenedor** (ciclo circular):

| Estado | Tramo activo | Coste generado |
| :--- | :--- | :--- |
| `INACTIVO` | Free time / ciclo cerrado | Sin coste |
| `PUERTO` | En Puerto | Demurrage (sobreestadía) |
| `CLIENTE` | Con Cliente | Detention (detención) |

---

#### `eventos`

Registro fotográfico del ciclo de vida de cada contenedor. El operador sube una foto en cada hito; Tesseract OCR lee el código BIC para validar que la foto corresponde al contenedor correcto.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| _id | ObjectId | PK | Identificador del evento. |
| contenedorId | ObjectId | FK `contenedores._id` | Contenedor al que pertenece el evento. |
| tipo | Enum | Not Null | `entrada_puerto`, `salida_puerto`, `llegada_almacen`, `devolucion` |
| timestamp | Date | Not Null | Fecha y hora del evento. |
| fotoUrl | String | Nullable | URL de la imagen subida. |
| codigoBIC | String | Nullable | Código BIC leído por Tesseract OCR. |
| ocrValidado | Boolean | Default false | Indica si el OCR coincidió con el BIC del contenedor. |
| registradoPor | ObjectId | FK `usuarios._id` | Operador que registró el evento. |

---

#### `informes`

Documento generado por el gestor al finalizar un movimiento. Almacena un snapshot de los datos en el momento de generación para garantizar su inmutabilidad, ya que las tarifas pueden cambiar con el tiempo.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| _id | ObjectId | PK | Identificador del informe. |
| contenedorId | ObjectId | FK `contenedores._id` | Contenedor del informe. |
| cicloId | ObjectId | FK `ciclos._id` | Ciclo (cerrado) que documenta el informe. |
| codigoBIC | String | Snapshot | Código BIC en el momento de generación. |
| cliente | String | Snapshot | Nombre del cliente en el momento de generación. |
| generadoPor | ObjectId | FK `usuarios._id` | Gestor que generó el informe. |
| generadoEn | Date | Not Null | Fecha de generación. |

---

### Relaciones entre colecciones

```
usuarios     ──< contenedores   (creadoPor)
usuarios     ──< eventos        (registradoPor)
usuarios     ──< informes       (generadoPor)
navieras     ──< contenedores   (navieraId)
contenedores ──< ciclos         (contenedorId)
clientes     ──< ciclos         (clienteId)
contenedores ──< eventos        (contenedorId)
contenedores ──< informes       (contenedorId)
ciclos       ──< informes       (cicloId)
```

---

## 2. Diagrama de casos de uso

> **Versión interactiva en FigJam:** [Diagrama de Flujo — Fluster](https://www.figma.com/board/RElpnz7nwahpUixOCr4vMq/Diagrama-de-Flujo---Fluster?node-id=0-1)

```mermaid
flowchart TD
    subgraph Público
        UC0([Acceder a la aplicación\nlogin / registro])
    end

    subgraph Operador
        UC1([Registrar contenedor\ncon foto y OCR])
        UC2([Ver mis contenedores])
        UC3([Eliminar contenedor\nsolo INACTIVO])
        UC4([Subir evento / foto])
    end

    subgraph Gestor
        UC5([Configurar navieras\ny tarifas D&D])
        UC6([Gestionar clientes])
        UC7([Revisar semáforo\nde riesgo])
        UC8([Gestionar almacén\neditar contenedores])
        UC9([Hacer transiciones\nde estado])
        UC10([Ver historial\ndel contenedor])
        UC11([Generar informe PDF])
    end

    subgraph Admin
        UC12([Gestionar usuarios\ny roles])
    end

    subgraph Cualquier_usuario_autenticado
        UC13([Cambiar nombre /\ncontraseña / foto de perfil])
        UC14([Usar OCR para\nextraer código BIC])
    end

    Operador --> UC0
    Gestor   --> UC0
    Admin    --> UC0

    Operador --> UC1
    Operador --> UC2
    Operador --> UC3
    Operador --> UC4

    Gestor --> UC5
    Gestor --> UC6
    Gestor --> UC7
    Gestor --> UC8
    Gestor --> UC9
    Gestor --> UC10
    Gestor --> UC11

    Admin --> UC12

    Operador --> UC13
    Gestor   --> UC13
    Admin    --> UC13
    Operador --> UC14
    Gestor   --> UC14
```

---

## 3. Diagramas de flujo de los procesos principales

> **Versión interactiva en FigJam:** [Diagrama de Flujo — Fluster](https://www.figma.com/board/RElpnz7nwahpUixOCr4vMq/Diagrama-de-Flujo---Fluster?node-id=0-1)

### Ciclo de vida del contenedor

```mermaid
flowchart TD
    START([Inicio]) --> A

    A["Operador registra el contenedor
    ─────────────────────────────
    codigoBIC · naviera · cliente
    tarifa · diasLibres · fechaInicioLibre
    POST /api/contenedores"]

    A --> B(["Estado: INACTIVO
    Free time en curso
    Sin coste acumulado"])

    B --> C{"¿Acción del gestor?"}

    C -->|"PATCH entrada-puerto"| D["Gestor registra entrada a puerto
    fechaEntradaPuerto = hoy"]
    C -->|"Cancelar / eliminar"| Z(["Contenedor eliminado"])

    D --> E(["Estado: PUERTO
    Demurrage activo
    Coste = días en puerto × tarifa"])

    E --> F{"¿Acción del gestor?"}

    F -->|"PATCH salida-puerto"| G["Gestor registra salida de puerto
    fechaSalidaPuerto = hoy"]
    F -->|"PATCH cancelar-ciclo"| B

    G --> H(["Estado: CLIENTE
    Detention activo
    Coste = días con cliente × tarifa"])

    H --> I{"¿Acción del gestor?"}

    I -->|"PATCH revertir-salida"| E
    I -->|"PATCH devolucion"| J["Gestor registra devolución
    fechaDevolucion = hoy"]
    I -->|"PATCH cancelar-ciclo"| B

    J --> K(["Estado: VUELTA_PUERTO
    Ciclo cerrado
    Coste total fijado"])

    K --> L{"¿Generar informe?"}
    L -->|"POST /api/informes"| M["Backend calcula coste final
    Snapshot inmutable del ciclo
    Genera PDF con jsPDF"]
    M --> N(["Informe PDF disponible
    para cotejar con factura
    de la naviera"])
    L -->|No por ahora| K

    style B   fill:#e8e8e8,color:#333
    style E   fill:#fff3cd,color:#333
    style H   fill:#fff3cd,color:#333
    style K   fill:#d4edda,color:#333
    style Z   fill:#f8d7da,color:#333
    style N   fill:#d1ecf1,color:#333
```

---

### Flujo de registro de contenedor con OCR

```mermaid
flowchart TD
    A([Operador accede a\n/meter-contenedor]) --> B[Rellena el formulario\nnaviera, cliente, tarifa,\ndías libres, fecha inicio]
    B --> C[Sube foto del contenedor]
    C --> D[Frontend envía imagen\nPOST /api/ocr/extraer-bic]
    D --> E{Tesseract.js\nlee el BIC}
    E -->|BIC detectado| F[Código BIC\nse autocompleta en el formulario]
    E -->|No detectado| G[Operador introduce\nel BIC manualmente]
    F --> H[Operador confirma\ny envía el formulario]
    G --> H
    H --> I[POST /api/contenedores\nestado inicial: INACTIVO]
    I --> J([Contenedor registrado\nvisible en /contenedores])
```

---

### Flujo de autenticación

```mermaid
flowchart TD
    A([Usuario accede a la app]) --> B{¿Tiene token\nválido en localStorage?}
    B -->|Sí| C[Se carga la página\ncorrespondiente a su rol]
    B -->|No / Expirado| D[Redirigido a /login]
    D --> E[Introduce correo y contraseña]
    E --> F[POST /api/auth/login]
    F --> G{¿Credenciales\ncorrectas?}
    G -->|No| H[Mensaje de error\nen el formulario]
    H --> E
    G -->|Sí| I[Backend devuelve JWT\ncon payload: id, correo, rol]
    I --> J[Frontend guarda token\nen localStorage]
    J --> K{¿Cuál es el rol?}
    K -->|gestor| L[Redirige a /semaforo]
    K -->|operador| M[Redirige a /contenedores]
    K -->|admin| N[Redirige a /panel-de-control]
```

---

### Flujo de cálculo D&D y semáforo de riesgo

```mermaid
flowchart TD
    A([Gestor accede a /semaforo]) --> B[GET /api/semaforo]
    B --> C[Backend obtiene todos\nlos contenedores activos]
    C --> D{Para cada contenedor}
    D --> E[Calcula días de demurrage\nfechaEntradaPuerto → hoy\nsi estado = PUERTO]
    D --> F[Calcula días de detention\nfechaEntradaPuerto → hoy\nsi estado = CLIENTE]
    E --> G[Aplica tramos de tarifa\ndesdeDia..hastaDia × precioPorDia]
    F --> G
    G --> H[Suma coste total acumulado]
    H --> I{Clasifica semáforo}
    I -->|Sin costes aún\nfree time activo| J[SIN_COSTES]
    I -->|Primer tramo\nde tarifa activo| K[PRIMER_TRAMO]
    I -->|Segundo tramo\no superior activo| L[SEGUNDO_TRAMO]
    I -->|Estado INACTIVO| M[INACTIVO]
    J & K & L & M --> N([Respuesta agrupada\npor estado de riesgo])
```

---

## 4. Arquitectura de la aplicación

La aplicación sigue una arquitectura de **tres capas** desacopladas: un frontend SPA, un backend API REST y una base de datos en la nube. La comunicación entre capas se realiza exclusivamente mediante HTTP/JSON con autenticación JWT.

```
┌──────────────────────────────┐
│        FRONTEND (SPA)        │
│  React 19 · Vite · SCSS      │
│  React Router 7 · Axios      │
│  JWT en localStorage         │
└──────────────┬───────────────┘
               │ HTTP/REST (JSON)
               │ Authorization: Bearer <JWT>
┌──────────────▼───────────────┐
│         BACKEND (API)        │
│  Node.js 22 · Express 5      │
│  Bcrypt · JWT · Tesseract.js │
│  Swagger UI en /api-docs     │
│  Motor de cálculo D&D        │
└──────────────┬───────────────┘
               │ Mongoose ODM
┌──────────────▼───────────────┐
│       BASE DE DATOS          │
│  MongoDB Atlas M0 (cloud)    │
│  7 colecciones               │
└──────────────────────────────┘
```

### Responsabilidades de cada capa

| Capa | Tecnología | Responsabilidad |
| :--- | :--- | :--- |
| Frontend | React 19 + Vite | Interfaz de usuario, navegación, consumo de la API |
| Backend | Node.js 22 + Express 5 | Lógica de negocio, autenticación, cálculo D&D, OCR |
| Base de datos | MongoDB Atlas M0 | Persistencia de documentos |

### Flujo de una petición protegida

1. El frontend envía la cabecera `Authorization: Bearer <token>` junto a la petición.
2. El `authMiddleware` verifica la firma del JWT y adjunta `req.usuario` (con `id`, `correo` y `rol`).
3. El `rolMiddleware` comprueba que `req.usuario.rol` se encuentra entre los roles permitidos para esa ruta.
4. El controlador delega la lógica en la capa de servicios.
5. El servicio accede al modelo Mongoose correspondiente.
6. La respuesta JSON viaja de vuelta hasta el frontend.

---

## 5. Diseño de la API (endpoints, métodos, respuestas)

Todos los endpoints siguen el prefijo `/api`. Las rutas están documentadas en Swagger UI bajo `/api-docs`.

**Autenticación:** todos los endpoints salvo `/api/auth/*` requieren la cabecera:

```
Authorization: Bearer <JWT>
```

El payload del JWT contiene `{ id, correo, rol }`.

**Formato de respuesta estándar:**

| Situación | Estructura JSON |
| :--- | :--- |
| Éxito con datos | `{ data: ..., mensaje: '...' }` o directamente el objeto |
| Éxito sin contenido | HTTP 204, sin cuerpo |
| Error de cliente | `{ mensaje: '...' }` |
| Error de servidor | `{ mensaje: '...' }` |

**Códigos HTTP utilizados:**

| Código | Significado |
| :--- | :--- |
| 200 | OK |
| 201 | Recurso creado |
| 204 | Sin contenido |
| 400 | Solicitud incorrecta |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | No encontrado |
| 409 | Conflicto (ej.: correo duplicado) |
| 422 | Entidad no procesable |
| 500 | Error interno del servidor |

---

#### Auth — `/api/auth`

| Método | Ruta | Roles | Descripción |
| :--- | :--- | :--- | :--- |
| POST | /api/auth/registro | Público | Registrar nuevo usuario |
| POST | /api/auth/login | Público | Autenticarse; devuelve JWT |

**Ejemplo — Registro (`POST /api/auth/registro`):**

```json
// Request body
{
  "nombre": "Ana García",
  "correo": "ana@empresa.com",
  "contrasena": "Segura123!",
  "rol": "operador"
}

// Response 201
{
  "mensaje": "Usuario registrado correctamente",
  "data": { "_id": "664a...", "nombre": "Ana García", "rol": "operador" }
}
```

**Ejemplo — Login (`POST /api/auth/login`):**

```json
// Request body
{
  "correo": "ana@empresa.com",
  "contrasena": "Segura123!"
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": { "_id": "664a...", "nombre": "Ana García", "rol": "operador" }
}
```

---

#### Usuarios — `/api/usuarios`

| Método | Ruta | Roles | Descripción |
| :--- | :--- | :--- | :--- |
| GET | /api/usuarios | admin | Listar todos los usuarios |
| GET | /api/usuarios/:id | admin | Obtener usuario por id |
| PUT | /api/usuarios/:id | admin | Actualizar usuario |
| DELETE | /api/usuarios/:id | admin | Eliminar usuario |
| PATCH | /api/usuarios/:id/nombre | cualquier autenticado | Cambiar nombre propio |
| PATCH | /api/usuarios/:id/contrasena | cualquier autenticado | Cambiar contraseña propia |
| PATCH | /api/usuarios/:id/foto | cualquier autenticado | Actualizar foto de perfil |

---

#### Navieras — `/api/navieras`

Acceso restringido a rol `gestor`.

| Método | Ruta | Roles | Descripción |
| :--- | :--- | :--- | :--- |
| GET | /api/navieras | gestor | Listar todas las navieras |
| GET | /api/navieras/:id | gestor | Obtener naviera por id |
| POST | /api/navieras | gestor | Crear naviera |
| PUT | /api/navieras/:id | gestor | Actualizar naviera |
| DELETE | /api/navieras/:id | gestor | Eliminar naviera |

---

#### Clientes — `/api/clientes`

Acceso restringido a rol `gestor`.

| Método | Ruta | Roles | Descripción |
| :--- | :--- | :--- | :--- |
| GET | /api/clientes | gestor | Listar todos los clientes |
| GET | /api/clientes/:id | gestor | Obtener cliente por id |
| POST | /api/clientes | gestor | Crear cliente |
| PUT | /api/clientes/:id | gestor | Actualizar cliente |
| DELETE | /api/clientes/:id | gestor | Eliminar cliente |

---

#### Contenedores — `/api/contenedores`

| Método | Ruta | Roles | Descripción |
| :--- | :--- | :--- | :--- |
| GET | /api/contenedores | operador, gestor | Listar contenedores |
| GET | /api/contenedores/:id | operador, gestor | Obtener contenedor |
| POST | /api/contenedores | operador | Crear contenedor |
| PUT | /api/contenedores/:id | gestor | Actualizar datos del contenedor |
| DELETE | /api/contenedores/:id | operador | Eliminar (solo si estado es INACTIVO) |
| PATCH | /api/contenedores/:id/editar | operador, gestor | Editar foto y fecha de inclusión |
| PATCH | /api/contenedores/:id/entrada-puerto | gestor | Registrar entrada a puerto (INACTIVO → PUERTO) |
| PATCH | /api/contenedores/:id/salida-puerto | gestor | Registrar salida de puerto (PUERTO → CLIENTE) |
| PATCH | /api/contenedores/:id/revertir-salida | gestor | Revertir salida de puerto (CLIENTE → PUERTO) |
| PATCH | /api/contenedores/:id/devolucion | gestor | Registrar devolución (CLIENTE → VUELTA_PUERTO) |
| PATCH | /api/contenedores/:id/cancelar-ciclo | gestor | Cancelar ciclo activo |

---

#### Eventos — `/api/eventos`

| Método | Ruta | Roles | Descripción |
| :--- | :--- | :--- | :--- |
| POST | /api/eventos | operador | Registrar evento con foto |
| GET | /api/eventos/contenedor/:contenedorId | operador, gestor | Listar eventos de un contenedor |

---

#### OCR — `/api/ocr`

| Método | Ruta | Roles | Descripción |
| :--- | :--- | :--- | :--- |
| POST | /api/ocr/extraer-bic | cualquier autenticado | Extraer código BIC de una imagen con Tesseract |

---

#### Semáforo — `/api/semaforo`

| Método | Ruta | Roles | Descripción |
| :--- | :--- | :--- | :--- |
| GET | /api/semaforo | gestor | Contenedores agrupados por nivel de riesgo D&D |

---

#### Informes — `/api/informes`

| Método | Ruta | Roles | Descripción |
| :--- | :--- | :--- | :--- |
| GET | /api/informes | gestor, admin | Listar todos los informes |
| GET | /api/informes/:id | gestor, admin | Obtener informe por id |
| GET | /api/informes/contenedor/:contenedorId | gestor, admin | Informes de un contenedor |
| POST | /api/informes | gestor, admin | Generar nuevo informe PDF |
| GET | /api/informes/generar-datos | gestor, admin | Generar datos de ejemplo |

---

#### Ciclos — `/api/ciclos`

| Método | Ruta | Roles | Descripción |
| :--- | :--- | :--- | :--- |
| PATCH | /api/ciclos/:id/demurrage | gestor | Editar tramos de demurrage de un ciclo |
| PATCH | /api/ciclos/:id/detention | gestor | Editar tramos de detention de un ciclo |

---

**Ejemplos curl**

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"ana@empresa.com","contrasena":"Segura123!"}'

# Listar contenedores (endpoint protegido)
curl http://localhost:5000/api/contenedores \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
