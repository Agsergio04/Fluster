# WAVE — Evaluación de Accesibilidad Web

> **Herramienta:** WAVE Web Accessibility Evaluation Tool (WebAIM)  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [¿Qué es WAVE?](#1-qué-es-wave)
2. [Métricas y categorías de WAVE](#2-métricas-y-categorías-de-wave)
3. [Errores detectados y correcciones aplicadas](#3-errores-detectados-y-correcciones-aplicadas)
4. [Alertas detectadas y correcciones aplicadas](#4-alertas-detectadas-y-correcciones-aplicadas)
5. [Resultados por página](#5-resultados-por-página)
6. [Impacto en el código](#6-impacto-en-el-código)

---

## 1. ¿Qué es WAVE?

**WAVE** (Web Accessibility Evaluation Tool) es una herramienta gratuita desarrollada por [WebAIM](https://webaim.org/) que evalúa el cumplimiento de las pautas de accesibilidad **WCAG 2.1** en páginas web. Funciona como extensión de navegador y superpone iconos visuales sobre la página para señalar errores, alertas y elementos de accesibilidad.

### ¿Para qué sirve?

WAVE permite identificar:

- **Barreras de accesibilidad** que impiden a usuarios con discapacidad usar la interfaz.
- **Problemas de estructura semántica** que dificultan la navegación por teclado y lectores de pantalla.
- **Ausencia de etiquetas** en controles de formulario, imágenes y regiones.
- **Posibles errores de contraste** de color que afectan a usuarios con baja visión.

### ¿Por qué es importante?

Los lectores de pantalla (NVDA, JAWS, VoiceOver) dependen de un HTML semántico correcto para narrar la interfaz. Un `<p>` estilizado como título no comunica jerarquía; un `<input>` sin `<label>` no tiene nombre accesible. WAVE detecta estos problemas antes de que lleguen a producción.

---

## 2. Métricas y categorías de WAVE

WAVE clasifica los resultados en seis categorías:

| Categoría | Icono | Descripción |
|---|---|---|
| **Errors** | 🔴 | Problemas críticos que impiden el acceso a lectores de pantalla. Deben corregirse siempre. |
| **Contrast Errors** | 🔴🔴 | Ratio de contraste insuficiente entre texto y fondo (mínimo WCAG AA: 4.5:1 para texto normal). |
| **Alerts** | 🟠 | Posibles problemas que requieren revisión manual. No son errores definitivos pero deben valorarse. |
| **Features** | 🟢 | Elementos de accesibilidad correctos: `alt` en imágenes, `aria-label`, `lang`, landmarks semánticos. |
| **Structural Elements** | 🔵 | Elementos de estructura semántica: `<h1>`–`<h6>`, `<nav>`, `<main>`, `<header>`, listas. |
| **ARIA** | 🟣 | Atributos ARIA detectados: `role`, `aria-label`, `aria-hidden`, `aria-live`, etc. |

### AIM Score

WAVE calcula un **AIM Score** (0–10) que representa el nivel de accesibilidad global de la página. Una puntuación superior a 9 indica una accesibilidad excelente.

---

## 3. Errores detectados y correcciones aplicadas

### Error: Missing form label

**Descripción:** Un `<input>` carece de etiqueta accesible. Los lectores de pantalla no pueden anunciar el propósito del campo al usuario.

**WCAG:** Criterio 1.3.1 (Información y relaciones) y 4.1.2 (Nombre, función, valor).

#### Caso 1 — Inputs de la tabla de tarifas (`FilaNavieraTarifas.jsx`)

La tabla de tarifas contenía **90 inputs** (10 navieras × 9 campos) sin etiqueta. Al ser parte de una tabla visual, no tenían `<label>` asociado.

**Antes:**
```jsx
<CeldaTabla label={valor} editable onChange={handleChange} />
// → <input value={valor} /> sin aria-label
```

**Corrección aplicada:** Se añadió la prop `ariaLabel` al átomo `CeldaTabla` con una descripción que combina el nombre de la columna y la naviera:

```jsx
const COLUMNAS = [
  'Días libres detention', 'Días libres demurrage',
  'Hasta día tramo 1 detention', 'Hasta día tramo 1 demurrage',
  'Precio/día tramo 1 detention', 'Precio/día tramo 1 demurrage',
  'Precio/día tramo 2 detention', 'Precio/día tramo 2 demurrage',
]

<CeldaTabla
  ariaLabel={`${COLUMNAS[i]} — ${naviera}`}
  label={valor}
  editable
  onChange={handleChange}
/>
// → <input aria-label="Días libres detention — MSC" />
```

#### Caso 2 — Input de foto de perfil (`PerfilCredenciales.jsx`)

El `<input type="file">` oculto (activado por botón) carecía de etiqueta.

**Corrección aplicada:**
```jsx
<input
  type="file"
  aria-label="Subir foto de perfil"
  aria-hidden="true"
  style={{ display: 'none' }}
  onChange={handleFotoElegida}
/>
```

#### Caso 3 — Input de foto OCR (`meter_contenedor.jsx`)

El `<input type="file">` del flujo de subida de imagen para OCR tampoco tenía etiqueta.

**Corrección aplicada:**
```jsx
<input
  ref={inputFotoRef}
  type="file"
  accept="image/*"
  aria-label="Seleccionar foto del contenedor"
  aria-hidden="true"
  style={{ display: 'none' }}
  onChange={handleFotoElegida}
/>
```

---

## 4. Alertas detectadas y correcciones aplicadas

### Alerta: Possible heading

**Descripción:** WAVE detecta un `<p>` con texto grande o en negrita que podría ser un encabezado. Los lectores de pantalla usan los encabezados (`<h1>`–`<h6>`) para permitir la navegación por secciones; un `<p>` estilizado como título no ofrece esta capacidad.

**WCAG:** Criterio 1.3.1 (Información y relaciones).

#### Caso 1 — Etiquetas de tarjetas de almacén y semáforo

Las tarjetas `CardContenedoresAlmacen` y `CardSemaforo` mostraban el código BIC y su etiqueta con `font-size: var(--text-24)` en elementos `<p>`. Con 9 tarjetas por página, esto generaba **18 alertas en almacén** y **42 en semáforo**.

**Antes:**
```jsx
<div className="card-almacen__bic">
  <p className="card-almacen__etiqueta">Código Bic :</p>
  <p className="card-almacen__valor">{codigoBic}</p>
</div>
```

**Corrección aplicada:** Cambio de `<p>` a `<span>`. Los spans son elementos inline y WAVE no los considera candidatos a encabezado. El layout no cambia porque ambos son flex items dentro de su contenedor:

```jsx
<div className="card-almacen__bic">
  <span className="card-almacen__etiqueta">Código Bic :</span>
  <span className="card-almacen__valor">{codigoBic}</span>
</div>
```

#### Caso 2 — Cabeceras de tramo del semáforo (`CabeceraTramo.jsx`)

Cada columna del semáforo tenía `<p>` con `font-size: var(--text-48)` para el título del tramo. Son encabezados de sección, por lo que el elemento correcto es `<h2>`.

**Antes:**
```jsx
<p className="cabecera-tramo__label">{LABELS[tramo]}</p>
<p className="cabecera-tramo__cantidad">{cantidad} contenedores</p>
```

**Corrección aplicada:**
```jsx
<h2 className="cabecera-tramo__label">{LABELS[tramo]}</h2>
<span className="cabecera-tramo__cantidad">{cantidad} contenedores</span>
```

#### Caso 3 — Elementos de perfil (`PerfilCredenciales.jsx`)

Los títulos de sección del perfil usaban `<p>` con `font-size: var(--texto-tamanio-32)`.

**Corrección aplicada:** Cambio a `<h2>` para el título principal y `<h3>` para las etiquetas de campo:

```jsx
// Antes
<p className="perfil-credenciales__titulo">Cambiar datos</p>
<p className="perfil-credenciales__etiqueta">Nombre</p>

// Después
<h2 className="perfil-credenciales__titulo">Cambiar datos</h2>
<h3 className="perfil-credenciales__etiqueta">Nombre</h3>
```

#### Caso 4 — Títulos de la página de subir foto OCR (`SubirFotoOcr.jsx`)

Los títulos "Introduce la Imagen" y "Previsualizado de la imagen" usaban `<p>` con `font-size: var(--texto-tamanio-40)`.

**Corrección aplicada:**
```jsx
// Antes
<p className="subir-foto-ocr__titulo">Introduce la Imagen</p>
<p className="subir-foto-ocr__previsualizacion-titulo">Previsualizado de la imagen</p>

// Después
<h2 className="subir-foto-ocr__titulo">Introduce la Imagen</h2>
<h2 className="subir-foto-ocr__previsualizacion-titulo">Previsualizado de la imagen</h2>
```

---

## 5. Resultados por página

Las siguientes capturas documentan el estado final de WAVE en cada página de Fluster tras aplicar todas las correcciones. Todas las páginas muestran **0 errores** y **0 errores de contraste**.

| Página | Ruta | Captura |
|---|---|---|
| Home | `/` | [wave-home.png](../assets/img/wave/wave-home.png) |
| Login | `/login` | [wave-login.png](../assets/img/wave/wave-login.png) |
| Registro | `/registro` | [wave-registro.png](../assets/img/wave/wave-registro.png) |
| Semáforo | `/semaforo` | [wave-semaforo.png](../assets/img/wave/wave-semaforo.png) |
| Almacén | `/almacen` | [wave-almacen.png](../assets/img/wave/wave-almacen.png) |
| Meter contenedor | `/meter-contenedor` | [wave-meter_contenedor.png](../assets/img/wave/wave-meter_contenedor.png) |
| Historial contenedor | `/almacen/historial/:id` | [wave-historial_contenedor.png](../assets/img/wave/wave-historial_contenedor.png) |
| Perfil | `/perfil` | [wave-perfil.png](../assets/img/wave/wave-perfil.png) |
| Tarifas | `/tarifas` | [wave-tarifas.png](../assets/img/wave/wave-tarifas.png) |
| Panel de control | `/panel` | [wave-panel_de_control.png](../assets/img/wave/wave-panel_de_control.png) |
| Contenedores | `/contenedores` | [wave-contenedores.png](../assets/img/wave/wave-contenedores.png) |

---

## 6. Impacto en el código

### Regla general adoptada

| Situación | Elemento correcto |
|---|---|
| Título de sección o bloque | `<h2>`, `<h3>`, `<h4>` según jerarquía |
| Etiqueta de dato en card (texto grande) | `<span>` con `display: block` si es necesario |
| Descripción/párrafo de texto | `<p>` (siempre que el tamaño no supere ~1.5rem) |
| Input sin `<label>` visible | `aria-label` en el propio `<input>` |
| Input oculto (activado por botón) | `aria-label` + `aria-hidden="true"` |

### Impacto en accesibilidad

Estas correcciones permiten que un usuario con lector de pantalla pueda:

1. **Navegar por encabezados** — saltar directamente a "Primer Tramo", "Segundo Tramo", etc. en el semáforo.
2. **Identificar campos de formulario** — el lector anuncia "Días libres detention — MSC" al enfocar cada celda de la tabla de tarifas.
3. **Operar inputs de archivo** — el lector anuncia "Seleccionar foto del contenedor" al enfocar el input de subida.
4. **Entender la estructura de las tarjetas** — "Código Bic :" se lee como texto descriptivo, no como posible título de sección.
