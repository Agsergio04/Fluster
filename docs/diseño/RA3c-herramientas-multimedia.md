# RA3.c — Herramientas multimedia

> **RA vinculado:** RA3 — CE 3.c  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Herramientas utilizadas en Fluster](#1-herramientas-utilizadas-en-fluster)
2. [Vite — bundler y procesado de assets](#2-vite--bundler-y-procesado-de-assets)
3. [Importación de SVG como componentes React](#3-importación-de-svg-como-componentes-react)
4. [Herramientas externas de optimización](#4-herramientas-externas-de-optimización)
5. [Tesseract.js — OCR de imágenes de contenedores](#5-tesseractjs--ocr-de-imágenes-de-contenedores)

---

## 1. Herramientas utilizadas en Fluster

| Herramienta | Tipo | Propósito en el proyecto |
|---|---|---|
| **Vite** | Bundler / build tool | Compilar SCSS, importar SVG como componentes, optimizar assets en producción |
| **Plugin `vite-plugin-svgr`** | Plugin Vite | Transforma archivos `.svg` en componentes React mediante `?react` |
| **Squoosh** | Herramienta externa (web) | Comprimir imágenes PNG/JPEG antes de incluirlas en el proyecto |
| **SVGO** | Herramienta externa (CLI) | Optimizar archivos SVG eliminando metadatos y nodos innecesarios |
| **Tesseract.js** | Librería OCR | Extraer el código BIC de las fotografías de contenedores |

---

## 2. Vite — bundler y procesado de assets

Vite es la herramienta de build principal del frontend de Fluster. Gestiona el procesado de todos los assets multimedia:

### Procesado de imágenes PNG/JPEG

Vite copia los archivos de imagen de `src/assets/` a la carpeta `dist/` durante el build, aplicando:
- **Hash de nombre de archivo** — `hero.abc123.png` — para invalidar la caché del navegador cuando cambia la imagen.
- **Inline de assets pequeños** — archivos menores de 4 KB se convierten automáticamente en data URIs para eliminar peticiones HTTP.

```js
// vite.config.js
export default {
  build: {
    assetsInlineLimit: 4096, // archivos < 4KB → data URI
  }
}
```

### Procesado de SCSS

Vite usa el compilador `sass` para transformar `main.scss` en `main.css` optimizado:

```bash
# Resultado del build en producción
dist/
├── assets/
│   ├── main.abc123.css   ← SCSS compilado, minificado y con autoprefixer
│   ├── index.abc123.js   ← JS + componentes React
│   └── hero.abc123.png   ← imagen renombrada con hash
└── index.html
```

---

## 3. Importación de SVG como componentes React

El plugin `vite-plugin-svgr` (integrado en Vite) permite importar archivos `.svg` directamente como componentes React usando el sufijo `?react`:

```jsx
// Sin el plugin: importación como URL de imagen
import logoUrl from './logo.svg'
<img src={logoUrl} alt="Fluster" />

// Con el plugin: importación como componente React
import LogoFluster from './logo.svg?react'
<LogoFluster className="header__logo" aria-hidden="true" />
```

### Ventajas de SVG como componente React

1. **Control de estilos desde CSS** — las propiedades `fill`, `stroke` y `color` del SVG son accesibles desde SCSS.
2. **Sin petición HTTP** — el SVG se incrusta en el bundle JS, eliminando latencia de red.
3. **Props de accesibilidad** — se pueden pasar `aria-label`, `aria-hidden`, `role` directamente.
4. **Clases dinámicas** — se puede pasar `className` para aplicar estilos del sistema.

```jsx
// Icono decorativo — no anunciado por lectores de pantalla
<IconoEditar aria-hidden="true" className="btn-editar__icono" />

// Icono funcional — anunciado por lectores de pantalla
<IconoBuscar aria-label="Buscar contenedor" role="img" />
```

---

## 4. Herramientas externas de optimización

### Squoosh — compresión de imágenes PNG/JPEG

Squoosh (squoosh.app) es una herramienta web de Google para comprimir imágenes visualmente comparando calidad y tamaño en tiempo real.

Se usó en Fluster para optimizar las imágenes estáticas del proyecto antes de añadirlas al repositorio:

| Proceso | Herramienta | Resultado |
|---|---|---|
| Comprimir `hero.png` | Squoosh (modo PNG, nivel 9) | Reducción de tamaño manteniendo calidad visual |
| Comprimir logo | Squoosh (modo PNG) | Archivo más ligero sin pérdida de nitidez |

**Configuración usada en Squoosh:**
- Formato de salida: PNG (para imágenes con transparencia)
- Nivel de compresión: máximo sin pérdida visible
- Comparación visual lado a lado para verificar que la calidad es aceptable

### SVGO — optimización de SVG

SVGO (SVG Optimizer) es una herramienta CLI que elimina de los archivos SVG:
- Metadatos del editor (Adobe Illustrator, Figma, etc.)
- Comentarios
- Nodos y atributos innecesarios
- Transformaciones que pueden simplificarse

```bash
# Optimizar un único SVG
npx svgo icono.svg -o icono.min.svg

# Optimizar todos los SVG de una carpeta
npx svgo --folder ./src/assets/icons/
```

Los iconos de Fluster se exportaron desde Figma y se optimizaron con SVGO antes de añadirlos al repositorio, reduciendo su tamaño entre un 20% y un 60%.

---

## 5. Tesseract.js — OCR de imágenes de contenedores

Tesseract.js es la herramienta multimedia más específica del proyecto: una librería de reconocimiento óptico de caracteres (OCR) que extrae texto de fotografías.

### Propósito en Fluster

Cuando el operador sube una fotografía del contenedor al registrarlo, Tesseract.js analiza la imagen y extrae el **código BIC** (identificador único del contenedor, ej: `MSCU1234567`) automáticamente.

### Flujo técnico

```
Operador sube foto
      ↓
Frontend envía imagen a POST /api/ocr/extraer-bic
      ↓
Backend: ocrService.js invoca Tesseract.js
      ↓
Tesseract.js analiza la imagen en busca de patrones de código BIC
(4 letras + 6 dígitos + 1 dígito de control)
      ↓
Código BIC detectado → se autocompleta en el formulario
      ↓
Si no detectado → operador lo introduce manualmente
```

### Configuración de Tesseract.js

```js
// backend/src/services/ocrService.js
const { createWorker } = require('tesseract.js')

async function extraerBic(imagenBuffer) {
  const worker = await createWorker('eng')
  const { data: { text } } = await worker.recognize(imagenBuffer)
  await worker.terminate()

  // Validar patrón BIC: 4 letras + 6 dígitos + 1 dígito
  const match = text.match(/[A-Z]{4}\d{7}/)
  return match ? match[0] : null
}
```

Esta herramienta transforma una fotografía JPG en texto estructurado, siendo la integración multimedia más avanzada del proyecto.
