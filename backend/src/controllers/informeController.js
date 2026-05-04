const informeService = require('../services/informeService')

async function generar(req, res, next) {
  try {
    // El generador se toma del token, no del body
    const informe = await informeService.generar({ ...req.body, generadoPor: req.usuario.id })
    res.status(201).json(informe)
  } catch (err) {
    next(err)
  }
}

async function listar(req, res, next) {
  try {
    const informes = await informeService.listar(req.query)
    res.json(informes)
  } catch (err) {
    next(err)
  }
}

async function listarPorContenedor(req, res, next) {
  try {
    const informes = await informeService.listarPorContenedor(req.params.contenedorId)
    res.json(informes)
  } catch (err) {
    next(err)
  }
}

async function obtener(req, res, next) {
  try {
    const informe = await informeService.obtenerPorId(req.params.id)
    res.json(informe)
  } catch (err) {
    next(err)
  }
}

module.exports = { generar, listar, listarPorContenedor, obtener }
