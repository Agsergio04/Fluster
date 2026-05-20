# RA3.h — Aplicación de guía de estilo

> **RA vinculado:** RA3 — CE 3.h  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [La guía de estilo de Fluster](#1-la-guía-de-estilo-de-fluster)
2. [Sistema de diseño atómico](#2-sistema-de-diseño-atómico)
3. [Nomenclatura BEM — consistencia total](#3-nomenclatura-bem--consistencia-total)
4. [Style Guide — página de catálogo](#4-style-guide--página-de-catálogo)
5. [Aplicación consistente en todos los componentes](#5-aplicación-consistente-en-todos-los-componentes)

---

## 1. La guía de estilo de Fluster

La guía de estilo de Fluster está documentada en [docs/04-guia-estilos.md](../04-guia-estilos.md) y define:

- **Paleta de colores** — tokens primarios, secundarios, semánticos y del semáforo D&D.
- **Tipografía** — Crimson Text (headings) y Poppins (body), con escala base 8px.
- **Espaciado** — sistema base 8px, todos los valores son múltiplos de 8.
- **Radio de borde** — `--radius: 12px` aplicado uniformemente.
- **Sombras** — escala de cuatro niveles (`--shadow-sm` a `--shadow-xl`).
- **Transiciones** — tres velocidades (`--transition-fast`, `--transition-base`, `--transition-slow`).
- **Breakpoints** — mobile (767px) y tablet (1023px), enfoque desktop-first.

Esta guía se implementa íntegramente en los tokens de `00-settings` y se aplica en los 76 componentes de `05-components`.

---

## 2. Sistema de diseño atómico

Fluster implementa Atomic Design en cuatro niveles. Cada nivel hereda los tokens de la guía de estilo y no introduce valores propios.

### Nivel 1 — Átomos (34 componentes)

Los átomos son los componentes más básicos. Cada uno tiene una única responsabilidad y es completamente reutilizable.

**Ejemplos y cómo aplican la guía:**

```jsx
// Input.jsx — aplica tokens de color, radio, transición
<input className="input" />
// .input usa: --color-surface, --color-border, --radius, --transition-fast
```

```jsx
// Spinner.jsx — aplica tokens de color primario y animación
<span className="spinner spinner--sm" role="status" aria-label="Cargando" />
// .spinner usa: --color-primary, --color-primary-off
```

```jsx
// RolAsignado.jsx — aplica tokens de tipografía
<span className="rol-asignado rol-asignado--gestor">{rol}</span>
// .rol-asignado usa: --text-8, --font-weight-semibold, --radius
```

### Nivel 2 — Moléculas

Las moléculas combinan átomos siguiendo las reglas de espaciado de la guía:

```jsx
// EntradaDatosLogin.jsx
<div className="entrada-datos-form">
  <label className="entrada-datos-form__label">{etiqueta}</label>
  <Input value={value} onChange={onChange} />
  {error && <p className="entrada-datos-form__error" role="alert">{error}</p>}
</div>
// Gap entre label e input: --space-8
// Error en --color-error (token semántico)
```

### Nivel 3 — Organismos

Los organismos aplican los tokens de layout (grid, flexbox) de la guía:

```jsx
// Header.jsx — aplica tokens de color primario y layout flex
<header className="header">
  <div className="header__marca">...</div>
  <nav className="header__navegacion">...</nav>
  <div className="header__acciones">...</div>
</header>
// .header usa: --color-primary (fondo), display flex, --space-16 (gap)
```

### Nivel 4 — Páginas

Cada página ensambla organismos y define la estructura de su sección introductoria:

```jsx
// semaforo.jsx
<main>
  <section className="semaforo__intro">
    <h1>Estado de los contenedores</h1>  // --text-48, --font-heading
    <p>Gestiona el riesgo D&D.</p>        // --text-16, --color-text-subtle
  </section>
  <section className="semaforo__contenido">
    // grid de 4 columnas con --space-24 de gap
  </section>
</main>
```

---

## 3. Nomenclatura BEM — consistencia total

La guía de estilo establece que **toda clase CSS debe seguir BEM**. No existen clases genéricas como `.red`, `.big` o `.left` en el proyecto.

### Reglas de BEM en Fluster

1. **Bloque** — nombre del componente en kebab-case: `.card-almacen`, `.btn-eliminar`, `.modal-editar-contenedor`.
2. **Elemento** — doble guión bajo: `.card-almacen__titulo`, `.modal-editar-contenedor__caja`.
3. **Modificador** — doble guión: `.btn-accion-tarifa--guardar`, `.input--error`, `.spinner--sm`.
4. **Sin mayúsculas ni camelCase** — nunca `.CardAlmacen` ni `.cardAlmacen`.
5. **Sin más de dos niveles de anidamiento en BEM** — `.card-almacen__botones__eliminar` está prohibido; usar `.card-almacen__btn-eliminar`.

### Verificación de consistencia

Los 76 archivos de `05-components` siguen esta nomenclatura sin excepción. El linter de SCSS (si se configura) puede verificarlo automáticamente con `stylelint-bem-check`.

---

## 4. Style Guide — página de catálogo

La ruta `/guia_estilos` muestra todos los componentes del sistema con sus variantes y estados. Es la evidencia visual de que la guía de estilo se aplica de forma coherente.

### Contenido de la página `/guia_estilos`

La página está organizada en secciones:

#### Sección 1 — Colores

Muestra todos los tokens de color con su nombre de variable CSS, valor hexadecimal y descripción de uso. Incluye los colores del semáforo D&D con su significado semántico.

#### Sección 2 — Tipografía

Muestra la escala tipográfica completa de `--text-8` a `--text-64`, las dos familias (Crimson Text y Poppins) y los cinco pesos de fuente.

#### Sección 3 — Espaciado

Representación visual de todos los tokens `--space-*` como barras de color proporcionales a su tamaño.

#### Sección 4 — Componentes

Catálogo de todos los átomos y moléculas con sus variantes:

- **Botones** — todos los tipos (primario, secundario, peligro) en sus estados (normal, hover, disabled, cargando).
- **Inputs** — normal, con error, con contraseña visible/oculta.
- **Spinner** — los tres tamaños (sm, md, lg).
- **Notificación** — variantes éxito y error.
- **Tarjetas** — tarjeta de almacén, semáforo y usuario.
- **Indicadores de semáforo** — los cuatro colores (verde, amarillo, rojo, gris).

---

## 5. Aplicación consistente en todos los componentes

La consistencia se garantiza mediante tres mecanismos:

### Mecanismo 1 — Fuente única de tokens

Ningún componente usa valores hardcoded. El único lugar donde se definen colores, tamaños y espaciados es `_variables.scss`. Si se cambia `$color-primary: #4FB2F8` por otro color, todos los componentes se actualizan automáticamente en el siguiente build.

### Mecanismo 2 — Mixins obligatorios para patrones comunes

Los patrones de layout, tipografía y accesibilidad se implementan **siempre** vía mixin:

```scss
// Correcto — uso del mixin
.card-almacen {
  @include mix.flex-col(var(--space-16));
  @include mix.foco-visible;
}

// Incorrecto — sin mixin (rompe la consistencia)
.card-almacen {
  display:        flex;
  flex-direction: column;
  gap:            16px;  // valor hardcoded!
}
```

### Mecanismo 3 — Un archivo SCSS por componente

La regla es que cada componente React (`.jsx`) tiene exactamente un archivo SCSS (`.scss`) en `05-components`. Esto evita que los estilos de un componente contaminen a otro y facilita la búsqueda y el mantenimiento.

```
CardAlmacen.jsx          →  _card-almacen.scss
Spinner.jsx              →  _spinner.scss
ModalEditarContenedor.jsx →  _modal-editar-contenedor.scss
```
