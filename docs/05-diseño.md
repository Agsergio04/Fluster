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
3. [Backend](#3-backend)
   - 3.1 [Estructura de carpetas](#31-estructura-de-carpetas)
   - 3.2 [Diseño de la API REST](#32-diseño-de-la-api-rest)
4. [Frontend](#4-frontend)
   - 4.1 [Estructura de carpetas](#41-estructura-de-carpetas)
   - 4.2 [Diseño de la interfaz](#42-diseño-de-la-interfaz)

---

## 1. Arquitectura general

> _Pendiente de redactar._

---

## 2. Base de datos

La base de datos utilizada es **MongoDB Atlas** (plan gratuito M0). El modelo sigue un esquema orientado a documentos con 7 colecciones. Los campos calculados (días de demurrage, coste acumulado, semáforo de riesgo) no se persisten — se calculan en el backend bajo demanda para mantener las colecciones ligeras.


### 2.1 Diagrama Entidad-Relación

> _Pendiente de añadir imagen en `assets/diagrama-er.png`._

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
| estado | Enum | Not Null | `INACTIVO` → `CARGADO` → `CLIENTE` → `VUELTA_PUERTO` |
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
| `CARGADO` | En Puerto | Demurrage (sobreestadía) |
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

## 3. Backend

### 3.1 Estructura de carpetas

> _Pendiente de redactar._

### 3.2 Diseño de la API REST

> _Pendiente de redactar._

---

## 4. Frontend

### 4.1 Estructura de carpetas

> _Pendiente de redactar._

### 4.2 Diseño de la interfaz

> _Pendiente de redactar._
