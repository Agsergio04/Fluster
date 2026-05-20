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
  --color-card-semaforo: #955A31;
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
