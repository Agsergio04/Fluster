/**
 * Servicio de informes
 * Generación y consulta de los informes PDF de ciclos cerrados.
 * La generación real del PDF se añadirá cuando se integre la librería correspondiente;
 * por ahora el servicio crea el registro en base de datos con una URL provisional.
 */

const Informe = require('../models/Informe')
const Contenedor = require('../models/Contenedor')
const Ciclo = require('../models/Ciclo')

/**
 * Genera el informe de un ciclo cerrado.
 * Verifica que el ciclo esté cerrado antes de crear el registro, ya que un informe
 * sobre un ciclo abierto tendría costes parciales y sería engañoso.
 * Los campos codigoBIC y cliente se guardan como snapshot para que el informe
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
    const err = new Error('No se puede generar un informe de un ciclo que aún no está cerrado')
    err.status = 422
    throw err
  }

  // TODO: generar el PDF con los datos del ciclo y subirlo al almacenamiento
  const urlPdf = `/informes/${contenedorId}/${cicloId}.pdf`

  return Informe.create({
    contenedorId,
    cicloId,
    codigoBIC: contenedor.codigoBIC,
    cliente: ciclo.clienteId.nombre,
    urlPdf,
    generadoPor,
  })
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

module.exports = { generar, listarPorContenedor, obtenerPorId }
