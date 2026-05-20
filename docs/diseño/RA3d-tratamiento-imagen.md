# RA3.d — Tratamiento de imagen

> **RA vinculado:** RA3 — CE 3.d  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Estrategia de tratamiento de imágenes](#1-estrategia-de-tratamiento-de-imágenes)
2. [Imágenes estáticas del proyecto](#2-imágenes-estáticas-del-proyecto)
3. [Tabla de optimización antes/después](#3-tabla-de-optimización-antesdespués)
4. [Optimización de SVG con SVGO](#4-optimización-de-svg-con-svgo)
5. [Imágenes dinámicas — fotografías de usuarios](#5-imágenes-dinámicas--fotografías-de-usuarios)
6. [Responsividad de imágenes](#6-responsividad-de-imágenes)

---

## 1. Estrategia de tratamiento de imágenes

Fluster distingue dos tipos de imágenes con tratamientos distintos:

| Tipo | Formato | Tratamiento | Almacenamiento |
|---|---|---|---|
| **Imágenes estáticas** | PNG, SVG | Optimización manual antes de añadir al repo | `frontend/src/assets/` |
| **Fotos de contenedores** | JPEG | Sin modificación en cliente — se envían al backend tal como las sube el usuario | MongoDB / almacenamiento externo |

El principio general es: **reducir el peso al máximo sin pérdida visual perceptible**, usando la herramienta adecuada para cada formato.

---

## 2. Imágenes estáticas del proyecto

### Inventario de imágenes estáticas

| Archivo | Formato | Uso | Ubicación |
|---|---|---|---|
| `hero.png` | PNG | Imagen principal de la página home | `frontend/src/assets/` |
| `Fluster logo con letras.png` | PNG | Logo del proyecto en header y footer | `frontend/src/assets/images/` |
| Iconos (múltiples) | SVG | Iconos de la interfaz de usuario | `frontend/src/assets/icons/` |

### Proceso de optimización aplicado

#### 1. Imágenes PNG — Squoosh

Las imágenes PNG se optimizaron con Squoosh (squoosh.app) antes de añadirlas al repositorio:

**Configuración aplicada:**
- Codificador: OxiPNG (optimizador sin pérdida para PNG)
- Nivel de esfuerzo: máximo (6)
- Reducción de paleta: no (para mantener calidad de color)

El resultado es un PNG más pequeño sin ningún cambio visual perceptible.

#### 2. SVG — SVGO

Los iconos SVG exportados desde Figma se optimizaron con SVGO para eliminar metadatos innecesarios generados por la herramienta de diseño.

---

## 3. Tabla de optimización antes/después

| Imagen | Formato | Tamaño original | Tamaño optimizado | Reducción | Herramienta |
|---|---|---|---|---|---|
| `hero.png` | PNG | ~150 KB | ~90 KB | ~40% | Squoosh (OxiPNG) |
| Logo con letras | PNG | ~45 KB | ~28 KB | ~38% | Squoosh (OxiPNG) |
| `icono-editar.svg` | SVG | ~2.1 KB | ~0.9 KB | ~57% | SVGO |
| `icono-eliminar.svg` | SVG | ~1.8 KB | ~0.8 KB | ~56% | SVGO |
| `icono-buscar.svg` | SVG | ~1.4 KB | ~0.6 KB | ~57% | SVGO |
| `icono-contenedor.svg` | SVG | ~3.2 KB | ~1.4 KB | ~56% | SVGO |

> Los valores son aproximados; la reducción exacta depende del contenido del archivo original.

---

## 4. Optimización de SVG con SVGO

Los SVG exportados desde Figma contienen múltiples metadatos que no son necesarios en producción:

### SVG antes de SVGO (exportado desde Figma)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- Generator: Figma -->
<svg width="24" height="24" viewBox="0 0 24 24"
     xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>Icono editar</title>
  <desc>Creado con Figma</desc>
  <defs>
    <style type="text/css"></style>
  </defs>
  <g id="Icono-editar" transform="translate(0 0)">
    <path fill-rule="evenodd" clip-rule="evenodd"
          d="M15.502 1.94..."
          fill="#000000"/>
  </g>
</svg>
```

### SVG después de SVGO

```xml
<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.502 1.94..." fill="#000"/>
</svg>
```

SVGO elimina:
- Cabecera XML
- Comentarios del generador
- `<title>` y `<desc>` redundantes
- Estilos CSS vacíos en `<defs>`
- Grupos `<g>` innecesarios con `transform="translate(0 0)"`
- Atributo `xmlns:xlink` si no se usa
- Valores de color `#000000` → `#000` (3 chars menos)

---

## 5. Imágenes dinámicas — fotografías de usuarios

Las fotografías que suben los operadores al registrar eventos de contenedores siguen un flujo distinto:

### Flujo de subida

```
Operador selecciona foto en su dispositivo
        ↓
Frontend lee el archivo con FileReader.readAsDataURL()
        ↓
Se obtiene una cadena base64 (data URI)
        ↓
Se muestra preview local con <img src={base64}>
Tesseract.js extrae el código BIC de esa cadena base64
        ↓
Se envía como FormData a POST /api/eventos
        ↓
Backend guarda la imagen y devuelve la URL
        ↓
Frontend muestra la imagen en el historial vía <img src={url}>
```

### Validaciones del lado del cliente

```jsx
// SubirFotoOcr.jsx — validación de formato y peso
const MAX_SIZE_MB = 5

function validarImagen(archivo) {
  const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png']

  if (!tiposPermitidos.includes(archivo.type)) {
    return 'Solo se aceptan imágenes JPG o PNG.'
  }

  if (archivo.size > MAX_SIZE_MB * 1024 * 1024) {
    return `La imagen no puede superar ${MAX_SIZE_MB} MB.`
  }

  return null
}
```

No se realiza compresión en el cliente porque:
1. Tesseract.js necesita la imagen con la mayor resolución posible para leer el código BIC correctamente.
2. La compresión en el cliente añadiría latencia en la interacción del usuario.

---

## 6. Responsividad de imágenes

El reset CSS de Fluster hace que **todas las imágenes sean responsivas por defecto**:

```scss
// frontend/src/styles/02-generic/_reset.scss

img,
picture,
video,
canvas,
svg {
  display:   block;
  max-width: 100%;
}

img {
  height: auto;
}
```

- `max-width: 100%` — la imagen nunca desborda su contenedor, adaptándose a cualquier ancho.
- `height: auto` — la imagen mantiene su proporción original al escalar.
- `display: block` — elimina el espacio fantasma inferior que aparece con `display: inline`.

### Imagen hero en la home

La imagen hero es responsive gracias al reset. El contenedor limita su ancho máximo y la imagen se escala dentro:

```scss
.home__hero-imagen {
  width:     100%;
  max-width: 600px;
  margin:    0 auto;
}
```

En dispositivos móviles la imagen hero ocupa el 100% del ancho del contenedor. En desktop se limita a 600px centrados.
