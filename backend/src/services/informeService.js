/**
 * Servicio de informes
 * Registro de auditoría y consulta de los informes PDF de ciclos cerrados.
 * El PDF lo genera el frontend con jsPDF; el backend solo persiste el registro
 * de quién exportó qué y cuándo.
 */

const Informe = require('../models/Informe')
const Contenedor = require('../models/Contenedor')
const Ciclo = require('../models/Ciclo')

/**
 * Registra que el gestor ha exportado el PDF de un ciclo cerrado.
 * Verifica que el ciclo esté cerrado; un ciclo abierto tendría costes parciales.
 * Los campos codigoBIC y cliente se guardan como snapshot para que el historial
 * no cambie si los datos originales se modifican después.
 *
 * @param {{ contenedorId: string, cicloId: string, generadoPor: string }} datos
 * @returns {Promise<object>}
 */
async function generar({ contenedorId, cicloId, generadoPor }) {
  const [contenedor, ciclo] = await Promise.all([
    Contenedor.findById(contenedorId),
    Ciclo.findById(cicloId).populate('clienteId', 'nombre'),
  ])

  if (!contenedor) {
    const err = new Error('Contenedor no encontrado')
    err.status = 404
    throw err
  }
  if (!ciclo) {
    const err = new Error('Ciclo no encontrado')
    err.status = 404
    throw err
  }
  if (!ciclo.fechaCierre) {
    const err = new Error('No se puede registrar un informe de un ciclo que aún no está cerrado')
    err.status = 422
    throw err
  }

  return Informe.create({
    contenedorId,
    cicloId,
    codigoBIC: contenedor.codigoBIC,
    cliente: ciclo.clienteId.nombre,
    generadoPor,
  })
}

/**
 * Lista todos los informes con filtros opcionales.
 * El campo cliente es un snapshot de texto, así que el filtro por nombre
 * usa una búsqueda parcial insensible a mayúsculas.
 *
 * @param {{ cliente?: string, contenedorId?: string }} filtros
 * @returns {Promise<object[]>}
 */
async function listar(filtros = {}) {
  const query = {}
  if (filtros.cliente) query.cliente = { $regex: filtros.cliente, $options: 'i' }
  if (filtros.contenedorId) query.contenedorId = filtros.contenedorId

  return Informe.find(query).sort({ generadoEn: -1 }).lean()
}

/**
 * Devuelve todos los informes de un contenedor, del más reciente al más antiguo.
 *
 * @param {string} contenedorId
 * @returns {Promise<object[]>}
 */
async function listarPorContenedor(contenedorId) {
  return Informe.find({ contenedorId }).sort({ generadoEn: -1 }).lean()
}

/**
 * Devuelve un informe por su ID con los datos del ciclo populados.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
async function obtenerPorId(id) {
  const informe = await Informe.findById(id).populate('cicloId').lean()
  if (!informe) {
    const err = new Error('Informe no encontrado')
    err.status = 404
    throw err
  }
  return informe
}

module.exports = { generar, listar, listarPorContenedor, obtenerPorId }
