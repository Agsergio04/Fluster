import apiClient from './apiClient'
import { guardarSesion } from './session'

export async function login(correo, contrasena) {
  const { data } = await apiClient.post('/login', { correo, contrasena })
  guardarSesion(data.token, data.usuario)
  return data.usuario
}

export async function registro(nombre, correo, contrasena, rol) {
  const { data } = await apiClient.post('/registro', { nombre, correo, contrasena, rol })
  return data
}
