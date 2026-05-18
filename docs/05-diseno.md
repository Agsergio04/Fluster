# 05. Diseño del Sistema

## Índice
1. [Arquitectura general](#1-arquitectura-general)
2. [Base de datos](#2-base-de-datos)
   - 2.1 [Diagrama Entidad-Relación](#21-diagrama-entidad-relación)
   - 2.2 [Diccionario de datos](#22-diccionario-de-datos)
     - [usuarios](#usuarios)
     - [navieras](#navieras)
     - [clientes](#clientes)
     - [tarifas](#tarifas)
     - [contenedores](#contenedores)
     - [eventos](#eventos)
     - [informes](#informes)
   - 2.3 [Relaciones entre colecciones](#23-relaciones-entre-colecciones)
   - 2.4 [Diagrama de casos de uso](#24-diagrama-de-casos-de-uso)
   - 2.5 [Diagramas de flujo](#25-diagramas-de-flujo)
3. [Backend](#3-backend)
   - 3.1 [Estructura de carpetas](#31-estructura-de-carpetas)
   - 3.2 [Diseño de la API REST](#32-diseño-de-la-api-rest)
4. [Frontend](#4-frontend)
   - 4.1 [Estructura de carpetas](#41-estructura-de-carpetas)
   - 4.2 [Diseño de la interfaz](#42-diseño-de-la-interfaz)

---

## 1. Arquitectura general

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

## 2. Base de datos

La base de datos utilizada es **MongoDB Atlas** (plan gratuito M0). El modelo sigue un esquema orientado a documentos con 7 colecciones. Los campos calculados (días de demurrage, coste acumulado, semáforo de riesgo) no se persisten — se calculan en el backend bajo demanda para mantener las colecciones ligeras.


### 2.1 Diagrama Entidad-Relación

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
        String   codigo    "Unique"
    }
    clientes {
        ObjectId _id PK
        String   nombre
    }
    tarifas {
        ObjectId _id       PK
        ObjectId navieraId FK
        Array    diasDemurrage
        Array    diasDetention
        Date     creadoEn
    }
    contenedores {
        ObjectId _id              PK
        String   codigoBIC
        String   tipo
        String   estado           "INACTIVO | PUERTO | CLIENTE | VUELTA_PUERTO"
        ObjectId navieraId        FK
        ObjectId clienteId        FK
        ObjectId tarifaId         FK
        Number   diasLibres
        Date     fechaInicioLibre
        Date     fechaEntradaPuerto
        Date     fechaSalidaPuerto
        Date     fechaDevolucion
        ObjectId creadoPor        FK
        Date     creadoEn
    }
    eventos {
        ObjectId _id           PK
        ObjectId contenedorId  FK
        String   tipo          "entrada_puerto | salida_puerto | llegada_almacen | devolucion"
        Date     timestamp
        String   fotoUrl
        String   codigoBICOcr
        Boolean  ocrValidado
        ObjectId registradoPor FK
    }
    informes {
        ObjectId _id          PK
        ObjectId contenedorId FK
        String   codigoBIC    "snapshot"
        String   cliente      "snapshot"
        Array    tramos
        Number   total
        String   urlPdf
        ObjectId generadoPor  FK
        Date     generadoEn
    }

    usuarios    ||--o{ contenedores : "crea (creadoPor)"
    usuarios    ||--o{ eventos      : "registra (registradoPor)"
    usuarios    ||--o{ informes     : "genera (generadoPor)"
    navieras    ||--o{ contenedores : "propietaria (navieraId)"
    navieras    ||--o{ tarifas      : "tiene (navieraId)"
    clientes    ||--o{ contenedores : "asociado (clienteId)"
    tarifas     ||--o{ contenedores : "aplica (tarifaId)"
    contenedores ||--o{ eventos     : "ciclo de vida (contenedorId)"
    contenedores ||--o{ informes    : "genera (contenedorId)"
```

### 2.2 Diccionario de datos

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

Catálogo de navieras disponibles en el sistema. Cada contenedor pertenece a una naviera y hereda su tarifa D&D.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| _id | ObjectId | PK | Identificador de la naviera. |
| nombre | String | Not Null | Nombre comercial (ej: MSC, Maersk). |
| codigo | String | Unique, Not Null | Código identificador de la naviera. |

---

#### `clientes`

Empresas o personas asociadas a los contenedores. Se utilizan como referencia en informes.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| _id | ObjectId | PK | Identificador del cliente. |
| nombre | String | Not Null | Nombre del cliente o empresa. |

---

#### `tarifas`

Tabla de tarifas D&D configurada por naviera. Define los tramos de precio por día para demurrage (sobreestadía) y detention (detención).

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| _id | ObjectId | PK | Identificador de la tarifa. |
| navieraId | ObjectId | FK `navieras._id` | Naviera a la que aplica esta tarifa. |
| diasDemurrage | Array | Not Null | Tramos de demurrage: `[{ desdeDia, hastaDia, precioPorDia }]` |
| diasDetention | Array | Not Null | Tramos de detention: `[{ desdeDia, hastaDia, precioPorDia }]` |
| creadoEn | Date | Not Null | Fecha de creación. |

**Ejemplo de `diasDemurrage`:**
```json
[
  { "desdeDia": 1,  "hastaDia": 5,    "precioPorDia": 50  },
  { "desdeDia": 6,  "hastaDia": 10,   "precioPorDia": 75  },
  { "desdeDia": 11, "hastaDia": null,  "precioPorDia": 120 }
]
```

---

#### `contenedores`

Entidad central del sistema. Registra el ciclo de vida de cada contenedor desde su entrada hasta su devolución. Los costes y el semáforo de riesgo se calculan en el backend a partir de las fechas y la tarifa asignada.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| _id | ObjectId | PK | Identificador del contenedor. |
| codigoBIC | String | Not Null | Código BIC del contenedor (ej: MSCU1234567). |
| tipo | String | Not Null | Tipo de contenedor (20ft, 40ft, Reefer…). |
| estado | Enum | Not Null | `INACTIVO` → `PUERTO` → `CLIENTE` → `VUELTA_PUERTO` |
| navieraId | ObjectId | FK `navieras._id` | Naviera propietaria del contenedor. |
| clienteId | ObjectId | FK `clientes._id` | Cliente asociado al movimiento. |
| tarifaId | ObjectId | FK `tarifas._id` | Tarifa D&D aplicada. |
| diasLibres | Number | Not Null | Días de free time concedidos por la naviera. |
| fechaInicioLibre | Date | Not Null | Inicio del período de free time. |
| fechaEntradaPuerto | Date | Nullable | Inicio del tramo En Puerto (activa demurrage). |
| fechaSalidaPuerto | Date | Nullable | Inicio del tramo Con Cliente (activa detention). |
| fechaDevolucion | Date | Nullable | Devolución del contenedor (cierre). |
| creadoPor | ObjectId | FK `usuarios._id` | Operador que registró el contenedor. |
| creadoEn | Date | Not Null | Fecha de alta. |

**Estados del contenedor:**

| Estado | Tramo activo | Coste generado |
| :--- | :--- | :--- |
| `INACTIVO` | Free time | Sin coste |
| `PUERTO` | En Puerto | Demurrage (sobreestadía) |
| `CLIENTE` | Con Cliente | Detention (detención) |
| `VUELTA_PUERTO` | Cerrado | Sin coste adicional |

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
| codigoBICOcr | String | Nullable | Código BIC leído por Tesseract OCR. |
| ocrValidado | Boolean | Default false | Indica si el OCR coincidió con el BIC del contenedor. |
| registradoPor | ObjectId | FK `usuarios._id` | Operador que registró el evento. |

---

#### `informes`

Documento generado por el gestor al finalizar un movimiento. Almacena un snapshot de los datos en el momento de generación para garantizar su inmutabilidad, ya que las tarifas pueden cambiar con el tiempo.

| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| _id | ObjectId | PK | Identificador del informe. |
| contenedorId | ObjectId | FK `contenedores._id` | Contenedor del informe. |
| codigoBIC | String | Snapshot | Código BIC en el momento de generación. |
| cliente | String | Snapshot | Nombre del cliente en el momento de generación. |
| tramos | Array | Not Null | `[{ tipo, fechaInicio, fechaFin, dias, precioPorDia, subtotal }]` |
| total | Number | Not Null | Suma total de todos los tramos. |
| urlPdf | String | Not Null | URL del PDF generado. |
| generadoPor | ObjectId | FK `usuarios._id` | Gestor que generó el informe. |
| generadoEn | Date | Not Null | Fecha de generación. |

---

### 2.3 Relaciones entre colecciones

```
usuarios     ──< contenedores   (creadoPor)
usuarios     ──< eventos        (registradoPor)
usuarios     ──< informes       (generadoPor)
navieras     ──< contenedores   (navieraId)
navieras     ──< tarifas        (navieraId)
clientes     ──< contenedores   (clienteId)
tarifas      ──< contenedores   (tarifaId)
contenedores ──< eventos        (contenedorId)
contenedores ──< informes       (contenedorId)
```

---

## 2.4 Diagrama de casos de uso

> 📋 **Versión interactiva en FigJam:** [Diagrama de Flujo — Fluster](https://www.figma.com/board/RElpnz7nwahpUixOCr4vMq/Diagrama-de-Flujo---Fluster?node-id=0-1)

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

## 2.5 Diagramas de flujo

> 📋 **Versión interactiva en FigJam:** [Diagrama de Flujo — Fluster](https://www.figma.com/board/RElpnz7nwahpUixOCr4vMq/Diagrama-de-Flujo---Fluster?node-id=0-1)

### Ciclo de vida del contenedor

```mermaid
flowchart TD
    START([Inicio]) --> A

    A["🟤 Operador registra el contenedor
    ─────────────────────────────
    codigoBIC · naviera · cliente
    tarifa · diasLibres · fechaInicioLibre
    POST /api/contenedores"]

    A --> B(["Estado: INACTIVO
    ⚪ Free time en curso
    Sin coste acumulado"])

    B --> C{"¿Acción del gestor?"}

    C -->|"PATCH entrada-puerto"| D["Gestor registra entrada a puerto
    fechaEntradaPuerto = hoy"]
    C -->|"Cancelar / eliminar"| Z(["Contenedor eliminado"])

    D --> E(["Estado: PUERTO
    🟡 / 🔴 Demurrage activo
    Coste = días en puerto × tarifa"])

    E --> F{"¿Acción del gestor?"}

    F -->|"PATCH salida-puerto"| G["Gestor registra salida de puerto
    fechaSalidaPuerto = hoy"]
    F -->|"PATCH cancelar-ciclo"| B

    G --> H(["Estado: CLIENTE
    🟡 / 🔴 Detention activo
    Coste = días con cliente × tarifa"])

    H --> I{"¿Acción del gestor?"}

    I -->|"PATCH revertir-salida"| E
    I -->|"PATCH devolucion"| J["Gestor registra devolución
    fechaDevolucion = hoy"]
    I -->|"PATCH cancelar-ciclo"| B

    J --> K(["Estado: VUELTA_PUERTO
    ✅ Ciclo cerrado
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
    I -->|Sin costes aún\nfree time activo| J[🟢 SIN_COSTES]
    I -->|Primer tramo\nde tarifa activo| K[🟡 PRIMER_TRAMO]
    I -->|Segundo tramo\no superior activo| L[🔴 SEGUNDO_TRAMO]
    I -->|Estado INACTIVO| M[⚪ INACTIVO]
    J & K & L & M --> N([Respuesta agrupada\npor estado de riesgo])
```

---

## 3. Backend

### 3.1 Estructura de carpetas

El backend sigue una arquitectura en capas (rutas → controladores → servicios → modelos) que separa claramente las responsabilidades. Los middlewares transversales (autenticación, roles, errores) se aplican en el punto de montaje de rutas.

```
backend/
├── Dockerfile
├── package.json
└── src/
    ├── index.js              # App Express, montaje de rutas, arranque del servidor
    ├── swagger.json          # Especificación OpenAPI para Swagger UI
    ├── config/
    │   └── db.js             # Conexión a MongoDB Atlas mediante Mongoose
    ├── controllers/          # Capa fina: recibe req/res y delega en servicios
    │   ├── authController.js
    │   ├── cicloController.js
    │   ├── clienteController.js
    │   ├── contenedorController.js
    │   ├── eventoController.js
    │   ├── informeController.js
    │   ├── navieraController.js
    │   ├── ocrController.js
    │   ├── semaforoController.js
    │   └── usuarioController.js
    ├── services/             # Lógica de negocio (cálculo D&D, validaciones)
    │   ├── authService.js
    │   ├── cicloService.js
    │   ├── clienteService.js
    │   ├── contenedorService.js
    │   ├── eventoService.js
    │   ├── informeService.js
    │   ├── navieraService.js
    │   ├── ocrService.js
    │   ├── semaforoService.js
    │   └── usuarioService.js
    ├── models/               # Esquemas Mongoose (uno por colección)
    │   ├── Usuario.js
    │   ├── Naviera.js
    │   ├── Cliente.js
    │   ├── Tarifa.js
    │   ├── Contenedor.js
    │   ├── Evento.js
    │   └── Informe.js
    ├── routes/               # Routers Express con guardas de rol
    │   ├── auth.js
    │   ├── ciclos.js
    │   ├── clientes.js
    │   ├── contenedores.js
    │   ├── eventos.js
    │   ├── informes.js
    │   ├── navieras.js
    │   ├── ocr.js
    │   ├── semaforo.js
    │   └── usuarios.js
    ├── middlewares/
    │   ├── authMiddleware.js  # Verificación JWT; adjunta req.usuario (id, correo, rol)
    │   ├── rolMiddleware.js   # Control de acceso por rol: verificarRol('gestor', ...)
    │   └── errorMiddleware.js # Manejador centralizado de errores (status + mensaje)
    └── tests/                # Tests unitarios con Jest
        ├── controllers/      # Tests de controladores (servicios mockeados)
        ├── services/         # Tests de servicios (modelos mockeados)
        └── middlewares/      # Tests de middlewares (req/res mockeados)
```

**Convenciones de la capa de servicios**

- Los servicios nunca acceden directamente a `req` ni `res`; reciben parámetros planos y devuelven datos o lanzan errores.
- El motor de cálculo D&D reside en `cicloService.js` y `semaforoService.js`. Aplica los tramos de tarifa sobre las fechas del contenedor para obtener el coste acumulado y el nivel de riesgo sin necesidad de persistir esos valores.
- `ocrService.js` encapsula la invocación de Tesseract.js para la extracción del código BIC a partir de la imagen recibida.

---

### 3.2 Diseño de la API REST

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

---

## 4. Frontend

### 4.1 Estructura de carpetas

El frontend sigue **Atomic Design** para los componentes y la metodología **ITCSS** para los estilos, con archivos SCSS organizados en capas de especificidad creciente.

```
frontend/
├── Dockerfile
├── nginx.conf               # Configuración de Nginx para enrutamiento SPA
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # Punto de entrada React DOM
    ├── App.jsx               # Componente raíz → AppRouter
    ├── assets/
    │   └── images/           # Imágenes estáticas (logos, etc.)
    ├── components/           # Componentes organizados por Atomic Design
    │   ├── atomos/           # Unidades mínimas reutilizables (botones, inputs, badges…)
    │   │   └── ...
    │   ├── moleculas/        # Composiciones de átomos (tarjetas, filas de tabla…)
    │   │   └── ...
    │   └── organismos/       # Componentes complejos (cabecera, modales…)
    │       ├── Header.jsx
    │       ├── Footer.jsx
    │       ├── ModalEditarContenedor.jsx
    │       └── ModalEntradaPuerto.jsx
    ├── hooks/                # Custom hooks de React
    │   ├── useContenedores.js  # Fetch y estado para la lista de contenedores
    │   ├── useHistorial.js     # Fetch y estado para el historial de un contenedor
    │   └── useTema.js          # Toggle dark/light con persistencia en localStorage
    ├── pages/                # Páginas completas (una por ruta)
    │   ├── home/
    │   ├── login/
    │   ├── registro/
    │   ├── semaforo/
    │   ├── tarifas/
    │   ├── almacen/
    │   ├── historial_contenedor/
    │   ├── contenedores/
    │   ├── meter_contenedor/
    │   ├── panel_de_control/
    │   ├── perfil/
    │   ├── guia_estilos/
    │   ├── terminos/
    │   ├── privacidad/
    │   ├── cookies/
    │   ├── contacto/
    │   └── error/
    ├── router/
    │   ├── AppRouter.jsx       # BrowserRouter + definición de todas las rutas + Footer
    │   ├── RutaProtegida.jsx   # Guarda de ruta por rol; redirige si no autorizado
    │   └── RutaPublica.jsx     # Redirige al inicio si el usuario ya está autenticado
    ├── services/               # Funciones de llamada a la API con Axios
    │   ├── session.js          # Helpers de almacenamiento y lectura del JWT
    │   └── ...                 # Un archivo por dominio (contenedores, navieras…)
    └── styles/                 # Arquitectura ITCSS
        ├── main.scss           # Importa todas las capas en orden de especificidad
        ├── 00-settings/        # Variables CSS y Sass (colores, tipografía, espaciados)
        ├── 01-tools/           # Mixins y funciones Sass
        ├── 02-generic/         # Reset y normalize
        ├── 03-elements/        # Estilos base de etiquetas HTML
        ├── 04-layout/          # Grid y estructura de página
        ├── 05-components/      # SCSS específico de componentes (nomenclatura BEM)
        └── 06-utilities/       # Clases de utilidad (visibilidad, alineación…)
```

**Convenciones de la capa de servicios**

- Cada archivo en `services/` exporta funciones que realizan una única llamada Axios y devuelven `response.data`.
- `session.js` centraliza la lectura (`getToken`), escritura (`setToken`) y eliminación (`removeToken`) del JWT en `localStorage`, de modo que el resto del código no accede directamente al storage.
- Los custom hooks gestionan el estado de carga (`loading`), los datos (`data`) y los errores (`error`) de forma homogénea, evitando repetición en las páginas.

---

### 4.2 Diseño de la interfaz

La interfaz está orientada a operadores de logística que trabajan principalmente desde escritorio. El diseño prioriza la densidad de información en tablas y la claridad en los indicadores de riesgo D&D.

**Paleta y tema**

La aplicación soporta modo claro y modo oscuro, gestionados mediante el hook `useTema`. Los tokens de color se definen en `styles/00-settings/` como variables CSS, lo que permite cambiar el tema sin reescribir los componentes.

**Páginas principales**

| Página | Ruta | Roles | Descripción |
| :--- | :--- | :--- | :--- |
| Home | `/` | Público | Presentación de la aplicación y acceso al login |
| Login | `/login` | Público | Formulario de autenticación |
| Registro | `/registro` | Público | Alta de nuevo usuario |
| Semáforo | `/semaforo` | gestor | Vista de riesgo D&D agrupada por nivel (verde / ámbar / rojo) |
| Tarifas | `/tarifas` | gestor | Gestión de navieras y sus tramos D&D |
| Almacén | `/almacen` | operador, gestor | Listado de contenedores en almacén con estado visual |
| Meter contenedor | `/meter-contenedor` | operador | Formulario de alta de contenedor con OCR de código BIC |
| Historial | `/historial/:id` | operador, gestor | Línea de tiempo de eventos de un contenedor |
| Panel de control | `/panel` | admin | Gestión de usuarios del sistema |
| Perfil | `/perfil` | cualquier autenticado | Edición de nombre, contraseña y foto de perfil |
| Error | `*` | Público | Página 404 para rutas desconocidas |

**Componentes clave**

- **Semáforo de riesgo:** cada contenedor muestra un indicador de color (verde, ámbar, rojo) calculado en el backend según los días transcurridos respecto a los tramos de tarifa.
- **Tabla de tarifas editable:** permite al gestor modificar los tramos D&D directamente en la celda, con guardado fila a fila mediante llamada a la API.
- **Modal de entrada a puerto:** recoge el nombre del cliente y registra la transición de estado `INACTIVO → PUERTO`, iniciando el cómputo de demurrage.
- **OCR de código BIC:** en el formulario de alta de contenedor, el operador puede subir una fotografía del contenedor y el sistema extrae automáticamente el código BIC mediante Tesseract.js.
- **Rutas protegidas:** `RutaProtegida` comprueba el rol del usuario almacenado en el JWT antes de renderizar cada página; en caso de acceso no autorizado redirige a `/error`.
