const TOKEN_KEY   = 'token'
const USUARIO_KEY = 'usuario'

export function guardarSesion(token, usuario) {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(USUARIO_KEY, JSON.stringify(usuario))
}

export function limpiarSesion() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USUARIO_KEY)
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getUsuario() {
  const raw = sessionStorage.getItem(USUARIO_KEY)
  return raw ? JSON.parse(raw) : null
}

export function isAuthenticated() {
  return !!getToken()
}

export function actualizarUsuario(cambios) {
  const usuario = getUsuario()
  if (!usuario) return
  sessionStorage.setItem(USUARIO_KEY, JSON.stringify({ ...usuario, ...cambios }))
}
