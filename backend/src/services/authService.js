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

// Validación de formato de email: algo@algo.algo, sin espacios y sin puntos
// consecutivos (el lookahead (?!.*\.\.) rechaza ".." en cualquier parte).
// Misma expresión que usa el formulario de registro del frontend.
const CORREO_REGEX = /^(?!.*\.\.)[^\s@]+@[^\s@]+\.[^\s@]+$/

// Roles permitidos en el registro público. 'admin' queda excluido a propósito:
// solo se crea con el script de administración (crearAdmin.js). Así se impide
// que un usuario no autenticado se auto-asigne privilegios de administrador.
const ROLES_REGISTRO_PUBLICO = ['gestor', 'operador']

/**
 * Registra un nuevo usuario en el sistema.
 * La contraseña se almacena siempre hasheada, nunca en texto plano.
 *
 * @param {{ nombre: string, correo: string, contrasena: string, rol: string }} datos
 * @returns {Promise<object>} Usuario creado sin el campo contrasena
 */
async function registrar({ nombre, correo, contrasena, rol }) {
  if (!CORREO_REGEX.test((correo ?? '').trim())) {
    const err = new Error('El correo no tiene un formato válido')
    err.status = 400
    err.campo = 'correo'
    throw err
  }

  // El registro público no puede crear administradores (evita escalada de privilegios).
  if (!ROLES_REGISTRO_PUBLICO.includes(rol)) {
    const err = new Error('Rol no permitido en el registro')
    err.status = 403
    err.campo = 'rol'
    throw err
  }

  if (typeof contrasena !== 'string' || contrasena.length < 8) {
    const err = new Error('La contraseña debe tener al menos 8 caracteres')
    err.status = 400
    err.campo = 'contrasena'
    throw err
  }

  if (!/[0-9]/.test(contrasena)) {
    const err = new Error('La contraseña debe incluir al menos un número')
    err.status = 400
    err.campo = 'contrasena'
    throw err
  }

  const yaExiste = await Usuario.findOne({ correo: String(correo).trim() })
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
 * El token caduca a los 7 días (expiresIn); el frontend lo guarda en localStorage
 * y la sesión se cierra al hacer logout o al expirar.
 *
 * @param {string} correo
 * @param {string} contrasena
 * @returns {Promise<{ token: string, usuario: object }>}
 */
async function login(correo, contrasena) {
  // Coerción a string: req.body podría traer objetos ({$ne:null}, …) e inyectar
  // operadores NoSQL en la consulta.
  const usuario = await Usuario.findOne({ correo: String(correo ?? '').trim() })

  if (!usuario) {
    const err = new Error('El correo no está registrado')
    err.status = 401
    err.campo = 'correo'
    throw err
  }

  const coincide = await bcrypt.compare(String(contrasena ?? ''), usuario.contrasena)
  if (!coincide) {
    const err = new Error('Contraseña incorrecta')
    err.status = 401
    err.campo = 'contrasena'
    throw err
  }

  const payload = { id: usuario._id, correo: usuario.correo, rol: usuario.rol }
  // Algoritmo fijado a HS256 (coherente con la verificación del authMiddleware):
  // solo se aceptan tokens HMAC, lo que evita ataques de confusión de algoritmo.
  // Caduca a los 7 días para limitar la ventana de un token filtrado.
  const token = jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' })

  return {
    token,
    usuario: {
      id: usuario._id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      foto: usuario.foto ?? null,
    },
  }
}

module.exports = { registrar, login }
