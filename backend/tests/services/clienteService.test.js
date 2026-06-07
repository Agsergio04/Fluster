jest.mock('../../src/models/Cliente')
jest.mock('../../src/models/Ciclo')

const Cliente = require('../../src/models/Cliente')
const Ciclo = require('../../src/models/Ciclo')
const { crear, listar, obtenerPorId, actualizar, eliminar } = require('../../src/services/clienteService')

describe('clienteService', () => {
  beforeEach(() => jest.clearAllMocks())

  // ---------------------------------------------------------------------------
  // crear
  // ---------------------------------------------------------------------------
  describe('crear', () => {
    it('crea un cliente nuevo cuando no existe otro con ese nombre', async () => {
      const mockCliente = { _id: 'cli-id', nombre: 'Mercadona' }
      Cliente.findOne.mockReturnValue({ collation: jest.fn().mockResolvedValue(null) })
      Cliente.create.mockResolvedValue(mockCliente)

      const result = await crear({ nombre: 'Mercadona' })

      expect(Cliente.create).toHaveBeenCalledWith({ nombre: 'Mercadona' })
      expect(result).toEqual(mockCliente)
    })

    it('reutiliza el cliente existente (sin distinguir mayúsculas) en vez de duplicarlo', async () => {
      const existente = { _id: 'cli-id', nombre: 'Mercadona' }
      Cliente.findOne.mockReturnValue({ collation: jest.fn().mockResolvedValue(existente) })

      const result = await crear({ nombre: '  mercadona  ' })

      expect(Cliente.findOne).toHaveBeenCalledWith({ nombre: 'mercadona' })
      expect(Cliente.create).not.toHaveBeenCalled()
      expect(result).toEqual(existente)
    })
  })

  // ---------------------------------------------------------------------------
  // listar
  // ---------------------------------------------------------------------------
  describe('listar', () => {
    it('devuelve todos los clientes', async () => {
      const mockClientes = [
        { _id: 'cli-1', nombre: 'Mercadona' },
        { _id: 'cli-2', nombre: 'Lidl' },
      ]
      Cliente.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockClientes) })

      const result = await listar()

      expect(result).toEqual(mockClientes)
      expect(Cliente.find).toHaveBeenCalled()
    })

    it('devuelve array vacío si no hay clientes', async () => {
      Cliente.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) })

      const result = await listar()

      expect(result).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // obtenerPorId
  // ---------------------------------------------------------------------------
  describe('obtenerPorId', () => {
    it('devuelve el cliente si existe', async () => {
      const mockCliente = { _id: 'cli-id', nombre: 'Mercadona' }
      Cliente.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockCliente) })

      const result = await obtenerPorId('cli-id')

      expect(result).toEqual(mockCliente)
    })

    it('lanza error 404 si el cliente no existe', async () => {
      Cliente.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

      await expect(obtenerPorId('non-existent')).rejects.toMatchObject({ status: 404 })
    })
  })

  // ---------------------------------------------------------------------------
  // actualizar
  // ---------------------------------------------------------------------------
  describe('actualizar', () => {
    it('actualiza el nombre del cliente correctamente', async () => {
      const updated = { _id: 'cli-id', nombre: 'Nuevo Nombre' }
      Cliente.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(updated) })

      const result = await actualizar('cli-id', { nombre: 'Nuevo Nombre' })

      expect(Cliente.findByIdAndUpdate).toHaveBeenCalledWith(
        'cli-id',
        { nombre: 'Nuevo Nombre' },
        { new: true, runValidators: true }
      )
      expect(result.nombre).toBe('Nuevo Nombre')
    })

    it('lanza error 404 si el cliente no existe', async () => {
      Cliente.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

      await expect(actualizar('non-existent', { nombre: 'Test' })).rejects.toMatchObject({ status: 404 })
    })
  })

  // ---------------------------------------------------------------------------
  // eliminar
  // ---------------------------------------------------------------------------
  describe('eliminar', () => {
    it('elimina el cliente si no tiene ciclos asociados', async () => {
      const mockCliente = { _id: 'cli-id', nombre: 'Mercadona', deleteOne: jest.fn().mockResolvedValue({}) }
      Cliente.findById.mockResolvedValue(mockCliente)
      Ciclo.exists.mockResolvedValue(null)

      await expect(eliminar('cli-id')).resolves.not.toThrow()
      expect(mockCliente.deleteOne).toHaveBeenCalled()
    })

    it('lanza error 409 si el cliente tiene ciclos asociados', async () => {
      const mockCliente = { _id: 'cli-id', nombre: 'Mercadona', deleteOne: jest.fn() }
      Cliente.findById.mockResolvedValue(mockCliente)
      Ciclo.exists.mockResolvedValue({ _id: 'ciclo-id' })

      await expect(eliminar('cli-id')).rejects.toMatchObject({ status: 409 })
      expect(mockCliente.deleteOne).not.toHaveBeenCalled()
    })

    it('lanza error 404 si el cliente no existe', async () => {
      Cliente.findById.mockResolvedValue(null)

      await expect(eliminar('non-existent')).rejects.toMatchObject({ status: 404 })
    })
  })
})
