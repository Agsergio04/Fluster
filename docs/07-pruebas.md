# 07 - Pruebas

Este documento describe la estrategia de pruebas aplicada en Fluster, los tipos de tests implementados, la metodología de mocking utilizada y los resultados obtenidos, junto con las instrucciones para ejecutar los tests y las mejoras planificadas para el futuro.

---

## 1. Metodología de pruebas

La estrategia de pruebas de Fluster cubre **backend y frontend** con herramientas distintas adaptadas a cada entorno.

En el **backend**, el foco es la lógica de negocio crítica (cálculo de costes D&D, autenticación, control de acceso). El enfoque es de tests unitarios con aislamiento de dependencias externas (base de datos, servicios OCR), inspirado en TDD para las capas de servicio: los servicios de cálculo se diseñaron pensando en su testabilidad antes de escribir su implementación.

En el **frontend**, los tests cubren las utilidades de sesión, los hooks personalizados y los componentes atómicos más reutilizables de la aplicación, verificando comportamiento, accesibilidad e interacciones del usuario.

Las pruebas se organizan en siete niveles:

| Nivel | Qué se prueba | Herramienta |
|---|---|---|
| Servicios (backend) | Lógica de negocio pura | Jest |
| Controladores (backend) | Ciclo petición/respuesta HTTP | Jest + mocks de servicios |
| Middlewares (backend) | Autenticación y autorización | Jest |
| Integración (backend) | Esquemas, validaciones e índices únicos contra una BD real | Jest + `mongodb-memory-server` |
| Utilidades y hooks (frontend) | `session.js`, `useTema`, `useContenedores` | Vitest + React Testing Library |
| Componentes (frontend) | Átomos y moléculas (`Spinner`, `Input`, `CardContenedor`, `ModalConfirmacion`…) | Vitest + React Testing Library |
| End-to-end (frontend) | Flujos de usuario completos en un navegador real | Playwright |

**Integración continua:** los tests de ambas capas se ejecutan automáticamente en cada `push` o Pull Request a las ramas `main` o `dev` mediante el workflow `ci.yml` de GitHub Actions, garantizando que el código en `main` siempre pasa todos los tests.

---

## 2. Tipos de pruebas realizadas

### 2.1 Pruebas unitarias de servicios — backend (10 archivos)

Los tests de servicios validan la lógica de negocio en aislamiento, sin conexión a la base de datos. Los modelos de Mongoose se sustituyen por mocks de Jest para que los tests sean rápidos y deterministas.

| Archivo de test | Qué valida |
|---|---|
| `calculoDD.test.js` | Helpers núcleo de cálculo D&D de forma aislada: `calcularDiasEntreFechas` (días naturales, ignorar hora, signo y cambio de mes) y `calcularCosteTramos` (tarifa escalonada, tramo abierto final, días dentro del free time, tramos desordenados). |
| `authService.test.js` | Registro: comprobación de email único, hash bcrypt de la contraseña, política de contraseña. Login: comparación de contraseña, firma del JWT. |
| `contenedorService.test.js` | Transiciones de estado del contenedor (32 casos), cálculo de costes D&D con múltiples tramos tarifarios, manejo de días libres. El reloj del sistema se fija con `jest.useFakeTimers` y se ajusta por test en los casos que verifican cálculos de días exactos. |
| `semaforoService.test.js` | Clasificación del nivel de riesgo (`sin_costes`, `primer_tramo`, `segundo_tramo`, `inactivo`) según los días transcurridos respecto a los días libres y los tramos de cada naviera. |
| `navieraService.test.js` | CRUD de navieras: creación, consulta, actualización, eliminación. Manejo de 404 cuando la naviera no existe. |
| `clienteService.test.js` | CRUD de clientes con los mismos escenarios: éxito y recurso no encontrado. |
| `informeService.test.js` | Generación de informes: inmutabilidad del snapshot una vez creado, datos agregados correctos. |
| `eventoService.test.js` | Registro de eventos: asociación al contenedor correcto, persistencia de foto en base64. |
| `cicloService.test.js` | Gestión de ciclos: apertura, cierre, edición manual de fechas y recálculo de costes. |
| `usuarioService.test.js` | CRUD de usuarios: cambio de rol, actualización de perfil, eliminación, protección del admin protegido y política de contraseña al cambiarla. |

