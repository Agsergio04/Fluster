# 03 - Guía de instalación

Esta guía explica cómo poner en marcha Fluster en un entorno local, tanto con Docker (opción recomendada) como de forma manual para desarrollo.

---

## 1. Requisitos previos

Antes de comenzar, asegúrate de tener instalado el siguiente software:

| Software | Versión mínima | Verificación |
|---|---|---|
| Node.js | 22+ | `node --version` |
| npm | 10+ | `npm --version` |
| Docker Desktop | 4.x+ | `docker --version` |
| Docker Compose | 2.x | `docker compose version` |
| Git | cualquiera reciente | `git --version` |
| MongoDB Compass | cualquiera | (opcional) inspección visual de la base de datos |

> MongoDB Compass no es necesario para ejecutar la aplicación, pero resulta útil para explorar y modificar datos directamente durante el desarrollo.

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/Agsergio04/Fluster.git
cd Fluster
```

---

## 3. Opción A: Instalación con Docker (recomendado)

Esta opción levanta los tres servicios (MongoDB, backend y frontend) con un único comando. No es necesario tener Node.js ni MongoDB instalados localmente.

### Paso 1 — Crear el archivo de variables de entorno

Copia el archivo de ejemplo y edítalo:

```bash
cp .env.example .env
```

El contenido de `.env.example` es el siguiente:

```dotenv
# Backend
MONGO_URI=mongodb://mongo:27017/fluster
PORT=3000
JWT_SECRET=cambia_esto_por_un_secreto_seguro_y_largo

# Frontend (usado en el build, no en runtime)
VITE_API_URL=http://localhost:3000/api
```

> **Importante:** cambia el valor de `JWT_SECRET` por una cadena larga, aleatoria y secreta antes de iniciar los contenedores. Este valor protege los tokens de sesión de los usuarios.

### Paso 2 — Iniciar los contenedores

```bash
docker compose up -d
```

Docker descargará las imágenes necesarias (la primera vez puede tardar varios minutos), construirá las imágenes de la aplicación y levantará los servicios en segundo plano. La base de datos local se **siembra automáticamente** al arrancar: un servicio `seed` de un solo uso crea el usuario administrador y los datos de demostración (no se conecta al cluster Atlas; ese se usa solo en el despliegue de Render) y, solo cuando termina, se pone en marcha el backend. Credenciales sembradas: `admin@fluster.com` / `Admin1234` (admin) y `gestor1@fluster.com` · `operador1@fluster.com` con `Test1234`.

### Paso 3 — Verificar que los contenedores están en ejecución

```bash
docker compose ps
```

Deberías ver `mongo`, `backend` y `frontend` con estado `Up`/`running`. El servicio `seed` aparece como `Exited (0)`: es normal, solo se ejecuta una vez para sembrar la base de datos y termina.

### Paso 4 — Acceder a la aplicación

| Servicio | URL |
|---|---|
| Frontend | http://localhost |
| Backend (API) | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api-docs |

### Paso 5 — Consultar los logs

```bash
docker compose logs -f backend
```

Sustituye `backend` por `frontend` o `mongo` para ver los logs de los otros servicios. Pulsa `Ctrl+C` para dejar de seguir los logs sin detener los contenedores.

### Detener los contenedores

```bash
docker compose down
```

Para detener y eliminar también el volumen de datos de MongoDB (se perderán todos los datos):

```bash
docker compose down -v
```

---

## 4. Opción B: Instalación manual (desarrollo local)

Usa esta opción si prefieres ejecutar el backend y el frontend directamente con Node.js, sin Docker.

### 4.1 Backend

```bash
cd backend
npm install
cp .env.example .env   # editar con tu MONGO_URI y JWT_SECRET
npm run dev
```

El servidor arranca con `nodemon` en el puerto `3000` y se reinicia automáticamente al detectar cambios en el código.

### 4.2 Frontend

Abre una segunda terminal:

```bash
cd frontend
npm install
npm run dev
```

Antes de iniciar, crea el archivo `frontend/.env.local` con el siguiente contenido:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

Vite levantará el servidor de desarrollo en el puerto `5173`.

### 4.3 MongoDB

Necesitas una instancia de MongoDB accesible desde el backend. Tienes dos opciones:

- **MongoDB local:** instala MongoDB Community Edition y arranca el servicio. La cadena de conexión por defecto es `mongodb://localhost:27017/fluster`.
- **MongoDB Atlas:** crea un clúster gratuito (M0) en [cloud.mongodb.com](https://cloud.mongodb.com), obtén la cadena de conexión y ponla en `MONGO_URI` dentro de `backend/.env`.

---

## 5. Verificación de la instalación

### Health check del backend

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{"ok":true}
```

### Frontend

- Modo desarrollo (manual): abre http://localhost:5173
- Con Docker: abre http://localhost

### Documentación de la API (Swagger)

Abre http://localhost:3000/api-docs en el navegador para explorar todos los endpoints disponibles de forma interactiva.

---

## 6. Crear el primer usuario administrador

1. Accede a la aplicación y regístrate desde la pantalla `/registro`. Esto crea un usuario con rol estándar.
2. Para elevar ese usuario a administrador, tienes dos opciones:

**Opción A — Desde MongoDB Compass (o mongosh):**

Abre la colección `usuarios` de la base de datos `fluster` y actualiza el campo `rol` del documento correspondiente:

```js
db.usuarios.updateOne(
  { email: "tu@email.com" },
  { $set: { rol: "admin" } }
)
```

**Opción B — Desde Swagger UI:**

Accede a http://localhost:3000/api-docs, autentícate con el token JWT obtenido al iniciar sesión y usa el endpoint `PATCH /usuarios/:id` para actualizar el rol.

---

## 7. Ejecutar los tests

### Tests del backend (Jest)

```bash
cd backend

# Ejecutar todos los tests
npm test

# Con informe de cobertura
npm test -- --coverage

# Modo watch (reejecutar al guardar cambios)
npm test -- --watch
```

Los tests cubren 203 casos en 21 suites (servicios, controladores y middlewares). No requieren base de datos real ni variables de entorno adicionales; Jest mockea todos los modelos de Mongoose internamente.

### Tests del frontend (Vitest + React Testing Library)

```bash
cd frontend

# Ejecutar todos los tests
npm test

# Modo watch
npm run test:watch

# Con informe de cobertura
npm run test:coverage
```

Los tests cubren 58 casos en 7 suites (utilidades de sesión, hooks y componentes atómicos). Se ejecutan sobre jsdom sin necesidad de navegador real.

---

## 8. Solución de problemas frecuentes

| Problema | Causa probable | Solución |
|---|---|---|
| `Error: listen EADDRINUSE :::3000` | El puerto 3000 ya está ocupado | Cambia `PORT` en `.env` o detén el proceso que usa ese puerto |
| `MongoServerError: connect ECONNREFUSED` | `MONGO_URI` incorrecto o MongoDB no arrancado | Verifica el valor de `MONGO_URI` en `.env` y que MongoDB esté en ejecución |
| `JsonWebTokenError: secret or public key must be provided` | `JWT_SECRET` no definido | Asegúrate de que `JWT_SECRET` tiene valor en `.env` |
| La imagen de Docker no se construye | Caché de capas corrupta | Ejecuta `docker compose build --no-cache` |
| El frontend no conecta con la API | `VITE_API_URL` incorrecto | Verifica que `VITE_API_URL` apunta al host y puerto correctos del backend |
| Cambios en el código no se reflejan | Contenedor con imagen antigua | Ejecuta `docker compose up -d --build` para reconstruir |
