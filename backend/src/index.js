require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger.json')
const conectarDB = require('./config/db')
const errorMiddleware = require('./middlewares/errorMiddleware')

// 100 peticiones por IP cada 15 minutos para la API general
const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Demasiadas peticiones, inténtalo más tarde' },
})

// 10 intentos por IP cada 15 minutos para login/registro
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Demasiados intentos de autenticación, inténtalo más tarde' },
})

const authRoutes        = require('./routes/auth')
const ocrRoutes         = require('./routes/ocr')
const usuarioRoutes     = require('./routes/usuarios')
const clienteRoutes     = require('./routes/clientes')
const navieraRoutes     = require('./routes/navieras')
const contenedorRoutes  = require('./routes/contenedores')
const eventoRoutes      = require('./routes/eventos')
const informeRoutes     = require('./routes/informes')
const semaforoRoutes    = require('./routes/semaforo')
const cicloRoutes       = require('./routes/ciclos')

const app = express()
const PORT = process.env.PORT || 3000

conectarDB()

app.use(cors())
app.use(express.json({ limit: '20mb' }))
app.use('/api', limiterGeneral)
app.use('/api/auth', limiterAuth)

app.get('/', (_req, res) => res.redirect('/api-docs'))
app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api/auth',         authRoutes)
app.use('/api/ocr',          ocrRoutes)
app.use('/api/usuarios',     usuarioRoutes)
app.use('/api/clientes',     clienteRoutes)
app.use('/api/navieras',     navieraRoutes)
app.use('/api/contenedores', contenedorRoutes)
app.use('/api/eventos',      eventoRoutes)
app.use('/api/informes',     informeRoutes)
app.use('/api/semaforo',     semaforoRoutes)
app.use('/api/ciclos',      cicloRoutes)

// Debe ir al final, después de todas las rutas
app.use(errorMiddleware)

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`)

  const selfUrl = process.env.RENDER_EXTERNAL_URL
  if (selfUrl) {
    setInterval(() => {
      fetch(`${selfUrl}/health`).catch(() => {})
    }, 5 * 60 * 1000)
  }
})
