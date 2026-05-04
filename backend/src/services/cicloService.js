/**
 * Servicio de ciclos
 * Consultas sobre los ciclos D&D de los contenedores.
 * La creación y el cierre de ciclos ocurren dentro de contenedorService,
 * que es quien orquesta las transiciones de estado.
 */

const Ciclo = require('../models/Ciclo')

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

module.exports = { listarPorContenedor, obtenerPorId }
