const ocrService = require('../services/ocrService')

async function extraerBic(req, res, next) {
  try {
    const { imagen } = req.body
    if (!imagen) return res.status(400).json({ mensaje: 'Se requiere una imagen' })
    const codigoBic = await ocrService.extraerCodigoBic(imagen)
    res.json({ codigoBic })
  } catch (err) {
    next(err)
  }
}

module.exports = { extraerBic }
