const { Router } = require('express')
const clienteController = require('../controllers/clienteController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol = require('../middlewares/rolMiddleware')

const router = Router()

router.use(authMiddleware, verificarRol('gestor'))

router.get('/',       clienteController.listar)
router.get('/:id',    clienteController.obtener)
router.post('/',      clienteController.crear)
router.put('/:id',    clienteController.actualizar)
router.delete('/:id', clienteController.eliminar)

module.exports = router
