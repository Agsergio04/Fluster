const cicloService = require('../services/cicloService')

async function listarPorContenedor(req, res, next) {
  try {
    const ciclos = await cicloService.listarPorContenedor(req.params.contenedorId)
    res.json(ciclos)
  } catch (err) {
    next(err)
  }
}

async function listarPorCliente(req, res, next) {
  try {
    const ciclos = await cicloService.listarPorCliente(req.params.clienteId)
    res.json(ciclos)
  } catch (err) {
    next(err)
  }
}

async function obtener(req, res, next) {
  try {
    const ciclo = await cicloService.obtenerPorId(req.params.id)
    res.json(ciclo)
  } catch (err) {
    next(err)
  }
}

module.exports = { listarPorContenedor, listarPorCliente, obtener }
