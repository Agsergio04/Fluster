import apiClient from './apiClient'

export async function crearContenedor(datos) {
  const { data } = await apiClient.post('/contenedores', datos)
  return data
}

export async function listarContenedores(params) {
  const { data } = await apiClient.get('/contenedores', { params })
  return data
}

export async function obtenerContenedor(id) {
  const { data } = await apiClient.get(`/contenedores/${id}`)
  return data
}

export async function actualizarContenedor(id, datos) {
  const { data } = await apiClient.patch(`/contenedores/${id}/editar`, datos)
  return data
}

export async function eliminarContenedor(id) {
  await apiClient.delete(`/contenedores/${id}`)
}

export async function entradaPuerto(id, clienteId) {
  const { data } = await apiClient.patch(`/contenedores/${id}/entrada-puerto`, {
    fecha: new Date().toISOString(),
    clienteId,
  })
  return data
}

export async function salidaPuerto(id) {
  const { data } = await apiClient.patch(`/contenedores/${id}/salida-puerto`, {
    fecha: new Date().toISOString(),
  })
  return data
}

export async function revertirSalidaPuerto(id) {
  const { data } = await apiClient.patch(`/contenedores/${id}/revertir-salida`)
  return data
}

export async function devolucion(id) {
  const { data } = await apiClient.patch(`/contenedores/${id}/devolucion`, {
    fecha: new Date().toISOString(),
  })
  return data
}

export async function cancelarCiclo(id) {
  const { data } = await apiClient.patch(`/contenedores/${id}/cancelar-ciclo`)
  return data
}
