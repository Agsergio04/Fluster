const usuarioService = require('../services/usuarioService')

async function listar(req, res, next) {
  try {
    const usuarios = await usuarioService.listar(req.query)
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

async function cambiarNombre(req, res, next) {
  try {
    if (req.usuario.id !== req.params.id) {
      return res.status(403).json({ mensaje: 'Solo puedes cambiar tu propio nombre' })
    }
    const { nombre } = req.body
    if (!nombre?.trim()) {
      return res.status(400).json({ mensaje: 'El nombre no puede estar vacío' })
    }
    const actualizado = await usuarioService.actualizar(req.params.id, { nombre: nombre.trim() })
    res.json(actualizado)
  } catch (err) {
    next(err)
  }
}

async function cambiarContrasena(req, res, next) {
  try {
    // Cada usuario solo puede cambiar su propia contraseña
    if (req.usuario.id !== req.params.id) {
      return res.status(403).json({ mensaje: 'Solo puedes cambiar tu propia contraseña' })
    }
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

async function actualizarFoto(req, res, next) {
  try {
    if (req.usuario.id !== req.params.id) {
      return res.status(403).json({ mensaje: 'Solo puedes actualizar tu propia foto' })
    }
    const actualizado = await usuarioService.actualizarFoto(req.params.id, req.body.foto)
    res.json(actualizado)
  } catch (err) {
    next(err)
  }
}

module.exports = { listar, obtener, actualizar, cambiarNombre, cambiarContrasena, eliminar, actualizarFoto }
