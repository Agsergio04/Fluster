const { Router } = require('express')
const usuarioController = require('../controllers/usuarioController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol = require('../middlewares/rolMiddleware')

const router = Router()

router.use(authMiddleware)

router.get('/',    verificarRol('admin'),              usuarioController.listar)
router.get('/:id', verificarRol('admin'),              usuarioController.obtener)
router.put('/:id', verificarRol('admin'),              usuarioController.actualizar)
router.patch('/:id/contrasena', verificarRol('admin'), usuarioController.cambiarContrasena)
router.delete('/:id', verificarRol('admin'),           usuarioController.eliminar)

module.exports = router
