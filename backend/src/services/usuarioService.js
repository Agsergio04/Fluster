/**
 * Servicio de usuarios
 * Gestión ordinaria de usuarios: consulta, edición y eliminación.
 * El registro y el login están en authService.
 */

const bcrypt = require('bcrypt')
const Usuario = require('../models/Usuario')

const SALT_ROUNDS = 10

/**
 * Devuelve todos los usuarios del sistema sin sus contraseñas.
 *
 * @returns {Promise<object[]>}
 */
async function listar() {
  return Usuario.find().select('-contrasena').lean()
}

/**
 * Devuelve un usuario concreto por su ID sin su contraseña.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
async function obtenerPorId(id) {
  const usuario = await Usuario.findById(id).select('-contrasena').lean()
  if (!usuario) {
    const err = new Error('Usuario no encontrado')
    err.status = 404
    throw err
  }
  return usuario
}

/**
 * Actualiza el nombre, correo o rol de un usuario.
 * El cambio de contraseña tiene su propia función para obligar a verificar la actual.
 * Impide quitar el rol de admin al último administrador del sistema, igual que
 * se impide borrarlo, para garantizar que siempre existe al menos uno.
 *
 * @param {string} id
 * @param {{ nombre?: string, correo?: string, rol?: string }} cambios
 * @returns {Promise<object>} Usuario actualizado sin contraseña
 */
async function actualizar(id, cambios) {
  const usuario = await Usuario.findById(id)
  if (!usuario) {
    const err = new Error('Usuario no encontrado')
    err.status = 404
    throw err
  }

  if (cambios.correo) {
    const duplicado = await Usuario.findOne({ correo: cambios.correo, _id: { $ne: id } })
    if (duplicado) {
      const err = new Error('Ya existe un usuario con ese correo')
      err.status = 409
      throw err
    }
  }

  // Proteger al último admin: no se puede cambiar su rol
  if (cambios.rol && cambios.rol !== 'admin' && usuario.rol === 'admin') {
    const totalAdmins = await Usuario.countDocuments({ rol: 'admin' })
    if (totalAdmins === 1) {
      const err = new Error('No se puede cambiar el rol del único administrador del sistema')
      err.status = 409
      throw err
    }
  }

  // contrasena nunca se actualiza por esta vía aunque venga en el body
  delete cambios.contrasena

  const actualizado = await Usuario
    .findByIdAndUpdate(id, cambios, { new: true, runValidators: true })
    .select('-contrasena')
    .lean()

  return actualizado
}

/**
 * Cambia la contraseña verificando primero la contraseña actual.
 * Exigir la contraseña actual evita que una sesión robada pueda
 * cambiar credenciales sin más.
 *
 * @param {string} id
 * @param {string} contrasenaActual
 * @param {string} contrasenaNueva
 * @returns {Promise<void>}
 */
async function cambiarContrasena(id, contrasenaActual, contrasenaNueva) {
  const usuario = await Usuario.findById(id)
  if (!usuario) {
    const err = new Error('Usuario no encontrado')
    err.status = 404
    throw err
  }

  const coincide = await bcrypt.compare(contrasenaActual, usuario.contrasena)
  if (!coincide) {
    const err = new Error('La contraseña actual no es correcta')
    err.status = 401
    throw err
  }

  const hash = await bcrypt.hash(contrasenaNueva, SALT_ROUNDS)
  await Usuario.findByIdAndUpdate(id, { contrasena: hash })
}

/**
 * Elimina un usuario del sistema.
 * Impide borrar al último administrador porque el sistema quedaría sin nadie
 * con permisos para gestionar roles.
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
async function eliminar(id) {
  const usuario = await Usuario.findById(id)
  if (!usuario) {
    const err = new Error('Usuario no encontrado')
    err.status = 404
    throw err
  }

  if (usuario.rol === 'admin') {
    const totalAdmins = await Usuario.countDocuments({ rol: 'admin' })
    if (totalAdmins === 1) {
      const err = new Error('No se puede eliminar el único administrador del sistema')
      err.status = 409
      throw err
    }
  }

  await usuario.deleteOne()
}

module.exports = { listar, obtenerPorId, actualizar, cambiarContrasena, eliminar }
