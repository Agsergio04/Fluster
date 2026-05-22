# RA1.d — Guía de estilo

> **RA vinculado:** RA1 — CE 1.d  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Por qué existe una guía de estilo en Fluster](#1-por-qué-existe-una-guía-de-estilo-en-fluster)
2. [Tokens del sistema de diseño](#2-tokens-del-sistema-de-diseño)
3. [La guía de estilo como contrato](#3-la-guía-de-estilo-como-contrato)
4. [Style Guide viva — página `/guia-estilos`](#4-style-guide-viva--página-guia-estilos)
5. [Impacto directo en el desarrollo](#5-impacto-directo-en-el-desarrollo)

---

## 1. Por qué existe una guía de estilo en Fluster

Sin una guía de estilo, cada vez que se añade un nuevo componente el desarrollador toma decisiones de diseño ad hoc: ¿qué tamaño de fuente? ¿qué padding? ¿qué color para este estado de error? El resultado son inconsistencias visuales que degradan la percepción de calidad del producto y dificultan el mantenimiento.

La guía de estilo de Fluster resuelve este problema **definiendo todos los valores de diseño una sola vez**. Cuando se crea un nuevo componente, no hay que decidir nada: todo está en los tokens.

### El problema sin guía de estilo

Imagina que sin guía de estilo se añaden dos componentes en momentos distintos:

```scss
// Componente A — primera semana
.card-contenedor {
  border-radius: 8px;
  padding: 16px;
  color: #1a73e8;
}

// Componente B — dos semanas después
.modal-editar {
  border-radius: 6px;   // ¿por qué 6 y no 8?
  padding: 14px;        // ¿por qué 14 y no 16?
  color: #1976d2;       // ¿es el mismo azul? No, pero parece igual
}
```

Estos dos componentes parecen coherentes en aislamiento, pero juntos crean una inconsistencia imperceptible que acumulada en 76 componentes produce un producto visualmente fragmentado.

### La solución con tokens

```scss
// Ambos componentes usan los mismos tokens
.card-contenedor {
  border-radius: var(--radius);      // siempre el mismo
  padding:       var(--space-16);    // siempre el mismo
  color:         var(--color-primary); // siempre el mismo
}

.modal-editar {
  border-radius: var(--radius);
  padding:       var(--space-32);    // más padding, pero del mismo sistema
  color:         var(--color-primary);
}
```

---

## 2. Tokens del sistema de diseño

Los tokens están organizados en dos archivos dentro de `00-settings/`:

```
frontend/src/styles/00-settings/
├── _variables.scss       → valores fuente (Sass, para usar en cálculos y mixins)
└── _css-variables.scss   → tokens en tiempo de ejecución (CSS Custom Properties)
```

### Colores

```scss
// _css-variables.scss — tema claro (por defecto)
:root {
  --color-primary:       #4FB2F8;   // azul principal
  --color-primary-hover: #3A9DE0;   // hover del azul
  --color-primary-off:   #DBEEFF;   // fondo suave del azul
  --color-bg:            #F9FAFB;   // fondo de página
  --color-surface:       #FFFFFF;   // fondo de tarjetas/modales
  --color-text:          #111827;   // texto principal
  --color-text-subtle:   #6B7280;   // texto secundario
  --color-border:        #E5E7EB;   // bordes
  --color-error:         #EF4444;   // rojo de error
  --color-error-subtle:  #FEF2F2;   // fondo suave de error
  --color-overlay:       rgba(0,0,0,0.5); // fondo de modales
}
```

Los colores del semáforo tienen sus propios tokens:

```scss
--color-sin_costes:    #22C55E;   // verde
--color-primer_tramo:  #EAB308;   // amarillo
--color-segundo_tramo: #EF4444;   // rojo
--color-inactivo:      #9CA3AF;   // gris
```

### Tipografía

```scss
// _variables.scss
$font-heading: 'Crimson Text', serif;
$font-body:    'Poppins', sans-serif;

$text-8:  0.5rem;
$text-12: 0.75rem;
$text-16: 1rem;       // tamaño base
$text-20: 1.25rem;
$text-24: 1.5rem;
$text-32: 2rem;
$text-40: 2.5rem;
$text-48: 3rem;
$text-64: 4rem;

$font-weight-regular:  400;
$font-weight-semibold: 600;
$font-weight-bold:     700;

$leading-tight:  1.2;
$leading-normal: 1.5;
```

### Espaciado

```scss
$space-4:  0.25rem;   //  4px
$space-8:  0.5rem;    //  8px
$space-16: 1rem;      // 16px
$space-24: 1.5rem;    // 24px
$space-32: 2rem;      // 32px
$space-40: 2.5rem;    // 40px
$space-48: 3rem;      // 48px
$space-56: 3.5rem;    // 56px
$space-64: 4rem;      // 64px
```

La escala de espaciado es multiplicativa (base 4px), lo que garantiza ritmo visual consistente en toda la interfaz.

### Forma y animación

```scss
$radius:           0.5rem;      // radio de esquinas
$transition-fast:  150ms ease;  // transición rápida (hover)
```

---

## 3. La guía de estilo como contrato

En Fluster, la guía de estilo funciona como un **contrato entre diseño y código** con tres reglas que se aplican sin excepción:

**Regla 1 — Los tokens son la fuente de verdad**  
Ningún componente puede usar un valor de color, tipografía o espaciado que no esté definido en `_variables.scss` o `_css-variables.scss`. Los valores hardcoded están prohibidos.

**Regla 2 — Un cambio en el token lo cambia todo**  
Si se decide que el radio de esquinas debe ser `0.75rem` en lugar de `0.5rem`, basta con cambiar `$radius` en `_variables.scss`. Los 76 componentes que usan `var(--radius)` se actualizan automáticamente.

**Regla 3 — La página `/guia-estilos` es la prueba de coherencia**  
Cualquier componente nuevo debe aparecer en la página de Style Guide. Si se ve diferente al resto, es porque no está siguiendo los tokens correctamente.

### Cambio de tema sin tocar componentes

El sistema de temas demuestra el valor real de la guía de estilo: cuando el usuario cambia a modo oscuro, todos los componentes se actualizan porque todos usan `var(--color-bg)`, `var(--color-surface)`, etc. Los componentes no saben si están en modo claro u oscuro — eso lo gestionan los tokens.

```scss
/* Los componentes no cambian nada */
.card-almacen {
  background-color: var(--color-surface);  // blanco en claro, gris oscuro en oscuro
  color:            var(--color-text);     // negro en claro, blanco en oscuro
}

/* Solo los tokens cambian */
:root[data-theme='dark'] {
  --color-surface: #1F2937;
  --color-text:    #F9FAFB;
}
```

---

## 4. Style Guide viva — página `/guia-estilos`

La página de Style Guide (`frontend/src/pages/guia_estilos/`) es la documentación viva del sistema de diseño. No es un PDF estático: es la aplicación real ejecutando todos sus componentes con los tokens reales.

### Contenido organizado por categorías

| Sección | Qué muestra |
|---|---|
| Colores | Todos los tokens `--color-*` en modo claro y oscuro, con su valor hexadecimal |
| Tipografía | Todos los niveles de texto con familia, peso y tamaño |
| Espaciado | Representación visual de todos los `--space-*` |
| Botones | Todas las variantes con estados hover, disabled y loading |
| Inputs | Estado normal, focus, error y contraseña |
| Tarjetas | Card contenedor, card almacén, card semáforo con sus variantes |
| Indicadores | Spinner (sm/md/lg), notificaciones, badges de rol |
| Semáforo | Los cuatro colores de riesgo D&D |

### Por qué es más valioso que un PDF

Un PDF de guía de estilo se desactualiza en cuanto cambia el código. La página `/guia-estilos` siempre refleja el estado real del sistema porque usa los mismos componentes, los mismos tokens y el mismo CSS que el resto de la aplicación.

---

## 5. Impacto directo en el desarrollo

| Sin guía de estilo | Con la guía de estilo de Fluster |
|---|---|
| `font-size: 18px` en un lugar, `font-size: 17px` en otro | Todos usan `var(--text-16)` o `var(--text-24)` — escala definida |
| `color: #2196F3` aquí, `color: #1E88E5` allá | Todos usan `var(--color-primary)` — un único token |
| Cambiar el azul requiere buscar en 76 archivos | Cambiar el azul es modificar un valor en `_css-variables.scss` |
| El modo oscuro requiere reescribir todos los componentes | El modo oscuro redefine los tokens; los componentes no cambian |
| Cada nuevo componente requiere decisiones de diseño | Cada nuevo componente usa los tokens existentes — sin decisiones |
| Inconsistencias visuales acumuladas | Coherencia garantizada por el sistema |
