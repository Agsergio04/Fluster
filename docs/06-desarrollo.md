# 06 - Proceso de desarrollo

Este documento recoge la secuencia de desarrollo seguida durante el proyecto, las decisiones técnicas más relevantes adoptadas a lo largo de los seis sprints, las dificultades encontradas y cómo se resolvieron, y una selección de fragmentos de código representativos de la arquitectura de la aplicación.

---

## 1. Secuencia de desarrollo

El proyecto se organizó en seis sprints de duración aproximada de dos semanas cada uno. El objetivo de cada sprint era entregar un incremento funcional y desplegable, no un conjunto de tareas técnicas aisladas.

### Sprint 1 — Infraestructura base y estructura del repositorio

**Objetivo:** tener un esqueleto funcional del proyecto desplegado desde el primer día.

Se estableció la estructura de directorios del monorepo (`backend/`, `frontend/`, `docs/`), se configuró Docker Compose para desarrollo local con hot-reload en ambos servicios, se creó el clúster MongoDB Atlas M0 y se conectó al backend mediante Mongoose. En el frontend se instaló Vite con React y se configuró el enrutamiento básico con React Router. Al final del sprint, la aplicación ya estaba desplegada en Render (frontend como Static Site, backend como Web Service) con el pipeline de GitHub Actions en marcha.

Desplegar en el sprint 1 fue una decisión deliberada: revelar los problemas de entorno (variables de entorno, CORS, cold starts) lo antes posible en lugar de acumularlos para el final.

### Sprint 2 — Autenticación, gestión de usuarios y API documentada

**Objetivo:** tener un sistema de acceso seguro y la base de la API pública.

Se implementó el sistema de autenticación completo: registro con bcrypt, login con generación de JWT, `authMiddleware` para proteger rutas y `rolMiddleware` para control de acceso por roles (admin, gestor, operador). Se creó el CRUD completo de usuarios y el panel de control del administrador. La API se documentó con Swagger UI (`/api-docs`) usando las anotaciones JSDoc de `swagger-jsdoc`. Al finalizar el sprint, cualquier endpoint expuesto tenía su descripción, esquemas de petición/respuesta y posibilidad de ser ejecutado desde el navegador.

### Sprint 3 — Modelo de tarifas D&D y motor de cálculo

**Objetivo:** implementar el núcleo de negocio de la aplicación.

Se diseñó el esquema de datos para navieras con tramos tarifarios (`diasDemurrage` y `diasDetention`, cada uno como array de objetos `{ desdeDia, hastaDia, precioPorDia }`). Se construyó el motor de cálculo de costes D&D en el backend: un algoritmo que itera sobre los tramos configurados, calcula cuántos días del contenedor caen en cada tramo y multiplica por el precio correspondiente. El cálculo se realiza bajo demanda, no se almacena en la base de datos, para garantizar que siempre refleja la tarifa vigente. También se implementó el CRUD de clientes y el modelo de contenedor con sus cuatro estados de ciclo de vida.

### Sprint 4 — Registro de eventos, ciclos y OCR

**Objetivo:** implementar el flujo operativo completo del contenedor.

Se desarrollaron los endpoints de transición de estado del contenedor (entrada a puerto, salida a cliente, devolución, reversión, cancelación de ciclo), cada uno con registro del evento correspondiente con foto y timestamp. Se integró Tesseract.js en el endpoint `POST /api/ocr/extraer-bic` para extraer el código BIC desde una imagen subida por el operador. Se implementó el modelo de ciclos (`Ciclo`), que agrupa los periodos de demurrage y detention de cada paso del contenedor por el sistema.

### Sprint 5 — Frontend completo: semáforo, tarifas, almacén, informes PDF

**Objetivo:** completar la interfaz de usuario y conectarla con el backend.

Se desarrollaron todas las páginas del frontend: semáforo de riesgo (`/semaforo`), gestión de tarifas por naviera (`/tarifas`), almacén con historial de ciclos (`/almacen`), panel de control de admin (`/panel-de-control`) y perfil de usuario (`/perfil`). Se implementó la generación de informes PDF con jsPDF y jsPDF-AutoTable, tanto en versión individual (un contenedor) como general (múltiples contenedores con filtros). Se crearon los custom hooks `useContenedores` e `useHistorial` para extraer la lógica de fetch de las páginas. Se añadió el soporte de tema claro/oscuro con persistencia en localStorage.

### Sprint 6 — Testing, corrección de errores y documentación

