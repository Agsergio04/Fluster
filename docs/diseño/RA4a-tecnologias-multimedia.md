# RA4.a — Tecnologías multimedia

> **RA vinculado:** RA4 — CE 4.a  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Tecnologías multimedia en Fluster](#1-tecnologías-multimedia-en-fluster)
2. [Elemento `<picture>` — imágenes adaptativas](#2-elemento-picture--imágenes-adaptativas)
3. [Atributo `srcset` y `sizes`](#3-atributo-srcset-y-sizes)
4. [Carga diferida `loading="lazy"`](#4-carga-diferida-loadinglazy)
5. [Soporte en navegadores](#5-soporte-en-navegadores)
6. [Estrategia de fallback](#6-estrategia-de-fallback)

---

## 1. Tecnologías multimedia en Fluster

Fluster implementa las tecnologías modernas de multimedia web para optimizar la carga de imágenes y mejorar la experiencia del usuario:

| Tecnología | Propósito | Estado en Fluster |
|---|---|---|
| `<img>` con atributos completos | Imágenes con alt, width/height | Implementado |
| `loading="lazy"` | Carga diferida de imágenes | Implementado |
| `color-scheme: light dark` | Adaptación de elementos nativos al tema | Implementado |
| SVG inline vía React | Iconos escalables sin petición HTTP | Implementado |
| `<picture>` | Imagen hero con fallback nativo | Implementado |

---

## 2. Elemento `<picture>` — imágenes adaptativas

El elemento `<picture>` permite servir diferentes formatos de imagen según las capacidades del navegador. Aunque puede combinarse con `srcset` para ofrecer múltiples resoluciones, su uso más básico es envolver `<img>` para tener una estructura preparada para añadir fuentes alternativas sin tocar el HTML existente.

### Aplicación en la imagen hero

La imagen hero de la página principal (`IntroduccionPagina.jsx`) usa `<picture>` para establecer semántica explícita de imagen adaptativa y garantizar que `loading="eager"` se aplica sobre la imagen crítica del primer render:

```jsx
// frontend/src/components/organismos/IntroduccionPagina.jsx

import imagenHome from '../../assets/images/imagen_home.png'

function IntroduccionPagina({ onIniciarSesion, onEmpezarAhora }) {
  return (
    <div className="introduccion-pagina">
      {/* ... */}
      <div className="introduccion-pagina__imagen">
        <picture>
          <img
            src={imagenHome}
            alt="Puerto de contenedores"
            width="600"
            height="400"
            loading="eager"
          />
        </picture>
      </div>
    </div>
  )
}
```

### Por qué `loading="eager"` en la hero

La imagen hero está **above the fold** (visible sin hacer scroll). El valor por defecto de `loading` ya es `eager`, pero declararlo explícitamente deja claro la intención y contrasta con el uso de `loading="lazy"` en el resto de imágenes del proyecto.

### Extensibilidad con `<source>`

La estructura con `<picture>` permite añadir fuentes WebP sin modificar el `<img>` de fallback:

```jsx
<picture>
  {/* Añadir aquí <source type="image/webp" srcSet={imagenHomeWebP} /> */}
  <img src={imagenHome} alt="Puerto de contenedores" width="600" height="400" loading="eager" />
</picture>
```

---

## 3. Atributo `srcset` y `sizes`

### `srcset` — múltiples resoluciones

El atributo `srcset` en `<img>` informa al navegador de las versiones disponibles de una imagen para que elija la más adecuada según la densidad de píxeles de la pantalla (`x`) o el ancho del viewport (`w`).

```html
<!-- Descriptor de píxeles (x) — para imágenes de tamaño fijo -->
<img
  src="logo.png"
  srcset="logo.png 1x, logo@2x.png 2x, logo@3x.png 3x"
  alt="Fluster"
  width="120"
  height="40"
/>
```

```html
<!-- Descriptor de ancho (w) — para imágenes responsivas -->
<img
  src="hero.png"
  srcset="hero-400.png 400w, hero-800.png 800w, hero-1200.png 1200w"
  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 80vw, 600px"
  alt="Panel de control"
  width="600"
  height="400"
/>
```

### `sizes` — indicación del tamaño de visualización

El atributo `sizes` le dice al navegador cuánto espacio ocupará la imagen en pantalla, para que pueda elegir la versión correcta de `srcset` antes de descargarla:

```
sizes="(max-width: 767px) 100vw,   → en móvil: ocupa el 100% del viewport
       (max-width: 1023px) 80vw,   → en tablet: ocupa el 80%
       600px"                       → en desktop: siempre 600px
```

Sin `sizes`, el navegador asumiría que la imagen ocupa siempre el 100% del viewport y descargaría versiones innecesariamente grandes.

---

## 4. Carga diferida `loading="lazy"`

### Cómo funciona

El atributo `loading="lazy"` hace que el navegador **no descargue** la imagen hasta que está a punto de entrar en el viewport del usuario. Utiliza la Intersection Observer API internamente.

```jsx
// Imagen en el historial del contenedor — below the fold
<img
  src={evento.fotoUrl}
  alt={`Evento ${evento.tipo} del contenedor ${contenedor.codigoBIC}`}
  className="tarjeta-ciclo__foto"
  loading="lazy"
  width="300"
  height="200"
/>
```

### Dónde se aplica en Fluster

| Imagen | `loading` | Justificación |
|---|---|---|
| Imagen hero (home) | `eager` | Above the fold — debe cargarse inmediatamente |
| Logo header | Sin atributo (eager por defecto) | Siempre visible |
| Logo footer | `lazy` | Below the fold |
| Fotos de eventos (historial) | `lazy` | Requieren scroll para verse |
| Fotos de perfil de usuario | `lazy` | No son críticas para el primer render |

### Impacto en rendimiento

En la página de historial de un contenedor con 10+ eventos, sin lazy loading se descargarían todas las fotos al cargar la página (potencialmente 10+ MB). Con lazy loading, solo se descargan las 2-3 fotos visibles inicialmente.

---

## 5. Soporte en navegadores

| Tecnología | Chrome | Firefox | Safari | Edge | IE |
|---|---|---|---|---|---|
| `<picture>` | 38+ | 38+ | 9.1+ | 13+ | No |
| `srcset` en `<img>` | 34+ | 38+ | 8+ | 12+ | No |
| `sizes` | 38+ | 38+ | 9+ | 13+ | No |
| `loading="lazy"` | 77+ | 75+ | 15.4+ | 79+ | No |
| SVG inline | 4+ | 3+ | 3.2+ | 12+ | 9+ |
| CSS Custom Properties | 49+ | 31+ | 9.1+ | 15+ | No |

### Estrategia para Internet Explorer

Internet Explorer no soporta `<picture>`, CSS Custom Properties ni SVG inline moderno. Fluster no está diseñado para IE ya que:

1. IE11 tiene cuota de mercado < 1% globalmente (StatCounter, 2024).
2. Microsoft dejó de soportar IE en junio de 2022.
3. La aplicación está dirigida a profesionales de logística que usan navegadores corporativos modernos (Chrome/Edge).

---

## 6. Estrategia de fallback

Para garantizar que la aplicación funciona incluso en navegadores que no soporten alguna tecnología:

### Fallback para `<picture>`

El elemento `<img>` final dentro de `<picture>` actúa como fallback universal:

```html
<picture>
  <source type="image/webp" srcset="hero.webp" />
  <img src="hero.png" alt="..." />  ← fallback si no hay soporte para picture
</picture>
```

### Fallback para `loading="lazy"`

Si el navegador no soporta `loading="lazy"`, simplemente ignora el atributo y carga la imagen normalmente. No hay degradación funcional.

### Fallback para CSS Custom Properties

Los valores por defecto de `:root` actúan como fallback para navegadores que no soporten CSS Custom Properties:

```scss
// Para navegadores sin soporte (rarísimo hoy en día)
.btn-iniciar-sesion {
  background-color: #4FB2F8;               // valor hardcoded como fallback
  background-color: var(--color-primary);  // sobreescribe si hay soporte
}
```
