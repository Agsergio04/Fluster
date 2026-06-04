/**
 * Modelo de Contenedor
 * Entidad central del sistema; registra el ciclo de vida de cada contenedor
 */

const { Schema, model } = require('mongoose')

/**
 * Ciclo de vida de un contenedor (circular):
 *
 *   INACTIVO → PUERTO → CLIENTE → INACTIVO
 *
 *   INACTIVO → free time activo; sin coste.
 *              Si fechaDevolucion está informada, el ciclo ya ha completado
 *              y los costes D&D han sido aplicados y cerrados.
 *   PUERTO   → contenedor en puerto; se acumula demurrage (sobreestadía).
 *   CLIENTE  → contenedor con el cliente; se acumula detention (detención).
 *
 * La transición CLIENTE → INACTIVO es el momento en que se finalizan
 * y aplican los costes totales del ciclo (demurrage + detention).
 */
const ESTADOS = ['INACTIVO', 'PUERTO', 'CLIENTE']

/**
 * Esquema de contenedor
 * Solo persiste los datos de entrada y las fechas clave de cada tramo.
 * Los días libres y las tarifas se obtienen de la naviera asociada.
 * Los costes, días acumulados y el semáforo de riesgo se calculan en el
 * backend bajo demanda a partir de las fechas y los datos de la naviera.
 * El campo fechaDevolucion indica que el ciclo ha cerrado y los costes son definitivos.
 */
const contenedorSchema = new Schema(
  {
    codigoBIC: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    foto: {
      type: String,
      default: null,
    },
    tipo: {
      type: String,
      trim: true,
      default: null,
    },
    estado: {
      type: String,
      enum: ESTADOS,
      default: 'INACTIVO',
    },
    navieraId: {
      type: Schema.Types.ObjectId,
      ref: 'Naviera',
      required: true,
    },
    fechaInicioLibre: {
      type: Date,
      default: Date.now,
    },
    // Inicio del tramo CARGADO → activa demurrage
    fechaEntradaPuerto: {
      type: Date,
      default: null,
    },
    // Inicio del tramo CLIENTE → activa detention
    fechaSalidaPuerto: {
      type: Date,
      default: null,
    },
    // Cierre del ciclo
    fechaDevolucion: {
      type: Date,
      default: null,
    },
    creadoPor: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' } }
)

// Índices para las consultas más habituales del panel
contenedorSchema.index({ estado: 1, creadoEn: -1 })
contenedorSchema.index({ navieraId: 1 })

module.exports = model('Contenedor', contenedorSchema)
