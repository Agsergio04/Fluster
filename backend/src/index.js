require('dotenv').config()
const express = require('express')
const cors = require('cors')
const conectarDB = require('./config/db')

const app = express()
const PORT = process.env.PORT || 3000

conectarDB()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`))