**Objetivo:** entregar un proyecto estable, probado y documentado.

Se escribió la suite completa de tests con Jest: 11 archivos de tests de controladores, 9 de servicios y 2 de middlewares (22 en total). Se corrigieron todos los errores detectados durante las pruebas (inconsistencias en clases CSS, advertencias del linter de hooks, confusión de clases entre modales). Se escribió la documentación técnica del proyecto (`docs/`) y se realizó la revisión final de UX: textos, accesibilidad básica, notificaciones de error amigables y ajuste del tema en todos los componentes.

---

## 2. Decisiones técnicas clave

### 2.1 Campos calculados vs. campos almacenados (costes D&D)

**Decisión:** los costes de demurrage y detention no se almacenan en la base de datos. Se calculan en el backend cada vez que se consulta el estado de un contenedor.

**Alternativa considerada:** almacenar el coste calculado en el documento del ciclo y recalcularlo solo cuando cambia la tarifa.

**Razonamiento:** almacenar el coste introduce el riesgo de inconsistencia entre el valor guardado y la tarifa actualmente configurada. Si un gestor modifica los precios de una naviera, habría que recalcular y actualizar retroactivamente todos los ciclos afectados. Con el cálculo bajo demanda, el valor devuelto por la API siempre es coherente con la tarifa vigente, sin necesidad de ningún proceso de sincronización. La penalización en rendimiento es asumible dado el volumen esperado de contenedores en una PYME.

### 2.2 JWT en localStorage vs. cookie httpOnly

**Decisión:** el token JWT se almacena en `localStorage` del navegador.

**Alternativa considerada:** cookie httpOnly enviada por el servidor, inaccesible desde JavaScript.

**Razonamiento:** las cookies httpOnly ofrecen mayor seguridad frente a ataques XSS porque el token no es accesible desde JavaScript. Sin embargo, introducen complejidad adicional en entornos SPA: hay que gestionar el atributo `SameSite` para peticiones cross-origin, el flujo de refresh de token es más complejo y la configuración de CORS debe incluir `credentials: true`. Para el alcance de este proyecto, almacenar en `localStorage` simplifica la integración y el riesgo de XSS se mitiga sanitizando las entradas del formulario. Esta decisión se reconoce como una deuda técnica que debería revisarse antes de un despliegue en producción con datos sensibles reales.

### 2.3 Tesseract.js vs. alternativas OCR

**Decisión:** se usa Tesseract.js, la versión en JavaScript puro de Tesseract OCR, para la extracción del código BIC.

**Alternativas consideradas:** Tess4J (Tesseract para Java mediante JNI), APIs de OCR externas (Google Vision API, AWS Textract).

**Razonamiento:** Tess4J requiere una JVM instalada en el servidor, lo que complica el despliegue en Render (solo Node.js) y aumenta el consumo de recursos. Las APIs externas introducen coste por petición, dependencia de terceros y latencia de red adicional. Tesseract.js es una dependencia npm estándar que funciona en cualquier entorno Node.js sin configuración adicional, lo que encaja perfectamente con el objetivo de un stack sencillo y desplegable en tier gratuito. El inconveniente es que su rendimiento con imágenes de baja resolución o ángulo incorrecto es inferior al de soluciones más avanzadas, pero esto se compensa con el fallback manual siempre disponible.

### 2.4 ITCSS + BEM + Atomic Design

**Decisión:** los estilos siguen la arquitectura ITCSS (siete capas de especificidad creciente), la nomenclatura BEM para clases CSS y la metodología Atomic Design para la jerarquía de componentes React.

**Alternativa considerada:** CSS Modules, TailwindCSS o un enfoque sin metodología explícita.

**Razonamiento:** con más de 80 archivos de componentes, la ausencia de una metodología de estilos garantiza conflictos de especificidad y clases duplicadas a medida que crece el proyecto. ITCSS elimina estos conflictos por diseño: las capas superiores (utilities) nunca se sobreescriben desde las inferiores sin intención explícita. BEM hace que la relación entre una clase CSS y el componente al que pertenece sea unívoca y evidente. Atomic Design proporciona un vocabulario compartido para clasificar componentes. La inversión inicial en configurar estas metodologías en el sprint 1 ahorró tiempo y fricciones en todos los sprints siguientes.

### 2.5 Express 5 con propagación automática de errores async

