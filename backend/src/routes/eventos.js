const { Router } = require('express')
const eventoController = require('../controllers/eventoController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol = require('../middlewares/rolMiddleware')

const router = Router()

router.use(authMiddleware)

router.post('/',                          verificarRol('admin', 'gestor', 'operador'), eventoController.registrar)
router.get('/contenedor/:contenedorId',   verificarRol('admin', 'gestor', 'operador'), eventoController.listarPorContenedor)

module.exports = router
