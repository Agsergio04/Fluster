jest.mock('../../src/models/Contenedor')
jest.mock('../../src/models/Ciclo')

const Contenedor = require('../../src/models/Contenedor')
const Ciclo = require('../../src/models/Ciclo')
const { obtenerAgrupados } = require('../../src/services/semaforoService')

// Fijar la fecha del sistema para que los cÃ¡lculos de dÃ­as sean deterministas
beforeAll(() => jest.useFakeTimers().setSystemTime(new Date('2025-01-20')))
afterAll(() => jest.useRealTimers())

// ---------------------------------------------------------------------------
// Helpers de datos de prueba
// ---------------------------------------------------------------------------

function makeNaviera(overrides = {}) {
  return {
    diasLibresDemurrage: 5,
    diasLibresDetention: 5,
    diasDemurrage: [
      { desdeDia: 1, hastaDia: 5,   precioPorDia: 50 },
      { desdeDia: 6, hastaDia: null, precioPorDia: 100 },
    ],
    diasDetention: [
      { desdeDia: 1, hastaDia: 5,   precioPorDia: 30 },
      { desdeDia: 6, hastaDia: null, precioPorDia: 60 },
    ],
    ...overrides,
  }
}

function mockContenedores(lista) {
  Contenedor.find.mockReturnValue({
    populate: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(lista),
    }),
  })
}

function mockCiclos(lista) {
  Ciclo.find.mockReturnValue({
    populate: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(lista),
    }),
  })
}

