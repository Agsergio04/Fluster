# RA2.d — Hojas alternativas (temas)

> **RA vinculado:** RA2 — CE 2.d  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Sistema de temas en Fluster](#1-sistema-de-temas-en-fluster)
2. [Implementación en CSS — tres capas de resolución](#2-implementación-en-css--tres-capas-de-resolución)
3. [Toggle desde JavaScript — hook useTema](#3-toggle-desde-javascript--hook-usetema)
4. [Persistencia en localStorage](#4-persistencia-en-localstorage)
5. [Soporte en navegadores](#5-soporte-en-navegadores)
6. [Layout responsive — adaptación al dispositivo](#6-layout-responsive--adaptación-al-dispositivo)

---

## 1. Sistema de temas en Fluster

Fluster implementa un sistema completo de temas **claro / oscuro** mediante CSS Custom Properties. El cambio de tema no requiere recargar la página ni intercambiar hojas de estilo alternativas: basta con cambiar el valor de las variables CSS en `:root`.

El sistema tiene **tres capas de resolución**, de mayor a menor prioridad:

| Prioridad | Mecanismo | Cuándo actúa |
|---|---|---|
| 1 (máxima) | `[data-theme='dark']` en `:root` vía JS | Usuario elige tema oscuro explícitamente |
| 1 (máxima) | `[data-theme='light']` en `:root` vía JS | Usuario elige tema claro explícitamente |
| 2 | `@media (prefers-color-scheme: dark)` | Sin preferencia guardada + SO en modo oscuro |
| 3 (base) | Valores por defecto en `:root` | Sin ninguna condición activa → tema claro |

---

## 2. Implementación en CSS — tres capas de resolución

### Capa 1 — Tema base (claro por defecto)

```scss
// frontend/src/styles/00-settings/_css-variables.scss

:root {
  --color-primary:  #4FB2F8;
  --color-bg:       #F9FAFB;
  --color-surface:  #FFFFFF;
  --color-text:     #111827;
  --color-border:   #E5E7EB;
  /* ... resto de tokens ... */
}
```

Estos valores se aplican siempre como base. Si ninguna condición superior los sobreescribe, el usuario ve el tema claro.

### Capa 2 — Tema oscuro explícito por JS

```scss
:root[data-theme='dark'] {
  --color-primary:  #245070;
  --color-bg:       #111827;
  --color-surface:  #1F2937;
  --color-text:     #F9FAFB;
  --color-border:   #374151;

  --color-card-almacen:  #2F6891;
  --color-card-semaforo: var(--color-secondary);  // azul secundario (semáforo/contenedor/usuario)
  /* ... resto de tokens oscuros ... */
}
```

Cuando JavaScript escribe `data-theme="dark"` en `<html>`, el selector `:root[data-theme='dark']` tiene mayor especificidad que `:root` y sobreescribe todos los tokens.

### Capa 3 — Tema claro explícito por JS

```scss
:root[data-theme='light'] {
  --color-primary:  #4FB2F8;
  --color-bg:       #F9FAFB;
  --color-surface:  #FFFFFF;
  --color-text:     #111827;
  /* ... mismos valores que :root base ... */
}
```

Este bloque garantiza que si el usuario eligió explícitamente el modo claro, la media query del sistema no lo sobreescriba.

### Capa 4 — Fallback del sistema operativo (sin JS)

```scss
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --color-primary:  #245070;
    --color-bg:       #111827;
    --color-surface:  #1F2937;
    --color-text:     #F9FAFB;
    --color-border:   #374151;
    /* ... */
  }
}
```

El selector `:not([data-theme='light'])` es la clave: si el usuario eligió modo claro explícitamente (`data-theme='light'`), esta media query no lo pisará aunque el SO esté en modo oscuro.

---

## 3. Toggle desde JavaScript — hook `useTema`

El componente `BotonCambiarTema` usa el hook personalizado `useTema` para alternar el tema:

```js
// frontend/src/hooks/useTema.js

function useTema() {
  const [tema, setTema] = useState(() => {
    return localStorage.getItem('theme') ?? 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema)
    localStorage.setItem('theme', tema)
  }, [tema])

  const toggleTema = () => setTema(prev => prev === 'light' ? 'dark' : 'light')

  return { tema, toggleTema }
}
```

### Flujo completo del cambio de tema

```
Usuario hace clic en BotonCambiarTema
        ↓
toggleTema() → setTema('dark')
        ↓
useEffect → document.documentElement.setAttribute('data-theme', 'dark')
        ↓
CSS: :root[data-theme='dark'] { --color-bg: #111827; ... }
        ↓
Toda la app actualiza sus colores instantáneamente
        ↓
localStorage.setItem('theme', 'dark') → persiste la preferencia
```

---

## 4. Persistencia en `localStorage`

La preferencia del usuario se guarda en `localStorage` con la clave `'theme'`. Al iniciar la aplicación, el hook `useTema` lee este valor antes del primer render:

```js
const [tema, setTema] = useState(() => {
  return localStorage.getItem('theme') ?? 'light'
})
```

Esto garantiza que el tema se aplique en el primer `useEffect` antes de que el usuario vea ningún parpadeo (flash of wrong theme). Si no hay ningún valor guardado, el tema claro es el valor por defecto.

---

## 5. Soporte en navegadores

| Tecnología | Soporte |
|---|---|
| CSS Custom Properties (`var(--*)`) | Chrome 49+, Firefox 31+, Safari 9.1+, Edge 15+ |
| `prefers-color-scheme` | Chrome 76+, Firefox 67+, Safari 12.1+, Edge 79+ |
| `localStorage` | Universal (todos los navegadores modernos) |
| `document.documentElement.setAttribute` | Universal |

El uso de `color-scheme: light dark` en el reset (`_reset.scss`) informa al navegador de que la app soporta ambos modos, lo que permite que elementos nativos como scrollbars y inputs también adapten su apariencia al tema activo.

```scss
// frontend/src/styles/02-generic/_reset.scss

html {
  color-scheme: light dark;
}
```

---

## 6. Layout responsive — adaptación al dispositivo

Al igual que el sistema de temas adapta la presentación visual al entorno del usuario (modo claro/oscuro), el sistema de layout responsive adapta la **estructura** de la interfaz al dispositivo. Ambos son "hojas alternativas" de presentación: una controla el color, la otra controla la disposición.

### Breakpoints como tokens del sistema

Los puntos de ruptura están definidos como variables Sass en `_variables.scss` y se consumen a través de mixins para garantizar consistencia:

```scss
// frontend/src/styles/00-settings/_variables.scss
$breakpoint-mobile: 767px;
$breakpoint-tablet: 1023px;

// frontend/src/styles/01-tools/_mixins.scss
@mixin mobile {
  @media (max-width: #{vars.$breakpoint-mobile}) { @content; }
}

@mixin tablet {
  @media (max-width: #{vars.$breakpoint-tablet}) { @content; }
}
```

### Layout base — Flexbox en el esqueleto de página

El layout global (`_layout.scss`) usa Flexbox para crear el esqueleto de todas las páginas, con adaptación de padding para cada breakpoint:

```scss
// frontend/src/styles/04-layout/_layout.scss

.pagina {
  display:          flex;
  flex-direction:   column;
  min-height:       100dvh;
}

.pagina__intro {
  display:        flex;
  flex-direction: column;
  align-items:    center;
  padding:        var(--space-48) var(--space-24) var(--space-32);

  @media (max-width: 767px) {
    padding: var(--space-24) var(--space-16) var(--space-16);
  }
}

.pagina__contenido {
  padding: 0 var(--space-24) var(--space-64);

  @media (max-width: 767px) {
    padding: 0 var(--space-16) var(--space-32);
  }
}
```

### Grid de tarjetas — Flexbox wrap

La cuadrícula de tarjetas de contenedores usa `flex-wrap` para distribuirse automáticamente según el espacio disponible, sin necesidad de media queries explícitas:

```scss
// frontend/src/styles/05-components/_conjunto-cards.scss

.conjunto-cards__grid {
  display:         flex;
  flex-wrap:       wrap;
  gap:             2.875rem 1.875rem;  // 46px fila · 30px columna
  justify-content: center;
  max-width:       76.5rem;           // 1224px máximo
}
```

### Tipografía y layout responsive por página

La vista de semáforo aplica media queries tanto al layout como a la tipografía, con tres niveles de adaptación:

```scss
// frontend/src/pages/semaforo/semaforo.scss

.semaforo__titulo {
  font-size: var(--text-48);   // desktop

  @media (max-width: 1023px) { font-size: var(--text-40); }  // tablet
  @media (max-width: 767px)  { font-size: var(--text-32); }  // mobile
}

.semaforo__contenido {
  padding: var(--space-32) var(--space-24) var(--space-64);

  @media (max-width: 1023px) { padding: var(--space-24) var(--space-16) var(--space-48); }
  @media (max-width: 767px)  { padding: var(--space-16) var(--space-16) var(--space-32); }
}
```

### Tarjeta responsive — adaptación de estructura interna

Las tarjetas de semáforo adaptan su estructura interna en tablet para reorganizar las filas de datos:

```scss
// frontend/src/styles/05-components/_card-semaforo.scss

.card-semaforo {
  width: 24.25rem;              // 388px en desktop

  @media (max-width: 1023px) {
    width: 100%;                // ocupa todo el ancho disponible

    &__fecha-izq {
      flex-direction: column;   // los elementos se apilan verticalmente
      align-items:    flex-start;
    }
  }

  @media (max-width: 767px) {
    &__etiqueta {
      font-size: var(--text-16); // tipografía reducida en mobile
    }

    &__valor {
      font-size: var(--text-16);
    }
  }
}
```

### Resumen de la estrategia responsive

| Técnica | Dónde se usa | Propósito |
|---|---|---|
| `flex-direction: column` | Layout global, intro de páginas | Apilado vertical base |
| `flex-wrap: wrap` | Cuadrícula de tarjetas | Grid automático sin media queries |
| `max-width` con `margin: auto` | Contenedores de página | Limitar anchura en pantallas grandes |
| Media query `767px` | Layout, tipografía, padding | Adaptación a móvil |
| Media query `1023px` | Semáforo, tarjetas, almacén | Adaptación a tablet |
| Unidades relativas (`rem`, `dvh`) | Todo el sistema | Escalado proporcional al tamaño base |
