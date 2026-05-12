import apiClient from './apiClient'

export async function login(correo, contrasena) {
  const { data } = await apiClient.post('/auth/login', { correo, contrasena })
  sessionStorage.setItem('token', data.token)
  sessionStorage.setItem('usuario', JSON.stringify(data.usuario))
  return data.usuario
}

export function logout() {
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('usuario')
}

export function getUsuario() {
  const raw = sessionStorage.getItem('usuario')
  return raw ? JSON.parse(raw) : null
}

export function getToken() {
  return sessionStorage.getItem('token')
}
