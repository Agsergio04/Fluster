jest.mock('../src/services/ocrService')

const ocrService = require('../src/services/ocrService')
const { extraerBic } = require('../src/controllers/ocrController')

describe('ocrController', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req  = { body: {} }
    res  = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    next = jest.fn()
  })

  describe('extraerBic', () => {
    it('devuelve el código BIC extraído de la imagen', async () => {
      ocrService.extraerCodigoBic.mockResolvedValue('MSCU1234567')
      req.body = { imagen: 'data:image/png;base64,...' }

      await extraerBic(req, res, next)

      expect(ocrService.extraerCodigoBic).toHaveBeenCalledWith('data:image/png;base64,...')
      expect(res.json).toHaveBeenCalledWith({ codigoBic: 'MSCU1234567' })
      expect(next).not.toHaveBeenCalled()
    })

    it('devuelve 400 si no se proporciona imagen', async () => {
      req.body = {}

      await extraerBic(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ mensaje: 'Se requiere una imagen' })
      expect(ocrService.extraerCodigoBic).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
    })

    it('devuelve null en codigoBic cuando el OCR no detecta código', async () => {
      ocrService.extraerCodigoBic.mockResolvedValue(null)
      req.body = { imagen: 'data:image/png;base64,...' }

      await extraerBic(req, res, next)

      expect(res.json).toHaveBeenCalledWith({ codigoBic: null })
    })

    it('llama a next cuando el servicio falla', async () => {
      const err = new Error('Error en el OCR')
      ocrService.extraerCodigoBic.mockRejectedValue(err)
      req.body = { imagen: 'data:image/png;base64,...' }

      await extraerBic(req, res, next)

      expect(next).toHaveBeenCalledWith(err)
    })
  })
})
