import apiClient from './apiClient'

export async function obtenerAgrupados() {
  const { data } = await apiClient.get('/semaforo')
  return data
}
