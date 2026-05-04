/**
 * Servicio de navieras
 * CRUD sobre navieras con sus días libres y tramos de tarifa D&D.
 * Antes de eliminar verifica que no haya contenedores que la referencien.
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
 * Elimina una naviera.
 * Impide el borrado si algún contenedor la referencia, ya que los ciclos
 * existentes necesitan sus tarifas para recalcular costes.
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

  const enUso = await Contenedor.exists({ navieraId: id })
  if (enUso) {
    const err = new Error('No se puede eliminar una naviera que tiene contenedores asociados')
    err.status = 409
    throw err
  }

  await naviera.deleteOne()
}

module.exports = { crear, listar, obtenerPorId, actualizar, eliminar }