El test más representativo de la lógica de negocio es `contenedorService.test.js`, que incluye casos con un único tramo tarifario, con dos tramos, con días en el límite exacto entre tramos y con periodo dentro de los días libres (coste cero esperado). Esa misma lógica de cálculo se prueba además de forma aislada en `calculoDD.test.js`.

### 2.2 Pruebas de controladores — backend (10 archivos)

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
| `guardarSesion(token, usuario)` | Persiste token y usuario serializado en `localStorage` |
| `limpiarSesion()` | Elimina token y usuario de `localStorage` |
| `getToken()` con sesión activa | Devuelve el token guardado |
| `getToken()` sin sesión | Devuelve `null` |
| `getUsuario()` con sesión activa | Devuelve el objeto usuario deserializado |
| `getUsuario()` sin sesión | Devuelve `null` |
| `isAuthenticated()` con token | Devuelve `true` |
| `isAuthenticated()` sin token | Devuelve `false` |
| `actualizarUsuario(cambios)` | Aplica merge parcial conservando propiedades no modificadas |
| `actualizarUsuario()` sin sesión | No modifica `localStorage` |

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

### 2.5 Pruebas de componentes — frontend (11 archivos)

Cubren tanto átomos como moléculas, verificando renderizado condicional, accesibilidad e interacciones del usuario con `userEvent`. Además de los cuatro componentes documentados en detalle a continuación, se prueban `BotonEditar`, `BotonEliminar`, `CeldaTabla`, `EstadoContenedorSemaforo`, `RolAsignado` (átomos) y `CardContenedor`, `ModalConfirmacion` (moléculas), comprobando en cada uno sus estados, las clases de modificador aplicadas y los callbacks que disparan.

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

### 2.6 Pruebas de integración — backend (2 archivos)

A diferencia de los tests de servicios y controladores (que mockean la base de datos), las pruebas de integración recorren la pila completa **ruta → middleware → controlador → servicio → MongoDB** contra una instancia real de MongoDB en memoria (`mongodb-memory-server`), levantada y limpiada entre tests por el helper `tests/integration/dbSetup.js`. Verifican el comportamiento real de los esquemas de Mongoose, las validaciones y los índices únicos.

| Archivo de test | Qué valida |
|---|---|
| `auth.integration.test.js` | Registro real (201 sin contraseña, hash persistido nunca en texto plano, 409 por correo duplicado) e inicio de sesión (token y usuario con credenciales válidas, 401 por contraseña incorrecta o correo no registrado). |
| `clientes.integration.test.js` | CRUD de clientes aplicando autenticación y roles de extremo a extremo: 401 sin token, 403 para un operador, alta/listado/actualización/borrado de un gestor y 404 al consultar un cliente inexistente. |

### 2.7 Pruebas end-to-end — frontend (3 archivos)

Las pruebas E2E se ejecutan con **Playwright** sobre un navegador Chromium real, interceptando la API con respuestas de fixture para que sean deterministas. Cubren los flujos de usuario más críticos:

| Archivo de spec | Flujo cubierto |
|---|---|
| `auth.spec.js` | Login completo: redirección por rol (gestor → `/semaforo`, operador → `/meter-contenedor`, admin → `/panel-de-control`), errores de correo y contraseña bajo el campo correcto, y no redirección con campos vacíos. |
| `almacen.spec.js` | Almacén del gestor: render de los contenedores del fixture, filtro del buscador por código BIC, limpieza del buscador, aviso ante fallo de la API y desaparición del spinner tras la carga. |
| `semaforo.spec.js` | Panel del semáforo: render de cada grupo de riesgo (sin coste, primer tramo, segundo tramo, inactivo), cliente asociado, gestión del spinner y aviso ante fallo de la API. |

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

### 3.5 Reloj del sistema — backend

Cuando los tests necesitan que `new Date()` devuelva una fecha fija, se usa la API nativa de Jest:

```javascript
beforeEach(() => {
  jest.useFakeTimers({ now: new Date('2025-06-04T14:14:22.767Z') })
})
afterEach(() => {
  jest.useRealTimers()
})
```

Para tests que verifican cálculos con fechas distintas dentro de la misma suite, se llama a `jest.setSystemTime(new Date('...'))` al inicio del test concreto. Este enfoque evita la recursión infinita que produce `jest.spyOn(global, 'Date').mockImplementation(() => new Date(...))`, donde la implementación del mock se llama a sí misma al instanciar la fecha de retorno.

### 3.6 APIs del navegador — frontend

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

