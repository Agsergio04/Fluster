import apiClient from './apiClient'

export async function crearContenedor(datos) {
  const { data } = await apiClient.post('/contenedores', datos)
  return data
}

export async function listarContenedores(params) {
  const { data } = await apiClient.get('/contenedores', { params })
  return data
}
