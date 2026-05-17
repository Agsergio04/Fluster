const { Router } = require('express')
const navieraController = require('../controllers/navieraController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol = require('../middlewares/rolMiddleware')

const router = Router()

router.use(authMiddleware, verificarRol('gestor'))

router.get('/',       navieraController.listar)
router.get('/:id',    navieraController.obtener)
router.post('/',      navieraController.crear)
router.put('/:id',    navieraController.actualizar)
router.delete('/:id', navieraController.eliminar)

module.exports = router
