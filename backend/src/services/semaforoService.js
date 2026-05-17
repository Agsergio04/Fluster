/**
 * Servicio del semáforo
 * Agrupa todos los contenedores según su nivel de riesgo D&D en tiempo real.
 * El grupo se determina calculando los días transcurridos desde la fecha de inicio
 * del tramo activo (demurrage si está en PUERTO, detention si está en CLIENTE)
 * y comparando los días facturables con los tramos de tarifa de la naviera.
 */

const Contenedor = require('../models/Contenedor')
const Ciclo = require('../models/Ciclo')

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

function calcularCosteTramos(diasFacturables, tramos) {
  if (diasFacturables <= 0 || !tramos?.length) return 0
  let total = 0
  for (const tramo of tramos) {
    if (diasFacturables < tramo.desdeDia) break
    const fin = tramo.hastaDia === null ? diasFacturables : Math.min(tramo.hastaDia, diasFacturables)
    total += (fin - tramo.desdeDia + 1) * tramo.precioPorDia
  }
  return total
}

function calcularDiasHastaHoy(fechaInicio) {
  const inicio = new Date(fechaInicio)
  const hoy = new Date()
  inicio.setHours(0, 0, 0, 0)
  hoy.setHours(0, 0, 0, 0)
  return Math.round((hoy - inicio) / (1000 * 60 * 60 * 24))
}

/**
 * Determina el grupo de semáforo a partir de los días facturables y los tramos.
 * Se consideran solo dos niveles de sobrecoste (primer y segundo tramo) para
 * simplificar la vista; si la naviera tiene más de dos tramos, todo lo que
 * supere el primero cae en "segundoTramo".
 */
function determinarGrupo(diasFacturables, tramos) {
  if (diasFacturables <= 0) return 'freeTime'

  const primerTramo = tramos[0]
  if (!primerTramo) return 'freeTime'

  if (primerTramo.hastaDia === null || diasFacturables <= primerTramo.hastaDia) {
    return 'primerTramo'
  }

  return 'segundoTramo'
}

// ---------------------------------------------------------------------------
// Función principal
// ---------------------------------------------------------------------------

/**
 * Devuelve todos los contenedores agrupados por nivel de riesgo.
 * Hace tres consultas en total (contenedores, ciclos activos, sin N+1)
 * y calcula el estado de cada uno en memoria.
 *
 * Cada contenedor del resultado incluye el campo _semaforo con los días
 * transcurridos y facturables del tramo activo, para que el frontend
 * no tenga que recalcularlos.
 *
 * @returns {Promise<{
 *   inactivos: object[],
 *   freeTime: object[],
 *   primerTramo: object[],
 *   segundoTramo: object[]
 * }>}
 */
async function obtenerAgrupados() {
  const contenedores = await Contenedor.find()
    .populate('navieraId')
    .lean()

  // Evitar N+1: traer todos los ciclos activos de una vez
  const idsActivos = contenedores
    .filter(c => c.estado !== 'INACTIVO')
    .map(c => c._id)

  const ciclosActivos = await Ciclo.find({
    contenedorId: { $in: idsActivos },
    fechaCierre: null,
  })
    .populate('clienteId', 'nombre')
    .lean()

  const cicloPorContenedor = {}
  for (const ciclo of ciclosActivos) {
    cicloPorContenedor[ciclo.contenedorId.toString()] = ciclo
  }

  const grupos = { inactivos: [], freeTime: [], primerTramo: [], segundoTramo: [] }

  for (const contenedor of contenedores) {
    if (contenedor.estado === 'INACTIVO') {
      grupos.inactivos.push(contenedor)
      continue
    }

    const ciclo = cicloPorContenedor[contenedor._id.toString()]

    // Si no hay ciclo activo (no debería pasar, pero por seguridad)
    if (!ciclo) {
      grupos.inactivos.push(contenedor)
      continue
    }

    const naviera = contenedor.navieraId
    let diasTranscurridos, diasFacturables, tramos, costeAcumulado

    if (contenedor.estado === 'PUERTO') {
      diasTranscurridos = calcularDiasHastaHoy(ciclo.demurrage.fechaInicio)
      diasFacturables   = Math.max(0, diasTranscurridos - ciclo.demurrage.diasLibres)
      tramos            = naviera.diasDemurrage
      costeAcumulado    = calcularCosteTramos(diasFacturables, tramos)
    } else {
      diasTranscurridos = calcularDiasHastaHoy(ciclo.detention.fechaInicio)
      diasFacturables   = Math.max(0, diasTranscurridos - ciclo.detention.diasLibres)
      tramos            = naviera.diasDetention
      // El coste de demurrage ya está cerrado y guardado en el ciclo
      costeAcumulado    = (ciclo.demurrage?.costeTotal ?? 0) + calcularCosteTramos(diasFacturables, tramos)
    }

    const grupo = determinarGrupo(diasFacturables, tramos)

    grupos[grupo].push({
      ...contenedor,
      _semaforo: {
        diasTranscurridos,
        diasFacturables,
        costeAcumulado,
        cliente: ciclo.clienteId?.nombre ?? null,
      },
    })
  }

  return grupos
}

module.exports = { obtenerAgrupados }
