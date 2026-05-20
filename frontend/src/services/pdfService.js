
/** Formatea una fecha a dd/mm/aaaa; devuelve '-' si el valor es nulo. */
const fmt  = date => date ? new Date(date).toLocaleDateString('es-ES') : '-'
/** Formatea un número como importe en euros; devuelve '-' si el valor es nulo. */
const eur  = n    => n != null ? `${n} €` : '-'

// Color primario de la aplicación tomado del token CSS --color-primary
const HEAD_COLOR = [79, 178, 248]
const ROW_ALT    = [240, 248, 255]

const TABLE_STYLES = {
  styles:            { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
  headStyles:        { fillColor: HEAD_COLOR, textColor: 255, fontStyle: 'bold' },
  alternateRowStyles:{ fillColor: ROW_ALT },
}

/**
 * Genera y descarga el informe general (múltiples contenedores).
 * @param {object[]} ciclos - Ciclos devueltos por /informes/generar-datos
 * @returns {boolean} false si no hay datos
 */
export async function generarPDFGeneral(ciclos) {
  if (!ciclos.length) return false

  const { default: jsPDF }     = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Informe General de Contenedores', 14, 18)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generado: ${fmt(new Date())}   ·   Total ciclos: ${ciclos.length}`, 14, 25)

  const columns = [
    { header: 'BIC',          dataKey: 'bic'     },
    { header: 'Naviera',      dataKey: 'naviera' },
    { header: 'Cliente',      dataKey: 'cliente' },
    { header: 'F. Cierre',    dataKey: 'fCierre' },
    { header: 'D.L. Dem.',    dataKey: 'dlDem'   },
    { header: 'D.F. Dem.',    dataKey: 'dfDem'   },
    { header: 'Coste Dem.',   dataKey: 'cDem'    },
    { header: 'D.L. Det.',    dataKey: 'dlDet'   },
    { header: 'D.F. Det.',    dataKey: 'dfDet'   },
    { header: 'Coste Det.',   dataKey: 'cDet'    },
    { header: 'Total',        dataKey: 'total'   },
  ]

  const rows = ciclos.map(c => ({
    bic:     c.contenedorId?.codigoBIC ?? '-',
    naviera: c.contenedorId?.navieraId?.nombre ?? '-',
    cliente: c.clienteId?.nombre ?? '-',
    fCierre: fmt(c.fechaCierre),
    dlDem:   c.demurrage?.diasLibres       ?? 0,
    dfDem:   c.demurrage?.diasFacturables  ?? 0,
    cDem:    eur(c.demurrage?.costeTotal),
    dlDet:   c.detention?.diasLibres       ?? 0,
    dfDet:   c.detention?.diasFacturables  ?? 0,
    cDet:    eur(c.detention?.costeTotal),
    total:   eur(c.costeTotal),
  }))

  autoTable(doc, { startY: 30, columns, body: rows, ...TABLE_STYLES })

  doc.save(`informe-general-${new Date().toISOString().split('T')[0]}.pdf`)
  return true
}

/**
 * Genera y descarga el informe individual de un contenedor.
 * @param {object[]} ciclos    - Ciclos del contenedor
 * @param {string}   codigoBIC - Código BIC para el título y nombre de fichero
 * @returns {boolean} false si no hay datos
 */
export async function generarPDFIndividual(ciclos, codigoBIC) {
  if (!ciclos.length) return false

  const { default: jsPDF }     = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(`Informe del Contenedor  ${codigoBIC}`, 14, 18)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generado: ${fmt(new Date())}   ·   Ciclos cerrados: ${ciclos.length}`, 14, 25)

  const columns = [
    { header: 'Cliente',        dataKey: 'cliente'    },
    { header: 'F. Ini. Dem.',   dataKey: 'fIniDem'    },
    { header: 'F. Fin Dem.',    dataKey: 'fFinDem'    },
    { header: 'D.L. Dem.',      dataKey: 'dlDem'      },
    { header: 'D.F. Dem.',      dataKey: 'dfDem'      },
    { header: 'Coste Dem.',     dataKey: 'cDem'       },
    { header: 'F. Ini. Det.',   dataKey: 'fIniDet'    },
    { header: 'F. Fin Det.',    dataKey: 'fFinDet'    },
    { header: 'D.L. Det.',      dataKey: 'dlDet'      },
    { header: 'D.F. Det.',      dataKey: 'dfDet'      },
    { header: 'Coste Det.',     dataKey: 'cDet'       },
    { header: 'Total',          dataKey: 'total'      },
  ]

  const rows = ciclos.map(c => ({
    cliente:  c.clienteId?.nombre ?? '-',
    fIniDem:  fmt(c.demurrage?.fechaInicio),
    fFinDem:  fmt(c.demurrage?.fechaFin),
    dlDem:    c.demurrage?.diasLibres       ?? 0,
    dfDem:    c.demurrage?.diasFacturables  ?? 0,
    cDem:     eur(c.demurrage?.costeTotal),
    fIniDet:  fmt(c.detention?.fechaInicio),
    fFinDet:  fmt(c.detention?.fechaFin),
    dlDet:    c.detention?.diasLibres       ?? 0,
    dfDet:    c.detention?.diasFacturables  ?? 0,
    cDet:     eur(c.detention?.costeTotal),
    total:    eur(c.costeTotal),
  }))

  autoTable(doc, { startY: 30, columns, body: rows, ...TABLE_STYLES })

  const fecha = new Date().toISOString().split('T')[0]
  doc.save(`informe-${codigoBIC}-${fecha}.pdf`)
  return true
}
