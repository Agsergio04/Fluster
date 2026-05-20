# 07 - Pruebas

Este documento describe la estrategia de pruebas aplicada en Fluster, los tipos de tests implementados, la metodología de mocking utilizada y los resultados obtenidos, junto con las instrucciones para ejecutar los tests y las mejoras planificadas para el futuro.

---

## 1. Metodología de pruebas

La estrategia de pruebas de Fluster cubre **backend y frontend** con herramientas distintas adaptadas a cada entorno.

En el **backend**, el foco es la lógica de negocio crítica (cálculo de costes D&D, autenticación, control de acceso). El enfoque es de tests unitarios con aislamiento de dependencias externas (base de datos, servicios OCR), inspirado en TDD para las capas de servicio: los servicios de cálculo se diseñaron pensando en su testabilidad antes de escribir su implementación.

En el **frontend**, los tests cubren las utilidades de sesión, los hooks personalizados y los componentes atómicos más reutilizables de la aplicación, verificando comportamiento, accesibilidad e interacciones del usuario.

Las pruebas se organizan en cinco niveles:

| Nivel | Qué se prueba | Herramienta |
|---|---|---|
| Servicios (backend) | Lógica de negocio pura | Jest |
| Controladores (backend) | Ciclo petición/respuesta HTTP | Jest + mocks de servicios |
| Middlewares (backend) | Autenticación y autorización | Jest |
| Utilidades y hooks (frontend) | `session.js`, `useTema`, `useContenedores` | Vitest + React Testing Library |
| Componentes (frontend) | `Spinner`, `Input`, `InputContrasenia`, `Notificacion` | Vitest + React Testing Library |

**Integración continua:** los tests de ambas capas se ejecutan automáticamente en cada `push` o Pull Request a las ramas `main` o `dev` mediante el workflow `ci.yml` de GitHub Actions, garantizando que el código en `main` siempre pasa todos los tests.

---

## 2. Tipos de pruebas realizadas

### 2.1 Pruebas unitarias de servicios — backend (9 archivos)

Los tests de servicios validan la lógica de negocio en aislamiento, sin conexión a la base de datos. Los modelos de Mongoose se sustituyen por mocks de Jest para que los tests sean rápidos y deterministas.

| Archivo de test | Qué valida |
|---|---|
| `authService.test.js` | Registro: comprobación de email único, hash bcrypt de la contraseña. Login: comparación de contraseña, firma del JWT. |
| `contenedorService.test.js` | Transiciones de estado del contenedor, cálculo de costes D&D con múltiples tramos tarifarios, manejo de días libres. |
| `semaforoService.test.js` | Clasificación del nivel de riesgo (`sin_costes`, `primer_tramo`, `segundo_tramo`, `inactivo`) según los días transcurridos respecto a los días libres y los tramos de cada naviera. |
| `navieraService.test.js` | CRUD de navieras: creación, consulta, actualización, eliminación. Manejo de 404 cuando la naviera no existe. |
| `clienteService.test.js` | CRUD de clientes con los mismos escenarios: éxito y recurso no encontrado. |
| `informeService.test.js` | Generación de informes: inmutabilidad del snapshot una vez creado, datos agregados correctos. |
| `eventoService.test.js` | Registro de eventos: asociación al contenedor correcto, persistencia de foto en base64. |
| `cicloService.test.js` | Gestión de ciclos: apertura, cierre, edición manual de fechas y recálculo de costes. |
| `usuarioService.test.js` | CRUD de usuarios: cambio de rol, actualización de perfil, eliminación. |

El test más representativo de la lógica de negocio es `contenedorService.test.js`, que incluye casos con un único tramo tarifario, con dos tramos, con días en el límite exacto entre tramos y con periodo dentro de los días libres (coste cero esperado).

### 2.2 Pruebas de controladores — backend (11 archivos)

Los tests de controladores validan el ciclo completo de petición HTTP → llamada al servicio → respuesta HTTP. Los servicios se mockean con `jest.fn()` para aislar el controlador de la lógica de negocio ya probada en los tests de servicios.

Para cada controlador se prueban al menos los siguientes escenarios:

- **Éxito (2xx):** la operación se ejecuta correctamente y la respuesta contiene los datos esperados con el código de estado correcto.
- **Recurso no encontrado (404):** el servicio devuelve `null` o lanza un error de tipo "no encontrado" y el controlador responde con 404.
- **Conflicto (409):** para operaciones de creación con datos duplicados (email ya registrado, nombre de naviera ya existente).
- **Error de validación (422):** cuando los datos de la petición no superan la validación de Mongoose.

