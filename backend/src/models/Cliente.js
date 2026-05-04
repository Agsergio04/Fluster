const { Schema, model } = require('mongoose')

const clienteSchema = new Schema({
  nombre: { type: String, required: true }
}, { timestamps: { createdAt: 'creadoEn', updatedAt: false } })

module.exports = model('Cliente', clienteSchema)
