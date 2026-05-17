import apiClient from './apiClient'

export async function listarNavieras() {
  const { data } = await apiClient.get('/navieras')
  return data
}

export async function actualizarNaviera(id, cambios) {
  const { data } = await apiClient.put(`/navieras/${id}`, cambios)
  return data
}

export async function eliminarNaviera(id) {
  await apiClient.delete(`/navieras/${id}`)
}
