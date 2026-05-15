import apiClient from './apiClient'

export async function editarDemurrageCiclo(id, fechas) {
  const { data } = await apiClient.patch(`/ciclos/${id}/demurrage`, fechas)
  return data
}

export async function editarDetentionCiclo(id, fechas) {
  const { data } = await apiClient.patch(`/ciclos/${id}/detention`, fechas)
  return data
}