describe('semaforoService', () => {
  beforeEach(() => jest.clearAllMocks())

  // ---------------------------------------------------------------------------
  // ClasificaciÃ³n individual
  // ---------------------------------------------------------------------------
  describe('clasificaciÃ³n por grupo', () => {
    it('clasifica los contenedores INACTIVO en el grupo inactivos', async () => {
      mockContenedores([{ _id: 'c1', estado: 'INACTIVO', navieraId: makeNaviera() }])
      mockCiclos([])

      const result = await obtenerAgrupados()

      expect(result.inactivos).toHaveLength(1)
      expect(result.freeTime).toHaveLength(0)
      expect(result.primerTramo).toHaveLength(0)
      expect(result.segundoTramo).toHaveLength(0)
    })

    it('clasifica en freeTime cuando los dÃ­as transcurridos no superan los dÃ­as libres', async () => {
      // Hoy: 2025-01-20. Inicio: 2025-01-15 â†’ 5 dÃ­as transcurridos, diasLibres=5 â†’ 0 facturables
      mockContenedores([{ _id: 'c1', estado: 'PUERTO', navieraId: makeNaviera() }])
      mockCiclos([{
        contenedorId: 'c1',
        clienteId: { nombre: 'Cliente A' },
        fechaCierre: null,
        demurrage: { fechaInicio: new Date('2025-01-15'), diasLibres: 5 },
      }])

      const result = await obtenerAgrupados()

      expect(result.freeTime).toHaveLength(1)
      expect(result.freeTime[0]._semaforo.diasTranscurridos).toBe(5)
      expect(result.freeTime[0]._semaforo.diasFacturables).toBe(0)
    })

    it('clasifica en primerTramo cuando los dÃ­as facturables estÃ¡n dentro del primer tramo', async () => {
      // Hoy: 2025-01-20. Inicio: 2025-01-10 â†’ 10 dÃ­as transcurridos, diasLibres=5 â†’ 5 facturables
      // primerTramo.hastaDia = 5 â†’ diasFacturables(5) <= 5 â†’ primerTramo
      mockContenedores([{ _id: 'c1', estado: 'PUERTO', navieraId: makeNaviera() }])
      mockCiclos([{
        contenedorId: 'c1',
        clienteId: { nombre: 'Cliente B' },
        fechaCierre: null,
        demurrage: { fechaInicio: new Date('2025-01-10'), diasLibres: 5 },
      }])

      const result = await obtenerAgrupados()

      expect(result.primerTramo).toHaveLength(1)
      expect(result.primerTramo[0]._semaforo.diasFacturables).toBe(5)
    })

    it('clasifica en segundoTramo cuando los dÃ­as facturables superan el primer tramo', async () => {
      // Hoy: 2025-01-20. Inicio: 2025-01-01 â†’ 19 dÃ­as transcurridos, diasLibres=5 â†’ 14 facturables
      // primerTramo.hastaDia = 5 â†’ diasFacturables(14) > 5 â†’ segundoTramo
      mockContenedores([{ _id: 'c1', estado: 'PUERTO', navieraId: makeNaviera() }])
      mockCiclos([{
        contenedorId: 'c1',
        clienteId: { nombre: 'Cliente C' },
        fechaCierre: null,
        demurrage: { fechaInicio: new Date('2025-01-01'), diasLibres: 5 },
      }])

      const result = await obtenerAgrupados()

      expect(result.segundoTramo).toHaveLength(1)
      expect(result.segundoTramo[0]._semaforo.diasFacturables).toBe(14)
    })

    it('clasifica contenedores CLIENTE usando el tramo de detention', async () => {
      // Hoy: 2025-01-20. Inicio detention: 2025-01-10 â†’ 10 dÃ­as, diasLibres=5 â†’ 5 facturables
      mockContenedores([{ _id: 'c1', estado: 'CLIENTE', navieraId: makeNaviera() }])
      mockCiclos([{
        contenedorId: 'c1',
        clienteId: { nombre: 'Cliente D' },
        fechaCierre: null,
        demurrage: { fechaInicio: new Date('2025-01-01'), diasLibres: 5 },
        detention: { fechaInicio: new Date('2025-01-10'), diasLibres: 5 },
      }])

      const result = await obtenerAgrupados()

      expect(result.primerTramo).toHaveLength(1)
      expect(result.primerTramo[0]._semaforo.diasFacturables).toBe(5)
    })
  })

  // ---------------------------------------------------------------------------
  // Datos aÃ±adidos al campo _semaforo
  // ---------------------------------------------------------------------------
  describe('campo _semaforo', () => {
    it('incluye el nombre del cliente en _semaforo', async () => {
      mockContenedores([{ _id: 'c1', estado: 'PUERTO', navieraId: makeNaviera() }])
      mockCiclos([{
        contenedorId: 'c1',
        clienteId: { nombre: 'Mercadona' },
        fechaCierre: null,
        demurrage: { fechaInicio: new Date('2025-01-01'), diasLibres: 5 },
      }])

      const result = await obtenerAgrupados()

      const contenedor = [...result.freeTime, ...result.primerTramo, ...result.segundoTramo][0]
      expect(contenedor._semaforo.cliente).toBe('Mercadona')
    })

    it('devuelve cliente null si el ciclo no tiene clienteId populado', async () => {
      mockContenedores([{ _id: 'c1', estado: 'PUERTO', navieraId: makeNaviera() }])
      mockCiclos([{
        contenedorId: 'c1',
        clienteId: null,
        fechaCierre: null,
        demurrage: { fechaInicio: new Date('2025-01-15'), diasLibres: 5 },
      }])

      const result = await obtenerAgrupados()

      const contenedor = result.freeTime[0]
      expect(contenedor._semaforo.cliente).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // MÃºltiples contenedores
  // ---------------------------------------------------------------------------
  describe('mÃºltiples contenedores', () => {
    it('distribuye correctamente varios contenedores en sus grupos', async () => {
      const naviera = makeNaviera()
      mockContenedores([
        { _id: 'c1', estado: 'INACTIVO', navieraId: naviera },
        { _id: 'c2', estado: 'PUERTO',  navieraId: naviera },
        { _id: 'c3', estado: 'PUERTO',  navieraId: naviera },
        { _id: 'c4', estado: 'PUERTO',  navieraId: naviera },
      ])
      mockCiclos([
        {
          contenedorId: 'c2',
          clienteId: { nombre: 'A' },
          fechaCierre: null,
          // 5 dÃ­as, 5 libres â†’ 0 facturables â†’ freeTime
          demurrage: { fechaInicio: new Date('2025-01-15'), diasLibres: 5 },
        },
        {
          contenedorId: 'c3',
          clienteId: { nombre: 'B' },
          fechaCierre: null,
          // 10 dÃ­as, 5 libres â†’ 5 facturables â†’ primerTramo
          demurrage: { fechaInicio: new Date('2025-01-10'), diasLibres: 5 },
        },
        {
          contenedorId: 'c4',
          clienteId: { nombre: 'C' },
          fechaCierre: null,
          // 19 dÃ­as, 5 libres â†’ 14 facturables â†’ segundoTramo
          demurrage: { fechaInicio: new Date('2025-01-01'), diasLibres: 5 },
        },
      ])

      const result = await obtenerAgrupados()

      expect(result.inactivos).toHaveLength(1)
      expect(result.freeTime).toHaveLength(1)
      expect(result.primerTramo).toHaveLength(1)
      expect(result.segundoTramo).toHaveLength(1)
    })

    it('mueve a inactivos un contenedor activo que no tiene ciclo asociado', async () => {
      const naviera = makeNaviera()
      mockContenedores([{ _id: 'c1', estado: 'PUERTO', navieraId: naviera }])
      // Sin ciclos activos (situaciÃ³n anÃ³mala, pero el servicio lo maneja)
      mockCiclos([])

      const result = await obtenerAgrupados()

      expect(result.inactivos).toHaveLength(1)
    })
  })

  // ---------------------------------------------------------------------------
  // Estructura de la respuesta
  // ---------------------------------------------------------------------------
  describe('estructura de la respuesta', () => {
    it('siempre devuelve los cuatro grupos aunque estÃ©n vacÃ­os', async () => {
      mockContenedores([])
      mockCiclos([])

      const result = await obtenerAgrupados()

      expect(result).toHaveProperty('inactivos')
      expect(result).toHaveProperty('freeTime')
      expect(result).toHaveProperty('primerTramo')
      expect(result).toHaveProperty('segundoTramo')
      expect(result.inactivos).toEqual([])
      expect(result.freeTime).toEqual([])
      expect(result.primerTramo).toEqual([])
      expect(result.segundoTramo).toEqual([])
    })
  })
})

