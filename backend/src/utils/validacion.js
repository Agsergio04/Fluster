/**
 * Utilidades de validación y saneado compartidas por los servicios.
 */

/**
 * Escapa los metacaracteres de una cadena para poder usarla con seguridad dentro
 * de un `$regex` de MongoDB. Evita la inyección de expresiones regulares y los
 * ataques ReDoS (backtracking catastrófico) cuando la entrada viene del usuario.
 *
 * @param {string} str
 * @returns {string}
 */
function escaparRegex(str) {
  return String(str ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Valida la política de contraseña del sistema (mínimo 8 caracteres y al menos un
 * número). Centralizada para aplicar las MISMAS reglas en el registro y en el
 * cambio de contraseña. Lanza un error 400 con `campo: 'contrasena'` si no cumple;
 * no devuelve nada si es válida.
 *
 * @param {string} contrasena
 */
function validarPoliticaContrasena(contrasena) {
  if (typeof contrasena !== 'string' || contrasena.length < 8) {
    const err = new Error('La contraseña debe tener al menos 8 caracteres')
    err.status = 400
    err.campo = 'contrasena'
    throw err
  }
  if (!/[0-9]/.test(contrasena)) {
    const err = new Error('La contraseña debe incluir al menos un número')
    err.status = 400
    err.campo = 'contrasena'
    throw err
  }
}

module.exports = { escaparRegex, validarPoliticaContrasena }
