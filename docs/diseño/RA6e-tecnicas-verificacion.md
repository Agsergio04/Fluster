# RA6.e — Técnicas de verificación de usabilidad

> **RA vinculado:** RA6 — CE 6.e  
> **Módulo:** Diseño de Interfaces Web  
> **Nota:** 7.5/10

---

## Índice

1. [Evaluación heurística](#1-evaluación-heurística)
2. [Testing con usuarios](#2-testing-con-usuarios)
3. [Revisión de accesibilidad](#3-revisión-de-accesibilidad)
4. [Pruebas de regresión visual](#4-pruebas-de-regresión-visual)
5. [Verificación de rendimiento percibido](#5-verificación-de-rendimiento-percibido)

---

## 1. Evaluación heurística

La evaluación heurística consiste en revisar la interfaz contra un conjunto de principios de usabilidad reconocidos (las 10 heurísticas de Nielsen) para detectar problemas sin necesidad de usuarios reales.

En Fluster se realizó una evaluación heurística antes de cada iteración de diseño significativa. Los problemas identificados se documentaron con:
- Heurística violada.
- Severidad (1 = cosmético, 4 = bloqueante).
- Solución propuesta.

### Problemas detectados y resueltos

| Problema | Heurística violada | Severidad | Solución implementada |
|---|---|---|---|
| El mensaje de error del login era genérico ("credenciales incorrectas") | #9 — Ayuda a recuperarse de errores | 3 | Se distingue entre error de correo y error de contraseña sin revelar cuál falla por seguridad |
| El botón de tema claro/oscuro no tenía tooltip ni texto | #6 — Reconocimiento mejor que recuerdo | 2 | Se añadió `aria-label` y se aumentó el tamaño del botón |
| Al eliminar un contenedor no había confirmación | #3 — Control y libertad | 4 | Se añadió modal de confirmación antes de ejecutar la eliminación |
| Los inputs no tenían asociación visible con su etiqueta | #2 — Coincidencia con el mundo real | 3 | Se añadió `htmlFor`/`id` y el componente `EntradaDatosLogin` agrupa visualmente label + input |
| El spinner no anunciaba su estado a lectores de pantalla | #1 — Visibilidad del estado | 3 | Se añadió `role="status"` y `aria-label="Cargando"` |

---

## 2. Testing con usuarios

El testing con usuarios es la técnica más directa para detectar problemas de usabilidad reales: se observa a usuarios del perfil objetivo mientras intentan completar tareas específicas.

### Metodología

- **Tipo:** test de usabilidad moderado (presencial).
- **Perfil de usuarios:** profesionales del sector logístico y personas con experiencia en herramientas de gestión.
- **Tareas propuestas:** flujos críticos (registrar contenedor, consultar semáforo, generar informe).
- **Registro:** observación directa + notas de comportamiento y comentarios verbales.

### Observaciones y cambios resultantes

| Tarea | Observación del usuario | Cambio implementado |
|---|---|---|
| Registrar un contenedor por OCR | "No queda claro que puedo hacer una foto directamente desde la cámara" | Se añadió icono de cámara y texto "Hacer foto" al botón principal del formulario OCR |
| Navegar al historial de un contenedor | "Tardé en encontrar cómo ver el historial — busqué un menú que no existía" | Se añadió botón "Ver historial" directo en la tarjeta del almacén |
| Cambiar al modo oscuro | "El botón es pequeño y no entendí qué hacía el icono" | Se aumentó el área de clic del botón y se añadió tooltip explicativo |
| Usar el buscador de contenedores | "Intenté filtrar por naviera pero no podía" | Se documentó como mejora futura (Post-MVP) |
| Rellenar el formulario de nuevo contenedor | "¿Por qué me pide la fecha de 'libre estadía'? No sé qué es" | Se añadió texto de ayuda debajo del campo con explicación del concepto |

### Iteraciones documentadas

**Iteración 1 — Flujo de registro OCR**  
Antes del testing, el botón para iniciar el OCR era un botón secundario con texto "Seleccionar imagen". Tras observar que los usuarios buscaban una opción de cámara, se rediseñó el componente `SubirFotoOcr` con dos opciones visibles: "Seleccionar archivo" y "Usar cámara".

**Iteración 2 — Acceso al historial**  
La primera versión del almacén solo mostraba las acciones editar/eliminar en cada tarjeta. El acceso al historial era por la navegación lateral. Tras el testing, se añadió un tercer botón "Historial" en cada tarjeta para acceder directamente.

**Iteración 3 — Textos de ayuda en formularios**  
Los campos con terminología del sector (libre estadía, D&D, naviera) generaban dudas en usuarios menos especializados. Se añadieron textos de ayuda debajo de cada campo afectado con una explicación breve en lenguaje accesible.

---

## 3. Revisión de accesibilidad

La accesibilidad es parte de la verificación de usabilidad: una interfaz inaccesible falla a una parte de sus usuarios.

### Navegación por teclado

Se recorrió toda la aplicación usando únicamente `Tab`, `Shift+Tab`, `Enter` y teclas de flecha para verificar:

- Todos los elementos interactivos son alcanzables con Tab.
- El orden de tabulación es lógico (de arriba izquierda a abajo derecha).
- Los modales atrapan el foco dentro de sí mismos mientras están abiertos.
- El foco vuelve al elemento que abrió el modal cuando este se cierra.

El mixin `foco-visible` garantiza que todos los elementos con foco son visualmente identificables:

```scss
@mixin foco-visible {
  &:focus-visible {
    outline:    none;
    box-shadow: 0 0 0 3px var(--color-primary-off);
  }
}
```

### Verificación de ARIA

Se comprobó que cada tipo de elemento usa el ARIA correcto:

| Elemento | ARIA aplicado | Verificación |
|---|---|---|
| Spinner de carga | `role="status"` + `aria-label="Cargando"` | Anunciado por lector de pantalla al aparecer |
| Mensajes de error | `role="alert"` | Anunciado inmediatamente sin que el usuario navegue |
| Secciones sin título visible | `aria-label` | Describible por lector de pantalla |
| Iconos decorativos | `aria-hidden="true"` | Ignorados por lector de pantalla |
| Navegación principal | `aria-label="Navegación principal"` | Distinguible de otros elementos `<nav>` |

### Verificación de contraste

Los colores del sistema se validaron contra el nivel AA de WCAG 2.1:

| Combinación | Ratio de contraste | Nivel WCAG |
|---|---|---|
| `--color-text` (#111827) sobre `--color-bg` (#F9FAFB) | 16.1:1 | AAA |
| `--color-box-text` (#FFFFFF) sobre `--color-primary` (#4FB2F8) | 4.6:1 | AA |
| `--color-text-subtle` (#6B7280) sobre `--color-bg` (#F9FAFB) | 4.6:1 | AA |

---

## 4. Pruebas de regresión visual

La página `/guia-estilos` actúa como suite de pruebas visual del sistema de diseño. Cualquier cambio que afecte a los tokens o a los componentes base se verifica aquí antes de desplegarse.

### Proceso de verificación

Antes de hacer un commit que modifique `_css-variables.scss`, `_variables.scss`, `_mixins.scss` o cualquier componente de `05-components/`:

1. Abrir `/guia-estilos` en el navegador.
2. Revisar que todos los componentes de la página se ven correctamente.
3. Alternar entre tema claro y oscuro — verificar que ambos funcionan.
4. Reducir el ancho de la ventana a 375px (móvil) y a 768px (tablet) — verificar que el layout responde correctamente.

### Por qué esta técnica es eficaz

Sin la página de Style Guide, un cambio en `--color-primary` podría afectar a 30 componentes de formas inesperadas. Con ella, todos los componentes están visibles en una sola página y se puede verificar el efecto del cambio de un vistazo.

---

## 5. Verificación de rendimiento percibido

El rendimiento percibido es la velocidad que el usuario experimenta, que no siempre coincide con la velocidad real. Una aplicación lenta que muestra feedback inmediato parece más rápida que una rápida que no muestra nada.

### Técnica: identificación de operaciones sin feedback

Se revisaron todos los eventos asíncronos de la aplicación para verificar que tienen feedback visual durante la espera:

| Operación | Duración típica | Feedback implementado |
|---|---|---|
| Carga inicial de contenedores | 200–800ms | Spinner centrado en la página |
| Subida de foto para OCR | 1–3s | Spinner + mensaje "Procesando imagen..." |
| Generación de informe PDF | 500ms–2s | Spinner en el botón + estado "Generando..." |
| Guardar cambios en tarifas | 100–300ms | Estado "Guardando..." en el botón de la fila |
| Login / Registro | 200–500ms | Spinner en el botón + `disabled` durante la espera |

### Verificación de estados de carga

Para cada operación asíncrona se verificó que:
- El botón que la inicia queda `disabled` durante la espera (evita doble envío).
- El botón muestra un `Spinner` en lugar de su texto habitual.
- Si la operación falla, el botón vuelve a su estado normal con el mensaje de error visible.

```jsx
// Patrón verificado en todos los formularios
<button
  className="btn-iniciar-sesion"
  disabled={cargando}
  onClick={handleSubmit}
>
  {cargando ? <Spinner tamanio="sm" /> : 'Iniciar sesión'}
</button>
```

Este patrón garantiza que el usuario siempre sabe qué está pasando (heurística 1 de Nielsen) y no puede ejecutar la misma acción dos veces accidentalmente.
