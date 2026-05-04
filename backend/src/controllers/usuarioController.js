const usuarioService = require('../services/usuarioService')

async function listar(req, res, next) {
  try {
    const usuarios = await usuarioService.listar()
    res.json(usuarios)
  } catch (err) {
    next(err)
  }
}

async function obtener(req, res, next) {
  try {
    const usuario = await usuarioService.obtenerPorId(req.params.id)
    res.json(usuario)
  } catch (err) {
    next(err)
  }
}

async function actualizar(req, res, next) {
  try {
    const actualizado = await usuarioService.actualizar(req.params.id, req.body)
    res.json(actualizado)
  } catch (err) {
    next(err)
  }
}

async function cambiarContrasena(req, res, next) {
  try {
    const { contrasenaActual, contrasenaNueva } = req.body
    await usuarioService.cambiarContrasena(req.params.id, contrasenaActual, contrasenaNueva)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

async function eliminar(req, res, next) {
  try {
    await usuarioService.eliminar(req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

module.exports = { listar, obtener, actualizar, cambiarContrasena, eliminar }
