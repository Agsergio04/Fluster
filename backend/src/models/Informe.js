const { Schema, model } = require('mongoose')

const tramoInformeSchema = new Schema({
  tipo:        { type: String, required: true },
  fechaInicio: { type: Date, required: true },
  fechaFin:    { type: Date, required: true },
  dias:        { type: Number, required: true },
  precioPorDia: { type: Number, required: true },
  subtotal:    { type: Number, required: true }
}, { _id: false })

const informeSchema = new Schema({
  contenedorId: { type: Schema.Types.ObjectId, ref: 'Contenedor', required: true },
  codigoBIC:    { type: String, required: true },
  cliente:      { type: String, required: true },
  tramos:       { type: [tramoInformeSchema], required: true },
  total:        { type: Number, required: true },
  urlPdf:       { type: String, required: true },
  generadoPor:  { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }
}, { timestamps: { createdAt: 'generadoEn', updatedAt: false } })

module.exports = model('Informe', informeSchema)
