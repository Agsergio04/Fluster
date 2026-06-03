# RA2.g — Clases de estilos

> **RA vinculado:** RA2 — CE 2.g  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Catálogo de componentes BEM](#1-catálogo-de-componentes-bem)
2. [Componentes con variantes y modificadores](#2-componentes-con-variantes-y-modificadores)
3. [Estados interactivos](#3-estados-interactivos)
4. [Nomenclatura BEM aplicada](#4-nomenclatura-bem-aplicada)

---

## 1. Catálogo de componentes BEM

Fluster tiene **67 archivos SCSS** de componentes en `05-components`, todos siguiendo la metodología BEM. A continuación se listan los más representativos agrupados por categoría.

### Botones (26 componentes)

| Clase BEM | Archivo | Descripción |
|---|---|---|
| `.btn-iniciar-sesion` | `_btn-iniciar-sesion.scss` | Botón primario de envío de formularios |
| `.btn-eliminar` | `_btn-eliminar.scss` | Botón de eliminación con icono |
| `.btn-editar` | `_btn-editar.scss` | Botón de edición con icono |
| `.btn-accion-tarifa` | `_btn-accion-tarifa.scss` | Guardar/cancelar en tabla de tarifas |
| `.btn-cambiar-tema` | `_btn-cambiar-tema.scss` | Toggle claro/oscuro |
| `.btn-generar-informe` | `_btn-generar-informe.scss` | Botón de descarga de PDF |
| `.btn-seleccionar-foto` | `_btn-seleccionar-foto.scss` | Selector de imagen para OCR |
| `.btn-decision` | `_btn-decision.scss` | Botones de confirmación en modales |

### Tarjetas (5 componentes)

| Clase BEM | Archivo | Descripción |
|---|---|---|
| `.card-almacen` | `_card-almacen.scss` | Tarjeta de contenedor en la vista de almacén |
| `.card-semaforo` | `_card-semaforo.scss` | Tarjeta de semáforo D&D con indicador de riesgo |
| `.card-contenedor` | `_card-contenedor.scss` | Tarjeta base de contenedor |
| `.card-usuario` | `_card-usuario.scss` | Tarjeta de usuario en el panel de admin |
| `.conjunto-cards` | `_conjunto-cards.scss` | Contenedor de grid de tarjetas |

### Formularios y entradas (6 componentes)

| Clase BEM | Archivo | Descripción |
|---|---|---|
| `.input` | `_input.scss` | Campo de texto genérico |
| `.entrada-datos-form` | `_entrada-datos-form.scss` | Grupo label + input |
| `.subir-foto-ocr` | `_subir-foto-ocr.scss` | Zona de subida de imagen |
| `.perfil-credenciales` | `_perfil-credenciales.scss` | Formulario de perfil |
| `.buscador-contenedores` | `_buscador-contenedores.scss` | Buscador con campo y botón |
| `.celda-tabla` | `_celda-tabla.scss` | Celda editable inline |

### Navegación y estructura (4 componentes)

| Clase BEM | Archivo | Descripción |
|---|---|---|
| `.header` | `_header.scss` | Cabecera global |
| `.footer` | `_footer.scss` | Pie de página |
| `.cabecera-header` | `_cabecera-header.scss` | Título de sección en la cabecera |
| `.introduccion-pagina` | `_introduccion-pagina.scss` | Bloque hero/intro de cada página |

### Modales (2 componentes)

| Clase BEM | Archivo | Descripción |
|---|---|---|
| `.modal-editar-contenedor` | `_modal-editar-contenedor.scss` | Modal de edición de contenedor |
| `.modal-entrada-puerto` | `_modal-entrada-puerto.scss` | Modal de registro de entrada a puerto |

---

## 2. Componentes con variantes y modificadores

### `.btn-accion-tarifa` — tres variantes

```scss
// _btn-accion-tarifa.scss

.btn-accion-tarifa {
  @include mix.btn-base(var(--space-8) var(--space-16));
  font-size:   var(--text-16);
  font-weight: var(--font-weight-semibold);

  // Variante: guardar (primario)
  &--guardar {
    background-color: var(--color-primary);
    color:            var(--color-box-text);

    &:hover { background-color: var(--color-primary-hover); }
  }

  // Variante: cancelar (error)
  &--cancelar {
    background-color: var(--color-error);
    color:            var(--color-box-text);
  }

  // Variante: estado de guardado en curso
  &--guardando {
    opacity: 0.7;
    cursor:  wait;
  }
}
```

### `.input` — modificadores de estado

```scss
// _input.scss

.input {
  width:            100%;
  padding:          var(--space-input-y) var(--space-input-x);
  background-color: var(--color-surface);
  border:           1px solid var(--color-border);
  border-radius:    var(--radius);
  font-size:        var(--text-16);
  color:            var(--color-text);
  transition:       border-color var(--transition-fast);

  // Estado: campo con error de validación
  &--error {
    border-color:     var(--color-error);
    background-color: var(--color-error-subtle);
  }

  // Estado: campo de contraseña (con icono a la derecha)
  &--contrasenia {
    padding-right: var(--space-40);
  }
}
```

### `.tabla-tarifas__celda` — modificador editable

```scss
// _tabla-tarifas.scss

.tabla-tarifas {
  width:           100%;
  border-collapse: collapse;

  &__cabecera {
    background-color: var(--color-primary);
    color:            var(--color-box-text);
    font-weight:      var(--font-weight-semibold);
    padding:          var(--space-16);
  }

  &__celda {
    padding:    var(--space-8) var(--space-16);
    text-align: center;
    border:     1px solid var(--color-border);

    // Modificador: celda en modo edición
    &--editable {
      background-color: var(--color-primary-off);
      cursor:           text;

      &:focus {
        outline:      none;
        border-color: var(--color-primary);
        box-shadow:   0 0 0 2px var(--color-primary-off);
      }
    }
  }
}
```

### `.card-semaforo` — variantes por nivel de riesgo

```scss
// _card-semaforo.scss

.card-semaforo {
  background-color: var(--color-card-semaforo);
  border-radius:    var(--radius);
  padding:          var(--space-24);

  &__indicador {
    width:  1.5rem;
    height: 1.5rem;
    border-radius: 50%;

    // Variante: sin costes (verde)
    &--sin_costes   { background-color: var(--color-sin_costes); }
    // Variante: primer tramo (amarillo)
    &--primer_tramo { background-color: var(--color-primer_tramo); }
    // Variante: segundo tramo (rojo)
    &--segundo_tramo{ background-color: var(--color-segundo_tramo); }
    // Variante: inactivo (gris)
    &--inactivo     { background-color: var(--color-inactivo); }
  }
}
```

---

## 3. Estados interactivos

Todos los elementos interactivos del proyecto implementan los estados `:hover`, `:focus-visible` y `:disabled`.

### `:hover` — todos los botones

```scss
.btn-iniciar-sesion {
  background-color: var(--color-primary);
  transition:       background-color var(--transition-fast);

  &:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }
}
```

### `:focus-visible` — mixin centralizado

```scss
// _mixins.scss
@mixin foco-visible {
  &:focus-visible {
    outline:       none;
    box-shadow:    0 0 0 3px var(--color-primary-off);
    border-radius: var(--radius);
  }
}
```

Se aplica en todos los componentes interactivos con `@include mix.foco-visible`.

### `:disabled` — botones deshabilitados

```scss
.btn-iniciar-sesion {
  &:disabled {
    opacity: 0.6;
    cursor:  not-allowed;
    pointer-events: none;
  }
}
```

---

## 4. Nomenclatura BEM aplicada

### Ejemplo completo: `.modal-editar-contenedor`

```html
<!-- Estructura HTML del modal -->
<div class="modal-editar-contenedor">
  <div class="modal-editar-contenedor__overlay"></div>
  <div class="modal-editar-contenedor__caja">
    <h2 class="modal-editar-contenedor__titulo">Editar contenedor</h2>
    <form class="modal-editar-contenedor__formulario">
      <div class="entrada-datos-form">...</div>
    </form>
    <div class="modal-editar-contenedor__acciones">
      <button class="btn-decision btn-decision--confirmar">Guardar</button>
      <button class="btn-decision btn-decision--cancelar">Cancelar</button>
    </div>
  </div>
</div>
```

```scss
// _modal-editar-contenedor.scss
.modal-editar-contenedor {
  position: fixed;
  inset:    0;
  z-index:  100;

  &__overlay {
    position:         fixed;
    inset:            0;
    background-color: var(--color-overlay);
  }

  &__caja {
    position:         relative;
    background-color: var(--color-surface);
    border-radius:    var(--radius);
    padding:          var(--space-32);
    box-shadow:       var(--shadow-xl);
    z-index:          101;
  }

  &__titulo {
    font-size:   var(--text-24);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--space-24);
  }

  &__acciones {
    @include mix.flex-row(var(--space-16));
    justify-content: flex-end;
    margin-top: var(--space-24);
  }
}
```

La nomenclatura BEM en este componente:
- **Bloque:** `.modal-editar-contenedor` — componente autónomo con propósito completo.
- **Elementos:** `__overlay`, `__caja`, `__titulo`, `__formulario`, `__acciones` — partes internas sin sentido fuera del bloque.
- **Modificadores en botones internos:** `.btn-decision--confirmar`, `.btn-decision--cancelar` — variantes del botón.
