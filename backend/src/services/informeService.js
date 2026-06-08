/**
 * Servicio de informes
 * Registro de auditoría y consulta de los informes PDF de ciclos cerrados.
 * El PDF lo genera el frontend con jsPDF; el backend solo persiste el registro
 * de quién exportó qué y cuándo.
 */

const Informe = require('../models/Informe')
const Contenedor = require('../models/Contenedor')
const Ciclo = require('../models/Ciclo')
const { escaparRegex } = require('../utils/validacion')

/**
 * Registra que el gestor ha exportado el PDF de un ciclo cerrado.
 * Verifica que el ciclo esté cerrado; un ciclo abierto tendría costes parciales.
 * Los campos codigoBIC y cliente se guardan como snapshot para que el historial
 * no cambie si los datos originales se modifican después.
 *
 * @param {{ contenedorId: string, cicloId: string, generadoPor: string }} datos
 * @returns {Promise<object>}
 */
async function generar({ contenedorId, cicloId, generadoPor }) {
  const [contenedor, ciclo] = await Promise.all([
    Contenedor.findById(contenedorId),
    Ciclo.findById(cicloId).populate('clienteId', 'nombre'),
  ])

  if (!contenedor) {
    const err = new Error('Contenedor no encontrado')
    err.status = 404
    throw err
  }
  if (!ciclo) {
    const err = new Error('Ciclo no encontrado')
    err.status = 404
    throw err
  }
  if (!ciclo.fechaCierre) {
    const err = new Error('No se puede registrar un informe de un ciclo que aún no está cerrado')
    err.status = 422
    throw err
  }

  return Informe.create({
    contenedorId,
    cicloId,
    codigoBIC: contenedor.codigoBIC,
    cliente: ciclo.clienteId?.nombre ?? 'Cliente desconocido',
    generadoPor,
  })
}

/**
 * Lista todos los informes con filtros opcionales.
 * El campo cliente es un snapshot de texto, así que el filtro por nombre
 * usa una búsqueda parcial insensible a mayúsculas.
 *
 * @param {{ cliente?: string, contenedorId?: string }} filtros
 * @returns {Promise<object[]>}
 */
async function listar(filtros = {}) {
  const query = {}
  if (filtros.cliente) query.cliente = { $regex: escaparRegex(filtros.cliente), $options: 'i' }
  if (filtros.contenedorId) query.contenedorId = filtros.contenedorId

  return Informe.find(query).sort({ generadoEn: -1 }).lean()
}

/**
 * Devuelve todos los informes de un contenedor, del más reciente al más antiguo.
 *
 * @param {string} contenedorId
 * @returns {Promise<object[]>}
 */
async function listarPorContenedor(contenedorId) {
  return Informe.find({ contenedorId }).sort({ generadoEn: -1 }).lean()
}

/**
 * Devuelve un informe por su ID con los datos del ciclo populados.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
async function obtenerPorId(id) {
  const informe = await Informe.findById(id).populate('cicloId').lean()
  if (!informe) {
    const err = new Error('Informe no encontrado')
    err.status = 404
    throw err
  }
  return informe
}

/**
 * Devuelve ciclos CERRADOS con todos los datos necesarios para generar el PDF.
 * Aplica los mismos filtros que el panel de informes del frontend.
 *
 * @param {{ fechaDesde?, fechaHasta?, fechaEspecifica?, naviera?, cliente?,
 *           codigoBic?, contenedorId?, ordenAscendente?, ordenDescendente?,
 *           ordenAlfabetico? }} filtros
 * @returns {Promise<object[]>}
 */
async function generarDatos(filtros = {}) {
  const query = { fechaCierre: { $ne: null } }

  if (filtros.fechaDesde || filtros.fechaHasta) {
    query.fechaCierre = {}
    if (filtros.fechaDesde) query.fechaCierre.$gte = new Date(filtros.fechaDesde)
    if (filtros.fechaHasta) {
      const fin = new Date(filtros.fechaHasta)
      fin.setHours(23, 59, 59, 999)
      query.fechaCierre.$lte = fin
    }
  }

  // La fecha específica solo se aplica si NO hay un rango Desde/Hasta: el rango
  // tiene prioridad y la fecha específica se ignora cuando ya se ha indicado uno.
  if (filtros.fechaEspecifica && !filtros.fechaDesde && !filtros.fechaHasta) {
    const ini = new Date(filtros.fechaEspecifica)
    const fin = new Date(filtros.fechaEspecifica)
    fin.setHours(23, 59, 59, 999)
    query.fechaCierre = { $gte: ini, $lte: fin }
  }

  if (filtros.contenedorId) query.contenedorId = filtros.contenedorId

  let ciclos = await Ciclo.find(query)
    .populate({
      path: 'contenedorId',
      populate: { path: 'navieraId', select: 'nombre codigo' },
    })
    .populate('clienteId', 'nombre')
    .sort({ fechaCierre: -1 })
    .lean()

  if (filtros.naviera) {
    const nav = filtros.naviera.toLowerCase()
    ciclos = ciclos.filter(c =>
      c.contenedorId?.navieraId?.nombre?.toLowerCase().includes(nav) ||
      c.contenedorId?.navieraId?.codigo?.toLowerCase().includes(nav)
    )
  }

  if (filtros.cliente) {
    const cli = filtros.cliente.toLowerCase()
    ciclos = ciclos.filter(c => c.clienteId?.nombre?.toLowerCase().includes(cli))
  }

  if (filtros.codigoBic) {
    const bic = filtros.codigoBic.toUpperCase()
    ciclos = ciclos.filter(c => c.contenedorId?.codigoBIC?.includes(bic))
  }

  // Los criterios de orden se COMBINAN en una sola ordenación: la fecha de cierre
  // es la clave principal (ascendente o descendente según se elija) y el código BIC
  // actúa como desempate alfabético dentro del mismo día. Si solo se marca el
  // alfabético ordena solo por BIC; si solo la fecha, solo por fecha.
  const ordenarPorFecha = filtros.ordenAscendente === 'true' || filtros.ordenDescendente === 'true'
  if (ordenarPorFecha || filtros.ordenAlfabetico === 'true') {
    ciclos.sort((a, b) => {
      if (ordenarPorFecha) {
        const diff = new Date(a.fechaCierre) - new Date(b.fechaCierre)
        const signo = filtros.ordenDescendente === 'true' ? -diff : diff
        if (signo !== 0) return signo
      }
      if (filtros.ordenAlfabetico === 'true') {
        return (a.contenedorId?.codigoBIC ?? '').localeCompare(b.contenedorId?.codigoBIC ?? '')
      }
      return 0
    })
  }

  return ciclos
}

module.exports = { generar, listar, listarPorContenedor, obtenerPorId, generarDatos }
