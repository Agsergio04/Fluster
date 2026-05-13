import apiClient from './apiClient'

export async function obtenerDatosInforme(filtros = {}) {
  const { data } = await apiClient.get('/informes/generar-datos', { params: filtros })
  return data
}

export async function registrarInforme(contenedorId, cicloId) {
  const { data } = await apiClient.post('/informes', { contenedorId, cicloId })
  return data
}
