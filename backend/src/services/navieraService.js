/**
 * Servicio de navieras
 * CRUD sobre navieras con sus días libres y tramos de tarifa D&D.
 */

const Naviera = require('../models/Naviera')
const Contenedor = require('../models/Contenedor')

/**
 * Crea una nueva naviera con sus tramos de demurrage y detention.
 *
 * @param {object} datos
 * @returns {Promise<object>}
 */
async function crear(datos) {
  return Naviera.create(datos)
}

/**
 * Devuelve todas las navieras.
 *
 * @returns {Promise<object[]>}
 */
async function listar() {
  await recrearNavierasHuerfanas()
  return Naviera.find().lean()
}

/**
 * Devuelve una naviera por su ID.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
async function obtenerPorId(id) {
  const naviera = await Naviera.findById(id).lean()
  if (!naviera) {
    const err = new Error('Naviera no encontrada')
    err.status = 404
    throw err
  }
  return naviera
}

/**
 * Actualiza los datos de una naviera.
 * Si se cambia el código verifica que no haya otra naviera con ese código.
 *
 * @param {string} id
 * @param {object} cambios
 * @returns {Promise<object>}
 */
async function actualizar(id, cambios) {
  if (cambios.codigo) {
    const duplicado = await Naviera.findOne({
      codigo: cambios.codigo.toUpperCase(),
      _id: { $ne: id },
    })
    if (duplicado) {
      const err = new Error('Ya existe una naviera con ese código')
      err.status = 409
      throw err
    }
  }

  const actualizada = await Naviera.findByIdAndUpdate(
    id,
    cambios,
    { new: true, runValidators: true }
  ).lean()

  if (!actualizada) {
    const err = new Error('Naviera no encontrada')
    err.status = 404
    throw err
  }

  return actualizada
}

/**
 * Elimina una naviera aunque tenga contenedores asociados.
 * Al volver a listar navieras, recrearNavierasHuerfanas() detectará los
 * contenedores huérfanos y recreará una naviera por defecto para cada uno.
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
async function eliminar(id) {
  const naviera = await Naviera.findById(id)
  if (!naviera) {
    const err = new Error('Naviera no encontrada')
    err.status = 404
    throw err
  }

  await naviera.deleteOne()
}

/**
 * Detecta contenedores cuya navieraId apunta a una naviera eliminada y crea
 * una naviera de sustitución usando el prefijo de 4 letras del código BIC.
 * Actualiza todos los contenedores afectados para que apunten a la nueva naviera.
 *
 * @returns {Promise<void>}
 */
async function recrearNavierasHuerfanas() {
  const contenedores = await Contenedor.find({}, 'codigoBIC navieraId').lean()
  if (!contenedores.length) return

  const idsReferenciados = [...new Set(contenedores.map(c => String(c.navieraId)))]
  const existentes = await Naviera.find({ _id: { $in: idsReferenciados } }, '_id').lean()
  const idsExistentes = new Set(existentes.map(n => String(n._id)))

  const huerfanos = contenedores.filter(c => !idsExistentes.has(String(c.navieraId)))
  if (!huerfanos.length) return

  const navierasPorCodigo = {}
  for (const c of huerfanos) {
    const codigo = (c.codigoBIC ?? '').slice(0, 4).toUpperCase() || 'UNKN'
    if (!navierasPorCodigo[codigo]) {
      const existente = await Naviera.findOne({ codigo })
      navierasPorCodigo[codigo] = existente ?? await Naviera.create({
        nombre: codigo,
        codigo,
        diasLibresDemurrage: 0,
        diasLibresDetention: 0,
        diasDemurrage: [
          { desdeDia: 1, hastaDia: 5,    precioPorDia: 0 },
          { desdeDia: 6, hastaDia: null, precioPorDia: 0 },
        ],
        diasDetention: [
          { desdeDia: 1, hastaDia: 5,    precioPorDia: 0 },
          { desdeDia: 6, hastaDia: null, precioPorDia: 0 },
        ],
      })
    }
    await Contenedor.updateMany(
      { navieraId: c.navieraId },
      { $set: { navieraId: navierasPorCodigo[codigo]._id } }
    )
  }
}

module.exports = { crear, listar, obtenerPorId, actualizar, eliminar, recrearNavierasHuerfanas }
