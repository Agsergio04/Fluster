const { Schema, model } = require('mongoose')

const navieraSchema = new Schema({
  nombre: { type: String, required: true },
  codigo: { type: String, required: true, unique: true, uppercase: true }
}, { timestamps: { createdAt: 'creadoEn', updatedAt: false } })

module.exports = model('Naviera', navieraSchema)
