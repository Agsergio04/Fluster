const { Router } = require('express')
const navieraController = require('../controllers/navieraController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol = require('../middlewares/rolMiddleware')

const router = Router()

router.use(authMiddleware)

router.get('/',    verificarRol('admin', 'gestor', 'operador'), navieraController.listar)
router.get('/:id', verificarRol('admin', 'gestor', 'operador'), navieraController.obtener)
router.post('/',   verificarRol('admin'),                       navieraController.crear)
router.put('/:id', verificarRol('admin'),                       navieraController.actualizar)
router.delete('/:id', verificarRol('admin'),                    navieraController.eliminar)

module.exports = router
