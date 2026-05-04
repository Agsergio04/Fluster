/**
 * Modelo de Evento
 * Registro fotográfico del ciclo de vida de cada contenedor
 */

const { Schema, model } = require('mongoose')

/**
 * Tipos de evento en el ciclo de vida de un contenedor:
 *   entrada_puerto  → el contenedor llega al puerto
 *   salida_puerto   → el contenedor sale del puerto hacia el cliente
 *   llegada_almacen → el contenedor llega al almacén del cliente
 *   devolucion      → el contenedor es devuelto vacío a la naviera
 */
const TIPOS = ['entrada_puerto', 'salida_puerto', 'llegada_almacen', 'devolucion']

/**
 * Esquema de evento
 * El operador sube una foto en cada hito del ciclo; Tesseract OCR lee el código
 * BIC de la imagen para validar que el evento se vincula al contenedor correcto
 */
const eventoSchema = new Schema(
  {
    contenedorId: {
      type: Schema.Types.ObjectId,
      ref: 'Contenedor',
      required: true,
    },
    tipo: {
      type: String,
      enum: TIPOS,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    fotoUrl: {
      type: String,
      default: null,
    },
    // Código BIC extraído por Tesseract OCR de la foto subida
    codigoBICOcr: {
      type: String,
      default: null,
    },
    // true si codigoBICOcr coincide con el BIC del contenedor
    ocrValidado: {
      type: Boolean,
      default: false,
    },
    registradoPor: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
  }
)

// Índice para recuperar todos los eventos de un contenedor ordenados por fecha
eventoSchema.index({ contenedorId: 1, timestamp: 1 })

module.exports = model('Evento', eventoSchema)