| Archivo de test | Controlador cubierto |
|---|---|
| `authController.test.js` | `POST /api/auth/registro`, `POST /api/auth/login` |
| `contenedorController.test.js` | CRUD de contenedores y todos los endpoints de transición de estado |
| `usuarioController.test.js` | CRUD de usuarios, cambio de rol |
| `navieraController.test.js` | CRUD de navieras |
| `clienteController.test.js` | CRUD de clientes |
| `eventoController.test.js` | Registro de eventos con foto |
| `informeController.test.js` | Generación y listado de informes |
| `semaforoController.test.js` | `GET /api/semaforo` con clasificación por riesgo |
| `ocrController.test.js` | `POST /api/ocr/extraer-bic` con resultado exitoso y con fallo de OCR |
| `cicloController.test.js` | Edición manual de tramos de ciclo |
| `healthController.test.js` | `GET /health` |

### 2.3 Pruebas de middlewares — backend (2 archivos)

Los tests de middlewares verifican el comportamiento del sistema de autenticación y autorización de forma independiente del resto de la aplicación.

**`authMiddleware.test.js`** cubre tres escenarios:

| Escenario | Resultado esperado |
|---|---|
| Petición sin cabecera `Authorization` | Respuesta 401 con mensaje de token no proporcionado |
| Petición con token inválido o expirado | Respuesta 401 con mensaje de token inválido |
| Petición con token válido | `req.usuario` se popula con el payload del JWT y se llama a `next()` |

**`rolMiddleware.test.js`** cubre:

| Escenario | Resultado esperado |
|---|---|
| Usuario con rol incluido en los roles permitidos | Se llama a `next()` |
| Usuario con rol NO incluido en los roles permitidos | Respuesta 403 |

### 2.4 Pruebas de utilidades y hooks — frontend (3 archivos)

Los tests de frontend se ejecutan con **Vitest** y **jsdom** como entorno de navegador simulado. Los módulos externos (servicios Axios) se mockean con `vi.mock()` para aislar los hooks de la red.

**`session.test.js`** — cubre las 6 funciones de `services/session.js`:

| Escenario | Resultado esperado |
|---|---|
| `guardarSesion(token, usuario)` | Persiste token y usuario serializado en `sessionStorage` |
| `limpiarSesion()` | Elimina token y usuario de `sessionStorage` |
| `getToken()` con sesión activa | Devuelve el token guardado |
| `getToken()` sin sesión | Devuelve `null` |
| `getUsuario()` con sesión activa | Devuelve el objeto usuario deserializado |
| `getUsuario()` sin sesión | Devuelve `null` |
| `isAuthenticated()` con token | Devuelve `true` |
| `isAuthenticated()` sin token | Devuelve `false` |
| `actualizarUsuario(cambios)` | Aplica merge parcial conservando propiedades no modificadas |
| `actualizarUsuario()` sin sesión | No modifica `sessionStorage` |

**`useTema.test.jsx`** — cubre el hook `hooks/useTema.js`:

| Escenario | Resultado esperado |
|---|---|
| Sin preferencia guardada ni de sistema | Devuelve `'light'` |
| Preferencia del sistema `dark` | Devuelve `'dark'` |
| Valor guardado en `localStorage` | Tiene prioridad sobre la preferencia del sistema |
| Primer render | Aplica `data-theme` en `documentElement` |
| `toggleTema()` desde `light` | Cambia a `'dark'` |
| `toggleTema()` desde `dark` | Cambia a `'light'` |
| `toggleTema()` | Persiste el nuevo valor en `localStorage` y actualiza `data-theme` |

**`useContenedores.test.jsx`** — cubre el hook `hooks/useContenedores.js`:

| Escenario | Resultado esperado |
|---|---|
| Estado inicial | `contenedores = []`, `cargando = true`, `aviso = ''` |
| Petición exitosa | `contenedores` se rellena, `cargando` pasa a `false` |
| Petición fallida | `aviso` se rellena con el mensaje de error, `cargando` pasa a `false` |
| `setContenedores(nuevos)` | Actualiza la lista localmente sin nueva petición |

### 2.5 Pruebas de componentes — frontend (4 archivos)

