jest.mock('../../src/models/Naviera')
jest.mock('../../src/models/Contenedor')

const Naviera = require('../../src/models/Naviera')
const Contenedor = require('../../src/models/Contenedor')
const { crear, listar, obtenerPorId, actualizar, eliminar } = require('../../src/services/navieraService')

describe('navieraService', () => {
  beforeEach(() => jest.clearAllMocks())

  const mockNaviera = {
    _id: 'nav-id',
    nombre: 'MSC',
    codigo: 'MSC',
    diasLibresDemurrage: 5,
    diasLibresDetention: 7,
    diasDemurrage: [{ desdeDia: 1, hastaDia: null, precioPorDia: 50 }],
    diasDetention: [{ desdeDia: 1, hastaDia: null, precioPorDia: 30 }],
  }

  // ---------------------------------------------------------------------------
  // crear
  // ---------------------------------------------------------------------------
  describe('crear', () => {
    it('crea una naviera y devuelve el objeto creado', async () => {
      Naviera.create.mockResolvedValue(mockNaviera)

      const result = await crear(mockNaviera)

      expect(Naviera.create).toHaveBeenCalledWith(mockNaviera)
      expect(result).toEqual(mockNaviera)
    })
  })

  // ---------------------------------------------------------------------------
  // listar
  // ---------------------------------------------------------------------------
  describe('listar', () => {
    beforeEach(() => {
      // recrearNavierasHuerfanas() llama a Contenedor.find().lean() internamente
      Contenedor.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) })
    })

    it('devuelve todas las navieras', async () => {
      Naviera.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([mockNaviera]) })

      const result = await listar()

      expect(result).toEqual([mockNaviera])
    })

    it('devuelve array vacío si no hay navieras', async () => {
      Naviera.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) })

      const result = await listar()

      expect(result).toEqual([])
    })
  })

  // ---------------------------------------------------------------------------
  // obtenerPorId
  // ---------------------------------------------------------------------------
  describe('obtenerPorId', () => {
    it('devuelve la naviera si existe', async () => {
      Naviera.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockNaviera) })

      const result = await obtenerPorId('nav-id')

      expect(result).toEqual(mockNaviera)
    })

    it('lanza error 404 si la naviera no existe', async () => {
      Naviera.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

      await expect(obtenerPorId('non-existent')).rejects.toMatchObject({ status: 404 })
    })
  })

  // ---------------------------------------------------------------------------
  // actualizar
  // ---------------------------------------------------------------------------
  describe('actualizar', () => {
    it('actualiza la naviera correctamente cuando no se cambia el código', async () => {
      const updated = { ...mockNaviera, nombre: 'MSC Lines' }
      Naviera.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(updated) })

      const result = await actualizar('nav-id', { nombre: 'MSC Lines' })

      expect(Naviera.findOne).not.toHaveBeenCalled()
      expect(result.nombre).toBe('MSC Lines')
    })

    it('verifica duplicados cuando se cambia el código y no hay conflicto', async () => {
      const updated = { ...mockNaviera, codigo: 'MSCK' }
      Naviera.findOne.mockResolvedValue(null)
      Naviera.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(updated) })

      const result = await actualizar('nav-id', { codigo: 'msck' })

      expect(Naviera.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ codigo: 'MSCK' })
      )
      expect(result.codigo).toBe('MSCK')
    })

    it('lanza error 409 si el nuevo código ya existe en otra naviera', async () => {
      Naviera.findOne.mockResolvedValue({ _id: 'otra-nav', codigo: 'CMA' })

      await expect(actualizar('nav-id', { codigo: 'cma' })).rejects.toMatchObject({ status: 409 })
      expect(Naviera.findByIdAndUpdate).not.toHaveBeenCalled()
    })

    it('lanza error 404 si la naviera no existe', async () => {
      Naviera.findByIdAndUpdate.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })

      await expect(actualizar('non-existent', { nombre: 'Test' })).rejects.toMatchObject({ status: 404 })
    })
  })

  // ---------------------------------------------------------------------------
  // eliminar
  // ---------------------------------------------------------------------------
  describe('eliminar', () => {
    it('elimina la naviera si no tiene contenedores asociados', async () => {
      const nav = { ...mockNaviera, deleteOne: jest.fn().mockResolvedValue({}) }
      Naviera.findById.mockResolvedValue(nav)
      Contenedor.exists.mockResolvedValue(null)

      await expect(eliminar('nav-id')).resolves.not.toThrow()
      expect(nav.deleteOne).toHaveBeenCalled()
    })

    it('lanza error 409 si la naviera tiene contenedores asociados', async () => {
      const nav = { ...mockNaviera, deleteOne: jest.fn() }
      Naviera.findById.mockResolvedValue(nav)
      Contenedor.exists.mockResolvedValue({ _id: 'cont-id' })

      await expect(eliminar('nav-id')).rejects.toMatchObject({ status: 409 })
      expect(nav.deleteOne).not.toHaveBeenCalled()
    })

it('lanza error 404 si la naviera no existe', async () => {
      Naviera.findById.mockResolvedValue(null)

      await expect(eliminar('non-existent')).rejects.toMatchObject({ status: 404 })
    })
  })
})
