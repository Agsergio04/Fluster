jest.mock('../src/services/semaforoService')

const semaforoService = require('../src/services/semaforoService')
const { obtenerAgrupados } = require('../src/controllers/semaforoController')

describe('semaforoController', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req  = {}
    res  = { json: jest.fn() }
    next = jest.fn()
  })

  describe('obtenerAgrupados', () => {
    it('devuelve los contenedores agrupados por tramo', async () => {
      const grupos = {
        freeTime:     [{ _id: 'c1' }],
        primerTramo:  [],
        segundoTramo: [],
        inactivos:    [{ _id: 'c2' }],
      }
      semaforoService.obtenerAgrupados.mockResolvedValue(grupos)

      await obtenerAgrupados(req, res, next)

      expect(semaforoService.obtenerAgrupados).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith(grupos)
      expect(next).not.toHaveBeenCalled()
    })

    it('llama a next cuando el servicio falla', async () => {
      const err = new Error('Error de base de datos')
      semaforoService.obtenerAgrupados.mockRejectedValue(err)

      await obtenerAgrupados(req, res, next)

      expect(next).toHaveBeenCalledWith(err)
      expect(res.json).not.toHaveBeenCalled()
    })
  })
})
