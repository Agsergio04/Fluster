# Changelog

Todos los cambios notables de este proyecto se documentan en este fichero.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

## [Sin publicar]

### Añadido
- Paginación por columna en el semáforo: cada tramo muestra 2 tarjetas y aparece un paginador a partir de la tercera, independiente por columna.
- El buscador del semáforo filtra ahora por código BIC, nombre de cliente y fecha de última operación (en formato español `dd/mm/aaaa`).
- Minibuscador de navieras sobre la tabla de tarifas de escritorio (filtra por código), además del de la vista de tarjetas.
- Mensaje de estado vacío «Aún no hay ciclos completados» en el historial de un contenedor sin ciclos cerrados.
- Confirmación mediante modal al eliminar una naviera en Tarifas (mismo patrón que el resto de borrados).
- Tokens de color accesibles para texto: `--color-error-text`, `--color-success-text` y `--color-enlace` (theme-aware, AA/AAA).
- **Administrador protegido**: campo `protegido` en el modelo de usuario. El administrador principal (Sergio Aragón García, `sergioaragongarcia@gmail.com`) se crea protegido en el seed; en el panel de control sus botones de rol y de borrado salen deshabilitados («Rol protegido»).
- Tabla de **usuarios de prueba** (uno de cada rol) documentada en el README, con sus credenciales.

### Seguridad
- El registro público ya no permite asignarse el rol `admin` (responde 403); el rol admin solo se crea con el script de administración.
- Un administrador **protegido** no puede perder el rol de admin ni ser eliminado: el servicio de usuarios responde **403** ante cualquier intento, garantizando que el administrador principal del sistema siempre permanece.
- El rol del cliente se deriva del JWT firmado, no del objeto `usuario` de `localStorage`, de modo que editar `localStorage` ya no concede permisos.
- Algoritmo del JWT fijado a HS256 en firma y verificación (rechaza `alg: none` y la confusión de algoritmo).
- Validación del entorno al arrancar: el servidor no arranca con un `JWT_SECRET` ausente o de ejemplo (fatal en producción).
- Control de propiedad (anti-IDOR): un operador solo puede ver, editar o borrar **sus** contenedores también por ID (`/:id`); acceder a uno ajeno responde 404. El gestor mantiene acceso completo.
- El token JWT caduca a los 7 días (`expiresIn`), limitando la ventana de un token filtrado.
- Las consultas de login coaccionan correo/contraseña a `string` para impedir la inyección de operadores NoSQL desde `req.body`.
- El registro valida la contraseña en el servidor (mínimo 8 caracteres → 400), no solo en el cliente.

### Cambiado
- Refactor MVC: la edición de tramos de ciclo pasa de `cicloController` a `cicloService` (controladores finos, sin acceso directo a modelos), reutilizando el motor de cálculo D&D extraído a `calculoDD.js`.
- Las hojas de estilo usan los mixins `mobile`/`tablet` y `flex-col`/`flex-row` en lugar de media queries y flex repetidos a mano.
- Las tarifas en móvil se muestran con el mismo conjunto de tarjetas (`ConjuntoCards`) que el resto de la aplicación.
- Docker Compose siembra automáticamente la base de datos local al arrancar (servicio `seed` de un solo uso) y el backend usa esa Mongo local en lugar del cluster Atlas; Mongo tiene `healthcheck` y el backend espera a que la siembra termine.
- Rediseño de la tarjeta de tarifa en formato compacto (móvil/tablet): cabecera con la naviera y cuerpo en dos columnas «Días» y «Costes», con los paneles de tramo teñidos (azul el primero, rojo el segundo) y manteniendo la edición en línea; responsive.
- El historial de ciclos de un contenedor solo registra los ciclos **completados** (con `fechaCierre`); el ciclo en curso ya no aparece como registrado hasta cerrarse.
- Jerarquía tipográfica coherente en el panel «Generar informe» (sección 24 px → grupo 20 px → etiquetas/inputs 16 px) y alineación uniforme; antes las etiquetas llegaban a 48 px.
- Subtítulos y títulos de Login y Semáforo usan `--color-text`; la etiqueta de la tarjeta del semáforo pasa a «Última operación» y la fecha se muestra en formato español.
- En la tarjeta de usuario, los roles no asignados se muestran en estado `--off` (disponibles para cambiar), como define el diseño.
- `autocomplete` semánticamente correcto en los campos de contraseña (`new-password` al crear cuenta o cambiar contraseña; `current-password` solo en login).
- Modo producción real en el despliegue: `NODE_ENV=production` en Render (enmascara los errores 500 y activa el fail-fast del `JWT_SECRET`).
- Un contenedor solo puede tener **un ciclo activo** a la vez (índice único parcial) y el `codigoBIC` es único (con comprobación de duplicado al crear).
- No se puede eliminar una naviera con contenedores asociados (409), para no perder sus tarifas.
- CI ejecuta ahora también los **tests (Vitest) y el lint (ESLint) del frontend** y cachea el binario de MongoDB; la publicación de imágenes Docker queda condicionada a que el CI termine en verde.
- El frontend en Docker espera a que el backend esté `healthy` (nuevo healthcheck contra `/health`); Render usa `npm ci`.

