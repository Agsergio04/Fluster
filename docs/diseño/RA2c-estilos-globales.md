# RA2.c — Estilos globales

> **RA vinculado:** RA2 — CE 2.c  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Organización global de estilos](#1-organización-global-de-estilos)
2. [Variables Sass — fuente única de tokens](#2-variables-sass--fuente-única-de-tokens)
3. [Variables CSS — propiedades personalizadas globales](#3-variables-css--propiedades-personalizadas-globales)
4. [Sistema de layout global](#4-sistema-de-layout-global)
5. [Punto de entrada — main.scss](#5-punto-de-entrada--mainscss)

---

## 1. Organización global de estilos

Fluster organiza sus estilos globales con la arquitectura **ITCSS** (Inverted Triangle CSS), que divide los archivos en capas ordenadas de menor a mayor especificidad. Las capas `00-settings` y `04-layout` son las que contienen los estilos verdaderamente globales.

```
frontend/src/styles/
├── 00-settings/
│   ├── _variables.scss      ← Variables Sass (fuente única de todos los tokens)
│   └── _css-variables.scss  ← Propiedades CSS en :root (acceso global en runtime)
├── 01-tools/
│   └── _mixins.scss         ← Mixins reutilizables (no generan CSS directamente)
├── 02-generic/
│   └── _reset.scss          ← Reset aplicado a todos los elementos
├── 03-elements/
│   └── _elements.scss       ← Estilos base de etiquetas HTML
├── 04-layout/
│   └── _layout.scss         ← Grid y estructura global de páginas
├── 05-components/           ← Estilos de componentes individuales (76 archivos)
├── 06-utilities/
│   └── _utilities.scss      ← Clases de utilidad de alta especificidad
└── main.scss                ← Importa todo en orden correcto
```

---

## 2. Variables Sass — fuente única de tokens

El archivo `frontend/src/styles/00-settings/_variables.scss` contiene **todas las variables Sass** del proyecto. Es la única fuente de verdad para los valores de diseño. Ningún componente usa valores hardcoded; todos consumen estas variables.

### Colores

```scss
// ── Colores primarios
$color-primary:       #4FB2F8;
$color-primary-hover: #69C1FF;
$color-primary-off:   #C8E7FD;

// ── Colores secundarios
$color-secondary:       #F28C28;
$color-secondary-hover: #F6A656;
$color-secondary-off:   #FBDBBC;

// ── Fondos (modo claro / modo oscuro)
$color-bg-light:      #F9FAFB;
$color-bg-dark:       #111827;
$color-surface-light: #FFFFFF;
$color-surface-dark:  #1F2937;

// ── Texto
$color-text-light:        #111827;
$color-text-dark:         #F9FAFB;
$color-text-subtle-light: #6B7280;
$color-text-subtle-dark:  #9CA3AF;

// ── Semáforo D&D
$color-sin-costes:   #35C65B;
$color-primer-tramo: #FFFC4B;
$color-segundo-tramo:#F66B6B;
$color-inactivo:     #B0AEAE;
```

### Tipografía

```scss
$font-heading: 'Crimson Text', Georgia, serif;
$font-body:    'Poppins', system-ui, sans-serif;

// Escala (base 8px)
$text-8:  0.5rem;
$text-16: 1rem;
$text-24: 1.5rem;
$text-32: 2rem;
$text-40: 2.5rem;
$text-48: 3rem;
$text-56: 3.5rem;
$text-64: 4rem;

// Pesos
$font-weight-light:    300;
$font-weight-regular:  400;
$font-weight-medium:   500;
$font-weight-semibold: 600;
$font-weight-bold:     700;
```

### Espaciado

```scss
// Base 8px — todos los espaciados son múltiplos de 8
$space-8:       0.5rem;
$space-16:      1rem;
$space-24:      1.5rem;
$space-32:      2rem;
$space-40:      2.5rem;
$space-48:      3rem;
$space-56:      3.5rem;
$space-64:      4rem;
$space-72:      4.5rem;
$space-80:      5rem;
$space-88:      5.5rem;
$space-96:      6rem;
$space-input-y: 0.5rem;
$space-input-x: 1rem;
```

### Otros tokens

```scss
$radius:          12px;
$transition-fast: 150ms ease-in-out;
$transition-base: 300ms ease-in-out;
$transition-slow: 500ms ease-in-out;

$shadow-sm: 0 1px 2px rgba(0,0,0,.05);
$shadow-md: 0 4px 6px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.06);
$shadow-lg: 0 10px 15px rgba(0,0,0,.1), 0 4px 6px rgba(0,0,0,.08);
$shadow-xl: 0 20px 25px rgba(0,0,0,.1), 0 10px 10px rgba(0,0,0,.04);

$breakpoint-mobile: 767px;
$breakpoint-tablet: 1023px;
```

---

## 3. Variables CSS — propiedades personalizadas globales

El archivo `_css-variables.scss` expone los tokens Sass como **CSS Custom Properties** (`var(--*)`) en el selector `:root`. Esto hace que estén disponibles globalmente en runtime para todos los componentes, incluyendo la lógica de cambio de tema.

```scss
// frontend/src/styles/00-settings/_css-variables.scss

:root {
  --color-primary:       #{vars.$color-primary};
  --color-primary-hover: #{vars.$color-primary-hover};
  --color-primary-off:   #{vars.$color-primary-off};

  --color-bg:      #{vars.$color-bg-light};
  --color-surface: #{vars.$color-surface-light};

  --color-text:        #{vars.$color-text-light};
  --color-text-subtle: #{vars.$color-text-subtle-light};
  --color-border:      #{vars.$color-border-light};

  --font-heading: #{vars.$font-heading};
  --font-body:    #{vars.$font-body};

  --text-16: #{vars.$text-16};
  --text-24: #{vars.$text-24};
  /* ... resto de tokens ... */

  --space-16: #{vars.$space-16};
  --space-24: #{vars.$space-24};
  /* ... */

  --radius:          #{vars.$radius};
  --transition-fast: #{vars.$transition-fast};
  --shadow-md:       #{vars.$shadow-md};
}
```

### Por qué dos niveles (Sass + CSS)

- Las **variables Sass** (`$color-primary`) solo existen en tiempo de compilación y se usan en los mixins donde se necesita lógica Sass (interpolación, operaciones).
- Las **propiedades CSS** (`--color-primary`) existen en tiempo de ejecución y permiten que JavaScript cambie el tema sin recargar la página.

---

## 4. Sistema de layout global

El archivo `04-layout/_layout.scss` define los contenedores y grids de alto nivel que estructuran todas las páginas.

```scss
// frontend/src/styles/04-layout/_layout.scss

.pagina {
  min-height:     100dvh;
  display:        flex;
  flex-direction: column;
}

.pagina__contenido {
  flex:       1;
  width:      100%;
  max-width:  1280px;
  margin:     0 auto;
  padding:    var(--space-32) var(--space-24);

  @include mobile {
    padding: var(--space-16);
  }
}
```

Este layout global garantiza que todas las páginas tengan la misma estructura de `min-height: 100dvh` con header fijo arriba y footer siempre al final, independientemente de la cantidad de contenido.

---

## 5. Punto de entrada — main.scss

El archivo `frontend/src/styles/main.scss` importa todas las capas en el orden correcto de la pirámide ITCSS. El orden es crítico: si se invierte, la especificidad se rompe.

```scss
// frontend/src/styles/main.scss

// 1. Sin output CSS
@use './00-settings/variables';
@use './00-settings/css-variables';
@use './01-tools/mixins';

// 2. Output CSS — de menor a mayor especificidad
@use './02-generic/reset';
@use './03-elements/elements';
@use './04-layout/layout';

// 3. Componentes (mayor especificidad)
@use './05-components/header';
@use './05-components/footer';
@use './05-components/spinner';
@use './05-components/notificacion';
@use './05-components/input';
// ... 71 componentes más ...

// 4. Utilidades (especificidad máxima)
@use './06-utilities/utilities';
```

Vite compila este archivo en un único `main.css` optimizado durante el build de producción, eliminando código no utilizado y minimizando el resultado.
