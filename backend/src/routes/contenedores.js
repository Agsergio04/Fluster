const { Router } = require('express')
const contenedorController = require('../controllers/contenedorController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol = require('../middlewares/rolMiddleware')

const router = Router()

router.use(authMiddleware)

// Lectura — operador y gestor (páginas Contenedores y Almacén)
router.get('/',    verificarRol('operador', 'gestor'), contenedorController.listar)
router.get('/:id', verificarRol('operador', 'gestor'), contenedorController.obtener)

// Alta de contenedor — solo operador (página meterContenedor)
router.post('/', verificarRol('operador'), contenedorController.crear)

// Edición de datos — solo gestor (página almacén)
router.put('/:id', verificarRol('gestor'), contenedorController.actualizar)

// Borrado — solo operador (página contenedores), solo si está INACTIVO
router.delete('/:id', verificarRol('operador'), contenedorController.eliminar)

// Edición de foto y fecha de inclusión — operador (página contenedores)
router.patch('/:id/editar', verificarRol('operador'), contenedorController.editarContenedor)

// Transiciones de estado — solo gestor (página semáforo)
router.patch('/:id/entrada-puerto', verificarRol('gestor'), contenedorController.entradaPuerto)
router.patch('/:id/salida-puerto',  verificarRol('gestor'), contenedorController.salidaPuerto)
router.patch('/:id/devolucion',     verificarRol('gestor'), contenedorController.devolucion)
router.patch('/:id/cancelar-ciclo', verificarRol('gestor'), contenedorController.cancelarCiclo)

module.exports = router