### Corregido
- `errorMiddleware` devuelve 400 ante un `CastError` (identificador inválido) y 409 ante clave duplicada (E11000) en lugar de 500.
- Borrado en cascada del contenedor (ciclos, eventos e informes) y *restrict* al eliminar usuarios con datos asociados.
- Formulario de registro: se elimina el doble envío y se valida el formato del correo (cliente y servidor).
- Capitalización de los textos de interfaz según la norma RAE (mayúscula inicial, no Title Case).
- Documentación sincronizada con el código: diagrama entidad-relación, Swagger (estado `PUERTO`), guía de despliegue y valores de tokens de estilo.
- Auditoría de contraste WCAG en toda la interfaz: las 8 combinaciones texto/fondo que no llegaban a AA (texto de error y de éxito, enlace azul de la zona de subida, input blanco-sobre-blanco en tema oscuro y una etiqueta diminuta) se corrigen a AA/AAA en claro y oscuro con colores del espectro de marca.
- La entrada a puerto reutiliza el cliente existente con el mismo nombre (find-or-create, sin distinguir mayúsculas) en lugar de crear un cliente duplicado en cada operación.
- Login: eliminado el doble `POST /auth/login` por clic de ratón (el botón usa solo el `onSubmit` del formulario, con un guard síncrono contra reenvíos).
- El botón del menú hamburguesa solo expone `aria-controls` cuando el panel está montado en el DOM (referencia ARIA ya no colgante).
- «Meter contenedor» valida el tipo de imagen (JPG/PNG) también al arrastrar, no solo al seleccionar, y alinea `accept` con lo anunciado.
- Cambio de contraseña: el estado `disabled` se propaga a los tres campos durante la petición, no solo al primero y al botón.
- Cambiar el rol de un usuario al rol que ya tiene no lanza un `PUT /usuarios/:id` redundante.
- Los enlaces a Contacto de las páginas legales usan `<Link>` de React Router (navegación cliente, sin recargar toda la SPA).
- El lápiz de editar fechas de un tramo se desactiva cuando el tramo no tiene datos.
- **Cálculo de costes D&D**: la naviera se identifica por las 3 primeras letras del BIC (código de propietario ISO 6346; la 4.ª letra es la categoría de equipo). El catálogo usaba códigos de 4 letras que no casaban, por lo que los costes salían 0; corregidos a 3 letras (servicio y datos semilla).
- El cálculo de tramos los ordena por `desdeDia` antes de facturar (evita infrafacturación si llegasen desordenados).
- Las transiciones de salida/devolución validan que exista un ciclo activo (422 en vez de un 500 por `TypeError`).
- El código BIC leído por OCR ahora se persiste (el evento usaba un nombre de campo que el esquema descartaba).
- `editarFechaInicioLibre` solo corrige `fechaEntradaPuerto` en estado PUERTO (ya no corrompe ese sello en INACTIVO/CLIENTE).
- Cambiar la contraseña con la actual incorrecta devuelve 422 (antes 401, que cerraba la sesión por el interceptor global).
- El conjunto de tarjetas acota la página activa: borrar el último elemento de la última página ya no deja la vista en blanco.
- Guard síncrono contra doble envío en el modal de entrada a puerto y en el formulario de registro.
- Importes del PDF formateados a 2 decimales en formato es-ES.
- Referencia de cliente colgante protegida al generar un informe.
- Semántica HTML y accesibilidad: encabezados sin saltos de nivel (`h2` en las columnas de la tarjeta de tarifa), `aria-current="page"` en el paginador, `role="img"` en el badge de estado, `alt` no redundante en el avatar, asociación `aria-describedby` del error en el campo de contraseña, `type="button"` en el botón de la 404, correo de Contacto como enlace `mailto:` y eliminación de un `aria-label` contradictorio.
- BEM: el estado de carga del panel de control usa `__cargando` (la clase del JSX ya no quedaba sin estilo).
- Página de tarifas a contraste **AAA** (≥7:1) en claro y oscuro: el azul `card-almacen` oscuro se profundiza (cabecera de tarjeta y tabla pasan de 5.98 a 8.86:1), el panel «Segundo tramo» usa un tinte rojo aclarado con `color-mix` (de 6.53 a 15.04:1) y las mini-etiquetas DET./SOB. usan color de texto pleno (de 4.83 a 17.74:1).
- Contraste **AAA** (≥7:1) en todas las páginas del perfil gestor (semáforo, tarifas, almacén, historial, perfil), tras auditar las 184 combinaciones texto/fondo en claro y oscuro. Cambios: fondo de etiqueta de error a rojo más oscuro (`--color-error-fondo` 5.6→8.0:1 con texto blanco); `--color-error-text`/`--color-success-text` claros oscurecidos a AAA sobre fondos neutros; tramo amarillo oscuro del semáforo (`primer_tramo` oscuro) oscurecido para texto blanco AAA (5.78→8.42:1); nuevo token `--color-placeholder` (sin `opacity`, que erosionaba el contraste) para los placeholders de los buscadores; texto de la notificación y botón de confirmar borrado pasan a colores que cumplen AAA; el enlace del pie usa subrayado en hover en vez de `opacity`; los textos de estado del semáforo usan texto pleno; y en los requisitos de contraseña del perfil (sobre el azul de la tarjeta, donde el verde no se lee) el estado «cumplido» se marca con el icono ✓/○ y los ítems usan el color de texto pleno (AAA), conservando el verde en el registro sobre fondo neutro.
- Diferenciación de los **botones de acción sobre tarjetas de color** (almacén, tabla de tarifas, botón de editar fechas de cada ciclo del historial, botón de editar de la tarjeta de contenedor, botón «Volver al almacén» y botones de la tarjeta del perfil): usaban el mismo azul `secondary` que la tarjeta y se fundían con ella (1.05:1). Ahora usan el token `--color-btn-card` con **modo claro y oscuro propios** (azul claro `#A4D3F4` en claro, azul marino en oscuro) y el texto usa la variable de tema `--color-text`, de modo que el botón se distingue de la tarjeta y cumple AAA en ambos modos (≥9.5:1). El botón de guardar del perfil se reestiliza solo en ese contexto (login/registro no cambian). El estado «marcado» de las opciones de filtrado del informe usa también ese color; el botón de actualizar la foto del perfil (sobre fondo de página, no sobre tarjeta) mantiene el color secundario.
- Las etiquetas de los campos (encima de los inputs) pasan a peso *semibold* para resaltar mejor sobre el campo, en los formularios (login, registro, perfil…) y en el panel de generar informe.
- Auditoría final de regresiones (sin regresiones por los cambios de tokens), que destapó tres defectos de contraste preexistentes ya corregidos: los botones de **borrar usuario** y **borrar contenedor** pasan a rojo sólido accesible (`error-fondo`) con texto/icono blanco (de 6.11 a 8.0:1 en reposo y de 2.22 a 9.4:1 en hover); el **icono del título de «Meter contenedor»** usa `--color-enlace` (de 2.2 a 7.2:1 sobre la superficie); y los **placeholders** de los campos de BIC (OCR y manual) usan el token `--color-placeholder` AAA (de 4.6 a 7.3:1).
- Las **tarjetas de funcionalidades del home** ya no se desplazan al pasar el cursor (se elimina el `translateY` que provocaba un salto; el realce se hace solo con la sombra).
- La **foto de perfil** se muestra completa (`object-fit: contain` con marco neutro) en vez de recortada (`cover`).

### Eliminado
- `frontend/node_modules` y los archivos de log dejan de versionarse (se añaden al `.gitignore`); la cobertura de tests (`coverage/`) tampoco se versiona.
- Componente huérfano `ModalEditarFecha` (sin uso; sustituido por `ModalEditarTramo`).
- Fila de tarjetas-resumen del semáforo (sobre fondo claro); el recuento por tramo permanece en la cabecera de cada columna.

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