**`Spinner.test.jsx`** — cubre `components/atomos/Spinner.jsx`:
- Renderiza con tamaño por defecto (`md`) y con tamaños `sm` y `lg`.
- Siempre tiene la clase base `spinner`.
- Tiene `role="status"` y `aria-label="Cargando"` para accesibilidad.

**`Input.test.jsx`** — cubre `components/atomos/Input.jsx`:
- Renderiza el label cuando se proporciona; no lo renderiza si se omite.
- Muestra el mensaje de error y aplica la clase `input--error`.
- Muestra el hint solo cuando no hay error (el error tiene prioridad).
- Muestra el indicador de campo requerido (`<abbr title="required">`) cuando `required=true`.
- Llama a `onChange` al escribir en el campo.
- Deshabilita el input cuando `disabled=true`.

**`InputContrasenia.test.jsx`** — cubre `components/atomos/InputContrasenia.jsx`:
- El input es de tipo `password` por defecto.
- El botón del ojo tiene `aria-label="Mostrar contraseña"` inicialmente.
- Al pulsar el botón, el input pasa a tipo `text` y el aria-label cambia a `"Ocultar contraseña"`.
- Al pulsar dos veces vuelve al tipo `password`.
- El hint no aparece cuando hay error.

**`Notificacion.test.jsx`** — cubre `components/atomos/Notificacion.jsx`:
- No renderiza nada cuando `mensaje` está vacío.
- Renderiza el mensaje con `role="alert"`.
- Llama a `onCerrar` al hacer clic en el botón de cierre.
- Llama a `onCerrar` automáticamente tras 4000 ms (duración por defecto).
- Respeta una duración personalizada sin llamar a `onCerrar` antes de tiempo.

---

## 3. Estrategia de mocking

### 3.1 Modelos de Mongoose — backend

Los modelos de la base de datos se mockean completamente con `jest.mock()`:

```javascript
jest.mock('../models/Contenedor')
jest.mock('../models/Naviera')
// etc.
```

Esto sustituye el modelo real por un objeto con métodos mock (`find`, `findById`, `save`, etc.) que devuelven los valores que el test define. Las pruebas nunca abren una conexión real a MongoDB.

### 3.2 Servicios en tests de controladores — backend

Cuando se prueban controladores, los servicios que estos invocan se mockean con `jest.fn()`:

```javascript
jest.mock('../services/contenedorService')
contenedorService.listarContenedores.mockResolvedValue([...])
```

Esto permite probar que el controlador maneja correctamente tanto los casos de éxito como los de error del servicio, sin depender de la implementación real del servicio.

### 3.3 Dependencias externas — backend

- **Tesseract.js:** se mockea en los tests de `ocrController` para evitar el coste computacional del motor OCR real y garantizar resultados deterministas. El mock devuelve un código BIC predefinido en el caso de éxito o un resultado vacío en el caso de fallo.
- **bcrypt:** se espía con `jest.spyOn(bcrypt, 'hash')` y `jest.spyOn(bcrypt, 'compare')` en los tests de `authService` para verificar que se invoca correctamente sin ejecutar el hash real.
- **jsonwebtoken:** se espía con `jest.spyOn(jwt, 'sign')` y `jest.spyOn(jwt, 'verify')` en los tests de autenticación y middleware.

### 3.4 Servicios Axios en hooks — frontend

Los hooks que realizan peticiones HTTP se prueban con el servicio Axios mockeado mediante `vi.mock()` de Vitest:

```javascript
vi.mock('../../services/contenedorService', () => ({
  listarContenedores: vi.fn(),
}))
```

Esto permite simular respuestas exitosas (`mockResolvedValue`) y errores de red (`mockRejectedValue`) de forma determinista sin necesidad de red real.

### 3.5 APIs del navegador — frontend

Los hooks que acceden a APIs del navegador (`localStorage`, `matchMedia`) se prueban con el entorno jsdom de Vitest. `localStorage` y `sessionStorage` están disponibles en jsdom; `window.matchMedia` se mockea manualmente ya que jsdom no lo implementa:

```javascript
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: prefersDark,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
})
```

---

## 4. Cómo ejecutar los tests

### Backend

Todos los tests del backend se encuentran en `backend/tests/`, organizado en subdirectorios `controllers/`, `services/` y `middlewares/`.

```bash
cd backend

# Ejecutar todos los tests
npm test

# Ejecutar con informe de cobertura
npm test -- --coverage

# Modo watch (reejecutar al guardar cambios)
npm test -- --watch

# Ejecutar solo un archivo específico
npm test -- authService
```

