const { Router } = require('express')
const informeController = require('../controllers/informeController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol = require('../middlewares/rolMiddleware')

const router = Router()

router.use(authMiddleware, verificarRol('gestor'))

router.get('/contenedor/:contenedorId', informeController.listarPorContenedor)
router.get('/',                         informeController.listar)
router.get('/:id',                      informeController.obtener)
router.post('/',                        informeController.generar)

module.exports = router
