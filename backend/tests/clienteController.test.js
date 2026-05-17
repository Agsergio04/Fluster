jest.mock('../src/services/clienteService')

const clienteService = require('../src/services/clienteService')
const { crear, listar, obtener, actualizar, eliminar } = require('../src/controllers/clienteController')

describe('clienteController', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req  = { params: {}, body: {} }
    res  = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() }
    next = jest.fn()
  })

  describe('crear', () => {
    it('devuelve 201 con el cliente creado', async () => {
      const cliente = { _id: 'c1', nombre: 'Mercadona' }
      clienteService.crear.mockResolvedValue(cliente)
      req.body = { nombre: 'Mercadona' }

      await crear(req, res, next)

      expect(clienteService.crear).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(cliente)
      expect(next).not.toHaveBeenCalled()
    })

    it('llama a next cuando el servicio falla', async () => {
      clienteService.crear.mockRejectedValue(new Error('Error'))
      await crear(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('listar', () => {
    it('devuelve el array de clientes', async () => {
      const clientes = [{ _id: 'c1', nombre: 'Mercadona' }, { _id: 'c2', nombre: 'Lidl' }]
      clienteService.listar.mockResolvedValue(clientes)

      await listar(req, res, next)

      expect(res.json).toHaveBeenCalledWith(clientes)
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('obtener', () => {
    it('devuelve el cliente por id', async () => {
      const cliente = { _id: 'c1', nombre: 'Mercadona' }
      clienteService.obtenerPorId.mockResolvedValue(cliente)
      req.params.id = 'c1'

      await obtener(req, res, next)

      expect(clienteService.obtenerPorId).toHaveBeenCalledWith('c1')
      expect(res.json).toHaveBeenCalledWith(cliente)
    })

    it('llama a next con 404 si el cliente no existe', async () => {
      const err = new Error('Cliente no encontrado')
      err.status = 404
      clienteService.obtenerPorId.mockRejectedValue(err)

      await obtener(req, res, next)

      expect(next).toHaveBeenCalledWith(err)
    })
  })

  describe('actualizar', () => {
    it('devuelve el cliente actualizado', async () => {
      const actualizado = { _id: 'c1', nombre: 'Nuevo nombre' }
      clienteService.actualizar.mockResolvedValue(actualizado)
      req.params.id = 'c1'
      req.body = { nombre: 'Nuevo nombre' }

      await actualizar(req, res, next)

      expect(clienteService.actualizar).toHaveBeenCalledWith('c1', req.body)
      expect(res.json).toHaveBeenCalledWith(actualizado)
    })
  })

  describe('eliminar', () => {
    it('devuelve 204 al eliminar correctamente', async () => {
      clienteService.eliminar.mockResolvedValue()
      req.params.id = 'c1'

      await eliminar(req, res, next)

      expect(clienteService.eliminar).toHaveBeenCalledWith('c1')
      expect(res.status).toHaveBeenCalledWith(204)
      expect(res.send).toHaveBeenCalled()
    })

    it('llama a next cuando el cliente tiene ciclos asociados', async () => {
      const err = new Error('Cliente tiene ciclos asociados')
      err.status = 409
      clienteService.eliminar.mockRejectedValue(err)

      await eliminar(req, res, next)

      expect(next).toHaveBeenCalledWith(err)
    })
  })
})