**Decisión:** se usa Express 5 (versión 5.x), que propaga automáticamente los errores de funciones asíncronas al middleware de errores sin necesidad de bloques `try/catch` explícitos.

**Alternativa considerada:** Express 4 con `try/catch` en cada controlador o wrapper `asyncHandler`.

**Razonamiento:** en Express 4, un `throw` dentro de una función `async` no es capturado por el middleware de errores de Express; hay que envolver cada controlador en un helper o usar bloques `try/catch`. Express 5 resuelve este problema de forma nativa. El código de los controladores queda más limpio y el manejo de errores queda centralizado en un único middleware (`errorMiddleware`), que formatea la respuesta de error de forma consistente en toda la API.

### 2.6 Stack gratuito: MongoDB Atlas M0 + Render free tier

**Decisión:** tanto la base de datos (MongoDB Atlas M0) como el hosting del backend y frontend (Render) utilizan el plan gratuito de cada plataforma.

**Alternativa considerada:** servidor VPS propio (DigitalOcean, Hetzner) con Docker Compose desplegado manualmente.

**Razonamiento:** el objetivo del proyecto es demostrar la funcionalidad completa de la aplicación, no optimizar la infraestructura. El plan gratuito de MongoDB Atlas M0 ofrece 512 MB de almacenamiento, más que suficiente para el volumen de datos de una PYME. Render proporciona un pipeline de despliegue automatizado con cada push a `main`, sin necesidad de gestionar un servidor. Las limitaciones conocidas (cold starts de ~30 segundos tras 15 minutos de inactividad, límites de almacenamiento) se han mitigado donde es posible (heartbeat para los cold starts) y están documentadas claramente.

### 2.7 Custom hooks para extraer lógica de fetch

**Decisión:** la lógica de carga de datos se extrae de las páginas a custom hooks (`useContenedores`, `useHistorial`).

**Alternativa considerada:** gestión de estado y fetch directamente en los componentes de página, o una librería de estado global como Zustand o Redux.

**Razonamiento:** sin custom hooks, los componentes de página mezclan lógica de negocio (qué datos cargar, cómo transformarlos) con lógica de presentación (qué renderizar). Esta mezcla hace los componentes más difíciles de probar y de reutilizar. Los custom hooks encapsulan el estado de carga (`cargando`), el estado de error (`aviso`) y los datos (`contenedores`) en una unidad cohesionada, fácilmente importable por cualquier página que los necesite. Para el alcance del proyecto, este patrón es suficiente sin necesitar el overhead de una librería de estado global.

---

## 3. Dificultades encontradas y soluciones

### 3.1 Precisión del OCR con Tesseract.js

**Problema:** Tesseract.js devuelve resultados incorrectos o vacíos cuando la fotografía del contenedor está tomada con poca luz, en ángulo pronunciado o con baja resolución. El código BIC (once caracteres con formato específico) es especialmente sensible a errores de reconocimiento de caracteres individuales.

**Solución:** se tomó la decisión de diseño de que el OCR es siempre una ayuda, nunca un requisito. El campo de código BIC del formulario siempre es editable manualmente. Si el OCR devuelve un resultado, lo precarga en el campo; si no lo devuelve o el usuario detecta un error, puede corregirlo o introducirlo a mano sin ninguna fricción adicional. Esta aproximación evita bloquear el flujo de trabajo del operador en condiciones de campo reales donde la calidad de la foto no siempre es óptima.

### 3.2 Cold starts en Render (plan gratuito)

**Problema:** Render apaga los servicios web del plan gratuito tras 15 minutos de inactividad. El siguiente acceso recibe un tiempo de respuesta de ~30 segundos mientras el contenedor arranca. Esto resulta en una experiencia de usuario pobre para la primera petición del día.

**Solución:** se implementó un mecanismo de heartbeat en el propio backend. Al arrancar, el servidor programa una llamada periódica a sí mismo (usando `RENDER_EXTERNAL_URL`, que Render inyecta automáticamente como variable de entorno) cada 5 minutos. Esto mantiene el servicio activo sin necesidad de un servicio externo de ping. La solución es autónoma y no requiere configuración adicional.

### 3.3 Conflictos de especificidad CSS

**Problema:** durante el sprint 5, la adición rápida de estilos para nuevos componentes generó en algunos casos colisiones de especificidad donde un estilo de un componente sobreescribía inesperadamente el de otro.

