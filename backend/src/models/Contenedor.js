const { Schema, model } = require('mongoose')

const ESTADOS = ['INACTIVO', 'CARGADO', 'CLIENTE', 'VUELTA_PUERTO']

const contenedorSchema = new Schema({
  codigoBIC:          { type: String, required: true, uppercase: true },
  tipo:               { type: String, required: true },
  estado:             { type: String, enum: ESTADOS, default: 'INACTIVO' },
  navieraId:          { type: Schema.Types.ObjectId, ref: 'Naviera', required: true },
  clienteId:          { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
  tarifaId:           { type: Schema.Types.ObjectId, ref: 'Tarifa', required: true },
  diasLibres:         { type: Number, required: true },
  fechaInicioLibre:   { type: Date, required: true },
  fechaEntradaPuerto: { type: Date, default: null },
  fechaSalidaPuerto:  { type: Date, default: null },
  fechaDevolucion:    { type: Date, default: null },
  creadoPor:          { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }
}, { timestamps: { createdAt: 'creadoEn', updatedAt: false } })

module.exports = model('Contenedor', contenedorSchema)
