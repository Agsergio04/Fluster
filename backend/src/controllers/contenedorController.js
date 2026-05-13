const contenedorService = require('../services/contenedorService')

async function crear(req, res, next) {
  try {
    // El creador se toma del token, no del body
    const contenedor = await contenedorService.crear({ ...req.body, creadoPor: req.usuario.id })
    res.status(201).json(contenedor)
  } catch (err) {
    next(err)
  }
}

async function listar(req, res, next) {
  try {
    const contenedores = await contenedorService.listar(req.query)
    res.json(contenedores)
  } catch (err) {
    next(err)
  }
}

async function obtener(req, res, next) {
  try {
    const contenedor = await contenedorService.obtenerPorId(req.params.id)
    res.json(contenedor)
  } catch (err) {
    next(err)
  }
}

async function actualizar(req, res, next) {
  try {
    const actualizado = await contenedorService.actualizar(req.params.id, req.body)
    res.json(actualizado)
  } catch (err) {
    next(err)
  }
}

async function entradaPuerto(req, res, next) {
  try {
    const { fecha, clienteId } = req.body
    const contenedor = await contenedorService.registrarEntradaPuerto(req.params.id, fecha, clienteId)
    res.json(contenedor)
  } catch (err) {
    next(err)
  }
}

async function salidaPuerto(req, res, next) {
  try {
    const contenedor = await contenedorService.registrarSalidaPuerto(req.params.id, req.body.fecha)
    res.json(contenedor)
  } catch (err) {
    next(err)
  }
}

async function devolucion(req, res, next) {
  try {
    const contenedor = await contenedorService.registrarDevolucion(req.params.id, req.body.fecha)
    res.json(contenedor)
  } catch (err) {
    next(err)
  }
}

async function cancelarCiclo(req, res, next) {
  try {
    const contenedor = await contenedorService.cancelarCiclo(req.params.id)
    res.json(contenedor)
  } catch (err) {
    next(err)
  }
}

async function editarContenedor(req, res, next) {
  try {
    const { foto, fechaInicioLibre } = req.body
    const cambios = {}
    if (foto !== undefined)           cambios.foto            = foto
    if (fechaInicioLibre !== undefined) cambios.fechaInicioLibre = fechaInicioLibre
    const actualizado = await contenedorService.actualizar(req.params.id, cambios)
    res.json(actualizado)
  } catch (err) {
    next(err)
  }
}

module.exports = { crear, listar, obtener, actualizar, editarContenedor, entradaPuerto, salidaPuerto, devolucion, cancelarCiclo }
