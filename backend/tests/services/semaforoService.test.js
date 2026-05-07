jest.mock('../../src/models/Contenedor')
jest.mock('../../src/models/Ciclo')

const Contenedor = require('../../src/models/Contenedor')
const Ciclo = require('../../src/models/Ciclo')
const { obtenerAgrupados } = require('../../src/services/semaforoService')

// Fijar la fecha del sistema para que los cálculos de días sean deterministas
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
  // Clasificación individual
  // ---------------------------------------------------------------------------
  describe('clasificación por grupo', () => {
    it('clasifica los contenedores INACTIVO en el grupo inactivos', async () => {
      mockContenedores([{ _id: 'c1', estado: 'INACTIVO', navieraId: makeNaviera() }])
      mockCiclos([])

      const result = await obtenerAgrupados()

      expect(result.inactivos).toHaveLength(1)
      expect(result.freeTime).toHaveLength(0)
      expect(result.primerTramo).toHaveLength(0)
      expect(result.segundoTramo).toHaveLength(0)
    })

    it('clasifica en freeTime cuando los días transcurridos no superan los días libres', async () => {
      // Hoy: 2025-01-20. Inicio: 2025-01-15 → 5 días transcurridos, diasLibres=5 → 0 facturables
      mockContenedores([{ _id: 'c1', estado: 'CARGADO', navieraId: makeNaviera() }])
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

    it('clasifica en primerTramo cuando los días facturables están dentro del primer tramo', async () => {
      // Hoy: 2025-01-20. Inicio: 2025-01-10 → 10 días transcurridos, diasLibres=5 → 5 facturables
      // primerTramo.hastaDia = 5 → diasFacturables(5) <= 5 → primerTramo
      mockContenedores([{ _id: 'c1', estado: 'CARGADO', navieraId: makeNaviera() }])
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

    it('clasifica en segundoTramo cuando los días facturables superan el primer tramo', async () => {
      // Hoy: 2025-01-20. Inicio: 2025-01-01 → 19 días transcurridos, diasLibres=5 → 14 facturables
      // primerTramo.hastaDia = 5 → diasFacturables(14) > 5 → segundoTramo
      mockContenedores([{ _id: 'c1', estado: 'CARGADO', navieraId: makeNaviera() }])
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
      // Hoy: 2025-01-20. Inicio detention: 2025-01-10 → 10 días, diasLibres=5 → 5 facturables
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
  // Datos añadidos al campo _semaforo
  // ---------------------------------------------------------------------------
  describe('campo _semaforo', () => {
    it('incluye el nombre del cliente en _semaforo', async () => {
      mockContenedores([{ _id: 'c1', estado: 'CARGADO', navieraId: makeNaviera() }])
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
      mockContenedores([{ _id: 'c1', estado: 'CARGADO', navieraId: makeNaviera() }])
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
  // Múltiples contenedores
  // ---------------------------------------------------------------------------
  describe('múltiples contenedores', () => {
    it('distribuye correctamente varios contenedores en sus grupos', async () => {
      const naviera = makeNaviera()
      mockContenedores([
        { _id: 'c1', estado: 'INACTIVO', navieraId: naviera },
        { _id: 'c2', estado: 'CARGADO',  navieraId: naviera },
        { _id: 'c3', estado: 'CARGADO',  navieraId: naviera },
        { _id: 'c4', estado: 'CARGADO',  navieraId: naviera },
      ])
      mockCiclos([
        {
          contenedorId: 'c2',
          clienteId: { nombre: 'A' },
          fechaCierre: null,
          // 5 días, 5 libres → 0 facturables → freeTime
          demurrage: { fechaInicio: new Date('2025-01-15'), diasLibres: 5 },
        },
        {
          contenedorId: 'c3',
          clienteId: { nombre: 'B' },
          fechaCierre: null,
          // 10 días, 5 libres → 5 facturables → primerTramo
          demurrage: { fechaInicio: new Date('2025-01-10'), diasLibres: 5 },
        },
        {
          contenedorId: 'c4',
          clienteId: { nombre: 'C' },
          fechaCierre: null,
          // 19 días, 5 libres → 14 facturables → segundoTramo
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
      mockContenedores([{ _id: 'c1', estado: 'CARGADO', navieraId: naviera }])
      // Sin ciclos activos (situación anómala, pero el servicio lo maneja)
      mockCiclos([])

      const result = await obtenerAgrupados()

      expect(result.inactivos).toHaveLength(1)
    })
  })

  // ---------------------------------------------------------------------------
  // Estructura de la respuesta
  // ---------------------------------------------------------------------------
  describe('estructura de la respuesta', () => {
    it('siempre devuelve los cuatro grupos aunque estén vacíos', async () => {
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
