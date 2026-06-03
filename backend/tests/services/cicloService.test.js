jest.mock('../../src/models/Ciclo')
jest.mock('../../src/models/Contenedor')
jest.mock('../../src/models/Naviera')

const Ciclo = require('../../src/models/Ciclo')
const Contenedor = require('../../src/models/Contenedor')
const Naviera = require('../../src/models/Naviera')
const {
  listarPorContenedor,
  listarPorCliente,
  obtenerPorId,
  editarDemurrage,
  editarDetention,
} = require('../../src/services/cicloService')

describe('cicloService', () => {
  beforeEach(() => jest.clearAllMocks())

  // ---------------------------------------------------------------------------
  // listarPorContenedor
  // ---------------------------------------------------------------------------
  describe('listarPorContenedor', () => {
    it('devuelve los ciclos de un contenedor del más reciente al más antiguo', async () => {
      const mockCiclos = [
        { _id: 'ciclo-2', creadoEn: new Date('2025-02-01') },
        { _id: 'ciclo-1', creadoEn: new Date('2025-01-01') },
      ]
      Ciclo.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockCiclos),
        }),
      })

      const result = await listarPorContenedor('cont-id')

      expect(Ciclo.find).toHaveBeenCalledWith({ contenedorId: 'cont-id' })
      expect(result).toEqual(mockCiclos)
    })

    it('devuelve array vacío si el contenedor no tiene ciclos', async () => {
      Ciclo.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      })

      const result = await listarPorContenedor('cont-id')

      expect(result).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // listarPorCliente
  // ---------------------------------------------------------------------------
  describe('listarPorCliente', () => {
    it('devuelve los ciclos de un cliente con los datos del contenedor populados', async () => {
      const mockCiclos = [
        {
          _id: 'ciclo-1',
          clienteId: 'cli-id',
          contenedorId: { _id: 'cont-id', codigoBIC: 'MSCU1234567', tipo: '20DC', estado: 'INACTIVO' },
        },
      ]
      Ciclo.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockCiclos),
          }),
        }),
      })

      const result = await listarPorCliente('cli-id')

      expect(Ciclo.find).toHaveBeenCalledWith({ clienteId: 'cli-id' })
      expect(result).toEqual(mockCiclos)
    })

    it('popula los campos codigoBIC, tipo y estado del contenedor', async () => {
      const populateMock = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      })
      Ciclo.find.mockReturnValue({ populate: populateMock })

      await listarPorCliente('cli-id')

      expect(populateMock).toHaveBeenCalledWith('contenedorId', 'codigoBIC tipo estado')
    })

    it('devuelve array vacío si el cliente no tiene ciclos', async () => {
      Ciclo.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([]),
          }),
        }),
      })

      const result = await listarPorCliente('cli-id')

      expect(result).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // obtenerPorId
  // ---------------------------------------------------------------------------
  describe('obtenerPorId', () => {
    it('devuelve el ciclo si existe', async () => {
      const mockCiclo = {
        _id: 'ciclo-id',
        costeTotal: 750,
        fechaCierre: new Date('2025-01-20'),
      }
      Ciclo.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockCiclo) })

      const result = await obtenerPorId('ciclo-id')

      expect(result).toEqual(mockCiclo)
    })

    it('lanza error 404 si el ciclo no existe', async () => {
      Ciclo.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

      await expect(obtenerPorId('non-existent')).rejects.toMatchObject({ status: 404 })
    })
  })

  // ---------------------------------------------------------------------------
  // editarDemurrage (lógica de negocio movida desde el controlador)
  // ---------------------------------------------------------------------------
  describe('editarDemurrage', () => {
    it('lanza 404 si el ciclo no existe', async () => {
      Ciclo.findById.mockResolvedValue(null)

      await expect(editarDemurrage('no-existe', {})).rejects.toMatchObject({ status: 404 })
    })

    it('lanza 422 si la fecha de fin es anterior a la de inicio', async () => {
      Ciclo.findById.mockResolvedValue({
        demurrage: { fechaInicio: new Date('2025-01-10'), diasLibres: 5 },
      })

      await expect(
        editarDemurrage('c1', { fechaInicio: '2025-01-10', fechaFin: '2025-01-05' })
      ).rejects.toMatchObject({ status: 422 })
    })

    it('recalcula días y coste del tramo y actualiza el ciclo', async () => {
      Ciclo.findById.mockResolvedValue({
        contenedorId: 'cont1',
        fechaCierre: null,
        demurrage: { fechaInicio: new Date('2025-01-01'), diasLibres: 5 },
      })
      Contenedor.findById.mockResolvedValue({ navieraId: 'nav1' })
      Naviera.findById.mockResolvedValue({
        diasDemurrage: [{ desdeDia: 1, hastaDia: null, precioPorDia: 10 }],
      })
      const populate = jest.fn().mockResolvedValue({ _id: 'c1' })
      Ciclo.findByIdAndUpdate.mockReturnValue({ populate })

      await editarDemurrage('c1', { fechaInicio: '2025-01-01', fechaFin: '2025-01-11' })

      const setArg = Ciclo.findByIdAndUpdate.mock.calls[0][1].$set
      // 10 días naturales - 5 libres = 5 facturables * 10 €/día = 50
      expect(setArg['demurrage.diasTranscurridos']).toBe(10)
      expect(setArg['demurrage.diasFacturables']).toBe(5)
      expect(setArg['demurrage.costeTotal']).toBe(50)
      expect(populate).toHaveBeenCalledWith('clienteId', 'nombre')
    })
  })

  // ---------------------------------------------------------------------------
  // editarDetention
  // ---------------------------------------------------------------------------
  describe('editarDetention', () => {
    it('lanza 422 si el ciclo aún no tiene tramo de detention', async () => {
      Ciclo.findById.mockResolvedValue({ demurrage: {}, detention: null })

      await expect(editarDetention('c1', {})).rejects.toMatchObject({ status: 422 })
    })
  })
})
