/**
 * Modelo de Ciclo
 * Registra las fechas de transición y los costes D&D de cada ciclo completo de un contenedor
 */

const { Schema, model } = require('mongoose')

/**
 * Tramo de demurrage
 * Cubre el período en que el contenedor permanece en puerto (estado CARGADO).
 * El coste empieza a acumularse una vez superados los diasLibres de la naviera.
 */
const tramoDemurrageSchema = new Schema(
  {
    // Snapshot de los días libres de la naviera en el momento del ciclo
    diasLibres: {
      type: Number,
      required: true,
    },
    fechaInicio: {
      type: Date,
      required: true,
    },
    // null mientras el contenedor sigue en puerto
    fechaFin: {
      type: Date,
      default: null,
    },
    // Total de días transcurridos en puerto (incluye días libres)
    diasTranscurridos: {
      type: Number,
      default: null,
    },
    // Días que generan coste (diasTranscurridos - diasLibres, mínimo 0)
    diasFacturables: {
      type: Number,
      default: null,
    },
    costeTotal: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
)

/**
 * Tramo de detention
 * Cubre el período en que el contenedor está con el cliente (estado CLIENTE).
 * El coste empieza a acumularse una vez superados los diasLibres de la naviera.
 */
const tramoDetentionSchema = new Schema(
  {
    // Snapshot de los días libres de la naviera en el momento del ciclo
    diasLibres: {
      type: Number,
      required: true,
    },
    fechaInicio: {
      type: Date,
      required: true,
    },
    // null mientras el contenedor sigue con el cliente
    fechaFin: {
      type: Date,
      default: null,
    },
    // Total de días transcurridos con el cliente (incluye días libres)
    diasTranscurridos: {
      type: Number,
      default: null,
    },
    // Días que generan coste (diasTranscurridos - diasLibres, mínimo 0)
    diasFacturables: {
      type: Number,
      default: null,
    },
    costeTotal: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
)

/**
 * Esquema de ciclo
 * Un ciclo cubre el recorrido completo INACTIVO → CARGADO → CLIENTE → INACTIVO.
 * Se crea cuando el contenedor entra en CARGADO y se cierra con los costes definitivos
 * en la transición CLIENTE → INACTIVO.
 * Un mismo contenedor puede acumular varios ciclos a lo largo de su vida útil.
 */
const cicloSchema = new Schema(
  {
    contenedorId: {
      type: Schema.Types.ObjectId,
      ref: 'Contenedor',
      required: true,
    },
    // El cliente se asigna al abrir el ciclo y permanece hasta que se cierra;
    // cada ciclo puede pertenecer a un cliente distinto
    clienteId: {
      type: Schema.Types.ObjectId,
      ref: 'Cliente',
      required: true,
    },
    demurrage: {
      type: tramoDemurrageSchema,
      default: null,
    },
    detention: {
      type: tramoDetentionSchema,
      default: null,
    },
    // Suma de demurrage.costeTotal + detention.costeTotal; se rellena al cerrar el ciclo
    costeTotal: {
      type: Number,
      default: null,
    },
    // Fecha en que el ciclo queda cerrado (transición CLIENTE → INACTIVO)
    fechaCierre: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: false } }
)

// Índice para recuperar todos los ciclos de un contenedor ordenados por fecha
cicloSchema.index({ contenedorId: 1, creadoEn: -1 })

module.exports = model('Ciclo', cicloSchema)
