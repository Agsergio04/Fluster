require('dotenv').config()
const app = require('./app')
const conectarDB = require('./config/db')

const PORT = process.env.PORT || 3000

conectarDB()

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`)

  const selfUrl = process.env.RENDER_EXTERNAL_URL
  if (selfUrl) {
    setInterval(() => {
      fetch(`${selfUrl}/health`).catch(() => {})
    }, 5 * 60 * 1000)
  }
})
