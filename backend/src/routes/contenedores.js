const { Router } = require('express')
const contenedorController = require('../controllers/contenedorController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol = require('../middlewares/rolMiddleware')

const router = Router()

router.use(authMiddleware)

router.get('/',    verificarRol('admin', 'gestor', 'operador'), contenedorController.listar)
router.get('/:id', verificarRol('admin', 'gestor', 'operador'), contenedorController.obtener)
router.post('/',   verificarRol('admin', 'gestor', 'operador'), contenedorController.crear)
router.put('/:id', verificarRol('admin', 'gestor'),             contenedorController.actualizar)

// Transiciones de estado; solo el gestor y el admin operan el semáforo
router.patch('/:id/entrada-puerto',  verificarRol('admin', 'gestor'), contenedorController.entradaPuerto)
router.patch('/:id/salida-puerto',   verificarRol('admin', 'gestor'), contenedorController.salidaPuerto)
router.patch('/:id/devolucion',      verificarRol('admin', 'gestor'), contenedorController.devolucion)
router.patch('/:id/cancelar-ciclo',  verificarRol('admin', 'gestor'), contenedorController.cancelarCiclo)

module.exports = router
