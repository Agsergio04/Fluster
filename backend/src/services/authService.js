/**
 * Servicio de autenticación
 * Gestiona el registro de nuevos usuarios y el inicio de sesión.
 * La generación y verificación de tokens JWT vive aquí, separada
 * de la gestión ordinaria de usuarios.
 */

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Usuario = require('../models/Usuario')

const SALT_ROUNDS = 10

/**
 * Registra un nuevo usuario en el sistema.
 * La contraseña se almacena siempre hasheada, nunca en texto plano.
 *
 * @param {{ nombre: string, correo: string, contrasena: string, rol: string }} datos
 * @returns {Promise<object>} Usuario creado sin el campo contrasena
 */
async function registrar({ nombre, correo, contrasena, rol }) {
  const yaExiste = await Usuario.findOne({ correo })
  if (yaExiste) {
    const err = new Error('Ya existe un usuario con ese correo')
    err.status = 409
    throw err
  }

  const hash = await bcrypt.hash(contrasena, SALT_ROUNDS)
  const nuevo = await Usuario.create({ nombre, correo, contrasena: hash, rol })

  const obj = nuevo.toObject()
  delete obj.contrasena
  return obj
}

/**
 * Autentica un usuario y devuelve un token JWT de sesión.
 * El token lleva id, correo y rol para que los middlewares de autorización
 * no tengan que consultar la base de datos en cada petición.
 *
 * El token no tiene expiración por tiempo; el frontend lo almacena en
 * sessionStorage para que desaparezca al cerrar el navegador.
 *
 * @param {string} correo
 * @param {string} contrasena
 * @returns {Promise<{ token: string, usuario: object }>}
 */
async function login(correo, contrasena) {
  const usuario = await Usuario.findOne({ correo })

  // Mismo mensaje tanto si no existe el correo como si la contraseña falla;
  // así no se revela qué campo es incorrecto
  if (!usuario) {
    const err = new Error('Credenciales incorrectas')
    err.status = 401
    throw err
  }

  const coincide = await bcrypt.compare(contrasena, usuario.contrasena)
  if (!coincide) {
    const err = new Error('Credenciales incorrectas')
    err.status = 401
    throw err
  }

  const payload = { id: usuario._id, correo: usuario.correo, rol: usuario.rol }
  const token = jwt.sign(payload, process.env.JWT_SECRET)

  return {
    token,
    usuario: {
      id: usuario._id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    },
  }
}

module.exports = { registrar, login }
