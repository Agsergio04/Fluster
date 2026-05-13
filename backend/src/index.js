require('dotenv').config()
const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger.json')
const conectarDB = require('./config/db')
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

const app = express()
const PORT = process.env.PORT || 3000

conectarDB()

app.use(cors())
app.use(express.json({ limit: '20mb' }))

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

// Debe ir al final, después de todas las rutas
app.use(errorMiddleware)

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`))
