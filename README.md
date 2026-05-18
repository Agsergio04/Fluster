# Fluster

Aplicación web para que empresas PYME de logística controlen y gestionen los costes de Demurrage & Detention (D&D) de contenedores marítimos.

[![CI](https://github.com/Agsergio04/Fluster/actions/workflows/ci.yml/badge.svg)](https://github.com/Agsergio04/Fluster/actions)
[![Docker](https://img.shields.io/badge/docker-compose-2496ED?logo=docker&logoColor=white)](./docker-compose.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## Tabla de contenidos

1. [¿Qué es Fluster?](#qué-es-fluster)
2. [Demo](#demo)
3. [Características principales](#características-principales)
4. [Stack tecnológico](#stack-tecnológico)
5. [Inicio rápido](#inicio-rápido)
6. [Variables de entorno](#variables-de-entorno)
7. [Documentación](#documentación)
8. [Contribuir](#contribuir)

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
| **Frontend** | React 19, React Router 7, Axios, Vite, SCSS/ITCSS, Atomic Design |
| **Backend** | Node.js, Express 5, MongoDB Atlas, Mongoose, JWT, Bcrypt, Tesseract.js, Swagger UI |
| **Infraestructura** | Docker Compose, GitHub Actions (CI/CD), Render (despliegue), Jest (tests) |

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

Una vez iniciado, la aplicación estará disponible en `http://localhost:5173` y la API en `http://localhost:3000`.

---

## Variables de entorno

El archivo `backend/.env` debe contener las siguientes variables:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGO_URI` | URI de conexión a MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/fluster` |
| `PORT` | Puerto en el que escucha el servidor Express | `3000` |
| `JWT_SECRET` | Clave secreta para firmar los tokens JWT | `una_clave_secreta_larga_y_aleatoria` |

---

## Documentación

| # | Documento | Descripción |
|---|-----------|-------------|
| 01 | [Introducción](./docs/01-introduccion.md) | Origen, objetivos, análisis comparativo y alcance del MVP |
| 02 | [Descripción del sistema](./docs/02-descripcion.md) | Visión general del sistema y sus componentes |
| 03 | [Instalación](./docs/03-instalacion.md) | Guía de instalación y configuración del entorno |
| 04 | [Guía de estilos](./docs/04-guia-estilos.md) | Convenciones de código, SCSS/ITCSS y Atomic Design |
| 05 | [Diseño](./docs/05-diseno.md) | Decisiones de diseño UI/UX y prototipado |
| 06 | [Desarrollo](./docs/06-desarrollo.md) | Arquitectura, modelo de datos y lógica de negocio |
| 07 | [Pruebas](./docs/07-pruebas.md) | Estrategia de tests, cobertura y ejecución con Jest |
| 08 | [Despliegue](./docs/08-despliegue.md) | CI/CD con GitHub Actions, configuración de Render y Docker |
| 09 | [Manual de usuario](./docs/09-manual-usuario.md) | Guía de uso por rol: admin, gestor y operador |
| 10 | [Conclusiones](./docs/10-conclusiones.md) | Valoración del proyecto, mejoras futuras y aprendizajes |

---

## Contribuir

Las contribuciones son bienvenidas. El flujo de trabajo es:

1. Crear una rama desde `dev` con un nombre descriptivo (`feat/nombre-feature` o `fix/descripcion-bug`).
2. Desarrollar y añadir tests si corresponde.
3. Abrir una Pull Request hacia `dev`. Los checks de CI (lint + tests) deben pasar antes de hacer merge.
4. Las releases a producción se realizan mediante PR de `dev` a `main`.

Por favor, respeta el estilo de código existente y añade tests para cualquier nueva funcionalidad en el backend.
