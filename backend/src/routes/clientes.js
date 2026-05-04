const { Router } = require('express')
const clienteController = require('../controllers/clienteController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol = require('../middlewares/rolMiddleware')

const router = Router()

router.use(authMiddleware)

router.get('/',    verificarRol('admin', 'gestor', 'operador'), clienteController.listar)
router.get('/:id', verificarRol('admin', 'gestor', 'operador'), clienteController.obtener)
router.post('/',   verificarRol('admin', 'gestor'),             clienteController.crear)
router.put('/:id', verificarRol('admin', 'gestor'),             clienteController.actualizar)
router.delete('/:id', verificarRol('admin'),                    clienteController.eliminar)

module.exports = router
