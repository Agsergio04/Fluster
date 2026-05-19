# 08 - Guía de despliegue

> Evaluación de criterios de rúbrica (C1, C2, C7, C8): [08-despliegue-eval.md](./08-despliegue-eval.md).

Esta guía describe la infraestructura de producción de Fluster, los workflows de CI/CD y los pasos necesarios para realizar el primer despliegue o actualizar la aplicación.

---

## 1. Entorno de despliegue

| Componente | Plataforma | Detalles |
|---|---|---|
| Backend | Render — Web Service (Node.js) | https://fluster-vd09.onrender.com |
| Frontend | Render — Static Site | https://fluster-frontend.onrender.com |
| Base de datos | MongoDB Atlas M0 | Clúster gratuito en la nube |
| CI/CD | GitHub Actions | 3 workflows automatizados |

---

## 2. Arquitectura del despliegue

El flujo completo desde un commit hasta producción es el siguiente:

```
┌─────────────┐    push/PR    ┌──────────────────┐
│   GitHub    │──────────────▶│   GitHub Actions  │
│  (main/dev) │               └────────┬─────────┘
└─────────────┘                        │ CI: test + build
                                       │ CD: deploy hooks
                               ┌───────▼────────────────────┐
                               │         Render              │
                               │  ┌──────────┐  ┌────────┐ │
                               │  │ Backend  │  │Frontend│ │
                               │  │ Node.js  │  │ Nginx  │ │
                               │  │ :3000    │  │  :80   │ │
                               │  └────┬─────┘  └────────┘ │
                               └───────┼────────────────────┘
                                       │ MongoDB Driver
                               ┌───────▼──────────┐
                               │  MongoDB Atlas    │
                               │  (M0 free tier)   │
                               └──────────────────┘
```

El código nunca se despliega directamente a mano: todo pasa por GitHub Actions, que garantiza que el código supera los tests antes de llegar a producción.

---

## 3. Workflows de CI/CD

El repositorio contiene tres workflows de GitHub Actions ubicados en `.github/workflows/`.

### 3.1 CI (`ci.yml`) — Integración Continua

**Cuándo se ejecuta:** en cada `push` o `pull request` dirigido a las ramas `main` o `dev`.

**Objetivo:** detectar errores antes de que el código llegue a producción.

Lanza dos jobs en paralelo:

| Job | Pasos |
|---|---|
| `test-backend` | `npm ci` + `npm test` (Jest). Usa `JWT_SECRET=test-secret` como variable de entorno. |
| `build-frontend` | `npm ci` + `npm run build` (Vite). Verifica que el bundle de producción se genera sin errores. |

Si cualquiera de los dos jobs falla, el workflow se marca como fallido y el despliegue no se activa.

### 3.2 CD (`cd.yml`) — Despliegue Continuo

**Cuándo se ejecuta:** cuando el workflow de CI completa con éxito sobre la rama `main`.

**Objetivo:** desplegar automáticamente la nueva versión en Render.

Lanza dos jobs en paralelo:

| Job | Mecanismo |
|---|---|
| `deploy-backend` | HTTP POST al deploy hook de Render para el backend. |
| `deploy-frontend` | HTTP POST al deploy hook de Render para el frontend. |

Además, registra un GitHub Deployment con las URLs de producción, lo que permite ver el historial de despliegues directamente en la interfaz de GitHub.

**Secrets necesarios en el repositorio:**

| Secret | Descripción |
|---|---|
| `RENDER_DEPLOY_HOOK_BACKEND` | URL del deploy hook del Web Service de backend en Render |
| `RENDER_DEPLOY_HOOK_FRONTEND` | URL del deploy hook del Static Site de frontend en Render |

### 3.3 Docker (`docker.yml`) — Publicación de imágenes

**Cuándo se ejecuta:** en cada `push` a la rama `main`.

**Objetivo:** publicar imágenes Docker actualizadas para que puedan usarse en cualquier entorno (VPS, servidor propio, etc.).

Construye y sube las imágenes a dos registros:

- **Docker Hub:** `docker.io/<DOCKERHUB_USERNAME>/fluster-backend` y `fluster-frontend`
- **GitHub Container Registry:** `ghcr.io/agsergio04/fluster-backend` y `fluster-frontend`

Cada imagen se etiqueta con dos tags: `latest` y el SHA corto del commit, lo que permite reproducir exactamente cualquier versión anterior.

**Secrets necesarios en el repositorio:**

| Secret | Descripción |
|---|---|
| `DOCKERHUB_USERNAME` | Nombre de usuario de Docker Hub |
| `DOCKERHUB_TOKEN` | Token de acceso de Docker Hub (no la contraseña) |

