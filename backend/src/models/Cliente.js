/**
 * Modelo de Cliente
 * Empresas o personas asociadas a los contenedores
 */

const { Schema, model } = require('mongoose')

/**
 * Esquema de cliente
 * Se utiliza como referencia en contenedores e informes
 */
const clienteSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: false } }
)

module.exports = model('Cliente', clienteSchema)
