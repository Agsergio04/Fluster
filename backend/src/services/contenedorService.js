/**
 * Servicio de contenedores
 * Gestiona el ciclo de vida de cada contenedor y el cálculo de costes D&D.
 * Las tres transiciones de estado (entrada puerto, salida puerto, devolución)
 * son las operaciones más críticas: actualizan el contenedor y su ciclo activo.
 */

const Contenedor = require('../models/Contenedor')
const Naviera = require('../models/Naviera')
const Ciclo = require('../models/Ciclo')

// ---------------------------------------------------------------------------
// Helpers privados de cálculo
// ---------------------------------------------------------------------------

/**
 * Diferencia en días naturales entre dos fechas, ignorando la hora.
 * Se usa días naturales porque así lo computan las navieras en sus contratos.
 */
function calcularDiasEntreFechas(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)
  inicio.setHours(0, 0, 0, 0)
  fin.setHours(0, 0, 0, 0)
  return Math.round((fin - inicio) / (1000 * 60 * 60 * 24))
}

/**
 * Calcula el coste total a partir de días facturables y los tramos de tarifa.
 * Cada tramo define el precio por día para un rango; el último tramo (hastaDia null)
 * cubre todos los días restantes.
 *
 * @param {number} diasFacturables - Días que generan coste (ya descontados los libres)
 * @param {Array}  tramos          - Tramos de tarifa de la naviera
 * @returns {number}
 */
function calcularCosteTramos(diasFacturables, tramos) {
  if (diasFacturables <= 0) return 0

  let total = 0
  for (const tramo of tramos) {
    if (diasFacturables < tramo.desdeDia) break
    const fin = tramo.hastaDia === null
      ? diasFacturables
      : Math.min(tramo.hastaDia, diasFacturables)
    total += (fin - tramo.desdeDia + 1) * tramo.precioPorDia
  }

  return total
}

// ---------------------------------------------------------------------------
// CRUD básico
// ---------------------------------------------------------------------------

/**
 * Da de alta un nuevo contenedor en estado INACTIVO.
 *
 * @param {object} datos
 * @returns {Promise<object>}
 */
async function crear({ codigoBIC, tipo, navieraId, fechaInicioLibre, creadoPor }) {
  return Contenedor.create({ codigoBIC, tipo, navieraId, fechaInicioLibre, creadoPor })
}

/**
 * Lista contenedores con filtros opcionales.
 * Popula la naviera para que el panel no necesite peticiones adicionales.
 * El cliente vive en el ciclo activo, no en el contenedor.
 *
 * @param {{ estado?: string, navieraId?: string }} filtros
 * @returns {Promise<object[]>}
 */
async function listar(filtros = {}) {
  const query = {}
  if (filtros.estado) query.estado = filtros.estado
  if (filtros.navieraId) query.navieraId = filtros.navieraId

  return Contenedor.find(query)
    .populate('navieraId', 'nombre codigo')
    .sort({ creadoEn: -1 })
    .lean()
}

/**
 * Devuelve un contenedor por su ID con naviera y cliente populados.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
async function obtenerPorId(id) {
  const contenedor = await Contenedor.findById(id)
    .populate('navieraId')
    .lean()

  if (!contenedor) {
    const err = new Error('Contenedor no encontrado')
    err.status = 404
    throw err
  }

  return contenedor
}

/**
 * Actualiza campos no estructurales de un contenedor (BIC, tipo, naviera).
 * El estado y las fechas de transición solo se modifican con sus funciones propias.
 *
 * @param {string} id
 * @param {object} cambios
 * @returns {Promise<object>}
 */
async function actualizar(id, cambios) {
  delete cambios.estado
  delete cambios.fechaEntradaPuerto
  delete cambios.fechaSalidaPuerto
  delete cambios.fechaDevolucion

  const actualizado = await Contenedor.findByIdAndUpdate(
    id,
    cambios,
    { new: true, runValidators: true }
  ).lean()

  if (!actualizado) {
    const err = new Error('Contenedor no encontrado')
    err.status = 404
    throw err
  }

  return actualizado
}

// ---------------------------------------------------------------------------
// Transiciones de estado
// ---------------------------------------------------------------------------

/**
 * Registra la entrada del contenedor al puerto (INACTIVO → CARGADO).
 * Abre un nuevo ciclo con el cliente asignado y el tramo de demurrage en curso.
 * La fecha de inicio del demurrage es fechaInicioLibre, no la de llegada física,
 * porque es la fecha desde la que la naviera empieza a contar los días libres.
 *
 * @param {string} id        - ID del contenedor
 * @param {Date}   fecha     - Fecha real de entrada al puerto
 * @param {string} clienteId - Cliente al que pertenece este ciclo
 * @returns {Promise<object>} Contenedor actualizado
 */
