jest.mock('../src/services/navieraService')

const navieraService = require('../src/services/navieraService')
const { crear, listar, obtener, actualizar, eliminar } = require('../src/controllers/navieraController')

describe('navieraController', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req  = { params: {}, body: {} }
    res  = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() }
    next = jest.fn()
  })

  describe('crear', () => {
    it('devuelve 201 con la naviera creada', async () => {
      const naviera = { _id: 'n1', nombre: 'MSC', codigo: 'MSC' }
      navieraService.crear.mockResolvedValue(naviera)
      req.body = { nombre: 'MSC', codigo: 'MSC' }

      await crear(req, res, next)

      expect(navieraService.crear).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(naviera)
      expect(next).not.toHaveBeenCalled()
    })

    it('llama a next cuando el servicio falla', async () => {
      const err = new Error('Código ya existe')
      err.status = 409
      navieraService.crear.mockRejectedValue(err)
      await crear(req, res, next)
      expect(next).toHaveBeenCalledWith(err)
    })
  })

  describe('listar', () => {
    it('devuelve el array de navieras', async () => {
      const navieras = [{ _id: 'n1', nombre: 'MSC' }, { _id: 'n2', nombre: 'CMA' }]
      navieraService.listar.mockResolvedValue(navieras)

      await listar(req, res, next)

      expect(res.json).toHaveBeenCalledWith(navieras)
    })
  })

  describe('obtener', () => {
    it('devuelve la naviera por id', async () => {
      const naviera = { _id: 'n1', nombre: 'MSC' }
      navieraService.obtenerPorId.mockResolvedValue(naviera)
      req.params.id = 'n1'

      await obtener(req, res, next)

      expect(navieraService.obtenerPorId).toHaveBeenCalledWith('n1')
      expect(res.json).toHaveBeenCalledWith(naviera)
    })

    it('llama a next con 404 si la naviera no existe', async () => {
      const err = new Error('Naviera no encontrada')
      err.status = 404
      navieraService.obtenerPorId.mockRejectedValue(err)
      await obtener(req, res, next)
      expect(next).toHaveBeenCalledWith(err)
    })
  })

  describe('actualizar', () => {
    it('devuelve la naviera actualizada', async () => {
      const actualizada = { _id: 'n1', diasLibresDemurrage: 7 }
      navieraService.actualizar.mockResolvedValue(actualizada)
      req.params.id = 'n1'
      req.body = { diasLibresDemurrage: 7 }

      await actualizar(req, res, next)

      expect(navieraService.actualizar).toHaveBeenCalledWith('n1', req.body)
      expect(res.json).toHaveBeenCalledWith(actualizada)
    })
  })

  describe('eliminar', () => {
    it('devuelve 204 al eliminar correctamente', async () => {
      navieraService.eliminar.mockResolvedValue()
      req.params.id = 'n1'

      await eliminar(req, res, next)

      expect(navieraService.eliminar).toHaveBeenCalledWith('n1')
      expect(res.status).toHaveBeenCalledWith(204)
      expect(res.send).toHaveBeenCalled()
    })

    it('llama a next cuando la naviera tiene contenedores asociados', async () => {
      const err = new Error('Naviera con contenedores activos')
      err.status = 409
      navieraService.eliminar.mockRejectedValue(err)
      await eliminar(req, res, next)
      expect(next).toHaveBeenCalledWith(err)
    })
  })
})
