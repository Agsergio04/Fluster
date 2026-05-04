require('dotenv').config()
const express = require('express')
const cors = require('cors')
const conectarDB = require('./config/db')
const errorMiddleware = require('./middlewares/errorMiddleware')

const app = express()
const PORT = process.env.PORT || 3000

conectarDB()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

// Las rutas se registrarán aquí

// Debe ir al final, después de todas las rutas
app.use(errorMiddleware)

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`))
