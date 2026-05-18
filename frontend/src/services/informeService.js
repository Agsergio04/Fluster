import apiClient from './apiClient'

/**
 * Obtiene los datos de ciclos cerrados para generar un informe PDF.
 * Acepta filtros opcionales para acotar el período o la naviera.
 *
 * @param {object} filtros - Parámetros de filtrado (fechaDesde, fechaHasta, navieraId…)
 * @returns {object[]} Ciclos con datos de contenedor, cliente y costes calculados
 */
export async function obtenerDatosInforme(filtros = {}) {
  const { data } = await apiClient.get('/informes/generar-datos', { params: filtros })
  return data
}

/**
 * Registra en el servidor que se ha generado un informe para el ciclo dado.
 * Sirve como trazabilidad de qué informes se han descargado y cuándo.
 *
 * @param {string} contenedorId
 * @param {string} cicloId
 */
export async function registrarInforme(contenedorId, cicloId) {
  const { data } = await apiClient.post('/informes', { contenedorId, cicloId })
  return data
}
