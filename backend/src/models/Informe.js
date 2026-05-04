/**
 * Modelo de Informe
 * Documento generado por el gestor al finalizar el ciclo de un contenedor
 */

const { Schema, model } = require('mongoose')

/**
 * Esquema de informe
 * Referencia al ciclo cerrado del que se extraen los datos para el PDF.
 * Los campos codigoBIC y cliente son snapshots del momento de emisión para
 * garantizar que el informe no cambia si los datos originales se modifican después.
 */
const informeSchema = new Schema(
  {
    contenedorId: {
      type: Schema.Types.ObjectId,
      ref: 'Contenedor',
      required: true,
    },
    cicloId: {
      type: Schema.Types.ObjectId,
      ref: 'Ciclo',
      required: true,
    },
    // Snapshot del BIC en el momento de generación
    codigoBIC: {
      type: String,
      required: true,
    },
    // Snapshot del nombre del cliente en el momento de generación
    cliente: {
      type: String,
      required: true,
    },
    urlPdf: {
      type: String,
      required: true,
    },
    generadoPor: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
  },
  { timestamps: { createdAt: 'generadoEn', updatedAt: false } }
)

// Índice para consultar el historial de informes de un contenedor
informeSchema.index({ contenedorId: 1, generadoEn: -1 })

module.exports = model('Informe', informeSchema)
