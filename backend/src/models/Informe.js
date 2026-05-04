/**
 * Modelo de Informe
 * Documento generado por el gestor al finalizar el ciclo de un contenedor
 */

const { Schema, model } = require('mongoose')

/**
 * Esquema de informe
 * Registro de auditoría que queda cuando el gestor exporta el PDF de un ciclo cerrado.
 * El PDF lo genera el frontend con jsPDF; aquí solo se guarda quién lo generó y cuándo.
 * Los campos codigoBIC y cliente son snapshots del momento de emisión para
 * garantizar que el historial no cambia si los datos originales se modifican después.
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
