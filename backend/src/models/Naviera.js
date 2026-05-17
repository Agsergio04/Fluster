/**
 * Modelo de Naviera
 * Catálogo de navieras con días libres separados por tipo y tarifas D&D embebidas
 */

const { Schema, model } = require('mongoose')

/**
 * Esquema de tramo
 * Define el precio por día para un rango dentro de un período D&D
 *
 * Ejemplo:
 *   { desdeDia: 1,  hastaDia: 5,    precioPorDia: 50  }  → días 1–5: 50€/día
 *   { desdeDia: 6,  hastaDia: 10,   precioPorDia: 75  }  → días 6–10: 75€/día
 *   { desdeDia: 11, hastaDia: null, precioPorDia: 120 }  → día 11 en adelante: 120€/día
 */
const tramoSchema = new Schema(
  {
    desdeDia: {
      type: Number,
      required: true,
    },
    hastaDia: {
      type: Number,
      default: null,
    },
    precioPorDia: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
)

/**
 * Esquema de naviera
 * Centraliza toda la configuración D&D: días libres por tipo y tramos de coste.
 * Al asignar una naviera a un contenedor, se heredan automáticamente sus
 * días libres de demurrage, sus días libres de detention y sus tarifas.
 */
const navieraSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    codigo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    // Días sin coste mientras el contenedor permanece en puerto
    diasLibresDemurrage: {
      type: Number,
      required: true,
    },
    // Días sin coste mientras el contenedor está con el cliente
    diasLibresDetention: {
      type: Number,
      required: true,
    },
    // Tramos de coste para sobreestadía (contenedor en puerto)
    diasDemurrage: {
      type: [tramoSchema],
      required: true,
    },
    // Tramos de coste para detención (contenedor con cliente)
    diasDetention: {
      type: [tramoSchema],
      required: true,
    },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: false } }
)

module.exports = model('Naviera', navieraSchema)