El comando `npm test` no requiere variables de entorno reales; el workflow de CI la proporciona como `JWT_SECRET=test-secret`.

### Frontend

Los tests del frontend se encuentran en `frontend/src/tests/`, organizado en subdirectorios `services/`, `hooks/` y `components/`.

```bash
cd frontend

# Ejecutar todos los tests
npm test

# Modo watch
npm run test:watch

# Ejecutar con informe de cobertura
npm run test:coverage
```

---

## 5. Cobertura

### Backend

Resultados obtenidos ejecutando `npm test -- --coverage` sobre la suite completa (**203 tests, 21 suites**):

```
--------------------------|---------|----------|---------|---------|-----------------------
Archivo                   | % Stmts | % Branch | % Funcs | % Lines | Líneas no cubiertas
--------------------------|---------|----------|---------|---------|-----------------------
All files                 |   83.31 |    68.04 |   84.76 |   84.89 |
 controllers              |   93.45 |    78.57 |     100 |    93.7 |
  authController.js       |     100 |      100 |     100 |     100 |
  cicloController.js      |   98.71 |       75 |     100 |     100 | 12,30,35,47,69-74,84
  clienteController.js    |    90.9 |      100 |     100 |    90.9 | 17,35
  contenedorController.js |   85.45 |    66.66 |     100 |   86.53 | 18,36,55,64,73,87,105
  eventoController.js     |     100 |      100 |     100 |     100 |
  informeController.js    |    90.9 |      100 |     100 |    90.9 | 18,27
  navieraController.js    |    90.9 |      100 |     100 |    90.9 | 17,35
  ocrController.js        |     100 |      100 |     100 |     100 |
  semaforoController.js   |     100 |      100 |     100 |     100 |
  usuarioController.js    |    92.5 |      100 |     100 |    92.5 | 26,42,77
 middlewares              |     100 |      100 |     100 |     100 |
  authMiddleware.js       |     100 |      100 |     100 |     100 |
  rolMiddleware.js        |     100 |      100 |     100 |     100 |
 models                   |     100 |      100 |     100 |     100 |
 services                 |   75.73 |    64.21 |   72.88 |   78.25 |
  authService.js          |     100 |      100 |     100 |     100 |
  cicloService.js         |     100 |      100 |     100 |     100 |
  clienteService.js       |     100 |      100 |     100 |     100 |
  contenedorService.js    |   80.15 |    78.43 |   83.33 |   79.52 | 66,147-149,351-405
  eventoService.js        |     100 |      100 |     100 |     100 |
  informeService.js       |   44.28 |    29.54 |   36.36 |   46.77 | 104-162
  navieraService.js       |   67.34 |       50 |   66.66 |   72.72 | 111-138
  ocrService.js           |   15.62 |        0 |       0 |      20 | 12-41
  semaforoService.js      |   98.18 |    96.15 |     100 |     100 | 45
  usuarioService.js       |   90.16 |    88.88 |   83.33 |   90.16 | 143-152
--------------------------|---------|----------|---------|---------|-----------------------
```

**Resumen backend:**

| Capa | Sentencias | Ramas | Funciones | Líneas |
|---|---|---|---|---|
| **Middlewares** | 100 % | 100 % | 100 % | 100 % |
| **Modelos** | 100 % | 100 % | 100 % | 100 % |
| **Controladores** | 93.45 % | 78.57 % | 100 % | 93.7 % |
| **Servicios** | 75.73 % | 64.21 % | 72.88 % | 78.25 % |
| **Total** | **83.31 %** | **68.04 %** | **84.76 %** | **84.89 %** |

La baja cobertura de ramas en servicios se debe principalmente a `informeService.js` (lógica de generación de PDF con jsPDF, difícil de testear sin entorno de browser real) y `ocrService.js` (integración con Tesseract.js, mockeada en los tests de controlador pero no probada internamente).

### Frontend

Resultados obtenidos ejecutando `npm run test:coverage` sobre la suite completa (**58 tests, 7 suites**):

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    91.07 |     100 |     100 |
 components/atomos |     100 |    89.13 |     100 |     100 |
  Input.jsx        |     100 |    88.88 |     100 |     100 | 25-26
  InputContrasenia |     100 |    86.36 |     100 |     100 | 46,55,84
 hooks             |     100 |      100 |     100 |     100 |
  useTema.js       |     100 |      100 |     100 |     100 |
  useContenedores  |     100 |      100 |     100 |     100 |
 services          |     100 |      100 |     100 |     100 |
  session.js       |     100 |      100 |     100 |     100 |
