/**
 * Helpers de cálculo de costes D&D (demurrage & detention).
 * Centralizados aquí para que los compartan contenedorService (transiciones de
 * estado) y cicloService (edición de tramos) sin duplicar la lógica de negocio.
 */

/**
 * Diferencia en días naturales entre dos fechas, ignorando la hora.
 * Se usa días naturales porque así lo computan las navieras en sus contratos.
 */
function calcularDiasEntreFechas(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)
  inicio.setHours(0, 0, 0, 0)
  fin.setHours(0, 0, 0, 0)
  return Math.round((fin - inicio) / (1000 * 60 * 60 * 24))
}

/**
 * Calcula el coste total a partir de días facturables y los tramos de tarifa.
 * Cada tramo define el precio por día para un rango; el último tramo (hastaDia null)
 * cubre todos los días restantes.
 *
 * @param {number} diasFacturables - Días que generan coste (ya descontados los libres)
 * @param {Array}  tramos          - Tramos de tarifa de la naviera
 * @returns {number}
 */
function calcularCosteTramos(diasFacturables, tramos) {
  if (diasFacturables <= 0) return 0

  let total = 0
  for (const tramo of tramos) {
    if (diasFacturables < tramo.desdeDia) break
    const fin = tramo.hastaDia === null
      ? diasFacturables
      : Math.min(tramo.hastaDia, diasFacturables)
    total += (fin - tramo.desdeDia + 1) * tramo.precioPorDia
  }

  return total
}

module.exports = { calcularDiasEntreFechas, calcularCosteTramos }
