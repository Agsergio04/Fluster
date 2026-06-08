/**
 * Servicio de usuarios
 * Gestión ordinaria de usuarios: consulta, edición y eliminación.
 * El registro y el login están en authService.
 */

const bcrypt = require('bcrypt')
const Usuario = require('../models/Usuario')
const Contenedor = require('../models/Contenedor')
const Evento = require('../models/Evento')
const Informe = require('../models/Informe')

const SALT_ROUNDS = 10

/**
 * Devuelve usuarios del sistema sin contraseñas.
 * Admite búsqueda por nombre/correo, filtro por rol y paginación opcional.
 * Sin page/limit devuelve todos (compatibilidad con el panel de control actual).
 *
 * @param {{ busqueda?: string, rol?: string, page?: number, limit?: number }} filtros
 * @returns {Promise<object[]|{ data: object[], total: number, page: number, limit: number, totalPages: number }>}
 */
async function listar(filtros = {}) {
  const query = {}
  if (filtros.busqueda) {
    const re = { $regex: filtros.busqueda, $options: 'i' }
    query.$or = [{ nombre: re }, { correo: re }]
  }
  if (filtros.rol) query.rol = filtros.rol

  if (filtros.page !== undefined || filtros.limit !== undefined) {
    const page  = Math.max(1, parseInt(filtros.page)  || 1)
    const limit = Math.min(100, Math.max(1, parseInt(filtros.limit) || 20))
    const [total, data] = await Promise.all([
      Usuario.countDocuments(query),
      Usuario.find(query).select('-contrasena').sort({ creadoEn: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  return Usuario.find(query).select('-contrasena').lean()
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

  const coincide = await bcrypt.compare(String(contrasenaActual ?? ''), usuario.contrasena)
  if (!coincide) {
    // 422 (no 401): el usuario SÍ tiene sesión válida; un 401 dispararía el
    // cierre de sesión global del interceptor del frontend al equivocarse de
    // contraseña actual. Es un error de validación, no de autenticación.
    const err = new Error('La contraseña actual no es correcta')
    err.status = 422
    throw err
  }

  const hash = await bcrypt.hash(contrasenaNueva, SALT_ROUNDS)
  await Usuario.findByIdAndUpdate(id, { contrasena: hash })
}

/**
 * Elimina un usuario del sistema.
 * Impide borrar al último administrador porque el sistema quedaría sin nadie
 * con permisos para gestionar roles.
 * Aplica restrict: no se borra un usuario con datos asociados (contenedores
 * creados, eventos registrados o informes generados), para no dejar
 * referencias colgando en esas colecciones.
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

  // Restrict: bloquea el borrado si el usuario tiene datos asociados, evitando
  // referencias huérfanas en creadoPor / registradoPor / generadoPor.
  const enUso =
    (await Contenedor.exists({ creadoPor: id })) ||
    (await Evento.exists({ registradoPor: id })) ||
    (await Informe.exists({ generadoPor: id }))
  if (enUso) {
    const err = new Error('No se puede eliminar un usuario con contenedores, eventos o informes asociados')
    err.status = 409
    throw err
  }

  await usuario.deleteOne()
}

async function actualizarFoto(id, foto) {
  const actualizado = await Usuario
    .findByIdAndUpdate(id, { foto }, { new: true })
    .select('-contrasena')
    .lean()
  if (!actualizado) {
    const err = new Error('Usuario no encontrado')
    err.status = 404
    throw err
  }
  return actualizado
}

module.exports = { listar, obtenerPorId, actualizar, cambiarContrasena, eliminar, actualizarFoto }
