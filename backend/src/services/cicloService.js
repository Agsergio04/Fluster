/**
 * Servicio de ciclos
 * Consultas y edición de los tramos D&D de los ciclos de un contenedor.
 * La creación y el cierre de ciclos ocurren dentro de contenedorService,
 * que es quien orquesta las transiciones de estado.
 */

const Ciclo = require('../models/Ciclo')
const Contenedor = require('../models/Contenedor')
const Naviera = require('../models/Naviera')
const { calcularDiasEntreFechas, calcularCosteTramos } = require('./calculoDD')

/**
 * Devuelve todos los ciclos de un contenedor, del más reciente al más antiguo.
 *
 * @param {string} contenedorId
 * @returns {Promise<object[]>}
 */
async function listarPorContenedor(contenedorId) {
  return Ciclo.find({ contenedorId }).sort({ creadoEn: -1 }).lean()
}

/**
 * Devuelve todos los ciclos asociados a un cliente, con los datos básicos
 * del contenedor populados. Se usa en el almacén para filtrar tramos por cliente.
 *
 * @param {string} clienteId
 * @returns {Promise<object[]>}
 */
async function listarPorCliente(clienteId) {
  return Ciclo.find({ clienteId })
    .populate('contenedorId', 'codigoBIC tipo estado')
    .sort({ creadoEn: -1 })
    .lean()
}

/**
 * Devuelve un ciclo por su ID.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
async function obtenerPorId(id) {
  const ciclo = await Ciclo.findById(id).lean()
  if (!ciclo) {
    const err = new Error('Ciclo no encontrado')
    err.status = 404
    throw err
  }
  return ciclo
}

/**
 * Edita las fechas de un tramo (demurrage o detention) de un ciclo y recalcula
 * sus días y coste. Si el ciclo está cerrado, recalcula también el coste total.
 * Centraliza la lógica de negocio que antes estaba en el controlador.
 *
 * @param {string} id - ID del ciclo
 * @param {'demurrage'|'detention'} tramo
 * @param {{ fechaInicio?: string, fechaFin?: string }} datos
 * @returns {Promise<object>} Ciclo actualizado (con clienteId populado)
 */
async function editarTramo(id, tramo, { fechaInicio, fechaFin } = {}) {
  const ciclo = await Ciclo.findById(id)
  if (!ciclo) {
    const err = new Error('Ciclo no encontrado')
    err.status = 404
    throw err
  }
  if (tramo === 'detention' && !ciclo.detention) {
    const err = new Error('Este ciclo aún no tiene tramo de detention')
    err.status = 422
    throw err
  }

  const update = {}
  if (fechaInicio) update[`${tramo}.fechaInicio`] = new Date(fechaInicio)
  if (fechaFin)    update[`${tramo}.fechaFin`]    = new Date(fechaFin)

  const iniEfectivo = fechaInicio ? new Date(fechaInicio) : ciclo[tramo].fechaInicio
  const finEfectivo = fechaFin    ? new Date(fechaFin)    : ciclo[tramo].fechaFin

  // La fecha de fin no puede ser anterior a la de inicio (duración negativa).
  if (iniEfectivo && finEfectivo && new Date(finEfectivo) < new Date(iniEfectivo)) {
    const err = new Error(`La fecha de fin del ${tramo} no puede ser anterior a la de inicio`)
    err.status = 422
    throw err
  }
  // El detention no puede empezar antes de que termine el demurrage.
  if (tramo === 'detention' && iniEfectivo && ciclo.demurrage?.fechaFin &&
      new Date(iniEfectivo) < new Date(ciclo.demurrage.fechaFin)) {
    const err = new Error('El detention no puede empezar antes de la fecha de fin del demurrage')
    err.status = 422
    throw err
  }

  // Solo se recalculan días y coste cuando hay fecha de fin asignada.
  if (finEfectivo) {
    const contenedor   = await Contenedor.findById(ciclo.contenedorId)
    const naviera      = await Naviera.findById(contenedor.navieraId)
    const tramosTarifa = tramo === 'demurrage' ? naviera.diasDemurrage : naviera.diasDetention
    const diasTot      = calcularDiasEntreFechas(iniEfectivo, finEfectivo)
    const diasFact     = Math.max(0, diasTot - ciclo[tramo].diasLibres)
    update[`${tramo}.diasTranscurridos`] = diasTot
    update[`${tramo}.diasFacturables`]   = diasFact
    update[`${tramo}.costeTotal`]        = calcularCosteTramos(diasFact, tramosTarifa)

    // Si el ciclo está cerrado, el coste total es la suma de ambos tramos.
    if (ciclo.fechaCierre) {
      const otro      = tramo === 'demurrage' ? 'detention' : 'demurrage'
      const costeOtro = ciclo[otro]?.costeTotal ?? 0
      update.costeTotal = update[`${tramo}.costeTotal`] + costeOtro
    }
  }

  return Ciclo
    .findByIdAndUpdate(id, { $set: update }, { new: true })
    .populate('clienteId', 'nombre')
}

/** Edita el tramo de demurrage de un ciclo. */
function editarDemurrage(id, datos) {
  return editarTramo(id, 'demurrage', datos)
}

/** Edita el tramo de detention de un ciclo. */
function editarDetention(id, datos) {
  return editarTramo(id, 'detention', datos)
}

module.exports = {
  listarPorContenedor,
  listarPorCliente,
  obtenerPorId,
  editarDemurrage,
  editarDetention,
}
