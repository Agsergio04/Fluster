import apiClient from './apiClient'

/** Devuelve todas las navieras con su estructura de tramos de tarifas. */
export async function listarNavieras() {
  const { data } = await apiClient.get('/navieras')
  return data
}

/**
 * Reemplaza la estructura de tarifas completa de una naviera.
 * Usa PUT (no PATCH) porque el modelo de tramos se reconstruye entero
 * a partir de los valores del formulario en TablaTarifas.
 *
 * @param {string} id      - ID de la naviera
 * @param {object} cambios - Objeto naviera completo con los nuevos tramos
 */
export async function actualizarNaviera(id, cambios) {
  const { data } = await apiClient.put(`/navieras/${id}`, cambios)
  return data
}

/**
 * Elimina la naviera. El backend rechaza la operación si tiene
 * contenedores con ciclos activos asociados.
 */
export async function eliminarNaviera(id) {
  await apiClient.delete(`/navieras/${id}`)
}
