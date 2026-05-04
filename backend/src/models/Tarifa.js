const { Schema, model } = require('mongoose')

const tramoSchema = new Schema({
  desdeDia:    { type: Number, required: true },
  hastaDia:    { type: Number, default: null },
  precioPorDia: { type: Number, required: true }
}, { _id: false })

const tarifaSchema = new Schema({
  navieraId:      { type: Schema.Types.ObjectId, ref: 'Naviera', required: true },
  diasDemurrage:  { type: [tramoSchema], required: true },
  diasDetention:  { type: [tramoSchema], required: true }
}, { timestamps: { createdAt: 'creadoEn', updatedAt: false } })

module.exports = model('Tarifa', tarifaSchema)
