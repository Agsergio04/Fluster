/**
 * Servicio de eventos
 * Registro y consulta de los hitos fotográficos del ciclo de vida de un contenedor.
 */

const Evento = require('../models/Evento')
const Contenedor = require('../models/Contenedor')

/**
 * Registra un nuevo evento para un contenedor.
 * Verifica que el contenedor existe antes de crear el evento.
 *
 * @param {object} datos
 * @param {string} datos.contenedorId
 * @param {string} datos.tipo  - entrada_puerto | salida_puerto | llegada_almacen | devolucion
 * @param {Date}   datos.timestamp
 * @param {string} [datos.fotoUrl]
 * @param {string} [datos.codigoBICOcr]
 * @param {boolean} [datos.ocrValidado]
 * @param {string} datos.registradoPor
 * @returns {Promise<object>}
 */
async function registrar({ contenedorId, tipo, timestamp, fotoUrl, codigoBICOcr, ocrValidado, registradoPor }) {
  const contenedor = await Contenedor.findById(contenedorId)
  if (!contenedor) {
    const err = new Error('Contenedor no encontrado')
    err.status = 404
    throw err
  }

  return Evento.create({ contenedorId, tipo, timestamp, fotoUrl, codigoBICOcr, ocrValidado, registradoPor })
}

/**
 * Devuelve todos los eventos de un contenedor ordenados cronológicamente.
 *
 * @param {string} contenedorId
 * @returns {Promise<object[]>}
 */
async function listarPorContenedor(contenedorId) {
  return Evento.find({ contenedorId }).sort({ timestamp: 1 }).lean()
}

module.exports = { registrar, listarPorContenedor }
