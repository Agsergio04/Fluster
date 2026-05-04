const { Router } = require('express')
const authController = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol = require('../middlewares/rolMiddleware')

const router = Router()

// El registro lo hace solo el admin; así controla quién tiene acceso al sistema
router.post('/registro', authMiddleware, verificarRol('admin'), authController.registrar)
router.post('/login', authController.login)

module.exports = router
