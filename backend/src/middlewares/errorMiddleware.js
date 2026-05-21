/**
 * Middleware de gestión centralizada de errores
 * Debe registrarse en index.js después de todas las rutas.
 * Los servicios lanzan errores con err.status; si no existe se asume 500.
 */

/**
 * Captura cualquier error que llegue a través de next(err) y devuelve
 * una respuesta JSON uniforme. En producción oculta el mensaje interno
 * de los errores 500 para no exponer detalles del servidor.
 */
function errorMiddleware(err, req, res, next) {
  const status = err.status || 500

  if (status === 500 && process.env.NODE_ENV === 'production') {
    return res.status(500).json({ mensaje: 'Error interno del servidor' })
  }

  const body = { mensaje: err.message || 'Error interno del servidor' }
  if (err.campo) body.campo = err.campo
  res.status(status).json(body)
}

module.exports = errorMiddleware
