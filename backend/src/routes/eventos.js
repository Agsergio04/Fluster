const { Router } = require('express')
const eventoController = require('../controllers/eventoController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol = require('../middlewares/rolMiddleware')

const router = Router()

router.use(authMiddleware)

// Registro de evento — solo operador (página meterContenedor)
router.post('/', verificarRol('operador'), eventoController.registrar)

// Consulta — operador y gestor
router.get('/contenedor/:contenedorId', verificarRol('operador', 'gestor'), eventoController.listarPorContenedor)

module.exports = router
