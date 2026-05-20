# RA3.f — Importar y exportar multimedia en diversos formatos

> **RA vinculado:** RA3 — CE 3.f  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Estrategia de importación de multimedia](#1-estrategia-de-importación-de-multimedia)
2. [Importación de SVG como componentes React](#2-importación-de-svg-como-componentes-react)
3. [Importación de PNG e imágenes rasterizadas](#3-importación-de-png-e-imágenes-rasterizadas)
4. [Carga diferida — loading lazy](#4-carga-diferida--loading-lazy)
5. [Exportación y generación de PDF con jsPDF](#5-exportación-y-generación-de-pdf-con-jspdf)
6. [Soporte de formatos en navegadores](#6-soporte-de-formatos-en-navegadores)

---

## 1. Estrategia de importación de multimedia

Fluster importa los assets multimedia directamente a través del sistema de módulos ES (ES Modules) de Vite, que garantiza que:

1. Los archivos se incluyen en el bundle optimizado de producción.
2. Los nombres de archivo se renombran con hash para invalidar caché.
3. Los archivos pequeños se convierten en data URIs para eliminar peticiones HTTP.

### Tipos de importación usados

| Tipo de asset | Sintaxis de importación | Resultado |
|---|---|---|
| SVG como componente React | `import Icono from './icono.svg?react'` | Componente JSX con acceso CSS |
| SVG como URL | `import url from './icono.svg'` | Cadena de URL para usar en `src` |
| PNG/JPEG como URL | `import img from './hero.png'` | Cadena de URL con hash |
| CSS/SCSS | `import './styles/main.scss'` | Compilado e inyectado en el bundle |

---

## 2. Importación de SVG como componentes React

Todos los iconos de la interfaz se importan como componentes React para mantener control total sobre sus propiedades CSS:

```jsx
// frontend/src/components/atomos/BotonEditar.jsx

import IconoLapiz from '../../assets/icons/editar.svg?react'

function BotonEditar({ onClick }) {
  return (
    <button
      className="btn-editar"
      onClick={onClick}
      aria-label="Editar"
    >
      <IconoLapiz aria-hidden="true" className="btn-editar__icono" />
    </button>
  )
}
```

### Control de color mediante CSS

Los SVG importados como componentes React usan `fill="currentColor"` (configurado en el SVG al exportar de Figma). Esto permite que el color del icono se herede del texto circundante, adaptándose automáticamente al tema claro/oscuro:

```scss
// _btn-editar.scss
.btn-editar {
  color: var(--color-text);  // el icono hereda este color

  &:hover {
    color: var(--color-primary);  // el icono cambia de color en hover
  }
}
```

Cuando el tema cambia de claro a oscuro, `--color-text` pasa de `#111827` a `#F9FAFB`, y todos los iconos adaptan su color automáticamente sin ninguna regla CSS adicional.

---

## 3. Importación de PNG e imágenes rasterizadas

Las imágenes PNG se importan como URL y se usan en el atributo `src` de `<img>`:

```jsx
// frontend/src/components/organismos/Footer.jsx

import logoFluster from '../../assets/images/Fluster logo con letras.png'

function Footer() {
  return (
    <footer className="footer">
      <img
        src={logoFluster}
        alt="Fluster — gestión de costes D&D"
        className="footer__logo"
        width="120"
        height="40"
        loading="lazy"
      />
    </footer>
  )
}
```

### Atributos importantes

- `alt` — texto alternativo descriptivo para lectores de pantalla y cuando la imagen no carga.
- `width` y `height` — dimensiones explícitas para evitar **Cumulative Layout Shift (CLS)**: el navegador reserva el espacio antes de que cargue la imagen.
- `loading="lazy"` — carga diferida: la imagen solo se descarga cuando entra en el viewport.

---

## 4. Carga diferida — `loading lazy`

El atributo `loading="lazy"` se aplica a todas las imágenes que no son críticas para el primer render (above the fold):

```jsx
// Imágenes en el historial del contenedor — no son visibles de entrada
<img
  src={evento.fotoUrl}
  alt={`Foto del evento ${evento.tipo} del contenedor ${codigoBIC}`}
  className="tarjeta-ciclo__foto"
  loading="lazy"
  width="300"
  height="200"
/>
```

### Imágenes que NO usan `loading="lazy"`

- La imagen hero de la home — está above the fold y debe cargarse inmediatamente.
- El logo del header — siempre visible, no debe retrasarse.

### Imágenes que SÍ usan `loading="lazy"`

- Logo del footer — generalmente below the fold.
- Fotos de eventos en el historial del contenedor — visibles solo al hacer scroll.
- Imágenes de la sección de características de la home.

### Ventaja de `loading="lazy"`

En la página de historial de un contenedor puede haber muchos eventos con fotos. Sin lazy loading, todas las fotos se descargarían al abrir la página aunque el usuario solo vea las primeras. Con lazy loading, solo se descargan las fotos visibles, reduciendo el tiempo de carga inicial y el consumo de datos.

---

## 5. Exportación y generación de PDF con jsPDF

Una funcionalidad clave de Fluster es la **exportación de informes PDF**. El gestor puede generar un informe del ciclo de vida de un contenedor con el resumen de costes D&D.

### Tecnología usada: jsPDF

```jsx
// frontend/src/pages/historial_contenedor/historial_contenedor.jsx

import jsPDF from 'jspdf'

async function generarPdf(informe) {
  const doc = new jsPDF()

  // Cabecera del informe
  doc.setFontSize(20)
  doc.text('Informe D&D — Fluster', 20, 20)

  // Datos del contenedor
  doc.setFontSize(12)
  doc.text(`Código BIC: ${informe.codigoBIC}`, 20, 40)
  doc.text(`Cliente: ${informe.cliente}`, 20, 50)

  // Tabla de tramos de coste
  informe.tramos.forEach((tramo, i) => {
    const y = 70 + (i * 10)
    doc.text(`${tramo.tipo}: ${tramo.dias} días × ${tramo.precioPorDia}€ = ${tramo.subtotal}€`, 20, y)
  })

  // Total
  doc.setFontSize(14)
  doc.text(`TOTAL: ${informe.total}€`, 20, 130)

  // Exportar como archivo descargable
  doc.save(`informe-${informe.codigoBIC}.pdf`)
}
```

### Flujo de exportación

```
Gestor hace clic en "Generar informe PDF"
        ↓
POST /api/informes → backend calcula snapshot inmutable
        ↓
Frontend recibe los datos del informe (tramos, total, fechas)
        ↓
jsPDF construye el documento en memoria (lado cliente)
        ↓
doc.save('informe-MSCU1234567.pdf') → descarga automática en el navegador
```

---

## 6. Soporte de formatos en navegadores

| Formato | Chrome | Firefox | Safari | Edge |
|---|---|---|---|---|
| **PNG** | Sí (todas versiones) | Sí | Sí | Sí |
| **SVG inline** | Sí (Chrome 4+) | Sí (Firefox 3+) | Sí (Safari 3.2+) | Sí |
| **JPEG** | Sí (todas versiones) | Sí | Sí | Sí |
| **`loading="lazy"`** | Sí (Chrome 77+) | Sí (Firefox 75+) | Sí (Safari 15.4+) | Sí (Edge 79+) |
| **CSS Custom Properties** | Sí (Chrome 49+) | Sí (Firefox 31+) | Sí (Safari 9.1+) | Sí (Edge 15+) |

El uso de `loading="lazy"` tiene soporte en todos los navegadores modernos. Para navegadores más antiguos que no lo soporten, simplemente se ignora el atributo y la imagen se carga normalmente — no hay degradación funcional.
