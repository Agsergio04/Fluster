const { Schema, model } = require('mongoose')

const TIPOS = ['entrada_puerto', 'salida_puerto', 'llegada_almacen', 'devolucion']

const eventoSchema = new Schema({
  contenedorId:  { type: Schema.Types.ObjectId, ref: 'Contenedor', required: true },
  tipo:          { type: String, enum: TIPOS, required: true },
  timestamp:     { type: Date, required: true },
  fotoUrl:       { type: String, default: null },
  codigoBICOcr:  { type: String, default: null },
  ocrValidado:   { type: Boolean, default: false },
  registradoPor: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }
})

module.exports = model('Evento', eventoSchema)
