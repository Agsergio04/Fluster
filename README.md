# Fluster

Aplicación web para que empresas PYME de logística controlen y gestionen los costes de Demurrage & Detention (D&D) de contenedores marítimos.

<!-- Estado del proyecto (dinámicos: reflejan el estado real en GitHub Actions) -->
[![CI](https://github.com/Agsergio04/Fluster/actions/workflows/ci.yml/badge.svg)](https://github.com/Agsergio04/Fluster/actions/workflows/ci.yml)
[![Security](https://github.com/Agsergio04/Fluster/actions/workflows/security.yml/badge.svg)](https://github.com/Agsergio04/Fluster/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## Tabla de contenidos

1. [¿Qué es Fluster?](#qué-es-fluster)
2. [Demo](#demo)
3. [Características principales](#características-principales)
4. [Stack tecnológico](#stack-tecnológico)
5. [Estructura del proyecto](#estructura-del-proyecto)
6. [Inicio rápido](#inicio-rápido)
7. [Desarrollo local (sin Docker)](#desarrollo-local-sin-docker)
8. [Datos de prueba (seed)](#datos-de-prueba-seed)
9. [Variables de entorno](#variables-de-entorno)
10. [Pruebas](#pruebas)
11. [Documentación](#documentación)


---

## ¿Qué es Fluster?

Las empresas PYME de logística (importadores, transitarios, transportistas) gestionan contenedores marítimos con hojas de cálculo, fotos por WhatsApp y correos dispersos. Cuando un contenedor supera los días libres acordados con la naviera, comienzan a acumularse costes de **Demurrage** (contenedor en puerto) y **Detention** (contenedor con el cliente), que pueden alcanzar cientos de euros por día.

Fluster centraliza todo el ciclo de vida del contenedor, calcula automáticamente los costes D&D según tarifas por tramos, y ofrece un semáforo de riesgo visual para actuar antes de que los costes se disparen.

---

## Demo

| Entorno | URL |
|---------|-----|
| **Frontend** | [https://fluster-frontend.onrender.com](https://fluster-frontend.onrender.com) |
| **Backend API** | [https://fluster-vd09.onrender.com](https://fluster-vd09.onrender.com) |
| **Documentación API (Swagger)** | [https://fluster-vd09.onrender.com/api-docs](https://fluster-vd09.onrender.com/api-docs) |
| **Diseño Figma** | [Archivo de diseño](https://www.figma.com/design/Jf6d7039UDcHaFClx7Rlby/Proyecto---Fluster?node-id=0-1) |
| **Prototipo interactivo** | [Prototipo navegable](https://www.figma.com/proto/Jf6d7039UDcHaFClx7Rlby/Proyecto-Fluster?node-id=4-5&page-id=4%3A5&starting-point-node-id=694%3A10274&scaling=min-zoom&content-scaling=fixed) |
| **Wireframes** | [Wireframes](https://www.figma.com/proto/Jf6d7039UDcHaFClx7Rlby/Proyecto-Fluster?node-id=4-3&page-id=4%3A3&starting-point-node-id=170%3A494&scaling=min-zoom&content-scaling=fixed) |
| **Diagrama de flujo (FigJam)** | [Diagrama de Flujo — Fluster](https://www.figma.com/board/RElpnz7nwahpUixOCr4vMq/Diagrama-de-Flujo---Fluster?node-id=0-1) |
| **GitHub Projects** | [Tablero de planificación](https://github.com/users/Agsergio04/projects/3) |

---

## Características principales

- **Ciclo de vida completo del contenedor** — registro de eventos con foto, timestamp y código BIC a lo largo de los estados INACTIVO, PUERTO, CLIENTE y VUELTA_PUERTO.
- **Cálculo automático de D&D** — costes calculados en tiempo real mediante tablas de tarifas por tramos configurables por naviera.
- **Semáforo de riesgo visual** — indicador verde/naranja/rojo basado en los días libres restantes para anticipar costes.
- **OCR con Tesseract.js** — lectura y validación automática del código BIC del contenedor a partir de una foto.
- **Generación de informes PDF** — exportación de resumen de costes con jsPDF para cotejar con las facturas de las navieras.
- **Control de acceso por roles** — admin, gestor y operador con permisos diferenciados.
- **Documentación interactiva** — Swagger UI disponible en `/api-docs`.
- **Tema claro/oscuro** — alternancia de tema persistente en la interfaz.
- **Despliegue con Docker Compose** — entorno completo reproducible en un solo comando.

---

## Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev) [![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev) · React Router 7 · Axios · SCSS/ITCSS · Atomic Design |
| **Backend** | [![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org) [![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com) [![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com) [![API Docs](https://img.shields.io/badge/API-Swagger-85EA2D?logo=swagger&logoColor=black)](https://fluster-vd09.onrender.com/api-docs) · Mongoose · JWT · Bcrypt · Tesseract.js |
| **Infraestructura** | [![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](./docker-compose.yml) · GitHub Actions (CI/CD) · Render (despliegue) · Jest · Vitest + React Testing Library |

---

## Estructura del proyecto

```
Fluster/
├── backend/                # API REST (Express + MongoDB)
│   ├── src/
│   │   ├── routes/         # Definición de endpoints
│   │   ├── controllers/    # Entrada/salida HTTP
│   │   ├── services/       # Lógica de negocio
│   │   ├── models/         # Esquemas de Mongoose
│   │   ├── middlewares/    # Auth, roles, errores
│   │   ├── scripts/        # Seed de datos
│   │   ├── app.js          # App Express (sin arrancar el servidor)
│   │   └── index.js        # Punto de entrada (arranque)
│   ├── tests/              # Tests unitarios y de integración (Jest)
│   └── Dockerfile
├── frontend/               # SPA (React + Vite)
│   ├── src/
│   │   ├── components/     # Atomic Design: átomos, moléculas, organismos
│   │   ├── pages/          # Vistas por ruta
│   │   ├── hooks/          # Hooks reutilizables
│   │   ├── services/       # Cliente HTTP (Axios)
│   │   └── styles/         # ITCSS + SCSS
│   ├── tests/              # Tests Vitest (unitarios) y Playwright (e2e/)
│   ├── nginx/              # Configuración del reverse proxy
│   └── Dockerfile
├── docs/                   # Documentación del proyecto (01–10 + diseño)
├── .github/workflows/      # CI, CD, Docker y escaneo de seguridad
└── docker-compose.yml      # Orquestación de los 3 servicios
```

---

## Inicio rápido

Requisitos previos: [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/) instalados.

```bash
# 1. Clonar el repositorio
git clone https://github.com/Agsergio04/Fluster.git
cd Fluster

# 2. Copiar y configurar las variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con los valores correspondientes

# 3. Levantar todos los servicios
docker compose up --build
```

Una vez iniciado, la aplicación estará disponible en `http://localhost` (puerto 80, servido por nginx). La API es accesible a través del proxy en `http://localhost/api`.

---

## Desarrollo local (sin Docker)

Si prefieres ejecutar los servicios directamente (por ejemplo, para desarrollar con recarga en caliente), necesitas **Node.js 22+** y una instancia de **MongoDB** (local o Atlas).

```bash
# 1. Clonar el repositorio
git clone https://github.com/Agsergio04/Fluster.git
cd Fluster

# 2. Backend
cd backend
npm ci
cp .env.example .env          # configurar MONGO_URI, JWT_SECRET (y CORS_ORIGIN si aplica)
npm run dev                   # arranca en http://localhost:3000 con recarga (nodemon)

# 3. Frontend (en otra terminal)
cd frontend
npm ci
cp .env.example .env          # configurar VITE_API_URL=http://localhost:3000/api
npm run dev                   # arranca en http://localhost:5173 (Vite)
```

El frontend de desarrollo (Vite) queda en `http://localhost:5173` y llama al backend mediante la variable `VITE_API_URL`.

---

## Datos de prueba (seed)

El backend incluye scripts para poblar la base de datos sin tener que crear los datos a mano:

```bash
cd backend

# Crear un usuario administrador inicial
npm run seed

# Poblar la BD con datos de demostración (usuarios, navieras, clientes,
# contenedores en distintos estados, ciclos y eventos)
npm run seed:datos
```

Tras `npm run seed:datos`, la consola muestra las credenciales de los usuarios de ejemplo (admin, gestor y operador) para iniciar sesión.

---

## Variables de entorno

El archivo `backend/.env` debe contener las siguientes variables:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGO_URI` | URI de conexión a MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/fluster` |
| `PORT` | Puerto en el que escucha el servidor Express | `3000` |
| `JWT_SECRET` | Clave secreta para firmar los tokens JWT | `una_clave_secreta_larga_y_aleatoria` |
| `CORS_ORIGIN` | Orígenes permitidos por CORS, separados por comas. Si se omite, se permite cualquier origen (solo recomendable en local) | `https://fluster-frontend.onrender.com` |

El archivo `frontend/.env` debe contener:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API que consume el frontend | `http://localhost:3000/api` |

---

## Pruebas

| Ámbito | Comando | Herramienta |
|--------|---------|-------------|
| Backend (unitarios + integración) | `cd backend && npm test` | Jest + `mongodb-memory-server` + Supertest |
| Backend (con cobertura) | `cd backend && npm run test:coverage` | Jest |
| Frontend (unitarios) | `cd frontend && npm test` | Vitest + React Testing Library |
| Frontend (end-to-end) | `cd frontend && npm run test:e2e` | Playwright |

La integración continua (GitHub Actions) ejecuta los tests del backend y la build del frontend en cada push y Pull Request a `main` y `dev`.

---

## Documentación

| # | Documento | Descripción |
|---|-----------|-------------|
| 01 | [Introducción](./docs/01-introduccion.md) | Origen, objetivos, análisis comparativo y alcance del MVP |
| 02 | [Descripción del sistema](./docs/02-descripcion.md) | Visión general del sistema y sus componentes |
| 03 | [Instalación](./docs/03-instalacion.md) | Guía de instalación y configuración del entorno |
| 04 | [Guía de estilos](./docs/04-guia-estilos.md) | Convenciones de código, SCSS/ITCSS y Atomic Design |
| 05 | [Diseño](./docs/05-diseno.md) | Diagrama ER, casos de uso, diagramas de flujo, arquitectura y diseño de la API REST |
| 06 | [Desarrollo](./docs/06-desarrollo.md) | Secuencia de sprints, decisiones técnicas y fragmentos de código representativos |
| 07 | [Pruebas](./docs/07-pruebas.md) | Estrategia de tests, cobertura y ejecución con Jest (backend) y Vitest (frontend) |
| 08 | [Despliegue](./docs/08-despliegue.md) | CI/CD con GitHub Actions, configuración de Render y Docker |
| 09 | [Manual de usuario](./docs/09-manual-usuario.md) | Guía de uso por rol: admin, gestor y operador |
| 10 | [Conclusiones](./docs/10-conclusiones.md) | Valoración del proyecto, mejoras futuras y aprendizajes |

### Documentación de recuperación

- **Diseño de Interfaces Web** — índice con todos los RA y sus evidencias: [`docs/diseño/README.md`](./docs/diseño/README.md).
- **Despliegue de Aplicaciones Web** — criterios C1, C2, C7 y C8 con evidencias (RA1 a recuperar): [`docs/08-despliegue-eval.md`](./docs/08-despliegue-eval.md).

---

## Contribuir

Las contribuciones son bienvenidas. Consulta la [guía de contribución completa](./CONTRIBUTING.md) para los detalles de entorno, convención de commits y proceso de Pull Request, y respeta el [Código de Conducta](./CODE_OF_CONDUCT.md). En resumen, el flujo de trabajo es:

1. Crear una rama desde `dev` con un nombre descriptivo (`feat/nombre-feature` o `fix/descripcion-bug`).
2. Desarrollar y añadir tests si corresponde.
3. Abrir una Pull Request hacia `dev`. Los checks de CI (lint + tests) deben pasar antes de hacer merge.
4. Las releases a producción se realizan mediante PR de `dev` a `main`.

Por favor, respeta el estilo de código existente y añade tests para cualquier nueva funcionalidad: Jest en el backend (`backend/tests/`) y Vitest en el frontend (`frontend/tests/`).

Los cambios entre versiones se documentan en el [CHANGELOG](./CHANGELOG.md).

---

## Seguridad

El proyecto incorpora medidas de seguridad básicas: autenticación JWT con roles, contraseñas hasheadas con bcrypt, cabeceras HTTP con Helmet, CORS configurable, escaneo de dependencias con Dependabot y de vulnerabilidades con Trivy en CI.

Si descubres una vulnerabilidad, **no abras un issue público**: sigue la [política de seguridad](./SECURITY.md).

---

## Licencia

Distribuido bajo la licencia **MIT**. Consulta el archivo [LICENSE](./LICENSE) para más información.
