# RA2.e — Redefinir estilos

> **RA vinculado:** RA2 — CE 2.e  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Reset — punto de partida neutro](#1-reset--punto-de-partida-neutro)
2. [Redefinición de estados interactivos](#2-redefinición-de-estados-interactivos)
3. [Modificadores BEM como redefiniciones](#3-modificadores-bem-como-redefiniciones)
4. [Redefinición por tema](#4-redefinición-por-tema)

---

## 1. Reset — punto de partida neutro

Antes de aplicar cualquier estilo del sistema de diseño, Fluster aplica un reset en `02-generic/_reset.scss` que neutraliza las diferencias entre navegadores y elimina los estilos por defecto que interferirían con el diseño propio.

### Box-sizing universal

```scss
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

Redefine el modelo de caja de todos los elementos: el padding y el borde quedan incluidos dentro del ancho declarado, no fuera. Esto hace que los cálculos de layout sean predecibles.

### Reset de márgenes y paddings

```scss
* {
  margin:  0;
  padding: 0;
}
```

Elimina los márgenes predeterminados que los navegadores aplican a `<h1>`-`<h6>`, `<p>`, `<ul>`, `<body>`, etc. A partir de aquí, todo el espaciado es explícito mediante los tokens `--space-*`.

### Reset de multimedia

```scss
img,
picture,
video,
canvas,
svg {
  display:   block;
  max-width: 100%;
}

img {
  height: auto;
}
```

Redefine las imágenes de `inline` a `block` (elimina el espacio fantasma que queda debajo de las imágenes inline) y las hace responsivas por defecto.

### Reset de formularios

```scss
input,
button,
textarea,
select {
  font: inherit;
}
```

Redefine la herencia de fuente en elementos de formulario. Los navegadores no aplican `font: inherit` en estos elementos por defecto; sin este reset, usarían una fuente del sistema diferente a Poppins.

```scss
button {
  cursor: pointer;
}
```

Redefine el cursor a `pointer` en todos los botones, que en algunos navegadores por defecto muestran el cursor de texto.

### Reset de tabla

```scss
table {
  border-collapse: collapse;
  border-spacing:  0;
}
```

Necesario para la tabla de tarifas: redefine el modelo de borde de `separate` a `collapse`, evitando el doble borde entre celdas.

### Reset de interacción móvil

```scss
a,
button {
  -webkit-tap-highlight-color: transparent;
}
```

Elimina el resaltado azul que Safari/Chrome en iOS muestra al pulsar enlaces y botones.

---

## 2. Redefinición de estados interactivos

### Estado `:focus-visible` — mixin centralizado

Para redefinir el estado de foco de forma consistente en todos los elementos interactivos, existe el mixin `foco-visible`:

```scss
// frontend/src/styles/01-tools/_mixins.scss

@mixin foco-visible {
  &:focus-visible {
    outline:       none;
    box-shadow:    0 0 0 3px var(--color-primary-off);
    border-radius: var(--radius);
  }
}
```

Se aplica en todos los componentes interactivos:

```scss
// _btn-iniciar-sesion.scss
.btn-iniciar-sesion {
  @include mix.foco-visible;
}

// _input.scss
.input {
  @include mix.foco-visible;
}
```

Esto redefine el `outline` nativo del navegador (que suele ser azul y rectangular) por un anillo de sombra que respeta el `border-radius` del componente y usa el color del sistema.

### Estado `:hover`

```scss
// _btn-accion-tarifa.scss
.btn-accion-tarifa {
  background-color: var(--color-primary);
  transition:       background-color var(--transition-fast);

  &:hover {
    background-color: var(--color-primary-hover);
  }
}
```

### Estado `:disabled`

```scss
// _btn-iniciar-sesion.scss
.btn-iniciar-sesion {
  &:disabled {
    opacity: 0.6;
    cursor:  not-allowed;
  }
}
```

---

## 3. Modificadores BEM como redefiniciones

Los modificadores BEM (`bloque--modificador`) son la forma principal de redefinir el estilo base de un componente para una variante o estado concreto.

### Modificador de estado: `.input--error`

```scss
// _input.scss
.input {
  border: 1px solid var(--color-border);

  &--error {
    border-color: var(--color-error);         // redefine el borde
    background-color: var(--color-error-subtle); // redefine el fondo
  }
}
```

### Modificador de variante: `.btn-accion-tarifa--guardar` / `--cancelar`

```scss
// _btn-accion-tarifa.scss
.btn-accion-tarifa {
  background-color: var(--color-surface);

  &--guardar {
    background-color: var(--color-primary); // redefine al color primario
    color:            var(--color-box-text);
  }

  &--cancelar {
    background-color: var(--color-error);   // redefine al color de error
    color:            var(--color-box-text);
  }
}
```

### Modificador de celda editable: `.tabla-tarifas__celda--editable`

```scss
// _tabla-tarifas.scss
.tabla-tarifas__celda {
  padding:    var(--space-8) var(--space-16);
  text-align: center;

  &--editable {
    background-color: var(--color-primary-off); // redefine el fondo
    cursor:           text;
  }
}
```

---

## 4. Redefinición por tema

El tema oscuro redefine todos los tokens de color en `_css-variables.scss`. Cualquier componente que use `var(--color-*)` en lugar de valores hex directos obtiene automáticamente la versión redefinida para el tema oscuro:

```scss
// Tema oscuro — redefine los tokens globales
:root[data-theme='dark'] {
  --color-bg:      #111827;  // redefine #F9FAFB
  --color-surface: #1F2937;  // redefine #FFFFFF
  --color-text:    #F9FAFB;  // redefine #111827
  --color-border:  #374151;  // redefine #E5E7EB
}
```

Las tarjetas del semáforo también tienen variantes de color para el modo oscuro:

```scss
:root[data-theme='dark'] {
  --color-card-almacen:  #2F6891;  // redefine #4FB2F8
  --color-card-semaforo: #955A31;  // redefine #F8944F
}
```

El resultado es que los 76 archivos de componentes no necesitan ninguna regla adicional para soportar el modo oscuro: la redefinición de tokens en `:root[data-theme='dark']` se propaga automáticamente a través de las propiedades CSS.
