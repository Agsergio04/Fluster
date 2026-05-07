jest.mock('../../src/models/Ciclo')

const Ciclo = require('../../src/models/Ciclo')
const { listarPorContenedor, listarPorCliente, obtenerPorId } = require('../../src/services/cicloService')

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
})
