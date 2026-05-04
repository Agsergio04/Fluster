const semaforoService = require('../services/semaforoService')

async function obtenerAgrupados(req, res, next) {
  try {
    const grupos = await semaforoService.obtenerAgrupados()
    res.json(grupos)
  } catch (err) {
    next(err)
  }
}

module.exports = { obtenerAgrupados }
