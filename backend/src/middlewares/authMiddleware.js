/**
 * Middleware de autenticación
 * Verifica el token JWT de cada petición y adjunta el payload a req.usuario.
 * Todas las rutas protegidas deben pasar por aquí antes de llegar al controlador.
 */

const jwt = require('jsonwebtoken')

/**
 * Extrae el token del header Authorization (formato: Bearer <token>),
 * lo verifica y adjunta el payload a req.usuario para que los middlewares
 * y controladores posteriores puedan leer el id, correo y rol del usuario.
 */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Acceso no autorizado: token no proporcionado' })
  }

  const token = header.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = payload
    next()
  } catch {
    return res.status(401).json({ mensaje: 'Acceso no autorizado: token inválido' })
  }
}

module.exports = authMiddleware
