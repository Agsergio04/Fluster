const { Schema, model } = require('mongoose')

const usuarioSchema = new Schema({
  nombre:     { type: String, required: true },
  correo:     { type: String, required: true, unique: true, lowercase: true },
  contrasena: { type: String, required: true },
  rol:        { type: String, enum: ['admin', 'gestor', 'operador'], required: true }
}, { timestamps: { createdAt: 'creadoEn', updatedAt: false } })

module.exports = model('Usuario', usuarioSchema)
