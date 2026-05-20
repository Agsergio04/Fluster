# RA2.a — Modificar etiquetas HTML

> **RA vinculado:** RA2 — CE 2.a  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Tipos de selectores en Fluster](#1-tipos-de-selectores-en-fluster)
2. [Selectores de elemento](#2-selectores-de-elemento)
3. [Selectores de clase](#3-selectores-de-clase)
4. [Selectores combinados](#4-selectores-combinados)
5. [Modificación de elementos de formulario](#5-modificación-de-elementos-de-formulario)

---

## 1. Tipos de selectores en Fluster

En Fluster los estilos se aplican a las etiquetas HTML mediante tres estrategias claramente separadas por la arquitectura ITCSS:

| Estrategia | Capa ITCSS | Archivo | Propósito |
|---|---|---|---|
| Selector de elemento | `03-elements` | `_elements.scss` | Estilos base de todas las etiquetas sin clase |
| Selector de clase BEM | `05-components` | `_*.scss` por componente | Estilos específicos de cada componente |
| Selector de pseudo-clase / atributo | `02-generic` / `05-components` | varios | Reset y estados interactivos |

Esta separación garantiza que los estilos de elemento nunca sobreescriban a los de clase, respetando la cascada de menor a mayor especificidad.

---

## 2. Selectores de elemento

Los selectores de elemento se definen únicamente en la capa `03-elements` (`_elements.scss`). Se aplican a todas las etiquetas del mismo tipo sin necesidad de clase.

### Estilos base de tipografía

```scss
// frontend/src/styles/03-elements/_elements.scss

body {
  font-family: var(--font-body);
  color:       var(--color-text);
  line-height: var(--leading-normal);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
  color:       var(--color-text);
}

p {
  font-size:   var(--text-16);
  line-height: var(--leading-normal);
}

a {
  color:           var(--color-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
```

### Por qué selectores de elemento aquí

Estos selectores de elemento establecen el "aspecto neutro" que cualquier etiqueta HTML tiene en Fluster antes de que se le aplique ninguna clase. Sirven como base predecible que los componentes pueden refinar, nunca como reglas con las que competir.

### Estilos base de formularios

```scss
input,
textarea,
select {
  font:             inherit;  // hereda de body (Poppins)
  background-color: var(--color-surface);
  color:            var(--color-text);
  border:           1px solid var(--color-border);
  border-radius:    var(--radius);
}

button {
  cursor:      pointer;
  font:        inherit;
  border:      none;
  background:  none;
}
```

---

## 3. Selectores de clase

Los selectores de clase en Fluster siguen siempre la metodología **BEM** (`bloque`, `bloque__elemento`, `bloque--modificador`). Se definen en la capa `05-components`, uno por componente.

### Ejemplo: clase de bloque `.input`

```scss
// frontend/src/styles/05-components/_input.scss

.input {
  width:            100%;
  padding:          var(--space-input-y) var(--space-input-x);
  background-color: var(--color-surface);
  border:           1px solid var(--color-border);
  border-radius:    var(--radius);
  font-size:        var(--text-16);
  color:            var(--color-text);
  transition:       border-color var(--transition-fast);

  &:focus {
    outline:      none;
    border-color: var(--color-primary);
  }

  &--error {
    border-color: var(--color-error);
  }

  &::placeholder {
    color: var(--color-text-subtle);
  }
}
```

La clase `.input` modifica la etiqueta `<input>` añadiendo estilos específicos del sistema de diseño sin alterar la base que ya definió `03-elements`.

### Diferencia entre selector de elemento y selector de clase

| | Selector de elemento | Selector de clase BEM |
|---|---|---|
| **Especificidad** | Baja (0-0-1) | Media (0-1-0) |
| **Alcance** | Toda la app | Solo el componente |
| **Ubicación** | `03-elements` | `05-components` |
| **Uso** | Estilos de reset/base | Estilos de componente |

---

## 4. Selectores combinados

En algunos componentes se combinan selector de elemento con selector de clase para refinar elementos hijos sin necesidad de clase adicional.

### Ejemplo: elementos `<li>` dentro de `.footer__lista`

```scss
// frontend/src/styles/05-components/_footer.scss

.footer__lista {
  list-style: none;

  li {       // selector de elemento dentro del contexto BEM
    padding: var(--space-8) 0;
  }

  a {        // selector de elemento — enlace dentro del footer
    color:       var(--color-box-text);
    font-size:   var(--text-16);
    transition:  color var(--transition-fast);

    &:hover {
      color: var(--color-primary-hover);
    }
  }
}
```

Este patrón se usa cuando los elementos hijos son etiquetas HTML estándar (`<li>`, `<a>`, `<span>`) que no necesitan clase propia porque viven siempre dentro del mismo bloque BEM.

---

## 5. Modificación de elementos de formulario

Los formularios de Fluster (login, registro, perfil, meter-contenedor) modifican los elementos de formulario nativos mediante clases BEM que sobreescriben los estilos de `03-elements`.

### Modificación de `<input>` en el formulario de login

```html
<!-- HTML del componente Input.jsx -->
<input
  className="input"
  type="email"
  value={correo}
  onChange={e => setCorreo(e.target.value)}
  placeholder="correo@empresa.com"
/>
```

La etiqueta `<input>` nativa recibe:
1. Los estilos base de `03-elements` (font: inherit, border básico).
2. La clase `.input` de `05-components` que añade padding, radio, colores del sistema y transición.
3. El modificador `.input--error` si la validación falla.

### Modificación de `<button>`

```html
<!-- Botón primario -->
<button className="btn-iniciar-sesion" onClick={handleSubmit} disabled={cargando}>
  {cargando ? <Spinner tamanio="sm" /> : 'Iniciar Sesión'}
</button>
```

El `<button>` nativo tiene `border: none; background: none; cursor: pointer` de `03-elements`. La clase `.btn-iniciar-sesion` añade el color primario, el padding y la sombra propios del sistema de diseño.

### Tabla resumen de modificaciones

| Etiqueta | Capa 03-elements | Clase 05-components | Resultado |
|---|---|---|---|
| `<input>` | `font: inherit` | `.input` — padding, colores, radio | Campo de texto del sistema |
| `<button>` | `cursor: pointer; border: none` | `.btn-*` — color, padding, sombra | Botón estilizado |
| `<a>` | `color: primary; no underline` | `.footer__nav a` — color box-text | Enlace adaptado al contexto |
| `<h1>` | `font-heading; bold; tight` | — | Título base sin modificación |
| `<table>` | `border-collapse: collapse` | `.tabla-tarifas` — ancho, zebra | Tabla de tarifas estilizada |
