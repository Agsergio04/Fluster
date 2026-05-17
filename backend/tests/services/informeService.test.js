jest.mock('../../src/models/Informe')
jest.mock('../../src/models/Contenedor')
jest.mock('../../src/models/Ciclo')

const Informe = require('../../src/models/Informe')
const Contenedor = require('../../src/models/Contenedor')
const Ciclo = require('../../src/models/Ciclo')
const { generar, listar, listarPorContenedor, obtenerPorId } = require('../../src/services/informeService')

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
})
