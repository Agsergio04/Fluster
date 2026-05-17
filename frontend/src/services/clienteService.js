import apiClient from './apiClient'

export async function crearCliente(nombre) {
  const { data } = await apiClient.post('/clientes', { nombre })
  return data
}
