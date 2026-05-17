const navieraService = require('../services/navieraService')

async function crear(req, res, next) {
  try {
    const naviera = await navieraService.crear(req.body)
    res.status(201).json(naviera)
  } catch (err) {
    next(err)
  }
}

async function listar(req, res, next) {
  try {
    const navieras = await navieraService.listar()
    res.json(navieras)
  } catch (err) {
    next(err)
  }
}

async function obtener(req, res, next) {
  try {
    const naviera = await navieraService.obtenerPorId(req.params.id)
    res.json(naviera)
  } catch (err) {
    next(err)
  }
}

async function actualizar(req, res, next) {
  try {
    const actualizada = await navieraService.actualizar(req.params.id, req.body)
    res.json(actualizada)
  } catch (err) {
    next(err)
  }
}

async function eliminar(req, res, next) {
  try {
    await navieraService.eliminar(req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

module.exports = { crear, listar, obtener, actualizar, eliminar }
