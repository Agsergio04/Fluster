# RA3.b — Formatos multimedia

> **RA vinculado:** RA3 — CE 3.b  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Formatos de imagen utilizados en Fluster](#1-formatos-de-imagen-utilizados-en-fluster)
2. [PNG — imágenes con transparencia y alta calidad](#2-png--imágenes-con-transparencia-y-alta-calidad)
3. [SVG — iconos y gráficos vectoriales](#3-svg--iconos-y-gráficos-vectoriales)
4. [JPEG — fotografías de contenedores](#4-jpeg--fotografías-de-contenedores)
5. [Tabla comparativa de formatos](#5-tabla-comparativa-de-formatos)
6. [Criterios de elección de formato](#6-criterios-de-elección-de-formato)

---

## 1. Formatos de imagen utilizados en Fluster

Fluster utiliza tres formatos de imagen, cada uno elegido según el tipo de contenido al que sirve:

| Formato | Archivos en el proyecto | Propósito |
|---|---|---|
| **PNG** | `hero.png`, logo | Imágenes con transparencia o calidad máxima necesaria |
| **SVG** | Iconos de la interfaz (`/assets/icons/`) | Iconos escalables a cualquier tamaño sin pérdida |
| **JPEG** | Fotos de contenedores subidas por usuarios | Fotografías con muchos colores y degradados |

---

## 2. PNG — imágenes con transparencia y alta calidad

### Cuándo se usa

PNG (Portable Network Graphics) es un formato sin pérdida que soporta transparencia (canal alfa). En Fluster se usa para:

- **Imagen hero** de la página principal (`frontend/src/assets/hero.png`): requiere transparencia para integrarse correctamente con el fondo, que cambia según el tema claro/oscuro.
- **Logo de Fluster** (`Fluster logo con letras.png`): el logo usa transparencia para poder superponerse sobre cualquier fondo sin borde visible.

### Ventajas del PNG en estos casos

- Sin pérdida de calidad (lossless) — adecuado para imágenes con texto o bordes nítidos.
- Soporte de transparencia (canal alfa de 8 bits) — esencial para logos y elementos que se superponen a fondos de color.
- Soporte universal en todos los navegadores.

### Desventajas y cuándo no usar PNG

- Tamaño de archivo mayor que JPEG para fotografías con muchos colores.
- No adecuado para fotografías de contenedores (demasiado peso).

---

## 3. SVG — iconos y gráficos vectoriales

### Cuándo se usa

SVG (Scalable Vector Graphics) es un formato vectorial basado en XML. En Fluster se usa para **todos los iconos de la interfaz** (menú hamburguesa, lupa de búsqueda, iconos de editar/eliminar, iconos de navegación).

Los archivos SVG se importan como **componentes React** con el sufijo `?react` de Vite:

```jsx
// Importación como componente React
import IconoContenedor from '../assets/icons/contenedor.svg?react'
import IconoEditar     from '../assets/icons/editar.svg?react'
import IconoEliminar   from '../assets/icons/eliminar.svg?react'

// Uso en JSX
<IconoContenedor aria-hidden="true" className="btn-editar__icono" />
```

### Ventajas del SVG para iconos

- **Escalabilidad perfecta** — el mismo archivo se usa para 16px y para 64px sin pixelación.
- **Control de color mediante CSS** — `fill: currentColor` permite que el icono adopte el color del texto circundante, funcionando automáticamente en modo oscuro.
- **Tamaño muy pequeño** — los iconos simples tienen menos de 1 KB.
- **Sin petición HTTP extra** — al importarse como componente, el SVG se incrusta directamente en el bundle de React.
- **Accesibilidad** — `aria-hidden="true"` cuando es decorativo, `aria-label` cuando es funcional.

```scss
// Los iconos heredan el color del texto automáticamente
.btn-eliminar__icono {
  color: currentColor;   // hereda --color-box-text o --color-text según contexto
  width:  1.25rem;
  height: 1.25rem;
}
```

---

## 4. JPEG — fotografías de contenedores

### Cuándo se usa

JPEG (Joint Photographic Experts Group) es un formato con compresión con pérdida optimizado para fotografías. En Fluster se usa para las **fotografías de contenedores** que suben los operadores al registrar eventos del ciclo de vida.

Estas imágenes se almacenan en el backend (MongoDB o almacenamiento externo) y se muestran en:
- La página de historial del contenedor (`/historial/:id`).
- Los eventos del contenedor en la línea de tiempo.

Las imágenes de ejemplo están en `docs/assets/contenedores/` con formato JPEG.

### Ventajas del JPEG para fotografías

- **Tamaño de archivo reducido** — la compresión con pérdida elimina información imperceptible, generando archivos mucho más pequeños que PNG.
- **Soporte universal** — compatible con todos los navegadores y dispositivos.
- **Adecuado para fotografías reales** — millones de colores y degradados suaves.

### Desventajas y cuándo no usar JPEG

- No soporta transparencia.
- Compresión con pérdida — cada vez que se guarda el archivo pierde calidad.
- No adecuado para imágenes con texto, bordes nítidos o iconos (aparecen artefactos).

---

## 5. Tabla comparativa de formatos

| Característica | PNG | SVG | JPEG |
|---|---|---|---|
| **Compresión** | Sin pérdida | Vectorial | Con pérdida |
| **Transparencia** | Sí | Sí | No |
| **Escalabilidad** | Rasterizado (pierde calidad) | Infinita | Rasterizado |
| **Mejor para** | Logos, capturas, UI con transparencia | Iconos, ilustraciones | Fotografías |
| **Soporte CSS** | No | Sí (`fill: currentColor`) | No |
| **Tamaño típico** | Medio | Muy pequeño | Pequeño/Medio |
| **Uso en Fluster** | Hero, logo | Iconos de interfaz | Fotos de contenedores |

---

## 6. Criterios de elección de formato

La elección del formato en Fluster sigue estas reglas:

1. **¿Es un icono o gráfico simple?** → SVG siempre. Escalable, ligero y controlable por CSS.
2. **¿Necesita transparencia sobre fondo variable?** → PNG. Soporta canal alfa sin pérdida.
3. **¿Es una fotografía del mundo real?** → JPEG. El ojo humano no detecta la pérdida mínima y el archivo es mucho más ligero.
4. **¿Es texto o imagen con bordes nítidos sin transparencia?** → PNG. JPEG introduciría artefactos visibles.

WebP es el formato moderno que combinaría las ventajas de PNG y JPEG, pero no se ha implementado aún en Fluster ya que las imágenes son principalmente SVG (no aplica) e imágenes subidas por usuarios cuyo formato no se controla en el cliente.
