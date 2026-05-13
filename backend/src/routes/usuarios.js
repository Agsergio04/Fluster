const { Router } = require('express')
const usuarioController = require('../controllers/usuarioController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol = require('../middlewares/rolMiddleware')

const router = Router()

router.use(authMiddleware)

// Gestión de usuarios — solo admin (página gestorDeUsuarios)
router.get('/',    verificarRol('admin'), usuarioController.listar)
router.get('/:id', verificarRol('admin'), usuarioController.obtener)
router.put('/:id', verificarRol('admin'), usuarioController.actualizar)
router.delete('/:id', verificarRol('admin'), usuarioController.eliminar)

// Cambio de credenciales propias — cualquier rol (página perfil)
router.patch('/:id/nombre',    usuarioController.cambiarNombre)
router.patch('/:id/contrasena', usuarioController.cambiarContrasena)
router.patch('/:id/foto',      usuarioController.actualizarFoto)

module.exports = router
