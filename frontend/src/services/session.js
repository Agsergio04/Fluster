// sessionStorage en lugar de localStorage es intencional: los datos de sesión
// se borran al cerrar la pestaña sin que el usuario tenga que cerrar sesión manualmente.
const TOKEN_KEY   = 'token'
const USUARIO_KEY = 'usuario'

/**
 * Persiste el token JWT y los datos del usuario en sessionStorage.
 * Lo llama authService.login() tras una autenticación exitosa.
 */
export function guardarSesion(token, usuario) {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(USUARIO_KEY, JSON.stringify(usuario))
}

/** Elimina el token y los datos del usuario, invalidando la sesión local. */
export function limpiarSesion() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USUARIO_KEY)
}

/** Devuelve el token JWT en curso o null si no hay sesión activa. */
export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

/** Devuelve el objeto usuario de la sesión activa o null si no hay sesión. */
export function getUsuario() {
  const raw = sessionStorage.getItem(USUARIO_KEY)
  return raw ? JSON.parse(raw) : null
}

/** Indica si hay un token guardado, sin verificar su validez en el servidor. */
export function isAuthenticated() {
  return !!getToken()
}

/**
 * Aplica un merge parcial sobre los datos del usuario en sessionStorage.
 * Lo usan las páginas de perfil y panel de control para reflejar cambios
 * (nombre, foto, rol) sin necesidad de cerrar y volver a iniciar sesión.
 *
 * @param {object} cambios - Campos a sobreescribir (p. ej. { nombre: 'Nuevo' })
 */
export function actualizarUsuario(cambios) {
  const usuario = getUsuario()
  if (!usuario) return
  sessionStorage.setItem(USUARIO_KEY, JSON.stringify({ ...usuario, ...cambios }))
}
