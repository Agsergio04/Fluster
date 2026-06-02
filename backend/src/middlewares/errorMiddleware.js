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
  // Errores de validación de Mongoose (enum, required, formato...) son siempre
  // datos incorrectos del cliente, no fallos del servidor → 400 en vez de 500.
  if (err.name === 'ValidationError') {
    const campo = Object.keys(err.errors ?? {})[0]
    const body = { mensaje: `Valor no válido para el campo '${campo}'` }
    if (campo) body.campo = campo
    return res.status(400).json(body)
  }

  const status = err.status || 500

  if (status === 500 && process.env.NODE_ENV === 'production') {
    return res.status(500).json({ mensaje: 'Error interno del servidor' })
  }

  const body = { mensaje: err.message || 'Error interno del servidor' }
  if (err.campo) body.campo = err.campo
  res.status(status).json(body)
}

module.exports = errorMiddleware
