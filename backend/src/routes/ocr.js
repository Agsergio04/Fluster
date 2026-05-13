const { Router } = require('express')
const ocrController = require('../controllers/ocrController')
const authMiddleware = require('../middlewares/authMiddleware')

const router = Router()

router.use(authMiddleware)
router.post('/extraer-bic', ocrController.extraerBic)

module.exports = router