Los tests del frontend se encuentran en `frontend/tests/` (junto a `src/`), organizado en subdirectorios `components/`, `hooks/` y `services/` para los unitarios (Vitest) y `e2e/` para los end-to-end (Playwright).

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

Resultados obtenidos ejecutando `npm test -- --coverage` sobre la suite completa (**254 tests, 24 suites**):

```
--------------------------|---------|----------|---------|---------|-----------------------
Archivo                   | % Stmts | % Branch | % Funcs | % Lines | Líneas no cubiertas
--------------------------|---------|----------|---------|---------|-----------------------
All files                 |   80.77 |    63.17 |   84.42 |   82.91 |
 controllers              |   93.02 |    91.66 |     100 |   92.85 |
  authController.js       |     100 |      100 |     100 |     100 |
  cicloController.js      |     100 |      100 |     100 |     100 |
  clienteController.js    |    90.9 |      100 |     100 |    90.9 | 17,35
  contenedorController.js |   90.47 |    85.71 |     100 |   89.83 | 24,42,78,105,110,128
  eventoController.js     |     100 |      100 |     100 |     100 |
  informeController.js    |    90.9 |      100 |     100 |    90.9 | 18,27
  navieraController.js    |    90.9 |      100 |     100 |    90.9 | 17,35
  ocrController.js        |     100 |      100 |     100 |     100 |
  semaforoController.js   |     100 |      100 |     100 |     100 |
  usuarioController.js    |    92.5 |      100 |     100 |    92.5 | 26,42,77
 middlewares              |      80 |    57.69 |     100 |   81.08 |
  authMiddleware.js       |     100 |      100 |     100 |     100 |
  errorMiddleware.js      |   55.55 |       45 |     100 |   56.25 | 16-19,25,30,36
  rateLimit.js            |     100 |      100 |     100 |     100 |
  rolMiddleware.js        |     100 |      100 |     100 |     100 |
 models                   |     100 |      100 |     100 |     100 |
 services                 |   71.72 |    61.91 |   76.11 |   74.68 |
  authService.js          |    90.9 |    77.77 |     100 |    90.9 | 34-37
  calculoDD.js            |     100 |      100 |     100 |     100 |
  cicloService.js         |   89.47 |    81.81 |     100 |   89.09 | 92-94,99-101
  clienteService.js       |     100 |    91.66 |     100 |     100 | 20
  contenedorService.js    |    58.7 |       50 |   81.81 |   62.36 | 28-30,85-97,201-258,455-480
  eventoService.js        |     100 |      100 |     100 |     100 |
  informeService.js       |   45.07 |    30.43 |   36.36 |   47.61 | 105-163
  navieraService.js       |   72.05 |    61.29 |   72.72 |   76.19 | 18-20,148-175
  ocrService.js           |   15.62 |        0 |       0 |      20 | 12-41
  semaforoService.js      |   98.24 |    96.15 |     100 |     100 | 47
  usuarioService.js       |   85.55 |    79.62 |   83.33 |   86.51 | 27-28,33-39,202-211
 utils                    |     100 |     87.5 |     100 |     100 |
  validacion.js           |     100 |     87.5 |     100 |     100 | 14
--------------------------|---------|----------|---------|---------|-----------------------
```

(Las rutas de `src/routes` quedan al 100 % y se omiten de la tabla por brevedad.)

**Resumen backend:**

| Capa | Sentencias | Ramas | Funciones | Líneas |
|---|---|---|---|---|
| **Modelos** | 100 % | 100 % | 100 % | 100 % |
| **Utils** | 100 % | 87.5 % | 100 % | 100 % |
| **Controladores** | 93.02 % | 91.66 % | 100 % | 92.85 % |
| **Middlewares** | 80 % | 57.69 % | 100 % | 81.08 % |
| **Servicios** | 71.72 % | 61.91 % | 76.11 % | 74.68 % |
| **Total** | **80.77 %** | **63.17 %** | **84.42 %** | **82.91 %** |

La baja cobertura de ramas en servicios se concentra en `informeService.js` y `ocrService.js` (generación de PDF con jsPDF e integración con Tesseract.js, mockeadas en los tests de controlador pero difíciles de probar internamente sin un entorno de navegador real) y en las ramas de `contenedorService.js` correspondientes a transiciones de estado poco frecuentes (reversión de salida a puerto). En middlewares, el `errorMiddleware.js` solo se ejercita parcialmente porque la mayoría de errores se prueban a nivel de controlador.

