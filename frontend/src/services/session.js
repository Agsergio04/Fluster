// Los datos de sesión se guardan en localStorage para que la sesión persista
// entre pestañas y reinicios del navegador hasta que el usuario cierre sesión.
const TOKEN_KEY   = 'token'
const USUARIO_KEY = 'usuario'

/**
 * Persiste el token JWT y los datos del usuario en localStorage.
 * Lo llama authService.login() tras una autenticación exitosa.
 */
export function guardarSesion(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario))
}

/** Elimina el token y los datos del usuario, invalidando la sesión local. */
export function limpiarSesion() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USUARIO_KEY)
}

/** Devuelve el token JWT en curso o null si no hay sesión activa. */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/** Devuelve el objeto usuario de la sesión activa o null si no hay sesión. */
export function getUsuario() {
  const raw = localStorage.getItem(USUARIO_KEY)
  return raw ? JSON.parse(raw) : null
}

/** Indica si hay un token guardado, sin verificar su validez en el servidor. */
export function isAuthenticated() {
  return !!getToken()
}

/**
 * Aplica un merge parcial sobre los datos del usuario en localStorage.
 * Lo usan las páginas de perfil y panel de control para reflejar cambios
 * (nombre, foto, rol) sin necesidad de cerrar y volver a iniciar sesión.
 *
 * @param {object} cambios - Campos a sobreescribir (p. ej. { nombre: 'Nuevo' })
 */
export function actualizarUsuario(cambios) {
  const usuario = getUsuario()
  if (!usuario) return
  localStorage.setItem(USUARIO_KEY, JSON.stringify({ ...usuario, ...cambios }))
}
