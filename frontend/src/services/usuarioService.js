import apiClient from './apiClient'

export async function actualizarFoto(id, foto) {
  const { data } = await apiClient.patch(`/usuarios/${id}/foto`, { foto })
  return data
}
