const { Router } = require('express')
const authController = require('../controllers/authController')
const { authLimiter } = require('../middlewares/rateLimit')

const router = Router()

// Límite estricto: frena la fuerza bruta de contraseñas y el abuso del registro.
router.post('/registro', authLimiter, authController.registrar)
router.post('/login', authLimiter, authController.login)

module.exports = router
