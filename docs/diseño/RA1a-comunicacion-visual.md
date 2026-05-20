# RA1.a — Comunicación visual

> **RA vinculado:** RA1 — CE 1.a  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Los cinco principios visuales](#1-los-cinco-principios-visuales)
2. [Jerarquía visual](#2-jerarquía-visual)
3. [Contraste](#3-contraste)
4. [Alineación](#4-alineación)
5. [Proximidad](#5-proximidad)
6. [Repetición](#6-repetición)

---

## 1. Los cinco principios visuales

La comunicación visual eficaz se apoya en cinco principios fundamentales que guían la percepción del usuario y le permiten procesar la información de forma rápida e intuitiva. En Fluster estos principios no son decorativos: se aplican de forma sistemática a través del sistema de tokens (`--color-*`, `--text-*`, `--space-*`) para que cada pantalla transmita claramente su propósito.

| Principio | Pregunta que responde | Herramienta principal en Fluster |
|---|---|---|
| Jerarquía | ¿Qué es lo más importante? | Escala tipográfica `--text-8` → `--text-64` |
| Contraste | ¿Qué destaca sobre el fondo? | Paleta de colores primario/secundario y semáforo |
| Alineación | ¿Cómo se ordena el espacio? | Flexbox y Grid mediante mixins `flex-row` / `flex-col` |
| Proximidad | ¿Qué elementos están relacionados? | Sistema de espaciado base 8 px (`--space-*`) |
| Repetición | ¿Qué patrones reconozco? | Tokens de diseño compartidos en `00-settings` |

---

## 2. Jerarquía visual

La jerarquía guía el ojo del usuario indicando qué leer primero. Se construye con diferencias de tamaño, peso y color.

### Escala tipográfica (base 8 px)

```
h1 · --text-48 / --text-64  →  título principal de la página
h2 · --text-40              →  título de sección
h3 · --text-32              →  título de componente
p  · --text-16              →  texto de cuerpo
small / badge · --text-8    →  metainformación, etiquetas
```

### Ejemplo — página Semáforo

La página `/semaforo` presenta tres niveles claros de jerarquía:

1. **`<h1>` con `--text-48`** — título «Estado de los contenedores».
2. **Cabecera de columna (`<h2>`)** — nombre del tramo («Sin coste», «Primer tramo»…).
3. **Código BIC en la tarjeta (`--text-16`, `--font-weight-bold`)** — dato clave del contenedor.
4. **Fecha y coste (`--text-16`, `--font-weight-regular`, `--color-text-subtle`)** — información secundaria.

### Ejemplo — botones primario vs. secundario

Los botones primarios (`background: var(--color-primary)`) tienen mayor peso visual que los secundarios (`background: transparent; border: …`), indicando la acción principal esperada en cada contexto.

```scss
// Botón primario — mayor jerarquía
.btn-iniciar-sesion {
  background-color: var(--color-primary);
  color:            var(--color-box-text);
  font-weight:      var(--font-weight-semibold);
}

// Botón secundario — menor jerarquía
.btn-cambio-registro-login {
  background-color: transparent;
  color:            var(--color-primary);
}
```

---

## 3. Contraste

El contraste permite distinguir texto del fondo, estados activos de inactivos y niveles de alerta entre sí.

### Contraste cromático en el semáforo D&D

El sistema semáforo utiliza tres colores semánticos con contraste suficiente para transmitir el nivel de riesgo sin depender solo del color (el texto complementa la información):

| Token | Valor | Significado |
|---|---|---|
| `--color-sin_costes` | `#35C65B` (verde) | Dentro del período gratuito |
| `--color-primer_tramo` | `#FFFC4B` (amarillo) | Próximo al límite de días libres |
| `--color-segundo_tramo` | `#F66B6B` (rojo) | Generando costes — acción urgente |
| `--color-inactivo` | `#B0AEAE` (gris) | Sin actividad |

### Contraste texto/fondo

- **Modo claro:** texto `#111827` sobre fondo `#F9FAFB` — ratio muy alto.
- **Modo oscuro:** texto `#F9FAFB` sobre fondo `#111827` — ratio invertido equivalente.
- El color primario `#4FB2F8` (modo claro) y `#245070` (modo oscuro) se eligieron para mantener contraste aceptable tanto sobre superficies claras como oscuras.

### Contraste en estados de formulario

Los campos con error muestran borde en `--color-error` (`--color-segundo_tramo`) y mensaje en el mismo tono, creando contraste semántico que el usuario asocia visualmente con la alerta.

---

## 4. Alineación

La alineación elimina el desorden visual conectando elementos mediante líneas invisibles.

### Alineación mediante Flexbox

Todos los layouts de Fluster se construyen con los mixins `flex-col` y `flex-row`, que garantizan alineación consistente en todos los componentes:

```scss
// Mixin flex-col — alineación vertical centrada
@mixin flex-col($gap: null, $align: center) {
  display:        flex;
  flex-direction: column;
  align-items:    $align;
  @if $gap != null { gap: $gap; }
}

// Mixin flex-row — alineación horizontal centrada
@mixin flex-row($gap: null, $align: center) {
  display:     flex;
  align-items: $align;
  @if $gap != null { gap: $gap; }
}
```

### Alineación en las tarjetas del semáforo

Cada `<article>` de tarjeta de semáforo alinea su contenido en columna centrada. Esto asegura que el código BIC, el estado y las fechas formen una línea visual vertical coherente en todas las tarjetas, independientemente de la longitud del contenido.

### Alineación en formularios

Los campos de los formularios de login y registro se alinean en columna con el mismo ancho (`--tamanio_normal`), creando una línea guía vertical izquierda que organiza el escaneo visual.

---

## 5. Proximidad

La proximidad agrupa elementos relacionados y separa los no relacionados, reduciendo el esfuerzo cognitivo para entender la estructura.

### Sistema de espaciado base 8 px

Fluster usa tokens de espaciado múltiplos de 8 px para crear distancias proporcionales:

- **Gap pequeño (`--space-8`)** — separa icono de texto dentro de un botón (misma unidad).
- **Gap medio (`--space-16`)** — separa campos de un formulario (mismo grupo funcional).
- **Gap grande (`--space-32` / `--space-48`)** — separa secciones distintas de la página.

```scss
// Tarjeta de almacén — elementos internos próximos entre sí
.card-almacen {
  padding: var(--space-24);   // espacio interno generoso
  gap:     var(--space-16);   // proximidad entre datos de la misma tarjeta
}

// Separación entre secciones de la home
.home__features {
  margin-top: var(--space-64); // distancia grande = sección independiente
}
```

### Proximidad en el historial de contenedor

La página `/historial/:id` agrupa los eventos del ciclo de vida en una línea de tiempo vertical. Cada evento (tipo, fecha, foto) se muestra compacto dentro de su propio bloque (`<article>`), con `--space-24` de separación entre eventos, indicando que pertenecen a la misma secuencia pero son momentos distintos.

---

## 6. Repetición

La repetición crea coherencia visual y permite al usuario reconocer patrones sin aprender desde cero en cada pantalla.

### Tokens compartidos como fuente de repetición

Todos los componentes consumen el mismo conjunto de tokens definidos en `00-settings`. Esto garantiza que el mismo tono de azul, el mismo radio de borde y el mismo tamaño de fuente aparezcan en todos los contextos:

```scss
// Radio de borde — igual en tarjetas, botones, inputs y modales
--radius: 12px;

// Color primario — igual en header, botones primarios, enlaces activos
--color-primary: #4FB2F8;

// Transición — igual en todos los elementos interactivos
--transition-fast: 150ms ease-in-out;
```

### Repetición estructural entre páginas

Todas las páginas internas (semáforo, almacén, tarifas, historial) repiten la misma estructura:

1. `<header>` fijo con navegación y toggle de tema.
2. `<main>` con `<section>` introductoria (título + descripción).
3. Cuerpo de contenido con el componente principal.
4. `<footer>` con enlaces legales y logo.

Esta repetición permite al usuario orientarse inmediatamente en cualquier pantalla, sin necesidad de reaprender la navegación.

### Repetición en los componentes de tarjeta

Las tarjetas de almacén, semáforo y usuario comparten la misma estructura visual: fondo `--color-surface`, radio `--radius`, sombra `--shadow-md` y padding `--space-24`. El usuario reconoce el patrón «tarjeta» instantáneamente, independientemente del tipo de contenido.
