# RA2.f — Propiedades de elementos

> **RA vinculado:** RA2 — CE 2.f  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [HTML semántico en Fluster](#1-html-semántico-en-fluster)
2. [Landmarks y estructura de página](#2-landmarks-y-estructura-de-página)
3. [ARIA — atributos de accesibilidad](#3-aria--atributos-de-accesibilidad)
4. [Jerarquía de encabezados](#4-jerarquía-de-encabezados)
5. [Formularios estructurados](#5-formularios-estructurados)
6. [Propiedades CSS aplicadas a los elementos](#6-propiedades-css-aplicadas-a-los-elementos)

---

## 1. HTML semántico en Fluster

El HTML semántico usa etiquetas que describen el significado del contenido, no solo su apariencia. Fluster aplica elementos semánticos HTML5 en todas sus páginas para que lectores de pantalla, motores de búsqueda y herramientas de accesibilidad puedan interpretar correctamente la estructura.

### Elementos semánticos utilizados

| Elemento | Descripción | Páginas donde aparece |
|---|---|---|
| `<header>` | Cabecera de la página con navegación | Todas las páginas autenticadas |
| `<nav>` | Bloque de navegación | `BotonesMenuHamburguesa`, `Header` |
| `<main>` | Contenido principal único de la página | Todas las páginas |
| `<section>` | Sección temática dentro del main | `semaforo`, `home`, `historial`, `perfil` |
| `<article>` | Contenido autónomo reutilizable | Tarjetas de contenedor, noticias de home |
| `<aside>` | Contenido relacionado pero secundario | `historial_contenedor` (panel de informe) |
| `<footer>` | Pie de página | Todas las páginas |
| `<h1>`–`<h3>` | Jerarquía de encabezados | En cada página con jerarquía lógica |
| `<ul>` / `<li>` | Listas de navegación y datos | Footer, listados de contenedores |
| `<time>` | Fechas y horas | Tarjetas de contenedor, historial |
| `<figure>` / `<figcaption>` | Imágenes con descripción | Fotos de eventos |

---

## 2. Landmarks y estructura de página

### Estructura estándar de las páginas autenticadas

```html
<!-- Estructura semántica de semaforo.jsx -->
<header className="header">
  <nav className="botones-menu-hamburguesa" aria-label="Navegación principal">
    <!-- enlaces de navegación -->
  </nav>
</header>

<main>
  <section className="semaforo__intro" aria-label="Estado de los contenedores">
    <h1>Estado de los contenedores</h1>
    <p>Gestiona el riesgo D&D de tus contenedores activos.</p>
  </section>

  <section className="semaforo__contenido">
    <!-- columnas por nivel de riesgo -->
  </section>
</main>

<footer className="footer">
  <ul className="footer__lista">
    <li><a href="/privacidad">Política de privacidad</a></li>
    <li><a href="/terminos">Términos de uso</a></li>
  </ul>
</footer>
```

### Página Home — uso de `<article>`

```html
<!-- home.jsx -->
<main>
  <section className="home__hero">
    <h1>Controla tus costes de D&D</h1>
    <p>Centraliza el ciclo de vida de tus contenedores.</p>
  </section>

  <section className="home__features" aria-label="Funcionalidades de Fluster">
    <article className="home__feature">
      <h2>Semáforo de riesgo</h2>
      <p>Visualiza qué contenedores generan costes en tiempo real.</p>
    </article>
    <article className="home__feature">
      <h2>OCR automático</h2>
      <p>Lee el código BIC de la foto del contenedor.</p>
    </article>
  </section>
</main>
```

### Página Historial — uso de `<aside>`

```html
<!-- historial_contenedor.jsx -->
<main>
  <section className="historial-contenedor__historial">
    <h1>Historial del contenedor</h1>
    <!-- línea de tiempo de eventos -->
  </section>

  <aside className="historial-contenedor__informe">
    <h2>Generar informe PDF</h2>
    <!-- panel para generar informe -->
  </aside>
</main>
```

El `<aside>` indica que el panel de informe es contenido relacionado pero no es el propósito principal de la página (el historial).

---

## 3. ARIA — atributos de accesibilidad

### `role="status"` — Spinner

```jsx
// Spinner.jsx
<span
  className={`spinner spinner--${tamanio}`}
  role="status"
  aria-label="Cargando"
/>
```

`role="status"` informa al lector de pantalla de que el elemento muestra información de estado del sistema. `aria-label="Cargando"` proporciona el texto que el lector de pantalla anuncia.

### `role="alert"` — Mensajes de error OCR

```jsx
// SubirFotoOcr.jsx
<p role="alert" className="subir-foto-ocr__error-ocr">
  {errorOcr}
</p>
```

`role="alert"` hace que el lector de pantalla anuncie el contenido inmediatamente cuando aparece, sin que el usuario tenga que navegar hasta él. Adecuado para mensajes de error críticos.

### `aria-label` — Navegación y buscadores

```jsx
// BotonesMenuHamburguesa.jsx
<nav className="botones-menu-hamburguesa" aria-label="Navegación principal">

// BuscadorContenedores.jsx
<section className="buscador-contenedores" aria-label="Buscador rápido">
```

`aria-label` describe el propósito del bloque cuando no hay un encabezado visible que lo haga.

### `aria-hidden` — Iconos decorativos

Los iconos SVG importados como componentes React incluyen `aria-hidden="true"` cuando son puramente decorativos, evitando que el lector de pantalla los anuncie:

```jsx
<IconoContenedor aria-hidden="true" />
<span>Ver contenedores</span>
```

---

## 4. Jerarquía de encabezados

Cada página sigue una jerarquía lógica de encabezados sin saltar niveles:

| Nivel | Elemento | Uso en Fluster |
|---|---|---|
| 1 | `<h1>` | Título principal de la página (uno por página) |
| 2 | `<h2>` | Título de sección importante |
| 3 | `<h3>` | Título de componente o tarjeta |

```html
<!-- semaforo.jsx — jerarquía correcta -->
<h1>Estado de los contenedores</h1>     <!-- nivel 1: tema de la página -->
  <h2>Sin coste</h2>                     <!-- nivel 2: sección -->
    <h3>MSCU1234567</h3>                 <!-- nivel 3: tarjeta individual -->
  <h2>Primer tramo</h2>
    <h3>MAEU9876543</h3>
```

---

## 5. Formularios estructurados

Los formularios de Fluster asocian cada `<input>` con su `<label>` mediante `htmlFor` / `id`:

```jsx
// EntradaDatosLogin.jsx
<div className="entrada-datos-form">
  <label htmlFor={id} className="entrada-datos-form__label">
    {etiqueta}
  </label>
  <Input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
  />
  {error && <p className="entrada-datos-form__error" role="alert">{error}</p>}
</div>
```

La asociación `label → input` permite que al hacer clic en la etiqueta se active el campo, y que el lector de pantalla anuncie el nombre del campo al enfocar el input.

---

## 6. Propiedades CSS aplicadas a los elementos

Estas son las propiedades CSS más relevantes que se aplican a los elementos semánticos del proyecto:

| Elemento | Propiedad CSS | Valor | Propósito |
|---|---|---|---|
| `html` | `font-size` | `16px` | Base para los rem |
| `html` | `scroll-behavior` | `smooth` | Scroll suave al navegar con anclas |
| `html` | `color-scheme` | `light dark` | Informa al navegador de soporte de temas |
| `body` | `min-height` | `100dvh` | Página siempre ocupa toda la pantalla |
| `body` | `font-family` | `var(--font-body)` | Poppins en todo el cuerpo |
| `img` | `display` | `block` | Elimina espacio fantasma debajo de imágenes |
| `img` | `max-width` | `100%` | Imágenes responsivas por defecto |
| `img` | `height` | `auto` | Mantiene proporción en imágenes responsivas |
| `button` | `cursor` | `pointer` | Cursor de mano en todos los botones |
| `input` | `font` | `inherit` | Hereda Poppins (no font del sistema) |
| `table` | `border-collapse` | `collapse` | Evita doble borde en tabla de tarifas |
| `[hidden]` | `display` | `none` | Oculta elementos con atributo hidden |
