jest.mock('../src/services/informeService')

const informeService = require('../src/services/informeService')
const { generar, listar, listarPorContenedor, obtener, generarDatos } = require('../src/controllers/informeController')

describe('informeController', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req  = { params: {}, body: {}, query: {}, usuario: { id: 'user-id' } }
    res  = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    next = jest.fn()
  })

  describe('generar', () => {
    it('devuelve 201 con el informe generado incluyendo generadoPor', async () => {
      const informe = { _id: 'inf1', contenedorId: 'c1', generadoPor: 'user-id' }
      informeService.generar.mockResolvedValue(informe)
      req.body = { contenedorId: 'c1', cicloId: 'cic1' }

      await generar(req, res, next)

      expect(informeService.generar).toHaveBeenCalledWith({
        contenedorId: 'c1',
        cicloId: 'cic1',
        generadoPor: 'user-id',
      })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(informe)
      expect(next).not.toHaveBeenCalled()
    })

    it('llama a next cuando el servicio falla', async () => {
      const err = new Error('Ciclo no cerrado')
      err.status = 422
      informeService.generar.mockRejectedValue(err)
      await generar(req, res, next)
      expect(next).toHaveBeenCalledWith(err)
    })
  })

  describe('listar', () => {
    it('devuelve la lista de informes con los filtros de query', async () => {
      const informes = [{ _id: 'inf1' }, { _id: 'inf2' }]
      informeService.listar.mockResolvedValue(informes)
      req.query = { naviera: 'MSC' }

      await listar(req, res, next)

      expect(informeService.listar).toHaveBeenCalledWith(req.query)
      expect(res.json).toHaveBeenCalledWith(informes)
    })
  })

  describe('listarPorContenedor', () => {
    it('devuelve los informes del contenedor indicado', async () => {
      const informes = [{ _id: 'inf1', contenedorId: 'c1' }]
      informeService.listarPorContenedor.mockResolvedValue(informes)
      req.params.contenedorId = 'c1'

      await listarPorContenedor(req, res, next)

      expect(informeService.listarPorContenedor).toHaveBeenCalledWith('c1')
      expect(res.json).toHaveBeenCalledWith(informes)
    })
  })

  describe('obtener', () => {
    it('devuelve el informe por id', async () => {
      const informe = { _id: 'inf1' }
      informeService.obtenerPorId.mockResolvedValue(informe)
      req.params.id = 'inf1'

      await obtener(req, res, next)

      expect(informeService.obtenerPorId).toHaveBeenCalledWith('inf1')
      expect(res.json).toHaveBeenCalledWith(informe)
    })

    it('llama a next con 404 si el informe no existe', async () => {
      const err = new Error('Informe no encontrado')
      err.status = 404
      informeService.obtenerPorId.mockRejectedValue(err)
      await obtener(req, res, next)
      expect(next).toHaveBeenCalledWith(err)
    })
  })

  describe('generarDatos', () => {
    it('devuelve los ciclos filtrados para la generación del PDF', async () => {
      const ciclos = [{ _id: 'cic1' }, { _id: 'cic2' }]
      informeService.generarDatos.mockResolvedValue(ciclos)
      req.query = { fechaDesde: '2025-01-01', fechaHasta: '2025-12-31' }

      await generarDatos(req, res, next)

      expect(informeService.generarDatos).toHaveBeenCalledWith(req.query)
      expect(res.json).toHaveBeenCalledWith(ciclos)
    })

    it('llama a next cuando el servicio falla', async () => {
      informeService.generarDatos.mockRejectedValue(new Error('Error'))
      await generarDatos(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })
})