**Solución:** la arquitectura ITCSS ya estaba en marcha desde el sprint 1, por lo que la resolución consistió en ubicar los estilos en la capa correcta. Los estilos de componente específico siempre van en la capa `05-components/`, los utilitarios de apoyo en `06-utilities/`. Ninguna capa inferior puede sobreescribir a una superior sin que sea intencional. Una vez que se comprendió bien el sistema de capas, los conflictos dejaron de producirse.

### 3.4 Orden de hooks en React (regla del linter)

**Problema:** el plugin `eslint-plugin-react-hooks` requiere que todos los `useState` y `useEffect` estén declarados en el nivel superior del componente, siempre en el mismo orden en cada render. Durante el desarrollo de varias páginas, algunos hooks quedaron declarados después de retornos condicionales, violando esta regla.

**Solución:** se movieron todas las llamadas a hooks al inicio del componente, antes de cualquier lógica condicional o retorno anticipado. En los casos en que la condición de carga se verificaba antes de renderizar el componente completo, se reestructuró el retorno condicional para que siempre se ejecutara después de la declaración de todos los hooks. El linter de hooks se mantuvo como error (no warning) para prevenir regresiones.

### 3.5 Clases CSS incorrectas en ModalEntradaPuerto

**Problema:** el componente `ModalEntradaPuerto` se desarrolló inicialmente reutilizando las clases CSS de `ModalEditarContenedor`, ya que ambos son modales con una estructura similar. Esto generaba una dependencia semántica incorrecta: un componente dependía de los estilos de otro con nombre distinto.

**Solución:** se creó un archivo de estilos dedicado `_modal-entrada-puerto.scss` en la capa `05-components/`. Las clases CSS del modal se renombraron siguiendo la convención BEM del componente propio (`modal-entrada-puerto__campo`, etc.), eliminando la dependencia con el otro modal. La separación garantiza que modificar los estilos de `ModalEditarContenedor` no afecte inadvertidamente a `ModalEntradaPuerto`.

### 3.6 Advertencia del linter por setCargando dentro de useEffect

**Problema:** el patrón inicial de los custom hooks inicializaba `cargando` como `false` y llamaba a `setCargando(true)` dentro del `useEffect`, lo que generaba una advertencia del linter (`unnecessary state update on mount`) y un render inicial innecesario con estado incorrecto.

**Solución:** se inicializó directamente el estado de carga como `true` en el `useState`: `const [cargando, setCargando] = useState(true)`. De esta forma, el componente renderiza desde el principio con el estado de carga activo, sin necesidad de actualizar el estado en el primer render, eliminando la advertencia y el render doble.

---

## 4. Herramientas de control de versiones

### 4.1 Estrategia de ramas

El repositorio sigue una estrategia de ramas simple y directa adaptada al tamaño de un proyecto unipersonal:

| Rama | Propósito |
|---|---|
| `main` | Código estable y desplegado en producción. Solo se actualiza mediante Pull Request. |
| `dev` | Rama de desarrollo activo. Recibe los commits del día a día. |
| Ramas de feature | Se crean desde `dev` para funcionalidades de mayor envergadura que requieran varias sesiones de trabajo. Se fusionan de nuevo en `dev` al completarse. |

El código nunca se escribe directamente en `main`. Todo cambio llega a `main` a través de un Pull Request desde `dev`, que debe superar el workflow de CI (tests + build) antes de poder fusionarse.

### 4.2 Convención de commits

Todos los commits siguen el formato de **Conventional Commits**:

```
tipo: descripción breve en imperativo
```

Los tipos utilizados en el proyecto son:

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad visible para el usuario |
| `fix` | Corrección de un error existente |
| `refactor` | Cambio de código que no añade funcionalidad ni corrige un error |
| `test` | Adición o corrección de tests |
| `style` | Cambios de formato, estilos CSS, sin impacto en lógica |
| `docs` | Creación o actualización de documentación |
| `chore` | Tareas de mantenimiento (dependencias, configuración, scripts) |

Este formato hace el historial de git legible, facilita la generación automática de changelogs y ayuda a identificar el tipo de cambio sin necesidad de leer el diff completo.

### 4.3 GitHub Projects

