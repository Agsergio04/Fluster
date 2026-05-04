const authService = require('../services/authService')

async function registrar(req, res, next) {
  try {
    const usuario = await authService.registrar(req.body)
    res.status(201).json(usuario)
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const { correo, contrasena } = req.body
    const resultado = await authService.login(correo, contrasena)
    res.json(resultado)
  } catch (err) {
    next(err)
  }
}

module.exports = { registrar, login }
