const cicloService = require('../services/cicloService')

/** Edita las fechas del tramo de demurrage de un ciclo y devuelve el ciclo actualizado. */
async function editarDemurrage(req, res, next) {
  try {
    const actualizado = await cicloService.editarDemurrage(req.params.id, req.body)
    res.json(actualizado)
  } catch (err) {
    next(err)
  }
}

/** Edita las fechas del tramo de detention de un ciclo y devuelve el ciclo actualizado. */
async function editarDetention(req, res, next) {
  try {
    const actualizado = await cicloService.editarDetention(req.params.id, req.body)
    res.json(actualizado)
  } catch (err) {
    next(err)
  }
}

module.exports = { editarDemurrage, editarDetention }
