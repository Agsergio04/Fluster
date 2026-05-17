jest.mock('../src/services/eventoService')

const eventoService = require('../src/services/eventoService')
const { registrar, listarPorContenedor } = require('../src/controllers/eventoController')

describe('eventoController', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req  = { params: {}, body: {}, usuario: { id: 'user-id' } }
    res  = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    next = jest.fn()
  })

  describe('registrar', () => {
    it('devuelve 201 con el evento creado incluyendo registradoPor', async () => {
      const evento = { _id: 'ev1', tipo: 'entrada_puerto', contenedorId: 'c1', registradoPor: 'user-id' }
      eventoService.registrar.mockResolvedValue(evento)
      req.body = { tipo: 'entrada_puerto', contenedorId: 'c1' }
      req.usuario.id = 'user-id'

      await registrar(req, res, next)

      expect(eventoService.registrar).toHaveBeenCalledWith({
        tipo: 'entrada_puerto',
        contenedorId: 'c1',
        registradoPor: 'user-id',
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(evento)
      expect(next).not.toHaveBeenCalled()
    })

    it('llama a next cuando el servicio falla', async () => {
      eventoService.registrar.mockRejectedValue(new Error('Error'))
      await registrar(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('listarPorContenedor', () => {
    it('devuelve los eventos del contenedor', async () => {
      const eventos = [{ _id: 'ev1' }, { _id: 'ev2' }]
      eventoService.listarPorContenedor.mockResolvedValue(eventos)
      req.params.contenedorId = 'c1'

      await listarPorContenedor(req, res, next)

      expect(eventoService.listarPorContenedor).toHaveBeenCalledWith('c1')
      expect(res.json).toHaveBeenCalledWith(eventos)
    })

    it('llama a next cuando el servicio falla', async () => {
      eventoService.listarPorContenedor.mockRejectedValue(new Error('Error'))
      await listarPorContenedor(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })
})
