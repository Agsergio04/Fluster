import apiClient from './apiClient'

/** Registra un contenedor nuevo en el sistema. El estado inicial es INACTIVO. */
export async function crearContenedor(datos) {
  const { data } = await apiClient.post('/contenedores', datos)
  return data
}

/**
 * Lista los contenedores del usuario autenticado con filtrado en servidor.
 * @param {object} params - Filtros opcionales (estado, navieraId, clienteId, etc.)
 */
export async function listarContenedores(params) {
  const { data } = await apiClient.get('/contenedores', { params })
  return data
}

export async function obtenerContenedor(id) {
  const { data } = await apiClient.get(`/contenedores/${id}`)
  return data
}

/** Actualiza campos editables del contenedor (foto, fechaInicioLibre). */
export async function actualizarContenedor(id, datos) {
  const { data } = await apiClient.patch(`/contenedores/${id}/editar`, datos)
  return data
}

/** Solo es posible si el contenedor está en estado INACTIVO. */
export async function eliminarContenedor(id) {
  await apiClient.delete(`/contenedores/${id}`)
}

/**
 * Transición INACTIVO → PUERTO. Abre un ciclo nuevo asociando el cliente.
 * La fecha se captura aquí para garantizar que refleja el momento real
 * de la operación y no un valor introducido manualmente.
 *
 * @param {string} id       - ID del contenedor
 * @param {string} clienteId - ID del cliente asociado al ciclo
 */
export async function entradaPuerto(id, clienteId) {
  const { data } = await apiClient.patch(`/contenedores/${id}/entrada-puerto`, { clienteId })
  return data
}

/**
 * Transición PUERTO → CLIENTE. El servidor calcula el inicio del Demurrage
 * a partir de esta fecha y los días libres de la naviera.
 */
export async function salidaPuerto(id) {
  const { data } = await apiClient.patch(`/contenedores/${id}/salida-puerto`)
  return data
}

/**
 * Deshace la transición CLIENTE → PUERTO sin cerrar el ciclo.
 * Útil para corregir una salida de puerto registrada por error.
 */
export async function revertirSalidaPuerto(id) {
  const { data } = await apiClient.patch(`/contenedores/${id}/revertir-salida`)
  return data
}

/**
 * Transición CLIENTE → INACTIVO y cierre del ciclo.
 * El servidor cierra los contadores de Detention y calcula el coste final.
 */
export async function devolucion(id) {
  const { data } = await apiClient.patch(`/contenedores/${id}/devolucion`)
  return data
}

/**
 * Cancela el ciclo activo y devuelve el contenedor a INACTIVO.
 * Solo es posible desde PUERTO; como aún no se ha generado coste
 * facturable, el backend elimina el ciclo activo.
 */
export async function cancelarCiclo(id) {
  const { data } = await apiClient.patch(`/contenedores/${id}/cancelar-ciclo`)
  return data
}
