import apiClient from './apiClient'

export async function actualizarFoto(id, foto) {
  const { data } = await apiClient.patch(`/usuarios/${id}/foto`, { foto })
  return data
}

export async function actualizarNombre(id, nombre) {
  const { data } = await apiClient.patch(`/usuarios/${id}/nombre`, { nombre })
  return data
}

export async function cambiarContrasena(id, contrasenaActual, contrasenaNueva) {
  await apiClient.patch(`/usuarios/${id}/contrasena`, { contrasenaActual, contrasenaNueva })
}
