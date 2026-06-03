# RA1.f — Plantillas de diseño

> **RA vinculado:** RA1 — CE 1.f  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Sistema de plantillas en Fluster](#1-sistema-de-plantillas-en-fluster)
2. [Átomos — unidades reutilizables mínimas](#2-átomos--unidades-reutilizables-mínimas)
3. [Moléculas — combinaciones funcionales](#3-moléculas--combinaciones-funcionales)
4. [Organismos — secciones complejas](#4-organismos--secciones-complejas)
5. [Layout global](#5-layout-global)
6. [Style Guide — catálogo visual](#6-style-guide--catálogo-visual)

---

## 1. Sistema de plantillas en Fluster

Fluster implementa **Atomic Design** como metodología de organización de componentes, lo que convierte cada pieza de UI en una plantilla reutilizable y escalable. Existen **34 átomos**, varias moléculas, organismos y 17 páginas, todos construidos sobre el mismo sistema de tokens (`00-settings`).

El resultado es un sistema donde añadir una nueva pantalla consiste en ensamblar componentes ya existentes, sin duplicar código ni estilos.

```
frontend/src/
├── components/
│   ├── atomos/        → 34 componentes base reutilizables
│   ├── moleculas/     → combinaciones de átomos con propósito concreto
│   └── organismos/    → secciones completas de la interfaz
└── pages/             → 17 páginas que ensamblan organismos
```

---

## 2. Átomos — unidades reutilizables mínimas

Los átomos son componentes que no pueden descomponerse más sin perder su función. Reciben todo su comportamiento por `props` y no tienen lógica de negocio propia.

### Catálogo de átomos representativos

| Componente | Archivo | Descripción | Props principales |
|---|---|---|---|
| `Input` | `Input.jsx` | Campo de texto genérico | `type`, `value`, `onChange`, `placeholder` |
| `InputContrasenia` | `InputContrasenia.jsx` | Campo de contraseña con toggle de visibilidad | `value`, `onChange` |
| `BotonEliminar` | `BotonEliminar.jsx` | Botón de eliminación con icono de papelera | `onClick`, `disabled` |
| `BotonEditar` | `BotonEditar.jsx` | Botón de edición con icono de lápiz | `onClick` |
| `BotonCambiarTema` | `BotonCambiarTema.jsx` | Toggle claro/oscuro accesible | — |
| `Notificacion` | `Notificacion.jsx` | Toast flotante de feedback | `mensaje`, `tipo` |
| `CeldaTabla` | `CeldaTabla.jsx` | Celda de tabla con soporte a edición inline | `valor`, `editable`, `onChange` |
| `RolAsignado` | `RolAsignado.jsx` | Etiqueta visual del rol del usuario | `rol` |
| `Spinner` | `Spinner.jsx` | Indicador de carga CSS puro | `tamanio` (`'sm'`, `'md'`, `'lg'`) |

### Ejemplo de átomo: `Spinner`

```jsx
function Spinner({ tamanio = 'md' }) {
  return (
    <span
      className={`spinner spinner--${tamanio}`}
      role="status"
      aria-label="Cargando"
    />
  )
}
```

El átomo usa el modificador BEM `spinner--sm/md/lg` para los tres tamaños y el atributo `role="status"` para accesibilidad. Su archivo SCSS `_spinner.scss` consume exclusivamente tokens del sistema:

```scss
.spinner {
  border:           3px solid var(--color-primary-off);
  border-top-color: var(--color-primary);
  border-radius:    50%;
  animation:        spinner-giro 700ms linear infinite;

  &--sm { width: 1rem;    height: 1rem;    }
  &--md { width: 1.5rem;  height: 1.5rem;  }
  &--lg { width: 3rem;    height: 3rem;    }
}

@keyframes spinner-giro {
  to { transform: rotate(360deg); }
}
```

---

## 3. Moléculas — combinaciones funcionales

Las moléculas combinan átomos para formar unidades con un propósito funcional concreto. Son los bloques de construcción de los organismos.

### Catálogo de moléculas representativas

| Componente | Descripción |
|---|---|
| `CardContenedor` | Tarjeta con datos de un contenedor: código BIC, estado, fecha y coste |
| `CardContenedoresAlmacen` | Tarjeta ampliada para la vista de almacén con botones de acción |
| `CardUsuario` | Tarjeta de usuario con rol, nombre y acciones de administración |
| `BuscadorContenedores` | Campo de búsqueda con icono, etiqueta y limpiar |
| `FilaNavieraTarifas` | Fila de la tabla de navieras con tramos editables inline |
| `TramoDeFechas` | Selector de rango de fechas para filtros |
| `EntradaDatosLogin` | Grupo de campo + etiqueta para los formularios de login y registro |

### Ejemplo de molécula: `CardContenedor`

La tarjeta agrupa tres átomos (`RolAsignado`, `BotonEditar`, `BotonEliminar`) con datos del contenedor:

```jsx
function CardContenedor({ contenedor, onEliminar, onEditar }) {
  return (
    <article className="card-contenedor">
      <h3 className="card-contenedor__codigo">{contenedor.codigoBIC}</h3>
      <p className="card-contenedor__estado">{contenedor.estado}</p>
      <time className="card-contenedor__fecha">{contenedor.fechaInicioLibre}</time>
      <div className="card-contenedor__acciones">
        <BotonEditar onClick={() => onEditar(contenedor)} />
        <BotonEliminar onClick={() => onEliminar(contenedor._id)} />
      </div>
    </article>
  )
}
```

---

## 4. Organismos — secciones complejas

Los organismos son componentes de alto nivel que encapsulan lógica propia y componen moléculas y átomos en secciones reconocibles de la UI.

### Catálogo de organismos

| Componente | Archivo | Descripción |
|---|---|---|
| `Header` | `Header.jsx` | Cabecera global con navegación, avatar y toggle de tema |
| `Footer` | `Footer.jsx` | Pie de página con logo, enlaces legales y redes |
| `TablaTarifas` | `TablaTarifas.jsx` | Tabla completa de tarifas con edición inline por fila |
| `ModalEditarContenedor` | `ModalEditarContenedor.jsx` | Modal de edición de datos y foto del contenedor |
| `ModalEntradaPuerto` | `ModalEntradaPuerto.jsx` | Modal de registro de entrada a puerto |
| `HistorialCiclosContenedor` | `HistorialCiclosContenedor.jsx` | Línea de tiempo de eventos del ciclo de vida |
| `PanelGenerarInforme` | `PanelGenerarInforme.jsx` | Panel de configuración y descarga del informe PDF |
| `ConjuntoNavieras` | `ConjuntoNavieras.jsx` | Lista de navieras con gestión de estado interno |

---

## 5. Layout global

El sistema de layout está definido en `frontend/src/styles/04-layout/_layout.scss` y establece la estructura común de todas las páginas.

### Contenedor principal

```scss
.pagina {
  min-height:     100dvh;
  display:        flex;
  flex-direction: column;
}

.pagina__contenido {
  flex: 1;
  width:     100%;
  max-width: 1280px;
  margin:    0 auto;
  padding:   var(--space-32) var(--space-24);
}
```

### Sistema de columnas del semáforo

La vista de semáforo usa CSS Grid para distribuir las cuatro columnas de riesgo de forma responsive:

```scss
.semaforo__contenido {
  display:               grid;
  grid-template-columns: repeat(4, 1fr);
  gap:                   var(--space-24);

  @include mobile {
    grid-template-columns: 1fr;
  }

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Breakpoints

| Nombre | Condición | Variable Sass |
|---|---|---|
| Mobile | `max-width: 767px` | `$breakpoint-mobile` |
| Tablet | `max-width: 1023px` | `$breakpoint-tablet` |
| Desktop | `> 1024px` | estilo base |

---

## 6. Style Guide — catálogo visual

Fluster incluye una página de Style Guide accesible en la ruta `/guia-estilos` (`frontend/src/pages/guia_estilos/`), abriéndola directamente en el navegador (no se enlaza desde la navegación). Esta página actúa como catálogo vivo de todos los componentes del sistema de diseño.

### Contenido del Style Guide

La página muestra de forma organizada:

- **Paleta de colores** — todos los tokens `--color-*` con su valor hexadecimal en modo claro y oscuro.
- **Escala tipográfica** — todos los niveles de `--text-8` a `--text-64` con sus familias (Crimson Text y Poppins).
- **Sistema de espaciado** — representación visual de todos los tokens `--space-*`.
- **Átomos** — todos los botones, inputs, badges y spinners con sus variantes y estados (normal, hover, disabled, error).
- **Moléculas** — tarjetas, filas de tabla y buscadores en sus estados.
- **Colores del semáforo** — los cuatro estados del semáforo D&D con sus tokens.

### Valor del Style Guide como plantilla

Cualquier nuevo componente que se añada al proyecto debe:

1. Seguir los tokens definidos en `00-settings` (no valores hardcoded).
2. Aplicar nomenclatura BEM consistente.
3. Ser registrado en `main.scss`.
4. Aparecer documentado en la página `/guia-estilos`.

Este proceso garantiza que el sistema de diseño sea escalable sin pérdida de coherencia.
