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

// Formato de código BIC/contenedor (ISO 6346): 4 letras seguidas de 7 dígitos
// (p. ej. MSCU1234567). No comprueba el dígito de control, solo el formato.
const CODIGO_BIC_REGEX = /^[A-Z]{4}[0-9]{7}$/

/**
 * Valida (y normaliza) el código BIC de un contenedor: 4 letras al principio y
 * 7 números. Normaliza a mayúsculas y sin espacios antes de comprobar. Lanza un
 * error 422 con `campo: 'codigoBIC'` si no cumple; devuelve el BIC normalizado.
 *
 * @param {string} codigoBIC
 * @returns {string} BIC en mayúsculas y sin espacios
 */
function validarCodigoBic(codigoBIC) {
  const bic = String(codigoBIC ?? '').trim().toUpperCase()
  if (!CODIGO_BIC_REGEX.test(bic)) {
    const err = new Error('El código BIC debe tener 4 letras seguidas de 7 números')
    err.status = 422
    err.campo = 'codigoBIC'
    throw err
  }
  return bic
}

module.exports = { escaparRegex, validarPoliticaContrasena, validarCodigoBic }
