/**
 * Middleware de autorización por rol
 * Debe usarse siempre después de authMiddleware, que es quien rellena req.usuario.
 */

/**
 * Devuelve un middleware que verifica que el usuario autenticado tiene
 * alguno de los roles indicados. Si no, responde con 403.
 *
 * Uso en rutas:
 *   router.delete('/:id', authMiddleware, verificarRol('admin'), controller.eliminar)
 *   router.get('/', authMiddleware, verificarRol('admin', 'gestor'), controller.listar)
 *
 * @param {...string} rolesPermitidos
 */
function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción' })
    }
    next()
  }
}

module.exports = verificarRol
