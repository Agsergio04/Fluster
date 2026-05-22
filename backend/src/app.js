const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger.json')
const errorMiddleware = require('./middlewares/errorMiddleware')

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

const app = express()

// Cabeceras HTTP de seguridad. La CSP se desactiva porque este servidor
// sirve Swagger UI (/api-docs), que carga scripts y estilos inline que la
// CSP por defecto bloquearía. El resto de protecciones de Helmet siguen activas.
app.use(helmet({ contentSecurityPolicy: false }))

// CORS restringido al origen del frontend si CORS_ORIGIN está definido
// (producción); sin definir, permite cualquier origen (desarrollo/local).
const corsOptions = process.env.CORS_ORIGIN
  ? { origin: process.env.CORS_ORIGIN.split(',').map(o => o.trim()) }
  : {}
app.use(cors(corsOptions))

app.use(express.json({ limit: '20mb' }))

// El rate limiting se desactiva en test para no interferir con las peticiones
// repetidas de los tests de integración
if (process.env.NODE_ENV !== 'test') {
  app.use('/api', limiterGeneral)
  app.use('/api/auth', limiterAuth)
}

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
app.use('/api/ciclos',       cicloRoutes)

// Debe ir al final, después de todas las rutas
app.use(errorMiddleware)

module.exports = app
