const Ciclo      = require('../models/Ciclo')
const Contenedor = require('../models/Contenedor')
const Naviera    = require('../models/Naviera')

function diasEntreFechas(a, b) {
  const ini = new Date(a); ini.setHours(0, 0, 0, 0)
  const fin = new Date(b); fin.setHours(0, 0, 0, 0)
  return Math.round((fin - ini) / 86400000)
}

function calcularCoste(diasFacturables, tramos) {
  if (diasFacturables <= 0) return 0
  let total = 0
  for (const t of tramos) {
    if (diasFacturables < t.desdeDia) break
    const fin = t.hastaDia === null ? diasFacturables : Math.min(t.hastaDia, diasFacturables)
    total += (fin - t.desdeDia + 1) * t.precioPorDia
  }
  return total
}

async function editarDemurrage(req, res, next) {
  try {
    const { fechaInicio, fechaFin } = req.body

    const ciclo = await Ciclo.findById(req.params.id)
    if (!ciclo) { const e = new Error('Ciclo no encontrado'); e.status = 404; throw e }

    const update = {}
    if (fechaInicio) update['demurrage.fechaInicio'] = new Date(fechaInicio)
    if (fechaFin)    update['demurrage.fechaFin']    = new Date(fechaFin)

    // Recalcular costes solo si hay fecha de fin
    const finEfectivo = fechaFin ? new Date(fechaFin) : ciclo.demurrage.fechaFin
    const iniEfectivo = fechaInicio ? new Date(fechaInicio) : ciclo.demurrage.fechaInicio

    // La fecha de fin no puede ser anterior a la de inicio (duración negativa)
    if (iniEfectivo && finEfectivo && new Date(finEfectivo) < new Date(iniEfectivo)) {
      const e = new Error('La fecha de fin del demurrage no puede ser anterior a la de inicio'); e.status = 422; throw e
    }

    if (finEfectivo) {
      const contenedor = await Contenedor.findById(ciclo.contenedorId)
      const naviera    = await Naviera.findById(contenedor.navieraId)
      const diasTot    = diasEntreFechas(iniEfectivo, finEfectivo)
      const diasFact   = Math.max(0, diasTot - ciclo.demurrage.diasLibres)
      update['demurrage.diasTranscurridos'] = diasTot
      update['demurrage.diasFacturables']   = diasFact
      update['demurrage.costeTotal']        = calcularCoste(diasFact, naviera.diasDemurrage)

      // Actualizar costeTotal del ciclo si está cerrado
      if (ciclo.fechaCierre) {
        const costeDet = ciclo.detention?.costeTotal ?? 0
        update.costeTotal = update['demurrage.costeTotal'] + costeDet
      }
    }

    const actualizado = await Ciclo.findByIdAndUpdate(
      req.params.id, { $set: update }, { new: true }
    ).populate('clienteId', 'nombre')

    res.json(actualizado)
  } catch (err) { next(err) }
}

async function editarDetention(req, res, next) {
  try {
    const { fechaInicio, fechaFin } = req.body

    const ciclo = await Ciclo.findById(req.params.id)
    if (!ciclo) { const e = new Error('Ciclo no encontrado'); e.status = 404; throw e }
    if (!ciclo.detention) { const e = new Error('Este ciclo aún no tiene tramo de detention'); e.status = 422; throw e }

    const update = {}
    if (fechaInicio) update['detention.fechaInicio'] = new Date(fechaInicio)
    if (fechaFin)    update['detention.fechaFin']    = new Date(fechaFin)

    const finEfectivo = fechaFin ? new Date(fechaFin) : ciclo.detention.fechaFin
    const iniEfectivo = fechaInicio ? new Date(fechaInicio) : ciclo.detention.fechaInicio

    // La fecha de fin no puede ser anterior a la de inicio (duración negativa)
    if (iniEfectivo && finEfectivo && new Date(finEfectivo) < new Date(iniEfectivo)) {
      const e = new Error('La fecha de fin del detention no puede ser anterior a la de inicio'); e.status = 422; throw e
    }
    // El detention no puede empezar antes de que termine el demurrage (fecha última asignada)
    if (iniEfectivo && ciclo.demurrage?.fechaFin && new Date(iniEfectivo) < new Date(ciclo.demurrage.fechaFin)) {
      const e = new Error('El detention no puede empezar antes de la fecha de fin del demurrage'); e.status = 422; throw e
    }

    if (finEfectivo) {
      const contenedor = await Contenedor.findById(ciclo.contenedorId)
      const naviera    = await Naviera.findById(contenedor.navieraId)
      const diasTot    = diasEntreFechas(iniEfectivo, finEfectivo)
      const diasFact   = Math.max(0, diasTot - ciclo.detention.diasLibres)
      update['detention.diasTranscurridos'] = diasTot
      update['detention.diasFacturables']   = diasFact
      update['detention.costeTotal']        = calcularCoste(diasFact, naviera.diasDetention)

      if (ciclo.fechaCierre) {
        const costeDem = ciclo.demurrage?.costeTotal ?? 0
        update.costeTotal = costeDem + update['detention.costeTotal']
      }
    }

    const actualizado = await Ciclo.findByIdAndUpdate(
      req.params.id, { $set: update }, { new: true }
    ).populate('clienteId', 'nombre')

    res.json(actualizado)
  } catch (err) { next(err) }
}

module.exports = { editarDemurrage, editarDetention }
