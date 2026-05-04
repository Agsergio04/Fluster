/**
 * Servicio de clientes
 * CRUD básico sobre la colección de clientes.
 * Antes de eliminar verifica que no haya contenedores asociados.
 */

const Cliente = require('../models/Cliente')
const Ciclo = require('../models/Ciclo')

/**
 * Crea un nuevo cliente.
 *
 * @param {{ nombre: string }} datos
 * @returns {Promise<object>}
 */
async function crear({ nombre }) {
  return Cliente.create({ nombre })
}

/**
 * Devuelve todos los clientes.
 *
 * @returns {Promise<object[]>}
 */
async function listar() {
  return Cliente.find().lean()
}

/**
 * Devuelve un cliente por su ID.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
async function obtenerPorId(id) {
  const cliente = await Cliente.findById(id).lean()
  if (!cliente) {
    const err = new Error('Cliente no encontrado')
    err.status = 404
    throw err
  }
  return cliente
}

/**
 * Actualiza el nombre de un cliente.
 *
 * @param {string} id
 * @param {{ nombre: string }} datos
 * @returns {Promise<object>}
 */
async function actualizar(id, { nombre }) {
  const actualizado = await Cliente.findByIdAndUpdate(
    id,
    { nombre },
    { new: true, runValidators: true }
  ).lean()

  if (!actualizado) {
    const err = new Error('Cliente no encontrado')
    err.status = 404
    throw err
  }

  return actualizado
}

/**
 * Elimina un cliente.
 * Impide el borrado si el cliente tiene contenedores asociados,
 * ya que perderíamos la trazabilidad histórica de esos ciclos.
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
async function eliminar(id) {
  const cliente = await Cliente.findById(id)
  if (!cliente) {
    const err = new Error('Cliente no encontrado')
    err.status = 404
    throw err
  }

  const enUso = await Ciclo.exists({ clienteId: id })
  if (enUso) {
    const err = new Error('No se puede eliminar un cliente que tiene ciclos asociados')
    err.status = 409
    throw err
  }

  await cliente.deleteOne()
}

module.exports = { crear, listar, obtenerPorId, actualizar, eliminar }