async function registrarEntradaPuerto(id, fecha, clienteId) {
  const contenedor = await Contenedor.findById(id)
  if (!contenedor) {
    const err = new Error('Contenedor no encontrado')
    err.status = 404
    throw err
  }
  if (contenedor.estado !== 'INACTIVO') {
    const err = new Error(`Transición no válida: el contenedor está en estado ${contenedor.estado}`)
    err.status = 422
    throw err
  }

  const naviera = await Naviera.findById(contenedor.navieraId)

  await Ciclo.create({
    contenedorId: id,
    clienteId,
    demurrage: {
      diasLibres: naviera.diasLibresDemurrage,
      fechaInicio: contenedor.fechaInicioLibre,
    },
  })

  return Contenedor.findByIdAndUpdate(
    id,
    { estado: 'CARGADO', fechaEntradaPuerto: fecha },
    { new: true }
  ).lean()
}

/**
 * Registra la salida del contenedor del puerto hacia el cliente (CARGADO → CLIENTE).
 * Cierra el tramo de demurrage calculando días y coste, y abre el tramo de detention.
 *
 * @param {string} id    - ID del contenedor
 * @param {Date}   fecha - Fecha real de salida del puerto
 * @returns {Promise<object>} Contenedor actualizado
 */
async function registrarSalidaPuerto(id, fecha) {
  const contenedor = await Contenedor.findById(id)
  if (!contenedor) {
    const err = new Error('Contenedor no encontrado')
    err.status = 404
    throw err
  }
  if (contenedor.estado !== 'CARGADO') {
    const err = new Error(`Transición no válida: el contenedor está en estado ${contenedor.estado}`)
    err.status = 422
    throw err
  }

  const [naviera, ciclo] = await Promise.all([
    Naviera.findById(contenedor.navieraId),
    Ciclo.findOne({ contenedorId: id, fechaCierre: null }),
  ])

  const diasTranscurridos = calcularDiasEntreFechas(ciclo.demurrage.fechaInicio, fecha)
  const diasFacturables = Math.max(0, diasTranscurridos - ciclo.demurrage.diasLibres)
  const costeTotal = calcularCosteTramos(diasFacturables, naviera.diasDemurrage)

  await Ciclo.findByIdAndUpdate(ciclo._id, {
    $set: {
      'demurrage.fechaFin': fecha,
      'demurrage.diasTranscurridos': diasTranscurridos,
      'demurrage.diasFacturables': diasFacturables,
      'demurrage.costeTotal': costeTotal,
      detention: {
        diasLibres: naviera.diasLibresDetention,
        fechaInicio: fecha,
      },
    },
  })

  return Contenedor.findByIdAndUpdate(
    id,
    { estado: 'CLIENTE', fechaSalidaPuerto: fecha },
    { new: true }
  ).lean()
}

/**
 * Registra la devolución del contenedor (CLIENTE → INACTIVO).
 * Cierra el tramo de detention, suma demurrage + detention y cierra el ciclo.
 * A partir de aquí los costes son definitivos y el contenedor queda libre para
 * iniciar un nuevo ciclo.
 *
 * @param {string} id    - ID del contenedor
 * @param {Date}   fecha - Fecha real de devolución
 * @returns {Promise<object>} Contenedor actualizado
 */
async function registrarDevolucion(id, fecha) {
  const contenedor = await Contenedor.findById(id)
  if (!contenedor) {
    const err = new Error('Contenedor no encontrado')
    err.status = 404
    throw err
  }
  if (contenedor.estado !== 'CLIENTE') {
    const err = new Error(`Transición no válida: el contenedor está en estado ${contenedor.estado}`)
    err.status = 422
    throw err
  }

  const [naviera, ciclo] = await Promise.all([
    Naviera.findById(contenedor.navieraId),
    Ciclo.findOne({ contenedorId: id, fechaCierre: null }),
  ])

  const diasTranscurridos = calcularDiasEntreFechas(ciclo.detention.fechaInicio, fecha)
  const diasFacturables = Math.max(0, diasTranscurridos - ciclo.detention.diasLibres)
  const costeDetention = calcularCosteTramos(diasFacturables, naviera.diasDetention)
  const costeTotal = (ciclo.demurrage.costeTotal || 0) + costeDetention

  await Ciclo.findByIdAndUpdate(ciclo._id, {
    $set: {
      'detention.fechaFin': fecha,
      'detention.diasTranscurridos': diasTranscurridos,
      'detention.diasFacturables': diasFacturables,
      'detention.costeTotal': costeDetention,
      costeTotal,
      fechaCierre: fecha,
    },
  })

  return Contenedor.findByIdAndUpdate(
    id,
    { estado: 'INACTIVO', fechaDevolucion: fecha },
    { new: true }
  ).lean()
}

module.exports = {
  crear,
  listar,
  obtenerPorId,
  actualizar,
  registrarEntradaPuerto,
  registrarSalidaPuerto,
  registrarDevolucion,
}