El seguimiento del trabajo se gestionó mediante un tablero Kanban en **[GitHub Projects](https://github.com/users/Agsergio04/projects/3)**, con las columnas: **Backlog**, **Sprint actual**, **En progreso**, **En revisión** y **Hecho**. Cada tarea del sprint se representaba como una Issue de GitHub enlazada a su commit o Pull Request correspondiente.

### 4.4 Pull Requests y CI

Todo merge de `dev` a `main` pasa por un Pull Request. El workflow de CI (`.github/workflows/ci.yml`) se ejecuta automáticamente sobre el PR y debe completarse con éxito —tests y build— antes de que sea posible fusionar. Esto garantiza que `main` siempre contiene código que pasa los tests.

---

## 5. Fragmentos de código relevantes

### 5.1 Motor de cálculo D&D

El motor de cálculo de costes D&D es el núcleo de negocio de Fluster. Su función es determinar cuánto cuesta un periodo dado de días en función de la tabla de tramos tarifarios configurada para una naviera.

El algoritmo itera sobre el array de tramos (`diasDemurrage` o `diasDetention`) y, para cada tramo, calcula cuántos días del periodo consultado caen dentro de ese tramo. La fórmula básica para un tramo es:

```
diasEnTramo = min(diasTotales, hastaDia) - max(diasLibres, desdeDia - 1)
```

Si `diasEnTramo` es positivo, el coste parcial del tramo es `diasEnTramo × precioPorDia`. El coste total es la suma de los costes parciales de todos los tramos que se solapan con el periodo.

```javascript
// Pseudocódigo del motor de cálculo
function calcularCoste(diasTranscurridos, diasLibres, tramos) {
  if (diasTranscurridos <= diasLibres) return 0

  const diasFacturables = diasTranscurridos - diasLibres
  let costeTotal = 0

  for (const tramo of tramos) {
    const inicio = tramo.desdeDia - 1       // base 0 para la comparación
    const fin = tramo.hastaDia              // puede ser Infinity para el último tramo
    const diasEnTramo = Math.min(diasFacturables, fin) - Math.max(0, inicio)
    if (diasEnTramo > 0) {
      costeTotal += diasEnTramo * tramo.precioPorDia
    }
  }

  return costeTotal
}
```

El mismo algoritmo se aplica tanto al periodo de demurrage (días en puerto) como al periodo de detention (días fuera del puerto con el cliente), con sus respectivos tramos y días libres.

### 5.2 Middleware de autenticación

El `authMiddleware` protege todos los endpoints que requieren sesión iniciada. Se ejecuta antes del controlador de la ruta y detiene la cadena si el token no es válido.

```javascript
function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Acceso no autorizado: token no proporcionado' })
  }
  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = payload
    next()
  } catch {
    return res.status(401).json({ mensaje: 'Acceso no autorizado: token inválido' })
  }
}
```

El middleware extrae el token del encabezado `Authorization` esperando el formato `Bearer <token>`. Si el encabezado no existe o no tiene el prefijo correcto, responde con 401 antes de llegar a `jwt.verify`. Si el token existe pero está expirado, manipulado o firmado con un secreto distinto, `jwt.verify` lanza una excepción que se captura y también devuelve 401. Solo si la verificación tiene éxito, el payload decodificado (que contiene el `id` y el `rol` del usuario) se adjunta a `req.usuario` y se llama a `next()` para continuar con el controlador.

El `rolMiddleware` complementa a este: recibe el array de roles permitidos para una ruta y comprueba que `req.usuario.rol` esté entre ellos, devolviendo 403 si no.

### 5.3 Custom hook useContenedores

El hook `useContenedores` encapsula la lógica de carga del listado de contenedores, separándola del componente de página que los muestra.

```javascript
function useContenedores() {
  const [contenedores, setContenedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    listarContenedores()
      .then(data => setContenedores(data))
      .catch(() => setAviso('No se pudieron cargar los contenedores'))
      .finally(() => setCargando(false))
  }, [])

  return { contenedores, setContenedores, cargando, aviso, setAviso }
}
```

El estado `cargando` se inicializa como `true` para que el componente muestre el indicador de carga desde el primer render, sin parpadeo. El `useEffect` sin dependencias ejecuta la petición una sola vez al montar el componente. Si la petición tiene éxito, actualiza `contenedores`; si falla, establece el mensaje de `aviso`; en ambos casos, `finally` pone `cargando` a `false` para ocultar el indicador. El hook devuelve tanto los datos como los setters para que la página pueda actualizar el listado localmente tras operaciones de creación, edición o eliminación sin necesidad de recargar desde el servidor.

Este mismo patrón se replica en `useHistorial` para la carga del historial de ciclos de un contenedor concreto, y podría extenderse fácilmente a cualquier otra entidad del sistema.
