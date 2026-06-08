jest.mock('../../src/models/Informe')
jest.mock('../../src/models/Contenedor')
jest.mock('../../src/models/Ciclo')

const Informe = require('../../src/models/Informe')
const Contenedor = require('../../src/models/Contenedor')
const Ciclo = require('../../src/models/Ciclo')
const { generar, listar, listarPorContenedor, obtenerPorId, generarDatos } = require('../../src/services/informeService')

describe('informeService', () => {
  beforeEach(() => jest.clearAllMocks())

  const mockContenedor = { _id: 'cont-id', codigoBIC: 'MSCU1234567' }
  const mockCiclo = {
    _id: 'ciclo-id',
    fechaCierre: new Date('2025-01-20'),
    clienteId: { nombre: 'Mercadona' },
  }
  const mockCicloPendiente = { _id: 'ciclo-id', fechaCierre: null, clienteId: { nombre: 'Mercadona' } }

  // ---------------------------------------------------------------------------
  // generar
  // ---------------------------------------------------------------------------
  describe('generar', () => {
    it('registra el informe cuando el ciclo está cerrado', async () => {
      const mockInforme = {
        _id: 'inf-id',
        contenedorId: 'cont-id',
        cicloId: 'ciclo-id',
        codigoBIC: 'MSCU1234567',
        cliente: 'Mercadona',
        generadoPor: 'user-id',
      }
      Contenedor.findById.mockResolvedValue(mockContenedor)
      Ciclo.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockCiclo) })
      Informe.create.mockResolvedValue(mockInforme)

      const result = await generar({ contenedorId: 'cont-id', cicloId: 'ciclo-id', generadoPor: 'user-id' })

      expect(result).toEqual(mockInforme)
    })

    it('guarda el codigoBIC del contenedor como snapshot en el informe', async () => {
      Contenedor.findById.mockResolvedValue(mockContenedor)
      Ciclo.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockCiclo) })
      Informe.create.mockResolvedValue({})

      await generar({ contenedorId: 'cont-id', cicloId: 'ciclo-id', generadoPor: 'user-id' })

      expect(Informe.create).toHaveBeenCalledWith(expect.objectContaining({
        codigoBIC: 'MSCU1234567',
        cliente: 'Mercadona',
      }))
    })

    it('lanza error 422 si el ciclo aún no está cerrado', async () => {
      Contenedor.findById.mockResolvedValue(mockContenedor)
      Ciclo.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockCicloPendiente) })

      await expect(
        generar({ contenedorId: 'cont-id', cicloId: 'ciclo-id', generadoPor: 'user-id' })
      ).rejects.toMatchObject({ status: 422 })

      expect(Informe.create).not.toHaveBeenCalled()
    })

    it('lanza error 404 si el contenedor no existe', async () => {
      Contenedor.findById.mockResolvedValue(null)
      Ciclo.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockCiclo) })

      await expect(
        generar({ contenedorId: 'no-existe', cicloId: 'ciclo-id', generadoPor: 'user-id' })
      ).rejects.toMatchObject({ status: 404 })
    })

    it('lanza error 404 si el ciclo no existe', async () => {
      Contenedor.findById.mockResolvedValue(mockContenedor)
      Ciclo.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) })

      await expect(
        generar({ contenedorId: 'cont-id', cicloId: 'no-existe', generadoPor: 'user-id' })
      ).rejects.toMatchObject({ status: 404 })
    })
  })

  // ---------------------------------------------------------------------------
  // listar
  // ---------------------------------------------------------------------------
  describe('listar', () => {
    it('devuelve todos los informes sin filtros', async () => {
      const mockInformes = [{ _id: 'inf-1' }, { _id: 'inf-2' }]
      Informe.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockInformes),
        }),
      })

      const result = await listar()

      expect(Informe.find).toHaveBeenCalledWith({})
      expect(result).toEqual(mockInformes)
    })

    it('filtra por nombre de cliente (búsqueda parcial, insensible a mayúsculas)', async () => {
      Informe.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      })

      await listar({ cliente: 'merca' })

      expect(Informe.find).toHaveBeenCalledWith(
        expect.objectContaining({
          cliente: { $regex: 'merca', $options: 'i' },
        })
      )
    })

    it('filtra por contenedorId cuando se proporciona', async () => {
      Informe.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      })

      await listar({ contenedorId: 'cont-id' })

      expect(Informe.find).toHaveBeenCalledWith(
        expect.objectContaining({ contenedorId: 'cont-id' })
      )
    })
  })

  // ---------------------------------------------------------------------------
  // listarPorContenedor
  // ---------------------------------------------------------------------------
  describe('listarPorContenedor', () => {
    it('devuelve los informes de un contenedor del más reciente al más antiguo', async () => {
      const mockInformes = [{ _id: 'inf-2' }, { _id: 'inf-1' }]
      Informe.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockInformes),
        }),
      })

      const result = await listarPorContenedor('cont-id')

      expect(Informe.find).toHaveBeenCalledWith({ contenedorId: 'cont-id' })
      expect(result).toEqual(mockInformes)
    })
  })

  // ---------------------------------------------------------------------------
  // obtenerPorId
  // ---------------------------------------------------------------------------
  describe('obtenerPorId', () => {
    it('devuelve el informe con el ciclo populado', async () => {
      const mockInforme = { _id: 'inf-id', cicloId: { _id: 'ciclo-id', costeTotal: 500 } }
      Informe.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockInforme),
        }),
      })

      const result = await obtenerPorId('inf-id')

      expect(result).toEqual(mockInforme)
    })

    it('lanza error 404 si el informe no existe', async () => {
      Informe.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      })

      await expect(obtenerPorId('non-existent')).rejects.toMatchObject({ status: 404 })
    })
  })

  // ---------------------------------------------------------------------------
  // generarDatos (datos de ciclos cerrados para el PDF; filtros y orden)
  // ---------------------------------------------------------------------------
  describe('generarDatos', () => {
    // Simula la cadena Ciclo.find(query).populate().populate().sort().lean()
    function mockFind(fixtures) {
      Ciclo.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(fixtures),
            }),
          }),
        }),
      })
    }

    // Tres ciclos cerrados: A y B el mismo día (BIC distinto), C un día antes
    const cA = { fechaCierre: new Date('2025-01-10'), contenedorId: { codigoBIC: 'ZZZU0000000' } }
    const cB = { fechaCierre: new Date('2025-01-10'), contenedorId: { codigoBIC: 'AAAU0000000' } }
    const cC = { fechaCierre: new Date('2025-01-05'), contenedorId: { codigoBIC: 'MMMU0000000' } }

    it('solo devuelve ciclos cerrados (fechaCierre != null)', async () => {
      mockFind([])
      await generarDatos({})
      expect(Ciclo.find).toHaveBeenCalledWith(
        expect.objectContaining({ fechaCierre: { $ne: null } })
      )
    })

    it('el rango Desde/Hasta tiene prioridad: la fecha específica se ignora si hay rango', async () => {
      mockFind([])
      await generarDatos({ fechaDesde: '2025-01-01', fechaHasta: '2025-01-31', fechaEspecifica: '2025-06-15' })

      const query = Ciclo.find.mock.calls[0][0]
      // Manda el rango: el $gte es el 1 de enero, no el 15 de junio de la fecha específica
      expect(query.fechaCierre.$gte).toEqual(new Date('2025-01-01'))
      expect(query.fechaCierre.$gte.getTime()).not.toBe(new Date('2025-06-15').getTime())
    })

    it('la fecha específica sí se aplica cuando no hay rango', async () => {
      mockFind([])
      await generarDatos({ fechaEspecifica: '2025-06-15' })

      const query = Ciclo.find.mock.calls[0][0]
      expect(query.fechaCierre.$gte).toEqual(new Date('2025-06-15'))
      expect(query.fechaCierre.$lte.getHours()).toBe(23) // fin del día
    })

    it('combina el orden por fecha (asc) con el BIC como desempate alfabético', async () => {
      mockFind([cA, cB, cC])
      const result = await generarDatos({ ordenAscendente: 'true', ordenAlfabetico: 'true' })

      // Principal por fecha asc (C antes que A/B) y, mismo día, BIC alfabético (B antes que A)
      expect(result.map(c => c.contenedorId.codigoBIC)).toEqual([
        'MMMU0000000', 'AAAU0000000', 'ZZZU0000000',
      ])
    })

    it('ordena solo por BIC cuando únicamente se marca el alfabético', async () => {
      mockFind([cA, cB, cC])
      const result = await generarDatos({ ordenAlfabetico: 'true' })

      expect(result.map(c => c.contenedorId.codigoBIC)).toEqual([
        'AAAU0000000', 'MMMU0000000', 'ZZZU0000000',
      ])
    })
  })
})
