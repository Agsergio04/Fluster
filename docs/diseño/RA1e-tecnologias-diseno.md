# RA1.e — Tecnologías de diseño

> **RA vinculado:** RA1 — CE 1.e  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Tecnologías de diseño utilizadas](#1-tecnologías-de-diseño-utilizadas)
2. [Wireframes y prototipos — evidencias visuales](#2-wireframes-y-prototipos--evidencias-visuales)
3. [Sistema de tokens — puente entre diseño y código](#3-sistema-de-tokens--puente-entre-diseño-y-código)
4. [Style Guide como herramienta de diseño viva](#4-style-guide-como-herramienta-de-diseño-viva)
5. [SCSS como tecnología de diseño técnico](#5-scss-como-tecnología-de-diseño-técnico)

---

## 1. Tecnologías de diseño utilizadas

Fluster utiliza las siguientes herramientas y tecnologías a lo largo de su proceso de diseño e implementación:

| Tecnología | Fase | Propósito |
|---|---|---|
| Figma | Diseño | Wireframes, prototipos navegables y Style Guide visual |
| SCSS (Sass) | Implementación | Preprocesador de estilos con tokens, mixins y arquitectura ITCSS |
| CSS Custom Properties | Implementación | Sistema de tokens en tiempo de ejecución (temas claro/oscuro) |
| React (JSX) | Implementación | Componentes que replican la estructura de Figma (Atomic Design) |
| Style Guide page | Verificación | Catálogo vivo que valida coherencia entre diseño y código |

---

## 2. Wireframes y prototipos — evidencias visuales

El proceso de diseño de Fluster está documentado visualmente en `docs/assets/img/`:

### Wireframes

Los wireframes de baja fidelidad definen la estructura y jerarquía de información antes de añadir estilos:

```
docs/assets/img/wireframes/
├── wireframe-home.png
├── wireframe-semaforo.png
├── wireframe-almacen.png
├── wireframe-login.png
├── wireframe-registro.png
└── ... (16 wireframes en total)
```

Cada wireframe define:
- La disposición de los bloques principales (header, contenido, footer).
- La jerarquía de información (qué es más importante visualmente).
- Los elementos interactivos (botones, formularios, modales).

### Prototipos navegables

Los prototipos de alta fidelidad muestran el aspecto visual final y el flujo de navegación:

```
docs/assets/img/prototipado/
├── prototipo-home.png
├── prototipo-semaforo.png
├── prototipo-almacen.png
└── ... (16 prototipos en total)
```

La coherencia entre wireframe y prototipo demuestra que el proceso de diseño sigue fases ordenadas: estructura → componentes → estilo final.

---

## 3. Sistema de tokens — puente entre diseño y código

En lugar de duplicar valores entre Figma y el código, Fluster define un único sistema de tokens que gobierna tanto el diseño como la implementación.

### Variables SCSS (`_variables.scss`)

Las variables Sass son los valores fuente del sistema. Definen los valores numéricos que después se exponen como Custom Properties:

```scss
// frontend/src/styles/00-settings/_variables.scss

// Tipografía
$font-heading:        'Crimson Text', serif;
$font-body:           'Poppins', sans-serif;
$text-16:             1rem;
$text-24:             1.5rem;
$text-32:             2rem;
$text-48:             3rem;
$text-64:             4rem;

// Espaciado
$space-8:             0.5rem;
$space-16:            1rem;
$space-24:            1.5rem;
$space-32:            2rem;
$space-48:            3rem;
$space-64:            4rem;

// Breakpoints
$breakpoint-mobile:   767px;
$breakpoint-tablet:   1023px;
```

### CSS Custom Properties (`_css-variables.scss`)

Las variables SCSS se exponen como Custom Properties para que estén disponibles en tiempo de ejecución (necesario para el cambio de tema):

```scss
// frontend/src/styles/00-settings/_css-variables.scss

:root {
  // Tipografía
  --font-heading:        #{vars.$font-heading};
  --font-body:           #{vars.$font-body};
  --text-16:             #{vars.$text-16};
  --text-24:             #{vars.$text-24};

  // Espaciado
  --space-8:             #{vars.$space-8};
  --space-16:            #{vars.$space-16};
  --space-24:            #{vars.$space-24};

  // Color (tema claro por defecto)
  --color-primary:       #4FB2F8;
  --color-bg:            #F9FAFB;
  --color-surface:       #FFFFFF;
  --color-text:          #111827;
}
```

### Coherencia con Figma

Los tokens del código corresponden directamente a los estilos definidos en Figma:

| Token en código | Equivalente en Figma | Valor |
|---|---|---|
| `--color-primary` | Color/Primary | `#4FB2F8` |
| `--font-heading` | Text/Heading | Crimson Text |
| `--space-24` | Spacing/Medium | `1.5rem` |
| `--radius` | Border/Radius | `0.5rem` |

Este mapeo garantiza que el diseño y la implementación siempre sean coherentes, ya que cualquier cambio en los tokens del código se refleja automáticamente en todos los componentes.

---

## 4. Style Guide como herramienta de diseño viva

La página `/guia-estilos` (`frontend/src/pages/guia_estilos/`) actúa como documentación viva del sistema de diseño. No es un PDF estático: es la aplicación real ejecutando todos sus componentes.

### Contenido del Style Guide

La página muestra de forma organizada y navegable:

- **Paleta de colores** — todos los tokens `--color-*` con su valor en modo claro y oscuro.
- **Escala tipográfica** — todos los niveles de `--text-8` a `--text-64`.
- **Sistema de espaciado** — representación visual de todos los tokens `--space-*`.
- **Botones** — todas las variantes con sus estados (normal, hover, disabled, loading).
- **Campos de formulario** — con estados normal, focus y error.
- **Tarjetas** — en sus tres variantes (contenedor, almacén, semáforo).
- **Indicadores** — spinner, notificaciones, badges de rol.
- **Colores del semáforo** — los cuatro estados de riesgo D&D.

### Valor como herramienta de diseño

Cualquier cambio en el sistema de tokens (por ejemplo, cambiar el color primario) se refleja instantáneamente en la página de Style Guide, permitiendo verificar visualmente la coherencia del sistema antes de que llegue al usuario final. Esta es la función principal de un sistema de diseño: garantizar la coherencia a escala.

---

## 5. SCSS como tecnología de diseño técnico

SCSS es la tecnología central que permite implementar el sistema de diseño de Fluster con precisión y sin duplicidad.

### Mixins como fragmentos de diseño reutilizables

Los mixins encapsulan patrones de diseño que se usan en múltiples componentes:

```scss
// _mixins.scss

// Layout: fila con gap configurable
@mixin flex-row($gap: null, $align: center) {
  display:     flex;
  align-items: $align;
  @if $gap != null { gap: $gap; }
}

// Accesibilidad: anillo de foco estándar
@mixin foco-visible {
  &:focus-visible {
    outline:    none;
    box-shadow: 0 0 0 3px var(--color-primary-off);
  }
}

// Botón base
@mixin btn-base($padding: var(--space-8)) {
  display:         inline-flex;
  align-items:     center;
  justify-content: center;
  padding:         $padding;
  border-radius:   var(--radius);
  transition:      background-color var(--transition-fast);
}
```

Estos mixins actúan como "componentes de diseño": al usarlos, un componente adopta automáticamente las convenciones visuales del sistema.

### Breakpoints como tokens de layout responsive

Los breakpoints también son tokens del sistema, definidos en `_variables.scss` y consumidos mediante mixins:

```scss
@mixin mobile {
  @media (max-width: #{vars.$breakpoint-mobile}) { @content; }  // 767px
}

@mixin tablet {
  @media (max-width: #{vars.$breakpoint-tablet}) { @content; }  // 1023px
}
```

Uso en un componente real:

```scss
.semaforo__titulo {
  font-size: var(--text-48);      // desktop

  @include tablet { font-size: var(--text-40); }  // 1023px
  @include mobile { font-size: var(--text-32); }  // 767px
}
```

Esto garantiza que los puntos de ruptura son consistentes en toda la aplicación, porque todos consumen el mismo token en lugar de repetir el valor `767px` manualmente.
