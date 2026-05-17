const { Router } = require('express')
const cicloController = require('../controllers/cicloController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol   = require('../middlewares/rolMiddleware')

const router = Router()

router.use(authMiddleware)

router.patch('/:id/demurrage', verificarRol('gestor'), cicloController.editarDemurrage)
router.patch('/:id/detention', verificarRol('gestor'), cicloController.editarDetention)

module.exports = router
