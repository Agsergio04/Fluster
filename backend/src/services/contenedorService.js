/**
 * Servicio de contenedores
 * Gestiona el ciclo de vida de cada contenedor y el cálculo de costes D&D.
 * Las tres transiciones de estado (entrada puerto, salida puerto, devolución)
 * son las operaciones más críticas: actualizan el contenedor y su ciclo activo.
 */

const Contenedor = require('../models/Contenedor')
const Naviera = require('../models/Naviera')
const Ciclo = require('../models/Ciclo')
const Evento = require('../models/Evento')
const Informe = require('../models/Informe')
const { calcularDiasEntreFechas, calcularCosteTramos } = require('./calculoDD')
const { escaparRegex } = require('../utils/validacion')

// ---------------------------------------------------------------------------
// CRUD básico
// ---------------------------------------------------------------------------

/**
 * Da de alta un nuevo contenedor en estado INACTIVO.
 *
 * @param {object} datos
 * @returns {Promise<object>}
 */
async function crear({ codigoBIC, foto, creadoPor }) {
  if (typeof codigoBIC !== 'string' || !codigoBIC.trim()) {
    const err = new Error('El código BIC es obligatorio')
    err.status = 422
    throw err
  }
  const bic = codigoBIC.trim().toUpperCase()

  // El código BIC identifica físicamente al contenedor: no puede repetirse
  // (coherente con la validación de `actualizar` y con el índice único del modelo).
  const duplicado = await Contenedor.findOne({ codigoBIC: bic })
  if (duplicado) {
    const err = new Error(`Ya existe un contenedor con el código BIC ${bic}`)
    err.status = 409
    throw err
  }

  // La naviera se identifica por las 3 primeras letras del BIC (código de
  // propietario ISO 6346); la 4ª letra es la categoría de equipo. El catálogo de
  // navieras debe usar ese mismo código de 3 letras (p. ej. MAE), no 4.
  const prefijo = bic.substring(0, 3)
  let naviera = await Naviera.findOne({ codigo: prefijo })
  if (!naviera) {
    naviera = await Naviera.create({
      nombre:               prefijo,
      codigo:               prefijo,
      diasLibresDemurrage:  0,
      diasLibresDetention:  0,
      diasDemurrage:        [],
      diasDetention:        [],
    })
  }
  return Contenedor.create({ codigoBIC: bic, foto: foto ?? null, navieraId: naviera._id, creadoPor })
}

/**
 * Lista contenedores con filtros, ordenación y paginación opcionales.
 * Si se filtra por clienteId busca primero los ciclos de ese cliente para
 * obtener los contenedorIds, ya que el cliente vive en el Ciclo, no en el Contenedor.
 * Sin page/limit devuelve todos los documentos (compatibilidad con el frontend actual).
 *
 * @param {{ estado?: string, navieraId?: string, clienteId?: string, busqueda?: string, orden?: 'asc'|'desc', page?: number, limit?: number }} filtros
 * @returns {Promise<object[]|{ data: object[], total: number, page: number, limit: number, totalPages: number }>}
 */
