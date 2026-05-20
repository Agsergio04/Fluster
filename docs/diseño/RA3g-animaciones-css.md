# RA3.g — Animaciones CSS

> **RA vinculado:** RA3 — CE 3.g  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Animaciones en Fluster](#1-animaciones-en-fluster)
2. [@keyframes spinner-giro](#2-keyframes-spinner-giro)
3. [@keyframes notificacion-entrada](#3-keyframes-notificacion-entrada)
4. [Transiciones en elementos interactivos](#4-transiciones-en-elementos-interactivos)
5. [Micro-interacciones](#5-micro-interacciones)
6. [Buenas prácticas aplicadas](#6-buenas-prácticas-aplicadas)

---

## 1. Animaciones en Fluster

Fluster implementa animaciones CSS puras (sin librerías de animación externas) con dos objetivos:

1. **Feedback visual inmediato** — el usuario sabe que el sistema está procesando su acción.
2. **Transiciones suaves** — los cambios de estado no son abruptos, reduciendo la carga cognitiva.

Las animaciones se implementan en dos niveles:
- **`@keyframes`** — para animaciones continuas o de entrada/salida.
- **`transition`** — para cambios de estado interactivos (hover, focus, active).

Todos los valores de duración y easing usan los tokens del sistema (`--transition-fast`, `--transition-base`, `--transition-slow`) para garantizar coherencia.

---

## 2. `@keyframes spinner-giro`

### Propósito

El spinner indica que el sistema está procesando una operación asíncrona (login, envío de formulario, carga de datos). Es la animación de mayor visibilidad en el proyecto.

### Implementación

```scss
// frontend/src/styles/05-components/_spinner.scss

.spinner {
  display:       inline-block;
  border:        3px solid var(--color-primary-off);  // pista: azul claro
  border-top-color: var(--color-primary);             // arco activo: azul primario
  border-radius: 50%;
  animation:     spinner-giro 700ms linear infinite;

  // Tres tamaños para distintos contextos
  &--sm { width: 1rem;   height: 1rem;   }  // dentro de botones
  &--md { width: 1.5rem; height: 1.5rem; }  // indicador de sección
  &--lg { width: 3rem;   height: 3rem;   }  // pantalla completa
}

@keyframes spinner-giro {
  to { transform: rotate(360deg); }
}
```

### Decisiones de diseño

- **Duración 700ms** — suficientemente rápida para parecer ágil, lo bastante lenta para no parecer glitcheo en operaciones que resuelven en <200ms.
- **`linear`** — el easing lineal es más natural para una rotación continua que `ease-in-out`.
- **`infinite`** — gira indefinidamente hasta que el estado de carga se desactiva.
- **Tokens de color** — usa `--color-primary-off` (pista) y `--color-primary` (arco), adaptándose automáticamente al tema oscuro.

### Uso en el formulario de login

```jsx
// BotonesLogin.jsx
<button disabled={cargando} className="btn-iniciar-sesion">
  {cargando ? <Spinner tamanio="sm" /> : 'Iniciar Sesión'}
</button>
```

El botón muestra el spinner mientras dura la petición y queda `disabled` para evitar dobles envíos.

---

## 3. `@keyframes notificacion-entrada`

### Propósito

Las notificaciones (toasts) aparecen en la parte inferior de la pantalla para confirmar acciones o mostrar errores. La animación de entrada comunica que apareció un mensaje nuevo sin ser intrusiva.

### Implementación

```scss
// frontend/src/styles/05-components/_notificacion.scss

@keyframes notificacion-entrada {
  from {
    transform: translate(-50%, 2rem);  // empieza 2rem más abajo
    opacity:   0;                      // empieza invisible
  }
  to {
    transform: translate(-50%, 0);    // posición final centrada
    opacity:   1;                     // completamente visible
  }
}

.notificacion {
  position:         fixed;
  bottom:           var(--space-32);
  left:             50%;
  transform:        translateX(-50%);
  display:          flex;
  align-items:      center;
  gap:              var(--space-16);
  padding:          var(--space-16) var(--space-24);
  background-color: var(--color-secondary);
  border-radius:    var(--radius);
  box-shadow:       var(--shadow-lg);
  // Aplica la animación al aparecer
  animation:        notificacion-entrada var(--transition-base) ease-out;
  z-index:          9999;
  max-width:        40rem;
  width:            max-content;
}
```

### Decisiones de diseño

- **Duración 300ms** — el tiempo estándar para transiciones de UI según Material Design y HIG de Apple.
- **`ease-out`** — acelera rápido al entrar y frena suavemente. Transmite que el elemento «aterrizó» en su posición.
- **`both`** — aplica el estado inicial `from` antes de que empiece la animación (evita parpadeo inicial).
- **`translate(-50%, 2rem) → translate(-50%, 0)`** — el `translateX(-50%)` se mantiene en ambos estados para que la notificación permanezca centrada horizontalmente durante toda la animación.

---

## 4. Transiciones en elementos interactivos

Las transiciones de estado (hover, focus, active) usan la propiedad `transition` con los tokens de duración del sistema.

### Botones — cambio de color en hover

```scss
// _btn-iniciar-sesion.scss
.btn-iniciar-sesion {
  background-color: var(--color-primary);
  transition:       background-color var(--transition-fast);  // 150ms ease-in-out

  &:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }
}
```

### Inputs — cambio de borde en focus

```scss
// _input.scss
.input {
  border:     1px solid var(--color-border);
  transition: border-color var(--transition-fast);

  &:focus {
    border-color: var(--color-primary);
  }
}
```

### Tarjetas — elevación en hover

```scss
// _card-semaforo.scss
.card-semaforo {
  box-shadow:  var(--shadow-md);
  transition:  box-shadow var(--transition-base);  // 300ms ease-in-out

  &:hover {
    box-shadow: var(--shadow-lg);
  }
}
```

---

## 5. Micro-interacciones

### Toggle del tema claro/oscuro

El cambio de tema aplica la transición `--transition-slow` (500ms) en los colores de fondo del body, creando un fundido suave en lugar de un cambio abrupto:

```scss
// _elements.scss
body {
  background-color: var(--color-bg);
  transition:       background-color var(--transition-slow),  // 500ms
                    color             var(--transition-slow);
}
```

### Apertura de modales

Los modales tienen una transición de opacidad y escala al abrirse:

```scss
// _modal-editar-contenedor.scss
.modal-editar-contenedor__caja {
  transition: transform var(--transition-base),
              opacity   var(--transition-base);

  &--entrando {
    transform: scale(0.95);
    opacity:   0;
  }

  &--visible {
    transform: scale(1);
    opacity:   1;
  }
}
```

---

## 6. Buenas prácticas aplicadas

### Animar solo `transform` y `opacity`

Las propiedades `transform` y `opacity` son las únicas que el navegador puede animar a 60fps sin repintar el DOM. En Fluster todas las animaciones usan exclusivamente estas propiedades:

- `spinner-giro` → `transform: rotate()`
- `notificacion-entrada` → `transform: translate()` + `opacity`
- Hover de tarjetas → `box-shadow` (excepción aceptable, muy corta)

### `prefers-reduced-motion` — accesibilidad

Los usuarios con sensibilidad al movimiento pueden configurar su sistema operativo para reducir animaciones. Fluster respeta esta preferencia en el reset global:

```scss
// frontend/src/styles/02-generic/_reset.scss

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration:        0.01ms !important;
    animation-iteration-count: 1      !important;
    transition-duration:       0.01ms !important;
    scroll-behavior:           auto   !important;
  }
}
```

Al colocarlo en el reset, se desactivan todas las animaciones y transiciones de la aplicación de forma centralizada para usuarios que lo necesiten, sin tocar ningún componente individualmente.
