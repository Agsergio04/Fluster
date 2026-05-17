const { Router } = require('express')
const authController = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddleware')
const verificarRol = require('../middlewares/rolMiddleware')

const router = Router()

router.post('/registro', authController.registrar)
router.post('/login', authController.login)

module.exports = router
