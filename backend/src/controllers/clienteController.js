const clienteService = require('../services/clienteService')

async function crear(req, res, next) {
  try {
    const cliente = await clienteService.crear(req.body)
    res.status(201).json(cliente)
  } catch (err) {
    next(err)
  }
}

async function listar(req, res, next) {
  try {
    const clientes = await clienteService.listar()
    res.json(clientes)
  } catch (err) {
    next(err)
  }
}

async function obtener(req, res, next) {
  try {
    const cliente = await clienteService.obtenerPorId(req.params.id)
    res.json(cliente)
  } catch (err) {
    next(err)
  }
}

async function actualizar(req, res, next) {
  try {
    const actualizado = await clienteService.actualizar(req.params.id, req.body)
    res.json(actualizado)
  } catch (err) {
    next(err)
  }
}

async function eliminar(req, res, next) {
  try {
    await clienteService.eliminar(req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

module.exports = { crear, listar, obtener, actualizar, eliminar }
