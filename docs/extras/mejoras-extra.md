# Mejoras extra del proyecto

Este documento recoge las mejoras añadidas a Fluster que **van más allá de los mínimos exigidos por las rúbricas**. No son obligatorias, pero refuerzan la seguridad, la calidad y las buenas prácticas de DevOps del proyecto, y sirven como evidencia adicional en la defensa (especialmente para el criterio de Control de versiones + CI/CD y para la seguridad del backend).

Para cada mejora se explica **qué es**, **qué hace exactamente**, **dónde está configurada** y **cómo verificar que funciona**.

---

## 1. Rate limiting (límite de peticiones)

**Qué es:** un límite al número de peticiones que una misma IP puede hacer en una ventana de tiempo, para mitigar abusos y ataques de fuerza bruta.

**Qué hace exactamente:**
- **Límite general:** 100 peticiones por IP cada 15 minutos sobre toda la API (`/api`).
- **Límite estricto de autenticación:** 10 intentos por IP cada 15 minutos sobre `/api/auth` (login y registro), para frenar ataques de fuerza bruta contra credenciales.
- Devuelve cabeceras estándar `RateLimit-*` y un mensaje JSON en español al superar el límite.
- Se **desactiva en entorno de test** (`NODE_ENV=test`) para no interferir con las pruebas de integración.

**Dónde está:** [`backend/src/app.js`](../../backend/src/app.js) — middlewares `limiterGeneral` y `limiterAuth` (paquete `express-rate-limit`).

**Cómo verificar:** lanzar más de 10 peticiones seguidas a `/api/auth/login` devuelve `429 Too Many Requests` con el mensaje de límite.

---

## 2. Helmet.js (cabeceras de seguridad HTTP)

**Qué es:** middleware que establece cabeceras HTTP de seguridad para proteger frente a vulnerabilidades web comunes.

**Qué hace exactamente:** añade automáticamente cabeceras como:
- `X-Content-Type-Options: nosniff` — evita que el navegador "adivine" el tipo de contenido (MIME sniffing).
- `X-Frame-Options: SAMEORIGIN` — protege frente a clickjacking (incrustar la web en un iframe ajeno).
- `Strict-Transport-Security` — fuerza HTTPS en navegadores compatibles.
- Otras cabeceras de endurecimiento por defecto de Helmet.

La **CSP (Content-Security-Policy) está desactivada a propósito**, porque el backend sirve Swagger UI en `/api-docs`, que carga scripts y estilos inline que una CSP estricta bloquearía. El resto de protecciones siguen activas.

**Dónde está:** [`backend/src/app.js`](../../backend/src/app.js) — `app.use(helmet({ contentSecurityPolicy: false }))` (paquete `helmet`).

**Cómo verificar:** `curl -I https://fluster-vd09.onrender.com/health` muestra las cabeceras `x-content-type-options`, `x-frame-options` y `strict-transport-security`.

---

## 3. CORS restringido por entorno

**Qué es:** control de qué orígenes (dominios) pueden hacer peticiones a la API.

**Qué hace exactamente:**
- Si la variable de entorno `CORS_ORIGIN` está definida, **solo** los orígenes indicados (separados por comas) pueden llamar a la API. En producción se configura con la URL del frontend.
- Si no está definida, se permite cualquier origen (cómodo para desarrollo local).

**Dónde está:** [`backend/src/app.js`](../../backend/src/app.js) — opciones de `cors()` según `CORS_ORIGIN`. Documentado en [`backend/.env.example`](../../backend/.env.example).

**Cómo verificar:** definir `CORS_ORIGIN=https://fluster-frontend.onrender.com` en el panel de Render del backend; las peticiones desde otros orígenes serán rechazadas por el navegador.

---

## 4. Dependabot (actualización automática de dependencias)

**Qué es:** servicio de GitHub que vigila las dependencias del proyecto y abre Pull Requests automáticos cuando hay versiones nuevas o vulnerabilidades.

**Qué hace exactamente:** revisa **semanalmente** tres ecosistemas y abre PRs (máx. 5 abiertos por ecosistema), con prefijos de commit y etiquetas por área:
- Dependencias npm del **backend** (`/backend`).
- Dependencias npm del **frontend** (`/frontend`).
- Versiones de las **GitHub Actions** usadas en los workflows.

**Dónde está:** [`.github/dependabot.yml`](../../.github/dependabot.yml).

**Cómo verificar:** tras subir el fichero a GitHub, aparece en *Insights → Dependency graph → Dependabot* con los tres ecosistemas. Genera PRs automáticos de actualización.

---

## 5. Trivy (escaneo de vulnerabilidades en CI)

**Qué es:** escáner de vulnerabilidades que analiza dependencias y configuraciones en busca de fallos de seguridad conocidos (CVEs).

**Qué hace exactamente:** un workflow de GitHub Actions que en **cada push o PR a `main`/`dev`**:
- Escanea el sistema de ficheros del repositorio (dependencias npm y configuraciones como los Dockerfiles).
- **Falla** el workflow si encuentra vulnerabilidades `CRITICAL` o `HIGH` (ignora las que aún no tienen parche, `ignore-unfixed`).
- Sube los resultados en formato **SARIF** a la pestaña *Security → Code scanning* del repo.

**Dónde está:** [`.github/workflows/security.yml`](../../.github/workflows/security.yml).

**Cómo verificar:** abrir un PR dispara el job "Security"; el resultado aparece en la pestaña *Actions* y, si hay hallazgos, en *Security*.

> **Complementariedad:** Dependabot avisa y actualiza dependencias; Trivy escanea y bloquea en CI. Juntos cubren prevención (mantener al día) y detección (frenar lo vulnerable antes de fusionar).

---

## 6. Observabilidad básica del despliegue

**Qué es:** mecanismos para saber que la aplicación está viva y poder diagnosticar problemas.

**Qué hace exactamente:**
- **Health check** `GET /health → {ok:true}`, usado por Render para comprobar que el servicio responde.
- **Heartbeat / keep-warm:** el backend se auto-pinguea cada 5 minutos vía `RENDER_EXTERNAL_URL` para evitar el modo suspensión del plan gratuito de Render.
- **Logs:** nginx emite sus logs de acceso por `stdout`/`stderr` (consultables con `docker compose logs frontend` o en el dashboard de Render); el backend registra arranque y conexión a MongoDB. Manejo centralizado de errores con respuestas JSON uniformes.

**Dónde está:** [`backend/src/app.js`](../../backend/src/app.js) (`/health`), [`backend/src/index.js`](../../backend/src/index.js) (heartbeat), [`backend/src/middlewares/errorMiddleware.js`](../../backend/src/middlewares/errorMiddleware.js). Detalle en [08-despliegue.md](../08-despliegue.md).

---

<!-- Añade aquí las próximas mejoras extra siguiendo el mismo formato:
## N. Nombre de la mejora
**Qué es:** ...
**Qué hace exactamente:** ...
**Dónde está:** ...
**Cómo verificar:** ...
-->
