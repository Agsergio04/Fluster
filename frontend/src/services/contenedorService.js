import apiClient from './apiClient'

export async function crearContenedor(datos) {
  const { data } = await apiClient.post('/contenedores', datos)
  return data
}

export async function listarContenedores(params) {
  const { data } = await apiClient.get('/contenedores', { params })
  return data
}

export async function actualizarContenedor(id, datos) {
  const { data } = await apiClient.patch(`/contenedores/${id}/editar`, datos)
  return data
}
