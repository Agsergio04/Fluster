/**
 * Validación de variables de entorno críticas en el arranque.
 *
 * El rol del usuario viaja firmado dentro del JWT. La seguridad de todo el
 * control de acceso depende de que el JWT_SECRET sea secreto y robusto: con un
 * secreto conocido, cualquiera podría firmar un token con rol "admin" y el
 * backend lo aceptaría como legítimo. Por eso se impide arrancar con un secreto
 * ausente o con uno de los valores de ejemplo del repositorio.
 */

// Valores de marcador de posición que NUNCA deben usarse en un despliegue real.
const SECRETOS_INSEGUROS = new Set([
  'cambia_esto_por_un_secreto_seguro',
  'cambia_esto_por_un_secreto_largo_y_aleatorio',
])

function validarEntorno() {
  const secret = process.env.JWT_SECRET

  if (!secret || !secret.trim()) {
    throw new Error(
      'JWT_SECRET no está definido. Define un secreto largo y aleatorio antes de arrancar el servidor.'
    )
  }

  if (SECRETOS_INSEGUROS.has(secret)) {
    const mensaje =
      'JWT_SECRET tiene un valor de ejemplo inseguro. Con un secreto conocido ' +
      'cualquiera podría falsificar tokens (p. ej. con rol admin). Cámbialo por ' +
      'un secreto largo y aleatorio.'

    // En producción es un fallo fatal: no se arranca con un secreto público.
    // En desarrollo solo se avisa para no bloquear el trabajo local.
    if (process.env.NODE_ENV === 'production') {
      throw new Error(mensaje)
    }
    console.warn(`⚠️  ${mensaje}`)
  }
}

module.exports = validarEntorno
