# Changelog

Todos los cambios notables de este proyecto se documentan en este fichero.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

## [Sin publicar]

### Seguridad
- El registro público ya no permite asignarse el rol `admin` (responde 403); el rol admin solo se crea con el script de administración.
- El rol del cliente se deriva del JWT firmado, no del objeto `usuario` de `localStorage`, de modo que editar `localStorage` ya no concede permisos.
- Algoritmo del JWT fijado a HS256 en firma y verificación (rechaza `alg: none` y la confusión de algoritmo).
- Validación del entorno al arrancar: el servidor no arranca con un `JWT_SECRET` ausente o de ejemplo (fatal en producción).

### Cambiado
- Refactor MVC: la edición de tramos de ciclo pasa de `cicloController` a `cicloService` (controladores finos, sin acceso directo a modelos), reutilizando el motor de cálculo D&D extraído a `calculoDD.js`.
- Las hojas de estilo usan los mixins `mobile`/`tablet` y `flex-col`/`flex-row` en lugar de media queries y flex repetidos a mano.
- Las tarifas en móvil se muestran con el mismo conjunto de tarjetas (`ConjuntoCards`) que el resto de la aplicación.

### Corregido
- `errorMiddleware` devuelve 400 ante un `CastError` (identificador inválido) y 409 ante clave duplicada (E11000) en lugar de 500.
- Borrado en cascada del contenedor (ciclos, eventos e informes) y *restrict* al eliminar usuarios con datos asociados.
- Formulario de registro: se elimina el doble envío y se valida el formato del correo (cliente y servidor).
- Capitalización de los textos de interfaz según la norma RAE (mayúscula inicial, no Title Case).
- Documentación sincronizada con el código: diagrama entidad-relación, Swagger (estado `PUERTO`), guía de despliegue y valores de tokens de estilo.

### Eliminado
- `frontend/node_modules` y los archivos de log dejan de versionarse (se añaden al `.gitignore`); la cobertura de tests (`coverage/`) tampoco se versiona.

## [1.0.0] - 2026-05-22

Primera versión estable de Fluster, desplegada y funcional. Gestión completa
del ciclo de vida de contenedores marítimos y cálculo de costes de
Demurrage & Detention (D&D) para PYMEs de logística.

### Añadido

#### Funcionalidad principal
- Ciclo de vida del contenedor como máquina de estados (INACTIVO → PUERTO →
  CLIENTE → INACTIVO) con transiciones de entrada a puerto, salida, devolución,
  cancelación y reversión.
- Cálculo automático de costes D&D por tramos de tarifa de cada naviera
  (días libres, días facturables y coste de demurrage y detention).
- Semáforo de riesgo en tiempo real que clasifica los contenedores activos
  por nivel de coste.
- Generación de informes PDF (general por filtros e individual por contenedor)
  con histórico de exportaciones.
- Lectura del código BIC por OCR a partir de una foto del contenedor
  (Tesseract.js), con introducción manual como alternativa.
- Gestión de clientes y navieras con sus tarifas.

#### Frontend
- SPA en React 19 con React Router 7 y arquitectura Atomic Design.
- Tema claro/oscuro con CSS Custom Properties, toggle y `prefers-color-scheme`.
- Arquitectura de estilos ITCSS con SCSS, metodología BEM y mixins reutilizables.
- Página de guía de estilos con todos los componentes, variantes y estados.
- Accesibilidad: HTML semántico, `lang`, atributos ARIA, textos alternativos,
  etiquetas asociadas a los campos y estados de foco visibles.

#### Backend
- API REST con Express 5 y arquitectura MVC (rutas, controladores, servicios,
  modelos) sobre MongoDB con Mongoose.
- Autenticación con JWT y autorización por roles (admin, gestor, operador)
  mediante middlewares.
- Documentación interactiva de la API con Swagger UI (OpenAPI 3).
- Endpoint de health check y heartbeat para mantener vivo el servicio.

#### Pruebas
- Tests unitarios de backend (Jest) sobre servicios, controladores y middlewares.
- Tests de integración con MongoDB en memoria (`mongodb-memory-server` + `supertest`).
- Tests unitarios de componentes y hooks del frontend (Vitest + Testing Library).
- Tests end-to-end con Playwright.

#### Despliegue y DevOps
- Dockerización completa con `docker-compose` (frontend + backend + MongoDB),
  red interna y un único punto de entrada vía nginx (reverse proxy).
- Despliegue en Render (backend, frontend estático) con MongoDB Atlas.
- CI/CD con GitHub Actions: integración continua (tests + build), despliegue
  continuo y publicación de imágenes Docker.
- Dependabot para actualización semanal de dependencias.
- Escaneo de vulnerabilidades con Trivy en cada push y Pull Request.

### Seguridad
- Helmet para cabeceras HTTP de seguridad.
- CORS restringible al origen del frontend por variable de entorno.
- Rate limiting general y reforzado en autenticación.
- Contraseñas hasheadas con bcrypt y secretos fuera del repositorio.
- Política de seguridad documentada en [SECURITY.md](./SECURITY.md).

[Sin publicar]: https://github.com/Agsergio04/Fluster/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Agsergio04/Fluster/releases/tag/v1.0.0