### Frontend

Resultados obtenidos ejecutando `npm run test:coverage` sobre la suite unitaria/de componentes (**115 tests, 14 suites**; los 20 tests E2E de Playwright se ejecutan aparte con `npm run test:e2e`):

```
----------------------|---------|----------|---------|---------|-------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------|---------|----------|---------|---------|-------------------
All files             |   94.11 |    86.46 |   98.07 |   95.41 |
 components/atomos     |   93.33 |     90.1 |   94.73 |   94.87 |
  CeldaTabla.jsx       |   83.33 |    86.36 |      80 |    87.5 | 51-53
  Input.jsx            |     100 |    91.66 |     100 |     100 | 26-27
  InputContrasenia.jsx |     100 |     86.2 |     100 |     100 | 47,56,75,87
 components/moleculas  |    90.9 |       85 |     100 |   88.88 |
  CardContenedor.jsx   |      80 |     87.5 |     100 |      80 | 13-14
  ModalConfirmacion.jsx|     100 |    83.33 |     100 |     100 | 38-50
 hooks                 |     100 |       75 |     100 |     100 |
  useContenedores.js   |     100 |       50 |     100 |     100 | 17-19
 services              |      90 |       70 |     100 |   96.15 |
  session.js           |      90 |       70 |     100 |   96.15 | 47
----------------------|---------|----------|---------|---------|-------------------
```

**Resumen frontend (suite unitaria/de componentes):**

| Capa | Sentencias | Ramas | Funciones | Líneas |
|---|---|---|---|---|
| **Servicios (session.js)** | 90 % | 70 % | 100 % | 96.15 % |
| **Hooks** | 100 % | 75 % | 100 % | 100 % |
| **Componentes (átomos y moléculas)** | 92.59 % | 88.13 % | 96.15 % | 92.85 % |
| **Total** | **94.11 %** | **86.46 %** | **98.07 %** | **95.41 %** |

Las ramas no cubiertas corresponden a props opcionales de presentación (modificadores CSS de `Input`, render condicional del `hint` en `InputContrasenia`, variantes de `CeldaTabla`/`CardContenedor`) y a una rama de error de `session.js`; son ramas sin lógica de negocio.

---

## 6. Resultados

**Backend:** todos los tests pasan en el entorno de CI de GitHub Actions. El workflow `ci.yml` ejecuta `npm test` en el job `test-backend` en cada push o Pull Request a `main` o `dev`. El número total de tests es **254** distribuidos en **24 suites** (10 de controladores + 10 de servicios + 2 de middlewares + 2 de integración), con cero fallos en la ejecución final del proyecto.

**Frontend:** la suite unitaria y de componentes suma **115 tests** en **14 suites** (11 de componentes + 2 de hooks + 1 de servicios), ejecutada con Vitest. A ello se añaden **20 tests end-to-end** con Playwright repartidos en **3 specs**, que cubren los flujos de login, almacén y semáforo en un navegador real.

**Total combinado: 389 tests (254 backend + 115 frontend unitarios/componentes + 20 frontend E2E), 41 suites.**

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

Tres de las mejoras inicialmente identificadas **ya se han implementado** y están documentadas en los apartados anteriores:

- ✅ **Tests de integración con MongoDB en memoria** (`mongodb-memory-server`) — apartado 2.6.
- ✅ **Ampliación de la cobertura de componentes React** con `userEvent` (átomos y moléculas) — apartado 2.5.
- ✅ **Tests end-to-end con Playwright** sobre los flujos de login, almacén y semáforo — apartado 2.7.

Quedan como trabajo pendiente, ordenadas por prioridad:

1. **Ampliar los flujos E2E:** automatizar también el ciclo de vida completo del contenedor (INACTIVO → puerto → cliente → devolución) y la generación/descarga de informes PDF, que hoy solo se cubren con pruebas manuales.

2. **Umbral mínimo de cobertura en CI:** configurar Jest y Vitest para fallar el workflow de CI si la cobertura de líneas cae por debajo de un umbral definido (por ejemplo, 80% en el backend y 90% en el frontend), previniendo la introducción de código no probado.

3. **Elevar la cobertura de `informeService.js` y `ocrService.js`:** son los módulos con menor cobertura por su dependencia de jsPDF y Tesseract.js; extraer su lógica pura a funciones testables reduciría la superficie no cubierta.
