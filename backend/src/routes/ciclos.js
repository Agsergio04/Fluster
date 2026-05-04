const { Router } = require('express')
const cicloController = require('../controllers/cicloController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol = require('../middlewares/rolMiddleware')

const router = Router()

router.use(authMiddleware, verificarRol('admin', 'gestor'))

// Las rutas específicas van antes que /:id para que Express no las confunda
router.get('/contenedor/:contenedorId', cicloController.listarPorContenedor)
router.get('/cliente/:clienteId',       cicloController.listarPorCliente)
router.get('/:id',                      cicloController.obtener)

module.exports = router