async function listar(filtros = {}) {
  const query = {}
  if (filtros.estado)      query.estado    = filtros.estado
  if (filtros.navieraId)   query.navieraId = filtros.navieraId
  if (filtros.busqueda)    query.codigoBIC = { $regex: escaparRegex(filtros.busqueda), $options: 'i' }
  if (filtros.creadoPorId) query.creadoPor = filtros.creadoPorId

  if (filtros.clienteId) {
    const ids = await Ciclo.find({ clienteId: filtros.clienteId }).distinct('contenedorId')
    query._id = { $in: ids }
  }

  const sort = filtros.orden === 'asc' ? { creadoEn: 1 } : { creadoEn: -1 }

  if (filtros.page !== undefined || filtros.limit !== undefined) {
    const page  = Math.max(1, parseInt(filtros.page)  || 1)
    const limit = Math.min(100, Math.max(1, parseInt(filtros.limit) || 20))
    const [total, data] = await Promise.all([
      Contenedor.countDocuments(query),
      Contenedor.find(query)
        .populate('navieraId', 'nombre codigo')
        .populate('creadoPor', 'nombre')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  return Contenedor.find(query)
    .populate('navieraId', 'nombre codigo')
    .populate('creadoPor', 'nombre')
    .sort(sort)
    .lean()
}

/**
 * Devuelve un contenedor por su ID con naviera y cliente populados.
 *
 * @param {string} id
 * @returns {Promise<object>}
 */
async function obtenerPorId(id, creadoPorId) {
  const contenedor = await Contenedor.findById(id)
    .populate('navieraId')
    .lean()

  // Control de propiedad: si el solicitante es operador (creadoPorId definido),
  // solo accede a SUS contenedores. Se responde 404 (no 403) para no revelar la
  // existencia de IDs ajenos.
  if (!contenedor || (creadoPorId && String(contenedor.creadoPor) !== String(creadoPorId))) {
    const err = new Error('Contenedor no encontrado')
    err.status = 404
    throw err
  }

  // Incluir el historial de ciclos para que el frontend tenga los cicloIds
  // necesarios para la generación de informes y la vista de almacén.
  // Solo se registran los ciclos COMPLETADOS (con fechaCierre): el ciclo en
  // curso no se considera un ciclo registrado hasta que se cierra (devolución).
  const ciclos = await Ciclo.find({ contenedorId: id, fechaCierre: { $ne: null } })
    .populate('clienteId', 'nombre')
    .sort({ creadoEn: -1 })
    .lean()

  return { ...contenedor, ciclos }
}

/**
 * Actualiza campos no estructurales de un contenedor (BIC, tipo, naviera).
 * El estado y las fechas de transición solo se modifican con sus funciones propias.
 *
 * @param {string} id
 * @param {object} cambios
 * @returns {Promise<object>}
 */
async function actualizar(id, cambios, creadoPorId) {
  delete cambios.estado
  delete cambios.fechaEntradaPuerto
  delete cambios.fechaSalidaPuerto
  delete cambios.fechaDevolucion

  // Control de propiedad para operadores (creadoPorId definido): no editar ajenos.
  if (creadoPorId) {
    const propio = await Contenedor.exists({ _id: id, creadoPor: creadoPorId })
    if (!propio) {
      const err = new Error('Contenedor no encontrado')
      err.status = 404
      throw err
    }
  }

  if (cambios.codigoBIC) {
    const duplicado = await Contenedor.findOne({ codigoBIC: cambios.codigoBIC.toUpperCase(), _id: { $ne: id } })
    if (duplicado) {
      const err = new Error(`Ya existe un contenedor con el código BIC ${cambios.codigoBIC.toUpperCase()}`)
      err.status = 409
      throw err
    }
  }

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

/**
 * Corrige la fecha de inicio del tramo activo del contenedor.
 * - INACTIVO : solo actualiza fechaInicioLibre (sin ciclo activo).
 * - PUERTO   : actualiza fechaInicioLibre, fechaEntradaPuerto y
 *              ciclo.demurrage.fechaInicio. La nueva fecha no puede ser
 *              futura ni posterior a la propia entrada a puerto.
 * - CLIENTE  : actualiza la fecha de inicio del demurrage, recalcula
 *              sus costes (ya cerrados) y valida que no supere
 *              fechaSalidaPuerto.
 *
 * @param {string} id
 * @param {string|Date} nuevaFechaStr
 */
async function editarFechaInicioLibre(id, nuevaFechaStr, creadoPorId) {
  const contenedor = await Contenedor.findById(id).populate('navieraId').lean()
  if (!contenedor || (creadoPorId && String(contenedor.creadoPor) !== String(creadoPorId))) {
    const err = new Error('Contenedor no encontrado'); err.status = 404; throw err
  }

  const nuevaFecha = new Date(nuevaFechaStr)
  const hoy        = new Date(); hoy.setHours(23, 59, 59, 999)

  if (isNaN(nuevaFecha)) {
    const err = new Error('Fecha inválida'); err.status = 422; throw err
  }
  if (nuevaFecha > hoy) {
    const err = new Error('La fecha no puede ser futura'); err.status = 422; throw err
  }
  if (contenedor.fechaSalidaPuerto && nuevaFecha > new Date(contenedor.fechaSalidaPuerto)) {
    const err = new Error('La fecha de inicio no puede ser posterior a la salida a cliente')
    err.status = 422; throw err
  }

  if (contenedor.estado !== 'INACTIVO') {
    const ciclo = await Ciclo.findOne({ contenedorId: id, fechaCierre: null })
    if (ciclo) {
      // La fecha de inicio del demurrage no puede superar el fin del propio demurrage
      // (aplica cuando el tramo ya ha sido editado manualmente y difiere de fechaSalidaPuerto)
      if (ciclo.demurrage?.fechaFin && nuevaFecha > new Date(ciclo.demurrage.fechaFin)) {
        const err = new Error('La fecha de inicio no puede ser posterior al fin del tramo de sobrestadía')
        err.status = 422; throw err
      }
      // Tampoco puede superar el inicio del tramo de detención
      if (ciclo.detention?.fechaInicio && nuevaFecha > new Date(ciclo.detention.fechaInicio)) {
        const err = new Error('La fecha de inicio no puede ser posterior al inicio del tramo de detención')
        err.status = 422; throw err
      }

      const updateCiclo = { 'demurrage.fechaInicio': nuevaFecha }

      // Para CLIENTE el tramo de demurrage ya está cerrado: recalculamos sus costes
      if (contenedor.estado === 'CLIENTE' && ciclo.demurrage?.fechaFin) {
        const naviera   = contenedor.navieraId
        const demDias   = calcularDiasEntreFechas(nuevaFecha, new Date(ciclo.demurrage.fechaFin))
        const demFact   = Math.max(0, demDias - ciclo.demurrage.diasLibres)
        const demCoste  = calcularCosteTramos(demFact, naviera.diasDemurrage)
        updateCiclo['demurrage.diasTranscurridos'] = demDias
        updateCiclo['demurrage.diasFacturables']   = demFact
        updateCiclo['demurrage.costeTotal']        = demCoste
      }

      await Ciclo.findByIdAndUpdate(ciclo._id, { $set: updateCiclo })
    }
  }

  // fechaEntradaPuerto solo se corrige en PUERTO (donde coincide con el inicio
  // del demurrage). En INACTIVO el contenedor nunca entró a puerto y en CLIENTE
  // ese timestamp ya es histórico: sobrescribirlo lo corromperia.
  const updateContenedor = { fechaInicioLibre: nuevaFecha }
  if (contenedor.estado === 'PUERTO') updateContenedor.fechaEntradaPuerto = nuevaFecha

  return Contenedor.findByIdAndUpdate(
    id,
    updateContenedor,
    { new: true }
  ).lean()
}

// ---------------------------------------------------------------------------
// Transiciones de estado
// ---------------------------------------------------------------------------

/**
 * Registra la entrada del contenedor al puerto (INACTIVO → PUERTO).
 * Abre un nuevo ciclo con el cliente asignado y el tramo de demurrage en curso.
 * El demurrage empieza a contar desde la fecha de entrada a puerto, de modo que
 * el contenedor arranca dentro del período libre (sin coste) y solo pasa a los
 * tramos a medida que transcurren los días libres.
 *
 * @param {string} id        - ID del contenedor
 * @param {string} clienteId - Cliente al que pertenece este ciclo
 * @returns {Promise<object>} Contenedor actualizado
 */
async function registrarEntradaPuerto(id, clienteId) {
  const fecha = new Date()
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
      fechaInicio: fecha,
    },
  })

  return Contenedor.findByIdAndUpdate(
    id,
    { estado: 'PUERTO', fechaEntradaPuerto: fecha, fechaInicioLibre: fecha },
    { new: true }
  ).lean()
}

/**
 * Registra la salida del contenedor del puerto hacia el cliente (PUERTO → CLIENTE).
 * Cierra el tramo de demurrage calculando días y coste, y abre el tramo de detention.
 *
 * @param {string} id - ID del contenedor
 * @returns {Promise<object>} Contenedor actualizado
 */
async function registrarSalidaPuerto(id) {
  const fecha = new Date()
  const contenedor = await Contenedor.findById(id)
  if (!contenedor) {
    const err = new Error('Contenedor no encontrado')
    err.status = 404
    throw err
  }
  if (contenedor.estado !== 'PUERTO') {
    const err = new Error(`Transición no válida: el contenedor está en estado ${contenedor.estado}`)
    err.status = 422
    throw err
  }

  const [naviera, ciclo] = await Promise.all([
    Naviera.findById(contenedor.navieraId),
    Ciclo.findOne({ contenedorId: id, fechaCierre: null }),
  ])

  if (!ciclo?.demurrage) {
    const err = new Error('No hay un ciclo de sobrestadía activo para este contenedor')
    err.status = 422
    throw err
  }

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
 * @param {string} id - ID del contenedor
 * @returns {Promise<object>} Contenedor actualizado
 */
async function registrarDevolucion(id) {
  const fecha = new Date()
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

/**
 * Cancela el ciclo activo y devuelve el contenedor a INACTIVO.
 * Solo aplicable cuando el contenedor está en PUERTO, antes de que haya
 * pasado al cliente; en ese punto no se ha generado ningún coste facturable
 * así que el ciclo se borra por completo.
 *
 * @param {string} id - ID del contenedor
 * @returns {Promise<object>} Contenedor actualizado
 */
async function cancelarCiclo(id) {
  const contenedor = await Contenedor.findById(id)
  if (!contenedor) {
    const err = new Error('Contenedor no encontrado')
    err.status = 404
    throw err
  }
  if (contenedor.estado !== 'PUERTO') {
    const err = new Error(`Solo se puede cancelar el ciclo desde estado PUERTO (actual: ${contenedor.estado})`)
    err.status = 422
    throw err
  }

  await Ciclo.findOneAndDelete({ contenedorId: id, fechaCierre: null })

  return Contenedor.findByIdAndUpdate(
    id,
    { estado: 'INACTIVO', fechaEntradaPuerto: null },
    { new: true }
  ).lean()
}

/**
 * Revierte la salida al cliente (CLIENTE → PUERTO).
 * Elimina los datos de detention del ciclo activo y restaura el estado PUERTO.
 */
async function revertirSalidaPuerto(id) {
  const contenedor = await Contenedor.findById(id)
  if (!contenedor) {
    const err = new Error('Contenedor no encontrado')
    err.status = 404
    throw err
  }
  if (contenedor.estado !== 'CLIENTE') {
    const err = new Error(`Solo se puede revertir desde estado CLIENTE (actual: ${contenedor.estado})`)
    err.status = 422
    throw err
  }

  await Ciclo.findOneAndUpdate(
    { contenedorId: id, fechaCierre: null },
    {
      $unset: {
        'demurrage.fechaFin':           '',
        'demurrage.diasTranscurridos':  '',
        'demurrage.diasFacturables':    '',
        'demurrage.costeTotal':         '',
        detention:                      '',
      },
    }
  )

  return Contenedor.findByIdAndUpdate(
    id,
    { estado: 'PUERTO', fechaSalidaPuerto: null },
    { new: true }
  ).lean()
}

/**
 * Elimina un contenedor y todos sus datos asociados en cascada:
 * ciclos, eventos e informes que lo referencian (por contenedorId).
 * Solo se puede eliminar si está en estado INACTIVO; un contenedor activo
 * tiene costes en curso que no deben perderse.
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
async function eliminar(id, creadoPorId) {
  const contenedor = await Contenedor.findById(id)
  if (!contenedor || (creadoPorId && String(contenedor.creadoPor) !== String(creadoPorId))) {
    const err = new Error('Contenedor no encontrado')
    err.status = 404
    throw err
  }
  if (contenedor.estado !== 'INACTIVO') {
    const err = new Error(`No se puede eliminar un contenedor en estado ${contenedor.estado}`)
    err.status = 422
    throw err
  }

  // Cascada: sin esto quedarían eventos e informes huérfanos apuntando
  // a un contenedorId inexistente.
  await Ciclo.deleteMany({ contenedorId: id })
  await Evento.deleteMany({ contenedorId: id })
  await Informe.deleteMany({ contenedorId: id })
  await contenedor.deleteOne()
}

module.exports = {
  crear,
  listar,
  obtenerPorId,
  actualizar,
  editarFechaInicioLibre,
  eliminar,
  registrarEntradaPuerto,
  registrarSalidaPuerto,
  revertirSalidaPuerto,
  registrarDevolucion,
  cancelarCiclo,
}
