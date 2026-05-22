# RA6.b — Adecuación al usuario y objetivo

> **RA vinculado:** RA6 — CE 6.b  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Público objetivo y contexto de uso](#1-público-objetivo-y-contexto-de-uso)
2. [User Persona principal — Gestor de operaciones](#2-user-persona-principal--gestor-de-operaciones)
3. [Decisiones de diseño justificadas por el usuario](#3-decisiones-de-diseño-justificadas-por-el-usuario)
4. [Propósito del producto y coherencia del diseño](#4-propósito-del-producto-y-coherencia-del-diseño)
5. [Accesibilidad como criterio de adecuación](#5-accesibilidad-como-criterio-de-adecuación)

---

## 1. Público objetivo y contexto de uso

Fluster es una herramienta de gestión profesional orientada a empresas del sector logístico marítimo. Su función principal es controlar el ciclo de vida de contenedores de transporte para evitar costes de **D&D (Demurrage & Detention)**: penalizaciones económicas que se acumulan cuando un contenedor supera el tiempo libre de almacenaje asignado por la naviera.

### Perfil del sector

| Dato | Contexto |
|---|---|
| **Sector** | Logística y comercio exterior |
| **Empresas objetivo** | Transitarios, agencias de aduanas, importadores/exportadores con volumen medio-alto |
| **Tamaño del equipo** | 2–20 personas con acceso al sistema |
| **Dispositivo de trabajo** | Ordenador de escritorio / portátil en oficina |
| **Frecuencia de uso** | Diaria, varias veces al día |

### Necesidades del sector

Las empresas del sector tienen necesidades muy específicas:

1. **Visibilidad en tiempo real** — saber en qué estado de riesgo está cada contenedor sin abrir hojas de cálculo.
2. **Registro rápido** — poder añadir un contenedor simplemente fotografiando el código BIC (lectura OCR automática).
3. **Control de costes** — ver cuánto está acumulando cada contenedor y poder exportar el informe para facturar al cliente.
4. **Gestión de equipo** — distinguir quién puede modificar datos (operadores) de quién puede ver informes (gestores) y de quién administra el sistema.

---

## 2. User Persona principal — Gestor de operaciones

### Elena Martín — Responsable operativa

| | |
|---|---|
| **Nombre** | Elena Martín |
| **Edad** | 34 años |
| **Rol en Fluster** | Gestor |
| **Empresa** | Transitaria mediana (8 empleados) |
| **Experiencia digital** | Competente. Usa ERP diariamente, cómoda con herramientas web |
| **Dispositivo** | Portátil en la oficina, ocasionalmente tablet |

**Contexto de trabajo:**  
Elena gestiona entre 30 y 80 contenedores activos simultáneamente. Actualmente trabaja con hojas Excel y correos de sus proveedores de naviera para saber cuándo expiran los tiempos libres. Pierde tiempo comparando fechas y calculando manualmente si un contenedor ha entrado en D&D.

**Frustraciones actuales:**
- No sabe a primera vista qué contenedores están en riesgo sin abrir un Excel.
- Los errores de transcripción al copiar códigos BIC generan problemas con las navieras.
- Cuando un operador actualiza mal un dato, no hay forma de saber quién lo cambió ni cuándo.
- Generar el informe de D&D para enviar al cliente requiere varias horas de trabajo manual.

**Objetivos:**
- Ver de un vistazo qué contenedores necesitan atención urgente.
- Que el equipo pueda registrar datos sin posibilidad de borrar información crítica por error.
- Generar informes de coste en minutos, no en horas.

**Cómo Fluster responde a sus necesidades:**

| Frustración de Elena | Solución en Fluster |
|---|---|
| No saber qué contenedores están en riesgo | Vista semáforo con 4 columnas de riesgo (sin coste, primer tramo, segundo tramo, inactivo) |
| Errores de transcripción del código BIC | OCR automático: fotografía el contenedor y lee el código BIC |
| No saber quién modificó qué | Historial de ciclo de vida por contenedor con fecha y usuario de cada cambio |
| Informes manuales lentos | Panel de informe PDF con filtros de fecha y descarga directa |

---

### Carlos Reyes — Operador de almacén

| | |
|---|---|
| **Nombre** | Carlos Reyes |
| **Edad** | 26 años |
| **Rol en Fluster** | Operador |
| **Empresa** | La misma transitaria que Elena |
| **Experiencia digital** | Básica-media. Cómodo con apps móviles y web sencillas |
| **Dispositivo** | Ordenador de sobremesa |

**Contexto de trabajo:**  
Carlos es el encargado de registrar la entrada y salida de contenedores en el sistema. No necesita ver informes ni configurar tarifas: su tarea es introducir datos de forma rápida y sin errores.

**Necesidades:**
- Interfaz simple que no lo sobrecargue con opciones que no son de su competencia.
- Poder registrar un contenedor en el menor número de pasos posible.
- Feedback claro cuando comete un error (campo incorrecto, foto no legible).

**Cómo Fluster responde:**
- El rol Operador tiene acceso restringido: no ve el panel de control ni las tarifas.
- El OCR reduce los pasos de registro: la foto hace el trabajo de transcripción.
- Los mensajes de error son específicos por campo y se anuncian con `role="alert"` para accesibilidad.

---

## 3. Decisiones de diseño justificadas por el usuario

Cada decisión visual principal de Fluster responde a una necesidad del usuario.

### El semáforo de riesgo D&D

La vista central de la aplicación organiza los contenedores en cuatro columnas por nivel de riesgo, con un color diferenciado para cada estado:

| Color | Estado | Significado |
|---|---|---|
| Verde | Sin coste | Dentro del tiempo libre |
| Amarillo | Primer tramo | Acumulando D&D primer tramo |
| Rojo | Segundo tramo | Acumulando D&D segundo tramo (más caro) |
| Gris | Inactivo | Contenedor cerrado o devuelto |

Esta elección responde directamente a la frustración de Elena: **ver el estado de riesgo sin necesidad de abrir ni leer ningún dato**. El color comunica la urgencia antes que el texto.

### Densidad de información en las tarjetas

Las tarjetas de contenedor muestran varios datos (código BIC, cliente, naviera, fechas de libre estadía, coste acumulado) en un espacio compacto. Esta densidad es intencional: los usuarios profesionales del sector prefieren ver más datos de un vistazo antes que pantallas vacías con pocas tarjetas.

### Sistema de roles

La separación en tres roles (Admin, Gestor, Operador) responde al contexto de equipo: no todos los usuarios deben poder hacer lo mismo. Un Operador que por error elimina una tarifa de naviera causaría un problema grave. La restricción de acceso por rol es una decisión de diseño centrada en el usuario, no solo técnica.

### Formularios con validación en tiempo real

Los formularios de login y registro validan cada campo al perder el foco (`onBlur`), con mensajes de error específicos por campo y visibles sin enviar el formulario. Esto reduce la fricción para Carlos, que puede corregir errores antes de intentar guardar.

---

## 4. Propósito del producto y coherencia del diseño

El propósito de Fluster es **reducir el tiempo que un profesional de logística necesita para saber si tiene contenedores en riesgo y actuar en consecuencia**. Todas las decisiones de diseño visual se pueden validar contra este propósito:

| Decisión de diseño | ¿Responde al propósito? |
|---|---|
| Vista semáforo como pantalla principal | Sí — acceso inmediato al estado de riesgo |
| Color como canal de comunicación principal | Sí — permite escanear visualmente sin leer |
| OCR automático en el registro | Sí — reduce tiempo y errores en el alta de contenedores |
| Roles diferenciados | Sí — cada usuario ve solo lo que necesita para su tarea |
| Exportación de informe PDF | Sí — el informe es el producto final que el usuario entrega a su cliente |
| Tema claro/oscuro | Sí — los usuarios trabajan largas jornadas frente al ordenador |
| Responsive (mobile/tablet) | Sí — el operador puede registrar desde cualquier dispositivo |

### Identidad visual y el sector

La paleta de colores de Fluster usa el azul (`#4FB2F8`) como color primario. El azul es el color dominante en el sector marítimo y de transporte (navieras, puertos, aplicaciones logísticas), lo que genera una asociación visual inmediata con el contexto profesional del usuario.

La tipografía combina **Crimson Text** (para títulos y datos clave) con **Poppins** (para cuerpo y etiquetas). Crimson Text aporta un carácter formal y legible para datos numéricos importantes, mientras que Poppins garantiza legibilidad en cuerpo de texto pequeño. Esta combinación refleja el balance entre la seriedad del sector y la claridad funcional de la interfaz.

---

## 5. Accesibilidad como criterio de adecuación

Adecuar una interfaz al usuario no es solo diseño visual: también significa que el usuario pueda acceder a ella independientemente de sus capacidades o el dispositivo que use.

### ARIA — roles semánticos

```jsx
// Spinner.jsx — informa al lector de pantalla que hay una carga en curso
<span className="spinner" role="status" aria-label="Cargando" />

// Mensaje de error — anunciado inmediatamente por el lector de pantalla
<p className="entrada-datos-form__error" role="alert">{error}</p>

// Buscador — su propósito queda claro sin texto visible
<section className="buscador-contenedores" aria-label="Buscador rápido">
```

### Foco visible — teclado

Todos los elementos interactivos tienen un estado `:focus-visible` visible mediante el mixin centralizado:

```scss
@mixin foco-visible {
  &:focus-visible {
    outline:    none;
    box-shadow: 0 0 0 3px var(--color-primary-off);
  }
}
```

Esto permite navegar toda la aplicación con el teclado, lo cual es importante para usuarios con movilidad reducida o que prefieren no usar el ratón.

### Contraste

Los tokens de color se definen respetando las relaciones de contraste WCAG 2.1 nivel AA:

| Combinación | Contraste | Nivel WCAG |
|---|---|---|
| `--color-text` sobre `--color-bg` | > 7:1 | AA / AAA |
| `--color-box-text` sobre `--color-primary` | > 4.5:1 | AA |
| `--color-text-subtle` | > 3:1 | AA (texto grande) |

Esto garantiza que el contenido sea legible para usuarios con visión reducida o daltónicos.
