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

/**
 * Decodifica el payload del JWT en curso (solo lo decodifica; la verificación de
 * la firma la hace exclusivamente el servidor). Devuelve null si no hay token o
 * está malformado.
 */
export function getTokenPayload() {
  const token = getToken()
  if (!token) return null
  const part = token.split('.')[1]
  if (!part) return null
  try {
    let base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    base64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * Rol del usuario tomado del JWT firmado. Es la fuente de verdad para la
 * autorización del cliente: NO se confía en el objeto `usuario` de localStorage
 * (editable), de modo que manipularlo no concede más permisos.
 */
export function getRol() {
  return getTokenPayload()?.rol ?? null
}

/**
 * Devuelve el objeto usuario de la sesión activa o null si no hay sesión.
 * El `rol` se toma siempre del JWT firmado (no del valor almacenado), para que
 * editar `usuario` en localStorage no altere los permisos efectivos del cliente.
 */
export function getUsuario() {
  const raw = localStorage.getItem(USUARIO_KEY)
  if (!raw) return null
  return { ...JSON.parse(raw), rol: getRol() }
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
