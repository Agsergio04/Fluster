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
    const filtros = { ...req.query }
    if (req.usuario.rol === 'operador') filtros.creadoPorId = req.usuario.id
    const contenedores = await contenedorService.listar(filtros)
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
    const contenedor = await contenedorService.registrarEntradaPuerto(req.params.id, req.body.clienteId)
    res.json(contenedor)
  } catch (err) {
    next(err)
  }
}

async function salidaPuerto(req, res, next) {
  try {
    const contenedor = await contenedorService.registrarSalidaPuerto(req.params.id)
    res.json(contenedor)
  } catch (err) {
    next(err)
  }
}

async function devolucion(req, res, next) {
  try {
    const contenedor = await contenedorService.registrarDevolucion(req.params.id)
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
    const { codigoBIC, foto, fechaInicioLibre } = req.body
    // fechaInicioLibre tiene su propia función con validación y actualización del ciclo
    if (fechaInicioLibre !== undefined) {
      const actualizado = await contenedorService.editarFechaInicioLibre(req.params.id, fechaInicioLibre)
      return res.json(actualizado)
    }
    const cambios = {}
    if (codigoBIC !== undefined) cambios.codigoBIC = codigoBIC
    if (foto !== undefined)      cambios.foto      = foto
    const actualizado = await contenedorService.actualizar(req.params.id, cambios)
    res.json(actualizado)
  } catch (err) {
    next(err)
  }
}

async function eliminar(req, res, next) {
  try {
    await contenedorService.eliminar(req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

async function revertirSalidaPuerto(req, res, next) {
  try {
    const contenedor = await contenedorService.revertirSalidaPuerto(req.params.id)
    res.json(contenedor)
  } catch (err) {
    next(err)
  }
}

module.exports = { crear, listar, obtener, actualizar, editarContenedor, eliminar, entradaPuerto, salidaPuerto, devolucion, cancelarCiclo, revertirSalidaPuerto }
