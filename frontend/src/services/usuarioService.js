import apiClient from './apiClient'

export async function listarUsuarios() {
  const { data } = await apiClient.get('/usuarios')
  return data
}

export async function actualizarRol(id, rol) {
  const { data } = await apiClient.put(`/usuarios/${id}`, { rol })
  return data
}

export async function eliminarUsuario(id) {
  await apiClient.delete(`/usuarios/${id}`)
}

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