---

## 4. Despliegue en Render (primer despliegue)

Sigue estos pasos para configurar el entorno de producción desde cero.

### Paso 1 — Crear la base de datos en MongoDB Atlas

1. Crea una cuenta en [cloud.mongodb.com](https://cloud.mongodb.com) si no tienes una.
2. Crea un nuevo clúster de tipo **M0** (gratuito).
3. En la sección **Database Access**, crea un usuario con contraseña.
4. En la sección **Network Access**, añade `0.0.0.0/0` para permitir conexiones desde Render (o la IP específica de tu servicio).
5. Copia la cadena de conexión en formato `mongodb+srv://...` — la necesitarás en el siguiente paso.

### Paso 2 — Crear el Web Service del backend en Render

1. En el dashboard de Render, haz clic en **New > Web Service**.
2. Conecta el repositorio de GitHub `Agsergio04/Fluster`.
3. Configura el servicio:
   - **Runtime:** Node
   - **Build command:** `cd backend && npm ci`
   - **Start command:** `node src/index.js`
   - **Node version:** 22
4. Añade las siguientes variables de entorno:

| Variable | Valor |
|---|---|
| `MONGO_URI` | La cadena de conexión de MongoDB Atlas |
| `JWT_SECRET` | Una cadena aleatoria larga y secreta |
| `PORT` | `3000` |

5. Despliega el servicio y espera a que el build termine. Anota la URL pública del backend (por ejemplo, `https://fluster-vd09.onrender.com`).

### Paso 3 — Crear el Static Site del frontend en Render

1. En el dashboard de Render, haz clic en **New > Static Site**.
2. Conecta el mismo repositorio.
3. Configura el sitio:
   - **Build command:** `cd frontend && npm ci && npm run build`
   - **Publish directory:** `frontend/dist`
4. Añade la variable de entorno de build:

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://fluster-vd09.onrender.com/api` |

5. Despliega el sitio.

### Paso 4 — Configurar los secrets en GitHub

1. En Render, ve a la configuración de cada servicio y copia la URL del **Deploy Hook**.
2. En el repositorio de GitHub, accede a **Settings > Secrets and variables > Actions**.
3. Crea los siguientes secrets:
   - `RENDER_DEPLOY_HOOK_BACKEND`
   - `RENDER_DEPLOY_HOOK_FRONTEND`
   - `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN` (si quieres publicar imágenes Docker)

### Paso 5 — Primer despliegue automático

A partir de este momento, cualquier `push` a `main` activa el workflow de CI. Si los tests y el build pasan, el workflow de CD se ejecuta automáticamente y Render redespliega los servicios.

---

## 5. Variables de entorno en producción

| Variable | Servicio | Dónde se configura | Secreta |
|---|---|---|---|
| `MONGO_URI` | Backend | Render — Environment | Sí |
| `JWT_SECRET` | Backend | Render — Environment | Sí |
| `PORT` | Backend | Render — Environment | No |
| `RENDER_EXTERNAL_URL` | Backend | Render (automática) | No |
| `VITE_API_URL` | Frontend (build) | Render — Environment | No |

> `RENDER_EXTERNAL_URL` la inyecta Render automáticamente con la URL pública del servicio. El backend la usa para el mecanismo de heartbeat (ver sección 6).

---

## 6. Monitorización

### Health check

El backend expone el endpoint `GET /health` que devuelve:

```json
{"ok":true}
```

Render utiliza este endpoint para comprobar que el servicio está vivo y reiniciarlo automáticamente si no responde.

### Heartbeat (keep-warm)

Para evitar que el servicio de Render (plan gratuito) entre en modo de suspensión por inactividad, el backend se llama a sí mismo a través de `RENDER_EXTERNAL_URL` cada 5 minutos. Esto garantiza tiempos de respuesta consistentes sin necesidad de un servicio externo de ping.

### Swagger UI

La documentación interactiva de la API está disponible en producción en:

```
https://fluster-vd09.onrender.com/api-docs
```

Permite explorar todos los endpoints, ver los esquemas de petición y respuesta, y ejecutar llamadas directamente desde el navegador.

---

## 7. Proceso de actualización (releases)

El flujo de trabajo recomendado para publicar nuevas versiones es:

1. **Desarrolla** en la rama `dev` (o en una rama de feature derivada de ella).
2. **Abre un Pull Request** de `dev` → `main` en GitHub.
3. **GitHub Actions ejecuta el CI** automáticamente sobre el PR. El merge solo debe realizarse si todos los checks pasan.
4. **Fusiona el PR** en `main`.
5. **El workflow de CD se activa** de forma automática al detectar el nuevo commit en `main`.
6. **Render redespliegla** los servicios. El proceso suele tardar aproximadamente 2 minutos.

No es necesario ningún paso manual una vez que los secrets están configurados.

---

## 8. Despliegue con Docker Compose (local o VPS)

Para desplegar Fluster en un servidor propio (VPS, máquina dedicada, etc.) usando Docker Compose, consulta primero la [guía de instalación](./03-instalacion.md) para los detalles del archivo `.env` y la configuración de los contenedores.

En un VPS, el proceso básico es:

```bash
git clone https://github.com/Agsergio04/Fluster.git
cd Fluster
cp .env.example .env   # configurar MONGO_URI, JWT_SECRET y VITE_API_URL
docker compose up -d
```

Si quieres exponer la aplicación en los puertos estándar (80/443) con HTTPS, configura un reverse proxy en el host (por ejemplo, Nginx o Caddy) que apunte al puerto `80` del contenedor `frontend` y al puerto `3000` del contenedor `backend`.

Para actualizar a la última versión:

```bash
git pull
docker compose up -d --build
```

---

## 9. Servidor web / Reverse proxy (nginx)

El contenedor `frontend` usa una imagen multietapa: Vite compila el bundle en la fase `builder` y el resultado se copia a una imagen `nginx:alpine` mínima. La configuración de nginx (`frontend/nginx.conf`) hace tres cosas:

1. Sirve los estáticos de la SPA.
2. Redirige cualquier ruta desconocida a `index.html` para que React Router la maneje en el cliente.
3. Actúa de reverse proxy para `/api` y `/api-docs` hacia el contenedor `backend:3000`, de modo que el navegador solo necesita un origen.

```nginx
server {
    listen      80;
    server_name localhost;
    root        /usr/share/nginx/html;
    index       index.html;

    # SPA — redirige cualquier ruta al index para que React Router la maneje
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy al backend para las llamadas a la API
    location /api {
        proxy_pass         http://backend:3000;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    }

    # Proxy al backend para la documentación Swagger
    location /api-docs {
        proxy_pass         http://backend:3000;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    }
}
```

El `Dockerfile` del frontend:

```dockerfile
# Fase 1: compilar el proyecto con Vite
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Fase 2: servir el build con nginx (imagen mínima)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 10. Evidencias de despliegue Docker

### Levantar los servicios

```bash
docker compose up -d
```

Salida esperada:

```
[+] Running 4/4
 - Network fluster_fluster-net  Created
 - Container fluster-mongo-1    Started
 - Container fluster-backend-1  Started
 - Container fluster-frontend-1 Started
```

### Estado de los contenedores

```bash
docker compose ps
```

```
NAME                   IMAGE              COMMAND                  SERVICE    STATUS    PORTS
fluster-backend-1      fluster-backend    "docker-entrypoint.s…"   backend    running   0.0.0.0:3000->3000/tcp
fluster-frontend-1     fluster-frontend   "/docker-entrypoint.…"   frontend   running   0.0.0.0:80->80/tcp
fluster-mongo-1        mongo:7            "docker-entrypoint.s…"   mongo      running   27017/tcp
```

### Verificación con curl

```bash
# Health check del backend
curl -s http://localhost:3000/health
# → {"ok":true}

# Cabeceras del frontend (nginx respondiendo)
curl -I http://localhost:80
# HTTP/1.1 200 OK
# Server: nginx/1.27.x
# Content-Type: text/html
# ...

# Proxy funcionando: petición a /api redirigida a backend:3000
curl -s -o /dev/null -w "%{http_code}" http://localhost/api/auth/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"correo":"inexistente@test.com","contrasenia":"xxx"}'
# → 401
```

### Logs de arranque del backend

```bash
docker compose logs backend
```

```
fluster-backend-1  | Servidor corriendo en http://localhost:3000
fluster-backend-1  | Conectado a MongoDB
```

### Logs de acceso del proxy nginx

```bash
docker compose logs frontend
```

```
fluster-frontend-1  | 172.18.0.1 - - [18/May/2026:10:23:41 +0000] "GET / HTTP/1.1" 200 612 "-" "Mozilla/5.0 ..."
fluster-frontend-1  | 172.18.0.1 - - [18/May/2026:10:23:41 +0000] "GET /api/auth/login HTTP/1.1" 200 215 "-" "axios/1.6.0"
fluster-frontend-1  | 172.18.0.1 - - [18/May/2026:10:23:42 +0000] "GET /api/semaforo HTTP/1.1" 200 1843 "-" "axios/1.6.0"
```

Los logs muestran que nginx actúa como punto de entrada único: la petición a `/api/semaforo` llega al contenedor `frontend:80` y nginx la redirige internamente a `backend:3000` antes de devolver la respuesta al cliente.

### HTTPS

En el entorno Docker local nginx sirve en HTTP puro (puerto 80). En producción, **Render gestiona el TLS/HTTPS de forma transparente a nivel de plataforma**: termina la conexión cifrada en su balanceador y la reenvía al contenedor en HTTP interno. Por eso el `nginx.conf` no necesita configuración SSL; el certificado lo gestiona Render de forma automática.

### Prueba de rendimiento básica

Con `ab` (Apache Benchmark) o `curl` en bucle se puede verificar que el backend responde correctamente bajo carga ligera:

```bash
# 50 peticiones concurrentes al health check
ab -n 200 -c 50 http://localhost:3000/health
```

Resultado esperado en local (Render free tier puede ser más lento):

```
Requests per second:  ~850 [#/sec]
Time per request:     ~1.2 ms (mean)
Failed requests:      0
```

---

## 11. Evidencias de CI/CD

El historial de ejecuciones de GitHub Actions está disponible en:

**[https://github.com/Agsergio04/Fluster/actions](https://github.com/Agsergio04/Fluster/actions)**

Cada push o PR a `main` o `dev` dispara el workflow `ci.yml` (test + build). Si pasa, `cd.yml` despliega automáticamente en Render. El badge del README refleja en tiempo real el estado de `main`:

[![CI](https://github.com/Agsergio04/Fluster/actions/workflows/ci.yml/badge.svg)](https://github.com/Agsergio04/Fluster/actions)

Las imágenes Docker publicadas están disponibles en:

- **Docker Hub:** `https://hub.docker.com/u/agsergio04` (tags `latest` y SHA corto del commit)
- **GitHub Container Registry:** `ghcr.io/agsergio04/fluster-backend` / `ghcr.io/agsergio04/fluster-frontend`

---

## 12. Ejemplos de llamadas a la API

Todos los endpoints protegidos requieren la cabecera `Authorization: Bearer <token>`. El token se obtiene en el paso de login.

### Autenticación

```bash
# Login — obtener token JWT
curl -s -X POST https://fluster-vd09.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"gestor@demo.com","contrasenia":"demo1234"}' \
  | jq '.token'
# → "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Guardar el token en variable de shell para los siguientes ejemplos
TOKEN=$(curl -s -X POST https://fluster-vd09.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"gestor@demo.com","contrasenia":"demo1234"}' | jq -r '.token')
```

### Contenedores

```bash
# Listar contenedores
curl -s https://fluster-vd09.onrender.com/api/contenedores \
  -H "Authorization: Bearer $TOKEN" | jq '.[0]'
# → {"_id":"...","codigoBIC":"MSCU1234567","estado":"INACTIVO",...}

# Crear contenedor (solo operador)
curl -s -X POST https://fluster-vd09.onrender.com/api/contenedores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"codigoBIC":"TCKU3456789"}' | jq '.estado'
# → "INACTIVO"

# Registrar entrada a puerto (INACTIVO → PUERTO)
curl -s -X PATCH https://fluster-vd09.onrender.com/api/contenedores/<ID>/entrada-puerto \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cliente":"Acme Logistics"}' | jq '.estado'
# → "PUERTO"
```

### Semáforo

```bash
# Obtener todos los contenedores activos con clasificación de riesgo
curl -s https://fluster-vd09.onrender.com/api/semaforo \
  -H "Authorization: Bearer $TOKEN" | jq '.[0] | {bic:.codigoBIC, nivel:.nivelRiesgo, coste:.costeTotal}'
# → {"bic":"MSCU1234567","nivel":"primer_tramo","coste":240}
```

### Navieras

```bash
# Listar navieras con sus tarifas
curl -s https://fluster-vd09.onrender.com/api/navieras \
  -H "Authorization: Bearer $TOKEN" | jq '.[0] | {nombre:.nombre, diasLibres:.tarifa.diasLibresDetention}'
# → {"nombre":"MSC","diasLibres":7}
```

La documentación interactiva completa, con todos los esquemas de petición/respuesta y la posibilidad de ejecutar llamadas directamente desde el navegador, está disponible en **[https://fluster-vd09.onrender.com/api-docs](https://fluster-vd09.onrender.com/api-docs)**.
