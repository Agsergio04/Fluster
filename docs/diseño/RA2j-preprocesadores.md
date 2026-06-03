# RA2.j — Preprocesadores de estilos

> **RA vinculado:** RA2 — CE 2.j  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Justificación del uso de SCSS](#1-justificación-del-uso-de-scss)
2. [Arquitectura ITCSS — estructura completa](#2-arquitectura-itcss--estructura-completa)
3. [Mixins — funciones reutilizables](#3-mixins--funciones-reutilizables)
4. [Variables Sass vs CSS Custom Properties](#4-variables-sass-vs-css-custom-properties)
5. [Sistema de módulos @use](#5-sistema-de-módulos-use)
6. [Proceso de compilación con Vite](#6-proceso-de-compilación-con-vite)

---

## 1. Justificación del uso de SCSS

Fluster usa **SCSS** (Sassy CSS) como preprocesador de estilos por las siguientes razones:

| Razón | Sin SCSS | Con SCSS |
|---|---|---|
| Variables de diseño | Valores hardcoded repetidos | Variables `$` centralizadas en `_variables.scss` |
| Lógica reutilizable | Copy-paste de media queries | Mixins `@mixin mobile { }` |
| Organización | Un archivo CSS enorme | 80+ archivos separados por responsabilidad |
| Anidamiento BEM | `.card__titulo` siempre fuera del bloque | `&__titulo` anidado dentro del bloque |
| Importación ordenada | Gestión manual de `<link>` | `@use` en `main.scss` con orden explícito |

---

## 2. Arquitectura ITCSS — estructura completa

ITCSS (Inverted Triangle CSS) organiza los archivos de menor a mayor especificidad. La metáfora del triángulo invertido indica que las reglas más genéricas (base amplia) van primero y las más específicas (vértice estrecho) al final.

```
frontend/src/styles/
│
├── 00-settings/              ← sin output CSS — solo definiciones
│   ├── _variables.scss       ← variables Sass ($color-primary, $space-16…)
│   └── _css-variables.scss   ← custom properties en :root (--color-primary…)
│
├── 01-tools/                 ← sin output CSS — lógica reutilizable
│   └── _mixins.scss          ← 8 mixins (mobile, tablet, flex-col, flex-row,
│                                texto, foco-visible, truncar, btn-base)
│
├── 02-generic/               ← output CSS — bajo alcance
│   └── _reset.scss           ← box-sizing, márgenes, multimedia, formularios
│
├── 03-elements/              ← output CSS — elementos sin clase
│   └── _elements.scss        ← body, h1-h6, a, button, input, img, table
│
├── 04-layout/                ← output CSS — estructura de página
│   └── _layout.scss          ← .pagina, .pagina__contenido, grids de sección
│
├── 05-components/            ← output CSS — la capa más extensa
│   └── _*.scss               ← 76 archivos (uno por componente)
│
├── 06-utilities/             ← output CSS — alta especificidad
│   └── _utilities.scss       ← .sr-only, .visually-hidden, clases de utilidad
│
└── main.scss                 ← importa todo en orden ITCSS
```

### Por qué este orden

Cada capa tiene especificidad creciente. Las reglas de `05-components` siempre superan a las de `03-elements` porque se importan después. Si se importara al revés, los estilos de elemento sobreescribirían a los de componente y el diseño se rompería.

---

## 3. Mixins — funciones reutilizables

Los mixins de Fluster están en `frontend/src/styles/01-tools/_mixins.scss`. Son 8 mixins que abstraen patrones repetitivos.

**Adopción en el código:** los breakpoints se aplican con `mobile`/`tablet` en todos los componentes responsivos (cabecera, tarjetas, footer, tablas de tarifas, páginas estáticas, panel de informes…) y los contenedores de layout usan `flex-col`/`flex-row`. Los mixins `texto`, `btn-base`, `foco-visible` y `truncar` se ofrecen como utilidades reutilizables; los componentes cuyo CSS difiere del patrón base (anillos de foco con color de error, botones con padding o transición propios) conservan su definición específica en lugar de forzar el mixin y alterar el resultado. Los ejemplos de cada apartado ilustran cómo invocarlos.

### Mixin `mobile` y `tablet` — breakpoints

```scss
@mixin mobile {
  @media (max-width: #{vars.$breakpoint-mobile}) {  // 767px
    @content;
  }
}

@mixin tablet {
  @media (max-width: #{vars.$breakpoint-tablet}) {  // 1023px
    @content;
  }
}
```

**Uso:**
```scss
.semaforo__contenido {
  display:               grid;
  grid-template-columns: repeat(4, 1fr);

  @include mix.tablet { grid-template-columns: repeat(2, 1fr); }
  @include mix.mobile { grid-template-columns: 1fr; }
}
```

### Mixin `flex-col` y `flex-row` — layout

```scss
@mixin flex-col($gap: null, $align: center) {
  display:        flex;
  flex-direction: column;
  align-items:    $align;
  @if $gap != null { gap: $gap; }
}

@mixin flex-row($gap: null, $align: center) {
  display:     flex;
  align-items: $align;
  @if $gap != null { gap: $gap; }
}
```

**Uso:**
```scss
.card-contenedor {
  @include mix.flex-col(var(--space-16));       // columna centrada con gap de 16px
}

.card-contenedor__acciones {
  @include mix.flex-row(var(--space-8), flex-end); // fila alineada a la derecha
}
```

### Mixin `texto` — tipografía

```scss
@mixin texto(
  $familia:      heading,
  $tamanio:      vars.$text-16,
  $peso:         vars.$font-weight-regular,
  $interlineado: vars.$leading-normal
) {
  font-family:  if($familia == heading, vars.$font-heading, vars.$font-body);
  font-size:    $tamanio;
  font-weight:  $peso;
  line-height:  $interlineado;
}
```

**Uso:**
```scss
.introduccion-pagina__titulo {
  @include mix.texto(heading, vars.$text-48, vars.$font-weight-bold, vars.$leading-tight);
}

.card-contenedor__codigo {
  @include mix.texto(body, vars.$text-16, vars.$font-weight-semibold, vars.$leading-normal);
}
```

### Mixin `foco-visible` — accesibilidad

```scss
@mixin foco-visible {
  &:focus-visible {
    outline:       none;
    box-shadow:    0 0 0 3px var(--color-primary-off);
    border-radius: var(--radius);
  }
}
```

**Uso:**
```scss
.btn-iniciar-sesion {
  @include mix.foco-visible;  // ejemplo: aplica el anillo de foco accesible al elemento
}
```

### Mixin `btn-base` — estructura de botones

```scss
@mixin btn-base($padding: var(--space-8)) {
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  padding:         $padding;
  border-radius:   var(--radius);
  transition:      background-color var(--transition-fast);
}
```

**Uso:**
```scss
.btn-iniciar-sesion {
  @include mix.btn-base(var(--space-16) var(--space-32));
  background-color: var(--color-primary);
}

.btn-accion-tarifa {
  @include mix.btn-base(var(--space-8) var(--space-16));
}
```

### Mixin `truncar` — texto desbordado

```scss
@mixin truncar {
  overflow:      hidden;
  text-overflow: ellipsis;
  white-space:   nowrap;
}
```

**Uso:**
```scss
.card-contenedor__codigo {
  @include mix.truncar;   // trunca códigos BIC muy largos
  max-width: 200px;
}
```

---

## 4. Variables Sass vs CSS Custom Properties

Fluster usa ambos sistemas con propósitos distintos:

| | Variables Sass (`$var`) | CSS Custom Properties (`--var`) |
|---|---|---|
| **Ámbito** | Solo en tiempo de compilación | En tiempo de ejecución (runtime) |
| **Disponibilidad** | Solo en archivos SCSS | En cualquier lugar del CSS/JS |
| **Cambio dinámico** | No — se compilan estáticamente | Sí — `element.style.setProperty('--color', '...')` |
| **Uso en Fluster** | Dentro de mixins y `@if` | En todos los componentes vía `var(--*)` |

```scss
// Variable Sass — usada en el mixin texto
@mixin texto($tamanio: vars.$text-16, ...) {
  font-size: $tamanio;      // se resuelve al compilar
}

// CSS Custom Property — usada en componente
.card-contenedor {
  background-color: var(--color-surface);  // se resuelve en runtime
  padding:          var(--space-24);
}
```

---

## 5. Sistema de módulos `@use`

Fluster usa `@use` (módulos Sass modernos) en lugar del obsoleto `@import`. Cada archivo que necesita acceder a las variables o mixins declara explícitamente su dependencia:

```scss
// En cualquier archivo de 05-components:
@use '../00-settings/variables' as vars;
@use '../01-tools/mixins'       as mix;

.mi-componente {
  font-size: vars.$text-24;        // variable Sass con namespace
  @include mix.flex-col(var(--space-16));  // mixin con namespace
}
```

El namespace (`vars.`, `mix.`) evita colisiones de nombres entre archivos y hace explícito el origen de cada variable o mixin.

---

## 6. Proceso de compilación con Vite

Vite usa internamente **sass** para compilar los archivos SCSS a CSS:

### Flujo de compilación

```
main.scss
  └─ @use './00-settings/variables'
  └─ @use './00-settings/css-variables'
  └─ @use './01-tools/mixins'
  └─ @use './02-generic/reset'
  └─ @use './03-elements/elements'
  └─ @use './04-layout/layout'
  └─ @use './05-components/header'
  └─ ... (76 componentes)
  └─ @use './06-utilities/utilities'
        ↓
     Sass compila
        ↓
     main.css (desarrollo: sin minificar)
     main.[hash].css (producción: minificado + tree-shaking)
```

### Comando de build

```bash
# Desarrollo (con hot reload)
npm run dev

# Producción (SCSS compilado + minificado)
npm run build
```

El resultado en producción es un único archivo CSS minificado que elimina comentarios, espacios y código no utilizado, reduciendo el tamaño de transferencia al navegador.
