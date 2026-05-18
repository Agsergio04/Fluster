import apiClient from './apiClient'

/**
 * Corrige las fechas del tramo Demurrage de un ciclo cerrado.
 * Permite ajustar fechas erróneas registradas durante la operación.
 *
 * @param {string} id     - ID del ciclo
 * @param {object} fechas - { fechaInicio, fechaFin } en formato ISO
 */
export async function editarDemurrageCiclo(id, fechas) {
  const { data } = await apiClient.patch(`/ciclos/${id}/demurrage`, fechas)
  return data
}

/**
 * Corrige las fechas del tramo Detention de un ciclo cerrado.
 *
 * @param {string} id     - ID del ciclo
 * @param {object} fechas - { fechaInicio, fechaFin } en formato ISO
 */
export async function editarDetentionCiclo(id, fechas) {
  const { data } = await apiClient.patch(`/ciclos/${id}/detention`, fechas)
  return data
}
