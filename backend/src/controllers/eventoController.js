const eventoService = require('../services/eventoService')

async function registrar(req, res, next) {
  try {
    // El registrador se toma del token, no del body
    const evento = await eventoService.registrar({ ...req.body, registradoPor: req.usuario.id })
    res.status(201).json(evento)
  } catch (err) {
    next(err)
  }
}

async function listarPorContenedor(req, res, next) {
  try {
    const eventos = await eventoService.listarPorContenedor(req.params.contenedorId)
    res.json(eventos)
  } catch (err) {
    next(err)
  }
}

module.exports = { registrar, listarPorContenedor }
