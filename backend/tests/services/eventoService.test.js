jest.mock('../../src/models/Evento')
jest.mock('../../src/models/Contenedor')

const Evento = require('../../src/models/Evento')
const Contenedor = require('../../src/models/Contenedor')
const { registrar, listarPorContenedor } = require('../../src/services/eventoService')

describe('eventoService', () => {
  beforeEach(() => jest.clearAllMocks())

  const datosEvento = {
    contenedorId: 'cont-id',
    tipo: 'entrada_puerto',
    timestamp: new Date('2025-01-10'),
    fotoUrl: 'http://storage/foto.jpg',
    codigoBICOcr: 'MSCU1234567',
    ocrValidado: true,
    registradoPor: 'user-id',
  }

  // ---------------------------------------------------------------------------
  // registrar
  // ---------------------------------------------------------------------------
  describe('registrar', () => {
    it('crea el evento si el contenedor existe', async () => {
      const mockEvento = { _id: 'evt-id', ...datosEvento }
      Contenedor.findById.mockResolvedValue({ _id: 'cont-id' })
      Evento.create.mockResolvedValue(mockEvento)

      const result = await registrar(datosEvento)

      expect(Contenedor.findById).toHaveBeenCalledWith('cont-id')
      expect(Evento.create).toHaveBeenCalledWith(expect.objectContaining({
        contenedorId: 'cont-id',
        tipo: 'entrada_puerto',
        registradoPor: 'user-id',
      }))
      expect(result).toEqual(mockEvento)
    })

    it('lanza error 404 si el contenedor no existe', async () => {
      Contenedor.findById.mockResolvedValue(null)

      await expect(registrar(datosEvento)).rejects.toMatchObject({ status: 404 })
      expect(Evento.create).not.toHaveBeenCalled()
    })

    it('registra el evento con fotoUrl y datos OCR', async () => {
      Contenedor.findById.mockResolvedValue({ _id: 'cont-id' })
      Evento.create.mockResolvedValue({ _id: 'evt-id' })

      await registrar(datosEvento)

      expect(Evento.create).toHaveBeenCalledWith(expect.objectContaining({
        fotoUrl: 'http://storage/foto.jpg',
        codigoBICOcr: 'MSCU1234567',
        ocrValidado: true,
      }))
    })

    it('registra el evento sin foto cuando no se proporciona fotoUrl', async () => {
      const datosSinFoto = { ...datosEvento, fotoUrl: undefined, codigoBICOcr: undefined, ocrValidado: undefined }
      Contenedor.findById.mockResolvedValue({ _id: 'cont-id' })
      Evento.create.mockResolvedValue({ _id: 'evt-id' })

      await expect(registrar(datosSinFoto)).resolves.not.toThrow()
    })
  })

  // ---------------------------------------------------------------------------
  // listarPorContenedor
  // ---------------------------------------------------------------------------
  describe('listarPorContenedor', () => {
    it('devuelve los eventos de un contenedor ordenados cronológicamente', async () => {
      const mockEventos = [
        { _id: 'evt-1', tipo: 'entrada_puerto', timestamp: new Date('2025-01-10') },
        { _id: 'evt-2', tipo: 'salida_puerto',  timestamp: new Date('2025-01-20') },
      ]
      Evento.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockEventos),
        }),
      })

      const result = await listarPorContenedor('cont-id')

      expect(Evento.find).toHaveBeenCalledWith({ contenedorId: 'cont-id' })
      expect(result).toEqual(mockEventos)
    })

    it('devuelve array vacío si el contenedor no tiene eventos', async () => {
      Evento.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      })

      const result = await listarPorContenedor('cont-id')

      expect(result).toEqual([])
    })
  })
})
