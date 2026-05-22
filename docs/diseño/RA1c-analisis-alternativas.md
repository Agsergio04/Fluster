# RA1.c — Análisis de alternativas

> **RA vinculado:** RA1 — CE 1.c  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Vistas alternativas para contenedores](#1-vistas-alternativas-para-contenedores)
2. [Alternativas de presentación de datos](#2-alternativas-de-presentación-de-datos)
3. [Alternativas tipográficas](#3-alternativas-tipográficas)
4. [Alternativas de navegación](#4-alternativas-de-navegación)

---

## 1. Vistas alternativas para contenedores

Fluster analiza y aplica múltiples alternativas de presentación para el mismo tipo de información, eligiendo en cada caso la que mejor se adapta al contexto y al usuario.

El sistema ofrece **dos vistas** del mismo conjunto de datos de contenedores:

| Vista | Componente | Cuándo se usa |
|---|---|---|
| **Semáforo** | `semaforo.jsx` | Prioridad operativa — ver el riesgo de un vistazo |
| **Almacén** | `almacen.jsx` | Gestión completa — editar, eliminar, buscar |

La vista semáforo prioriza la comunicación visual (color como canal principal); el almacén prioriza la densidad de datos y las acciones disponibles. Este análisis de alternativas llevó a implementar ambas en lugar de una sola pantalla.

Ambas vistas son accesibles desde el mismo menú de navegación y comparten los mismos datos, lo que demuestra que la alternativa elegida no excluye a la otra: se ofrecen las dos porque responden a necesidades distintas del mismo usuario.

---

## 2. Alternativas de presentación de datos

Para cada tipo de información, se analizaron varias formas de presentarla antes de tomar una decisión:

| Información | Alternativa A (descartada) | Alternativa B (elegida) | Motivo |
|---|---|---|---|
| Lista de contenedores | Tabla HTML paginada | Cuadrícula de tarjetas con `flex-wrap` | Las tarjetas permiten ver más datos relevantes de un vistazo sin scroll horizontal |
| Estado de riesgo | Solo texto ("Primer tramo") | Color + texto (semáforo) | El color comunica urgencia antes que el texto — la información llega sin leer |
| Errores de formulario | Mensaje al enviar (toast genérico) | Mensaje inline por campo | El usuario sabe exactamente qué campo corregir sin releer el formulario |
| Historial del contenedor | Lista de eventos simple | Línea de tiempo con hitos | La cronología comunica mejor la secuencia de eventos y las duraciones |
| Informe de costes | Tabla en pantalla | PDF descargable | El usuario necesita enviárselo al cliente, no solo consultarlo |

### Tarjeta vs tabla: análisis detallado

La decisión de usar tarjetas en lugar de tabla merece un análisis específico porque es la decisión visual más impactante del proyecto:

**Tabla HTML (descartada):**
- Permite comparar valores entre filas fácilmente.
- Difícil de hacer responsive: en móvil se pierde información o requiere scroll horizontal.
- Más adecuada cuando la comparación entre registros es el objetivo principal.

**Cuadrícula de tarjetas (elegida):**
- Cada tarjeta es una unidad autónoma de información.
- Se adapta automáticamente al espacio disponible con `flex-wrap`.
- Permite incluir más tipos de datos (fechas, costes, estado, acciones) sin perder legibilidad.
- El objetivo en Fluster es gestionar cada contenedor individualmente, no comparar entre ellos.

---

## 3. Alternativas tipográficas

Se analizaron tres combinaciones tipográficas antes de elegir la actual:

| Opción | Heading | Body | Resultado |
|---|---|---|---|
| A (descartada) | Inter (ambas) | Inter | Funcional pero sin personalidad — parece una app genérica |
| B (descartada) | Playfair Display | Lato | Demasiado editorial para una herramienta profesional de logística |
| C (elegida) | Crimson Text | Poppins | Balance entre formalidad de datos y legibilidad funcional |

**Justificación de la opción C:**

- **Crimson Text** (serif) aporta carácter a los títulos, encabezados y métricas de coste. Su trazado formal comunica seriedad, coherente con el contexto empresarial del producto.
- **Poppins** (sans-serif geométrica) garantiza legibilidad en interfaz densa: etiquetas de formulario, textos de tarjeta, contenido de tabla.

La combinación serif + sans-serif es una práctica estándar en diseño editorial y de producto cuando se quiere jerarquía visual clara entre título y cuerpo.

---

## 4. Alternativas de navegación

### Menú principal

| Opción | Descripción | Resultado |
|---|---|---|
| Barra superior con texto | Pestañas horizontales en el header | Descartada — se queda sin espacio en móvil con 5+ secciones |
| Menú hamburguesa lateral | Icono que despliega un panel lateral | Elegida — permite incluir iconos + texto y se adapta bien a móvil y escritorio |
| Barra lateral siempre visible | Menú fijo a la izquierda | Descartada — consume demasiado espacio horizontal en pantallas pequeñas |

El menú hamburguesa lateral se implementó en `BotonesMenuHamburguesa.jsx` con `aria-label="Navegación principal"` para accesibilidad y con las mismas opciones visibles en escritorio y colapsadas en móvil.

### Feedback de acciones

| Tipo de acción | Alternativa descartada | Alternativa elegida |
|---|---|---|
| Éxito al guardar | Redirección a otra página | Toast de éxito con `Notificacion.jsx` y permanencia en la misma página |
| Error de red | Página de error completa | Toast de error y reintento sin recargar |
| Carga de datos | Pantalla en blanco | `Spinner` en el contenedor mientras carga |

Estas decisiones se basan en el mismo principio: mantener al usuario en contexto y darle feedback inmediato sin interrumpir su flujo de trabajo.
