const { Router } = require('express')
const semaforoController = require('../controllers/semaforoController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol = require('../middlewares/rolMiddleware')

const router = Router()

router.get('/', authMiddleware, verificarRol('admin', 'gestor', 'operador'), semaforoController.obtenerAgrupados)

module.exports = router
