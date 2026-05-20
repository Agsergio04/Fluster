# RA4.e — Agregar multimedia

> **RA vinculado:** RA4 — CE 4.e  
> **Módulo:** Diseño de Interfaces Web

---

## Índice

1. [Cómo se agrega multimedia en Fluster](#1-cómo-se-agrega-multimedia-en-fluster)
2. [Imágenes estáticas — SVG como componentes](#2-imágenes-estáticas--svg-como-componentes)
3. [Imágenes estáticas — PNG con atributos completos](#3-imágenes-estáticas--png-con-atributos-completos)
4. [Imágenes dinámicas — fotos de contenedores](#4-imágenes-dinámicas--fotos-de-contenedores)
5. [Multimedia generada — PDF con jsPDF](#5-multimedia-generada--pdf-con-jspdf)
6. [Accesibilidad en todos los elementos multimedia](#6-accesibilidad-en-todos-los-elementos-multimedia)

---

## 1. Cómo se agrega multimedia en Fluster

Fluster maneja tres tipos de multimedia con flujos de integración distintos:

| Tipo | Formato | Origen | Cómo se agrega |
|---|---|---|---|
| **Iconos de interfaz** | SVG | Figma → exportado y optimizado | Importación como componente React (`?react`) |
| **Imágenes estáticas** | PNG | Diseñadas/capturadas → optimizadas | Importación como URL y uso en `<img>` |
| **Fotos de contenedores** | JPEG | Subidas por usuarios en runtime | API REST → URL devuelta → `<img src={url}>` |
| **Informes** | PDF | Generados en cliente | jsPDF → `doc.save()` → descarga automática |

---

## 2. Imágenes estáticas — SVG como componentes

### Flujo de integración de un icono SVG nuevo

1. **Diseñar el icono en Figma** con `fill="currentColor"` para que el color sea heredable.
2. **Exportar como SVG** desde Figma (File → Export).
3. **Optimizar con SVGO** para eliminar metadatos innecesarios.
4. **Guardar en** `frontend/src/assets/icons/nombre-icono.svg`.
5. **Importar en el componente** React que lo usa.

```jsx
// Paso 5 — importar y usar el SVG como componente

import IconoContenedor from '../../assets/icons/contenedor.svg?react'

function BtnVerContenedor({ onClick }) {
  return (
    <button className="btn-ver-contenedor" onClick={onClick}>
      <IconoContenedor
        className="btn-ver-contenedor__icono"
        aria-hidden="true"
        width={20}
        height={20}
      />
      <span>Ver contenedor</span>
    </button>
  )
}
```

### Estilos del icono SVG

```scss
// _btn-ver-contenedor.scss
.btn-ver-contenedor {
  @include mix.flex-row(var(--space-8));
  color: var(--color-text);

  &__icono {
    flex-shrink: 0;       // no se comprime en flex
    color: currentColor;  // hereda el color del botón padre
  }

  &:hover {
    color: var(--color-primary);
    // el icono también cambia de color automáticamente
  }
}
```

---

## 3. Imágenes estáticas — PNG con atributos completos

### Flujo de integración de una imagen PNG

1. **Obtener o crear la imagen** (captura, diseño en Figma, fotografía).
2. **Optimizar con Squoosh** usando OxiPNG sin pérdida.
3. **Guardar en** `frontend/src/assets/images/`.
4. **Importar y usar en el componente** con todos los atributos recomendados.

```jsx
// Logo en el Footer

import logoUrl from '../../assets/images/Fluster logo con letras.png'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__marca">
        <img
          src={logoUrl}
          alt="Fluster"
          className="footer__logo"
          width="120"     // dimensión intrínseca en px
          height="40"     // evita Cumulative Layout Shift
          loading="lazy"  // below the fold → carga diferida
          decoding="async" // decodificación asíncrona sin bloquear UI
        />
      </div>
    </footer>
  )
}
```

### Atributos obligatorios en `<img>`

| Atributo | Obligatorio | Propósito |
|---|---|---|
| `src` | Sí | Ruta de la imagen |
| `alt` | Sí | Texto alternativo para accesibilidad |
| `width` | Recomendado | Reserva espacio y evita CLS |
| `height` | Recomendado | Reserva espacio y evita CLS |
| `loading` | Recomendado | `"lazy"` para imágenes below the fold |
| `decoding` | Opcional | `"async"` para no bloquear el hilo principal |

---

## 4. Imágenes dinámicas — fotos de contenedores

Las fotografías de contenedores son imágenes dinámicas que los operadores suben en tiempo de ejecución. El flujo es diferente al de las imágenes estáticas.

### Flujo completo

```
1. Operador selecciona archivo en <input type="file">
2. Frontend valida: tipo (JPG/PNG) y tamaño (< 5 MB)
3. FileReader.readAsDataURL() convierte el archivo a cadena base64 (data URI)
4. Frontend muestra preview local con <img src={base64}>
   Tesseract.js procesa esa cadena base64 para extraer el código BIC
5. Operador confirma o corrige el código BIC detectado
6. Formulario se envía como FormData a POST /api/eventos
7. Backend guarda la imagen y devuelve la URL
8. Frontend muestra la imagen en el historial con <img src={url}>
```

### Por qué FileReader en lugar de URL.createObjectURL

Se usa `FileReader.readAsDataURL()` en lugar de `URL.createObjectURL()` porque Tesseract.js necesita la imagen en formato base64 para ejecutar el OCR. Usar `readAsDataURL` unifica el preview y el OCR en un único paso: el mismo base64 que muestra la previsualización se pasa directamente al worker de Tesseract.

```jsx
// frontend/src/pages/meter_contenedor/meter_contenedor.jsx (fragmento)

function handleFotoSeleccionada(fichero) {
  const reader = new FileReader()

  reader.onload = (e) => {
    const base64 = e.target.result      // data:image/jpeg;base64,...
    setFoto(base64)                     // pasa el base64 al componente de preview
    ejecutarOcr(base64)                 // Tesseract.js recibe el mismo base64
  }

  reader.readAsDataURL(fichero)
}
```

### Preview con dimensiones explícitas

```jsx
// frontend/src/components/organismos/SubirFotoOcr.jsx (estado 'introducido')

<img
  className="subir-foto-ocr__foto"
  src={foto}                          // cadena base64 del FileReader
  alt="Previsualizado del contenedor"
  width="400"
  height="300"
  decoding="async"
/>
```

### Visualización en el historial

```jsx
// tarjeta-ciclo-contenedor.jsx
function TarjetaCicloContenedor({ evento, codigoBIC }) {
  return (
    <article className="tarjeta-ciclo">
      <time className="tarjeta-ciclo__fecha" dateTime={evento.timestamp}>
        {formatearFecha(evento.timestamp)}
      </time>
      <p className="tarjeta-ciclo__tipo">{evento.tipo}</p>
      {evento.fotoUrl && (
        <img
          src={evento.fotoUrl}
          alt={`Foto del evento ${evento.tipo} del contenedor ${codigoBIC}`}
          className="tarjeta-ciclo__foto"
          loading="lazy"
          width="300"
          height="200"
        />
      )}
    </article>
  )
}
```

---

## 5. Multimedia generada — PDF con jsPDF

jsPDF genera documentos PDF directamente en el navegador del cliente, sin necesidad de servidor. El archivo se descarga automáticamente cuando el gestor hace clic en «Generar informe».

```jsx
// PanelGenerarInforme.jsx
import jsPDF from 'jspdf'

async function handleGenerarPdf() {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  // Cabecera
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('Informe D&D — Fluster', 20, 25)

  // Línea separadora
  doc.setDrawColor(79, 178, 248)  // --color-primary
  doc.setLineWidth(0.5)
  doc.line(20, 30, 190, 30)

  // Datos del contenedor
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Código BIC: ${informe.codigoBIC}`, 20, 42)
  doc.text(`Cliente:    ${informe.cliente}`,   20, 50)
  doc.text(`Generado:   ${formatearFecha(informe.generadoEn)}`, 20, 58)

  // Tabla de tramos
  let y = 72
  informe.tramos.forEach(tramo => {
    doc.text(`${tramo.tipo}`, 20, y)
    doc.text(`${tramo.dias} días`, 80, y)
    doc.text(`${tramo.precioPorDia} €/día`, 120, y)
    doc.text(`${tramo.subtotal} €`, 170, y, { align: 'right' })
    y += 8
  })

  // Total
  doc.setFont('helvetica', 'bold')
  doc.text(`TOTAL: ${informe.total} €`, 170, y + 8, { align: 'right' })

  // Descarga automática
  doc.save(`informe-${informe.codigoBIC}-${Date.now()}.pdf`)
}
```

---

## 6. Accesibilidad en todos los elementos multimedia

Todos los elementos multimedia de Fluster implementan las reglas de accesibilidad WCAG 2.1:

| Elemento | Atributo de accesibilidad | Valor |
|---|---|---|
| `<img>` estáticas | `alt` descriptivo | `"Fluster — gestión de costes D&D"` |
| `<img>` decorativas | `alt=""` | Cadena vacía — lectores de pantalla las omiten |
| Iconos SVG decorativos | `aria-hidden="true"` | El lector de pantalla los ignora |
| Iconos SVG funcionales | `aria-label="Descripción"` | El lector de pantalla lo anuncia |
| `<input type="file">` | `<label>` asociado | `htmlFor` / `id` correctamente vinculados |
| Preview de imagen | `alt` con contexto | `"Preview de la foto del contenedor"` |
| Fotos de eventos | `alt` con código BIC | `"Foto del evento entrada_puerto del contenedor MSCU1234567"` |
| Spinner | `role="status"` + `aria-label` | `"Cargando"` |
