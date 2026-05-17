jest.mock('../src/models/Ciclo')
jest.mock('../src/models/Contenedor')
jest.mock('../src/models/Naviera')

const Ciclo     = require('../src/models/Ciclo')
const Contenedor = require('../src/models/Contenedor')
const Naviera   = require('../src/models/Naviera')
const { editarDemurrage, editarDetention } = require('../src/controllers/cicloController')

const makeNaviera = () => ({
  _id: 'nav-id',
  diasDemurrage: [
    { desdeDia: 1, hastaDia: 5,    precioPorDia: 10 },
    { desdeDia: 6, hastaDia: null, precioPorDia: 20 },
  ],
  diasDetention: [
    { desdeDia: 1, hastaDia: 5,    precioPorDia: 15 },
    { desdeDia: 6, hastaDia: null, precioPorDia: 25 },
  ],
})

const makeContenedor = () => ({ _id: 'cont-id', navieraId: 'nav-id' })

describe('cicloController', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req  = { params: { id: 'ciclo-id' }, body: {} }
    res  = { json: jest.fn() }
    next = jest.fn()
  })

  // ── editarDemurrage ──────────────────────────────────────────────

  describe('editarDemurrage', () => {
    it('devuelve 404 si el ciclo no existe', async () => {
      Ciclo.findById.mockResolvedValue(null)

      await editarDemurrage(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }))
      expect(res.json).not.toHaveBeenCalled()
    })

    it('actualiza solo la fecha sin calcular costes cuando no hay fechaFin', async () => {
      const ciclo = {
        _id: 'ciclo-id',
        contenedorId: 'cont-id',
        fechaCierre: null,
        demurrage: { diasLibres: 5, fechaInicio: new Date('2025-01-01'), fechaFin: null },
      }
      const actualizado = { ...ciclo }
      Ciclo.findById.mockResolvedValue(ciclo)
      Ciclo.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(actualizado),
      })
      req.body = { fechaInicio: '2025-01-05' }

      await editarDemurrage(req, res, next)

      expect(Ciclo.findByIdAndUpdate).toHaveBeenCalledWith(
        'ciclo-id',
        { $set: expect.not.objectContaining({ 'demurrage.diasTranscurridos': expect.anything() }) },
        { new: true },
      )
      expect(res.json).toHaveBeenCalledWith(actualizado)
    })

    it('calcula dias y coste de demurrage cuando se proporciona fechaFin (ciclo abierto)', async () => {
      // 10 días entre 01-ene y 11-ene; 5 libres → 5 facturables
      // coste: 5 días × 10€ = 50€ (solo primer tramo)
      const ciclo = {
        _id: 'ciclo-id',
        contenedorId: 'cont-id',
        fechaCierre: null,
        demurrage: { diasLibres: 5, fechaInicio: new Date('2025-01-01'), fechaFin: null },
      }
      const actualizado = { ...ciclo }
      Ciclo.findById.mockResolvedValue(ciclo)
      Contenedor.findById.mockResolvedValue(makeContenedor())
      Naviera.findById.mockResolvedValue(makeNaviera())
      Ciclo.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(actualizado),
      })
      req.body = { fechaInicio: '2025-01-01', fechaFin: '2025-01-11' }

      await editarDemurrage(req, res, next)

      expect(Ciclo.findByIdAndUpdate).toHaveBeenCalledWith(
        'ciclo-id',
        {
          $set: expect.objectContaining({
            'demurrage.diasTranscurridos': 10,
            'demurrage.diasFacturables':   5,
            'demurrage.costeTotal':        50,
          }),
        },
        { new: true },
      )
      expect(res.json).toHaveBeenCalledWith(actualizado)
      expect(next).not.toHaveBeenCalled()
    })

    it('calcula coste con tramos múltiples (7 dias facturables)', async () => {
      // 7 días facturables: 5 × 10€ + 2 × 20€ = 90€
      const ciclo = {
        _id: 'ciclo-id',
        contenedorId: 'cont-id',
        fechaCierre: null,
        demurrage: { diasLibres: 5, fechaInicio: new Date('2025-01-01'), fechaFin: null },
      }
      Ciclo.findById.mockResolvedValue(ciclo)
      Contenedor.findById.mockResolvedValue(makeContenedor())
      Naviera.findById.mockResolvedValue(makeNaviera())
      Ciclo.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(ciclo),
      })
      // 17 días totales - 5 libres = 12 facturables → 5×10 + 7×20 = 190
      req.body = { fechaInicio: '2025-01-01', fechaFin: '2025-01-18' }

      await editarDemurrage(req, res, next)

      expect(Ciclo.findByIdAndUpdate).toHaveBeenCalledWith(
        'ciclo-id',
        {
          $set: expect.objectContaining({
            'demurrage.diasTranscurridos': 17,
            'demurrage.diasFacturables':   12,
            'demurrage.costeTotal':        190,
          }),
        },
        { new: true },
      )
    })

    it('actualiza también costeTotal cuando el ciclo está cerrado', async () => {
      const ciclo = {
        _id: 'ciclo-id',
        contenedorId: 'cont-id',
        fechaCierre: new Date('2025-02-01'),
        demurrage: { diasLibres: 5, fechaInicio: new Date('2025-01-01'), fechaFin: null },
        detention: { costeTotal: 100 },
      }
      Ciclo.findById.mockResolvedValue(ciclo)
      Contenedor.findById.mockResolvedValue(makeContenedor())
      Naviera.findById.mockResolvedValue(makeNaviera())
      Ciclo.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(ciclo),
      })
      req.body = { fechaInicio: '2025-01-01', fechaFin: '2025-01-11' }

      await editarDemurrage(req, res, next)

      // costeTotal = demurrage(50) + detention(100) = 150
      expect(Ciclo.findByIdAndUpdate).toHaveBeenCalledWith(
        'ciclo-id',
        { $set: expect.objectContaining({ costeTotal: 150 }) },
        { new: true },
      )
    })

    it('llama a next cuando hay un error de base de datos', async () => {
      Ciclo.findById.mockRejectedValue(new Error('DB error'))
      await editarDemurrage(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })

  // ── editarDetention ──────────────────────────────────────────────

  describe('editarDetention', () => {
    it('devuelve 404 si el ciclo no existe', async () => {
      Ciclo.findById.mockResolvedValue(null)

      await editarDetention(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }))
    })

    it('devuelve 422 si el ciclo no tiene tramo de detention', async () => {
      Ciclo.findById.mockResolvedValue({
        _id: 'ciclo-id',
        detention: null,
        demurrage: {},
      })

      await editarDetention(req, res, next)

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 422 }))
      expect(res.json).not.toHaveBeenCalled()
    })

    it('calcula dias y coste de detention cuando se proporciona fechaFin', async () => {
      // 10 días totales, 5 libres → 5 facturables
      // coste: 5 × 15€ = 75€ (solo primer tramo de detention)
      const ciclo = {
        _id: 'ciclo-id',
        contenedorId: 'cont-id',
        fechaCierre: null,
        demurrage: { costeTotal: 50 },
        detention: { diasLibres: 5, fechaInicio: new Date('2025-01-11'), fechaFin: null },
      }
      const actualizado = { ...ciclo }
      Ciclo.findById.mockResolvedValue(ciclo)
      Contenedor.findById.mockResolvedValue(makeContenedor())
      Naviera.findById.mockResolvedValue(makeNaviera())
      Ciclo.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(actualizado),
      })
      req.body = { fechaInicio: '2025-01-11', fechaFin: '2025-01-21' }

      await editarDetention(req, res, next)

      expect(Ciclo.findByIdAndUpdate).toHaveBeenCalledWith(
        'ciclo-id',
        {
          $set: expect.objectContaining({
            'detention.diasTranscurridos': 10,
            'detention.diasFacturables':   5,
            'detention.costeTotal':        75,
          }),
        },
        { new: true },
      )
      expect(res.json).toHaveBeenCalledWith(actualizado)
      expect(next).not.toHaveBeenCalled()
    })

    it('actualiza también costeTotal cuando el ciclo está cerrado', async () => {
      const ciclo = {
        _id: 'ciclo-id',
        contenedorId: 'cont-id',
        fechaCierre: new Date('2025-02-01'),
        demurrage: { costeTotal: 50 },
        detention: { diasLibres: 5, fechaInicio: new Date('2025-01-11'), fechaFin: null },
      }
      Ciclo.findById.mockResolvedValue(ciclo)
      Contenedor.findById.mockResolvedValue(makeContenedor())
      Naviera.findById.mockResolvedValue(makeNaviera())
      Ciclo.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(ciclo),
      })
      req.body = { fechaInicio: '2025-01-11', fechaFin: '2025-01-21' }

      await editarDetention(req, res, next)

      // costeTotal = demurrage(50) + detention(75) = 125
      expect(Ciclo.findByIdAndUpdate).toHaveBeenCalledWith(
        'ciclo-id',
        { $set: expect.objectContaining({ costeTotal: 125 }) },
        { new: true },
      )
    })

    it('llama a next cuando hay un error de base de datos', async () => {
      Ciclo.findById.mockRejectedValue(new Error('DB error'))
      await editarDetention(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })
})