-------------------|---------|----------|---------|---------|-------------------
```

**Resumen frontend:**

| Capa | Sentencias | Ramas | Funciones | Líneas |
|---|---|---|---|---|
| **Servicios (session.js)** | 100 % | 100 % | 100 % | 100 % |
| **Hooks** | 100 % | 100 % | 100 % | 100 % |
| **Componentes** | 100 % | 89.13 % | 100 % | 100 % |
| **Total** | **100 %** | **91.07 %** | **100 %** | **100 %** |

Las ramas no cubiertas en los componentes corresponden a las props opcionales `variant` y `size` de `Input` (modificadores CSS) y al renderizado condicional del `hint` sin label en `InputContrasenia`; son ramas de presentación sin lógica de negocio.

---

## 6. Resultados

**Backend:** todos los tests pasan en el entorno de CI de GitHub Actions. El workflow `ci.yml` ejecuta `npm test` en el job `test-backend` en cada push o Pull Request a `main` o `dev`. El número total de tests es **203** distribuidos en **21 suites** (11 de controladores + 9 de servicios + 2 de middlewares), con cero fallos en la ejecución final del proyecto.

**Frontend:** todos los tests pasan con **58 tests** en **7 suites** (4 de componentes + 2 de hooks + 1 de servicios), 100% de sentencias y funciones cubiertas.

**Total combinado: 261 tests, 28 suites.**

---

## 7. Pruebas manuales realizadas

Además de los tests automatizados, se realizaron pruebas manuales sistemáticas de los flujos de usuario completos:

- **Ciclo de vida completo del contenedor:** registro en estado INACTIVO → entrada a puerto → salida a cliente → devolución. Verificación de que los costes D&D se calculan correctamente en cada transición y que el historial de ciclos refleja todos los eventos.
- **OCR con diversas calidades de imagen:** pruebas con fotos de buena resolución (resultado correcto), fotos con ángulo (resultado parcial o incorrecto, corregido manualmente) y fotos de baja resolución (resultado vacío, campo disponible para entrada manual).
- **Persistencia del tema claro/oscuro:** cambio de tema y recarga de página. Verificación de que el tema se recupera de localStorage y se aplica antes del primer render para evitar parpadeo.
- **Gestión de expiración del JWT:** expiración del token durante una sesión activa. Verificación de que la siguiente petición al backend devuelve 401 y la aplicación redirige al login de forma controlada.
- **Control de acceso por roles:** intento de acceso a rutas de gestor desde una cuenta con rol operador (espera 403 del backend y redireccionamiento en el frontend). Intento de acceso al panel de control desde un gestor (espera redirección sin acceso).
- **Generación y descarga de informes PDF:** generación del informe individual de un contenedor con varios ciclos y del informe general con filtros por naviera y rango de fechas. Verificación de que el archivo descargado es válido y contiene los datos correctos.
- **Reversión de estado:** operación "revertir salida a cliente" para corregir un registro erróneo. Verificación de que el contenedor vuelve al estado anterior y el ciclo de detention se anula correctamente.

---

## 8. Mejoras futuras en testing

Las siguientes mejoras están identificadas como trabajo pendiente, ordenadas por prioridad:

1. **Tests de integración con MongoDB de prueba:** crear un conjunto de tests que conecte a una instancia de MongoDB en memoria (usando `mongodb-memory-server`) para verificar el comportamiento real de los esquemas de Mongoose, las validaciones y los índices únicos.

2. **Ampliar cobertura de componentes React:** añadir tests para los componentes más complejos del frontend (formularios de registro de eventos, lógica del semáforo, generación de informes) con simulación de interacciones de usuario usando `userEvent` de Testing Library.

3. **Tests end-to-end con Playwright o Cypress:** automatizar los flujos de usuario más críticos (ciclo completo del contenedor, login/logout, generación de PDF) para detectar regresiones de integración que los tests unitarios no pueden capturar.

4. **Umbral mínimo de cobertura en CI:** configurar Jest y Vitest para fallar el workflow de CI si la cobertura de líneas cae por debajo de un umbral definido (por ejemplo, 80% en el backend y 90% en el frontend), previniendo la introducción de código no probado.
