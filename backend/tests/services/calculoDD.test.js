/**
 * Tests unitarios de los helpers de cálculo de costes D&D.
 * Es la lógica de negocio núcleo (demurrage & detention): la comparten
 * contenedorService y cicloService, así que se prueba de forma aislada y
 * exhaustiva, sin base de datos.
 */

const { calcularDiasEntreFechas, calcularCosteTramos } = require('../../src/services/calculoDD')

describe('calculoDD', () => {
  // ---------------------------------------------------------------------------
  // calcularDiasEntreFechas
  // ---------------------------------------------------------------------------
  describe('calcularDiasEntreFechas', () => {
    it('devuelve 0 cuando ambas fechas son el mismo día', () => {
      expect(calcularDiasEntreFechas('2026-01-10', '2026-01-10')).toBe(0)
    })

    it('cuenta los días naturales transcurridos entre dos fechas', () => {
      expect(calcularDiasEntreFechas('2026-01-10', '2026-01-15')).toBe(5)
    })

    it('ignora la hora del día (cuenta días naturales, no múltiplos de 24h)', () => {
      // Mismo día con horas distintas → 0
      expect(calcularDiasEntreFechas('2026-01-10T23:59:00', '2026-01-10T00:01:00')).toBe(0)
      // Apenas dos minutos pero cruzando la medianoche → 1 día natural
      expect(calcularDiasEntreFechas('2026-01-10T23:59:00', '2026-01-11T00:01:00')).toBe(1)
    })

    it('devuelve un valor negativo si la fecha fin es anterior a la de inicio', () => {
      expect(calcularDiasEntreFechas('2026-01-15', '2026-01-10')).toBe(-5)
    })

    it('cruza correctamente el cambio de mes', () => {
      expect(calcularDiasEntreFechas('2026-01-28', '2026-02-02')).toBe(5)
    })

    it('acepta tanto cadenas ISO como objetos Date', () => {
      const inicio = new Date('2026-03-01')
      const fin = new Date('2026-03-04')
      expect(calcularDiasEntreFechas(inicio, fin)).toBe(3)
    })
  })

  // ---------------------------------------------------------------------------
  // calcularCosteTramos
  // ---------------------------------------------------------------------------
  describe('calcularCosteTramos', () => {
    // Tarifa escalonada típica: cuanto más se tarda, más caro el día.
    const tramos = [
      { desdeDia: 1, hastaDia: 5, precioPorDia: 10 },
      { desdeDia: 6, hastaDia: 10, precioPorDia: 20 },
      { desdeDia: 11, hastaDia: null, precioPorDia: 30 }, // tramo abierto final
    ]

    it('devuelve 0 si no hay días facturables (aún dentro del free time)', () => {
      expect(calcularCosteTramos(0, tramos)).toBe(0)
    })

    it('devuelve 0 si los días facturables son negativos', () => {
      expect(calcularCosteTramos(-3, tramos)).toBe(0)
    })

    it('devuelve 0 cuando no hay tramos de tarifa', () => {
      expect(calcularCosteTramos(5, [])).toBe(0)
      expect(calcularCosteTramos(5, null)).toBe(0)
      expect(calcularCosteTramos(5, undefined)).toBe(0)
    })

    it('factura solo el primer tramo cuando los días no lo superan', () => {
      // 3 días × 10 = 30
      expect(calcularCosteTramos(3, tramos)).toBe(30)
    })

    it('cobra el tramo completo justo en su límite superior', () => {
      // días 1..5 × 10 = 50
      expect(calcularCosteTramos(5, tramos)).toBe(50)
    })

    it('encadena dos tramos cuando los días cruzan al segundo', () => {
      // 1..5 × 10 (50) + 6..8 × 20 (60) = 110
      expect(calcularCosteTramos(8, tramos)).toBe(110)
    })

    it('aplica el tramo abierto final (hastaDia null) a los días restantes', () => {
      // 1..5 ×10 (50) + 6..10 ×20 (100) + 11..13 ×30 (90) = 240
      expect(calcularCosteTramos(13, tramos)).toBe(240)
    })

    it('produce el mismo coste aunque los tramos lleguen desordenados', () => {
      const desordenados = [tramos[2], tramos[0], tramos[1]]
      expect(calcularCosteTramos(8, desordenados)).toBe(calcularCosteTramos(8, tramos))
      expect(calcularCosteTramos(13, desordenados)).toBe(240)
    })

    it('factura el primer día del segundo tramo como un único día', () => {
      // 1..5 ×10 (50) + día 6 ×20 (20) = 70
      expect(calcularCosteTramos(6, tramos)).toBe(70)
    })

    it('funciona con una tarifa de un solo tramo abierto', () => {
      const unico = [{ desdeDia: 1, hastaDia: null, precioPorDia: 15 }]
      // 1..4 × 15 = 60
      expect(calcularCosteTramos(4, unico)).toBe(60)
    })
  })
})
