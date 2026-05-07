jest.mock('../../src/models/Contenedor')
jest.mock('../../src/models/Naviera')
jest.mock('../../src/models/Ciclo')

const Contenedor = require('../../src/models/Contenedor')
const Naviera = require('../../src/models/Naviera')
const Ciclo = require('../../src/models/Ciclo')
const {
  registrarEntradaPuerto,
  registrarSalidaPuerto,
  registrarDevolucion,
  cancelarCiclo,
} = require('../../src/services/contenedorService')

// ---------------------------------------------------------------------------
// Factories para objetos de prueba reutilizables
// ---------------------------------------------------------------------------

function makeContenedor(estado = 'INACTIVO', overrides = {}) {
  return {
    _id: 'cont-id',
    estado,
    navieraId: 'naviera-id',
    fechaInicioLibre: new Date('2025-01-01'),
    ...overrides,
  }
}

function makeNaviera(overrides = {}) {
  return {
    _id: 'naviera-id',
    diasLibresDemurrage: 5,
    diasLibresDetention: 7,
    diasDemurrage: [
      { desdeDia: 1, hastaDia: 5, precioPorDia: 50 },
      { desdeDia: 6, hastaDia: null, precioPorDia: 100 },
    ],
    diasDetention: [
      { desdeDia: 1, hastaDia: 5, precioPorDia: 30 },
      { desdeDia: 6, hastaDia: null, precioPorDia: 60 },
    ],
    ...overrides,
  }
}

function makeCiclo(overrides = {}) {
  return {
    _id: 'ciclo-id',
    demurrage: {
      fechaInicio: new Date('2025-01-01'),
      diasLibres: 5,
      costeTotal: 0,
    },
    detention: {
      fechaInicio: new Date('2025-01-11'),
      diasLibres: 7,
    },
    ...overrides,
  }
}

describe('contenedorService', () => {
  beforeEach(() => jest.clearAllMocks())

  // ---------------------------------------------------------------------------
  // registrarEntradaPuerto (INACTIVO → CARGADO)
  // ---------------------------------------------------------------------------
  describe('registrarEntradaPuerto', () => {
    it('transiciona de INACTIVO a CARGADO y crea un ciclo con los días libres de la naviera', async () => {
      const contenedor = makeContenedor('INACTIVO')
      const naviera = makeNaviera()

      Contenedor.findById.mockResolvedValue(contenedor)
      Naviera.findById.mockResolvedValue(naviera)
      Ciclo.create.mockResolvedValue({})
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...contenedor, estado: 'CARGADO' }),
      })

      const result = await registrarEntradaPuerto('cont-id', new Date('2025-02-01'), 'cliente-id')

      expect(Ciclo.create).toHaveBeenCalledWith(expect.objectContaining({
        contenedorId: 'cont-id',
        clienteId: 'cliente-id',
        demurrage: expect.objectContaining({ diasLibres: 5 }),
      }))
      expect(result.estado).toBe('CARGADO')
    })

    it('el ciclo se crea con fechaInicio = fechaInicioLibre del contenedor (no la fecha física de entrada)', async () => {
      const contenedor = makeContenedor('INACTIVO', { fechaInicioLibre: new Date('2025-01-15') })

      Contenedor.findById.mockResolvedValue(contenedor)
      Naviera.findById.mockResolvedValue(makeNaviera())
      Ciclo.create.mockResolvedValue({})
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...contenedor, estado: 'CARGADO' }),
      })

      await registrarEntradaPuerto('cont-id', new Date('2025-02-01'), 'cliente-id')

      expect(Ciclo.create).toHaveBeenCalledWith(expect.objectContaining({
        demurrage: expect.objectContaining({ fechaInicio: new Date('2025-01-15') }),
      }))
    })

    it('lanza error 404 si el contenedor no existe', async () => {
      Contenedor.findById.mockResolvedValue(null)

      await expect(
        registrarEntradaPuerto('no-existe', new Date(), 'cliente-id')
      ).rejects.toMatchObject({ status: 404 })

      expect(Ciclo.create).not.toHaveBeenCalled()
    })

    it('lanza error 422 si el contenedor no está en INACTIVO', async () => {
      Contenedor.findById.mockResolvedValue(makeContenedor('CARGADO'))

      await expect(
        registrarEntradaPuerto('cont-id', new Date(), 'cliente-id')
      ).rejects.toMatchObject({ status: 422 })

      expect(Ciclo.create).not.toHaveBeenCalled()
    })

    it('lanza error 422 si el contenedor está en estado CLIENTE', async () => {
      Contenedor.findById.mockResolvedValue(makeContenedor('CLIENTE'))

      await expect(
        registrarEntradaPuerto('cont-id', new Date(), 'cliente-id')
      ).rejects.toMatchObject({ status: 422 })
    })
  })

  // ---------------------------------------------------------------------------
  // registrarSalidaPuerto (CARGADO → CLIENTE)
  // ---------------------------------------------------------------------------
  describe('registrarSalidaPuerto', () => {
    it('transiciona de CARGADO a CLIENTE y calcula el coste de demurrage', async () => {
      // 10 días desde 01/01 hasta 11/01, diasLibres=5 → 5 facturables
      // tramo 1 (días 1-5, 50€/día): 5 días × 50€ = 250€
      const ciclo = makeCiclo({
        demurrage: { fechaInicio: new Date('2025-01-01'), diasLibres: 5 },
      })

      Contenedor.findById.mockResolvedValue(makeContenedor('CARGADO'))
      Naviera.findById.mockResolvedValue(makeNaviera())
      Ciclo.findOne.mockResolvedValue(ciclo)
      Ciclo.findByIdAndUpdate.mockResolvedValue({})
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ estado: 'CLIENTE' }),
      })

      const result = await registrarSalidaPuerto('cont-id', new Date('2025-01-11'))

      expect(Ciclo.findByIdAndUpdate).toHaveBeenCalledWith(
        'ciclo-id',
        expect.objectContaining({
          $set: expect.objectContaining({
            'demurrage.diasTranscurridos': 10,
            'demurrage.diasFacturables': 5,
            'demurrage.costeTotal': 250,
          }),
        })
      )
      expect(result.estado).toBe('CLIENTE')
    })

    it('calcula coste 0 cuando los días transcurridos no superan los días libres', async () => {
      // 3 días transcurridos, 5 libres → 0 facturables → coste 0
      const ciclo = makeCiclo({
        demurrage: { fechaInicio: new Date('2025-01-01'), diasLibres: 10 },
      })

      Contenedor.findById.mockResolvedValue(makeContenedor('CARGADO'))
      Naviera.findById.mockResolvedValue(makeNaviera())
      Ciclo.findOne.mockResolvedValue(ciclo)
      Ciclo.findByIdAndUpdate.mockResolvedValue({})
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ estado: 'CLIENTE' }),
      })

      await registrarSalidaPuerto('cont-id', new Date('2025-01-05'))

      expect(Ciclo.findByIdAndUpdate).toHaveBeenCalledWith(
        'ciclo-id',
        expect.objectContaining({
          $set: expect.objectContaining({
            'demurrage.diasFacturables': 0,
            'demurrage.costeTotal': 0,
          }),
        })
      )
    })

    it('calcula el coste correctamente cuando hay días en múltiples tramos', async () => {
      // 12 días, diasLibres=0 → 12 facturables
      // tramo 1 (días 1-5,  10€): 5 días × 10€ =  50€
      // tramo 2 (días 6-10, 20€): 5 días × 20€ = 100€
      // tramo 3 (días 11+,  40€): 2 días × 40€ =  80€  → total: 230€
      const navieraMultiTramo = makeNaviera({
        diasLibresDemurrage: 0,
        diasDemurrage: [
          { desdeDia: 1, hastaDia: 5,   precioPorDia: 10 },
          { desdeDia: 6, hastaDia: 10,  precioPorDia: 20 },
          { desdeDia: 11, hastaDia: null, precioPorDia: 40 },
        ],
      })
      const ciclo = makeCiclo({
        demurrage: { fechaInicio: new Date('2025-01-01'), diasLibres: 0 },
      })

      Contenedor.findById.mockResolvedValue(makeContenedor('CARGADO'))
      Naviera.findById.mockResolvedValue(navieraMultiTramo)
      Ciclo.findOne.mockResolvedValue(ciclo)
      Ciclo.findByIdAndUpdate.mockResolvedValue({})
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ estado: 'CLIENTE' }),
      })

      await registrarSalidaPuerto('cont-id', new Date('2025-01-13'))

      expect(Ciclo.findByIdAndUpdate).toHaveBeenCalledWith(
        'ciclo-id',
        expect.objectContaining({
          $set: expect.objectContaining({
            'demurrage.diasTranscurridos': 12,
            'demurrage.diasFacturables': 12,
            'demurrage.costeTotal': 230,
          }),
        })
      )
    })

    it('abre el tramo de detention con la fecha de salida y los días libres de la naviera', async () => {
      const fechaSalida = new Date('2025-01-11')
      const ciclo = makeCiclo({
        demurrage: { fechaInicio: new Date('2025-01-01'), diasLibres: 5 },
      })

      Contenedor.findById.mockResolvedValue(makeContenedor('CARGADO'))
      Naviera.findById.mockResolvedValue(makeNaviera())
      Ciclo.findOne.mockResolvedValue(ciclo)
      Ciclo.findByIdAndUpdate.mockResolvedValue({})
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ estado: 'CLIENTE' }),
      })

      await registrarSalidaPuerto('cont-id', fechaSalida)

      expect(Ciclo.findByIdAndUpdate).toHaveBeenCalledWith(
        'ciclo-id',
        expect.objectContaining({
          $set: expect.objectContaining({
            detention: expect.objectContaining({
              diasLibres: 7,
              fechaInicio: fechaSalida,
            }),
          }),
        })
      )
    })

    it('lanza error 404 si el contenedor no existe', async () => {
      Contenedor.findById.mockResolvedValue(null)

      await expect(registrarSalidaPuerto('no-existe', new Date())).rejects.toMatchObject({ status: 404 })
    })

    it('lanza error 422 si el contenedor no está en CARGADO', async () => {
      Contenedor.findById.mockResolvedValue(makeContenedor('CLIENTE'))

      await expect(registrarSalidaPuerto('cont-id', new Date())).rejects.toMatchObject({ status: 422 })
    })
  })

  // ---------------------------------------------------------------------------
  // registrarDevolucion (CLIENTE → INACTIVO)
  // ---------------------------------------------------------------------------
  describe('registrarDevolucion', () => {
    it('transiciona de CLIENTE a INACTIVO y cierra el ciclo con el coste total', async () => {
      // 3 días desde 11/01 hasta 14/01, diasLibresDetention=7 → 0 facturables → costeDetention=0
      // costeTotal = demurrage.costeTotal(250) + detention(0) = 250
      const ciclo = makeCiclo({
        demurrage: { fechaInicio: new Date('2025-01-01'), diasLibres: 5, costeTotal: 250 },
        detention: { fechaInicio: new Date('2025-01-11'), diasLibres: 7 },
      })

      Contenedor.findById.mockResolvedValue(makeContenedor('CLIENTE'))
      Naviera.findById.mockResolvedValue(makeNaviera())
      Ciclo.findOne.mockResolvedValue(ciclo)
      Ciclo.findByIdAndUpdate.mockResolvedValue({})
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ estado: 'INACTIVO' }),
      })

      const result = await registrarDevolucion('cont-id', new Date('2025-01-14'))

      expect(Ciclo.findByIdAndUpdate).toHaveBeenCalledWith(
        'ciclo-id',
        expect.objectContaining({
          $set: expect.objectContaining({
            'detention.diasFacturables': 0,
            'detention.costeTotal': 0,
            costeTotal: 250,
          }),
        })
      )
      expect(result.estado).toBe('INACTIVO')
    })

    it('calcula correctamente el coste de detention cuando hay días facturables', async () => {
      // 15 días de detention, diasLibres=7 → 8 facturables
      // tramo 1 (días 1-5, 30€): 5 × 30 = 150€
      // tramo 2 (días 6+,  60€): 3 × 60 = 180€ → total detention: 330€
      // costeTotal = 250(demurrage) + 330(detention) = 580€
      const ciclo = makeCiclo({
        demurrage: { fechaInicio: new Date('2025-01-01'), diasLibres: 5, costeTotal: 250 },
        detention: { fechaInicio: new Date('2025-01-11'), diasLibres: 7 },
      })

      Contenedor.findById.mockResolvedValue(makeContenedor('CLIENTE'))
      Naviera.findById.mockResolvedValue(makeNaviera())
      Ciclo.findOne.mockResolvedValue(ciclo)
      Ciclo.findByIdAndUpdate.mockResolvedValue({})
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ estado: 'INACTIVO' }),
      })

      // 26/01 - 11/01 = 15 días, diasLibres=7 → 8 facturables
      await registrarDevolucion('cont-id', new Date('2025-01-26'))

      expect(Ciclo.findByIdAndUpdate).toHaveBeenCalledWith(
        'ciclo-id',
        expect.objectContaining({
          $set: expect.objectContaining({
            'detention.diasTranscurridos': 15,
            'detention.diasFacturables': 8,
            'detention.costeTotal': 330,
            costeTotal: 580,
          }),
        })
      )
    })

    it('cierra el ciclo con fechaCierre igual a la fecha de devolución', async () => {
      const fechaDevolucion = new Date('2025-01-14')
      const ciclo = makeCiclo({
        demurrage: { costeTotal: 0, diasLibres: 5, fechaInicio: new Date('2025-01-11') },
        detention: { fechaInicio: new Date('2025-01-11'), diasLibres: 30 },
      })

      Contenedor.findById.mockResolvedValue(makeContenedor('CLIENTE'))
      Naviera.findById.mockResolvedValue(makeNaviera())
      Ciclo.findOne.mockResolvedValue(ciclo)
      Ciclo.findByIdAndUpdate.mockResolvedValue({})
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ estado: 'INACTIVO' }),
      })

      await registrarDevolucion('cont-id', fechaDevolucion)

      expect(Ciclo.findByIdAndUpdate).toHaveBeenCalledWith(
        'ciclo-id',
        expect.objectContaining({
          $set: expect.objectContaining({ fechaCierre: fechaDevolucion }),
        })
      )
    })

    it('lanza error 422 si el contenedor no está en CLIENTE', async () => {
      Contenedor.findById.mockResolvedValue(makeContenedor('INACTIVO'))

      await expect(registrarDevolucion('cont-id', new Date())).rejects.toMatchObject({ status: 422 })
    })

    it('lanza error 404 si el contenedor no existe', async () => {
      Contenedor.findById.mockResolvedValue(null)

      await expect(registrarDevolucion('no-existe', new Date())).rejects.toMatchObject({ status: 404 })
    })
  })

  // ---------------------------------------------------------------------------
  // cancelarCiclo (CARGADO → INACTIVO sin coste)
  // ---------------------------------------------------------------------------
  describe('cancelarCiclo', () => {
    it('cancela el ciclo activo y devuelve el contenedor a INACTIVO', async () => {
      Contenedor.findById.mockResolvedValue(makeContenedor('CARGADO'))
      Ciclo.findOneAndDelete.mockResolvedValue({})
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ estado: 'INACTIVO', fechaEntradaPuerto: null }),
      })

      const result = await cancelarCiclo('cont-id')

      expect(Ciclo.findOneAndDelete).toHaveBeenCalledWith({ contenedorId: 'cont-id', fechaCierre: null })
      expect(result.estado).toBe('INACTIVO')
      expect(result.fechaEntradaPuerto).toBeNull()
    })

    it('lanza error 422 si el contenedor no está en CARGADO', async () => {
      Contenedor.findById.mockResolvedValue(makeContenedor('CLIENTE'))

      await expect(cancelarCiclo('cont-id')).rejects.toMatchObject({ status: 422 })
      expect(Ciclo.findOneAndDelete).not.toHaveBeenCalled()
    })

    it('lanza error 422 si el contenedor está en INACTIVO', async () => {
      Contenedor.findById.mockResolvedValue(makeContenedor('INACTIVO'))

      await expect(cancelarCiclo('cont-id')).rejects.toMatchObject({ status: 422 })
    })

    it('lanza error 404 si el contenedor no existe', async () => {
      Contenedor.findById.mockResolvedValue(null)

      await expect(cancelarCiclo('no-existe')).rejects.toMatchObject({ status: 404 })
      expect(Ciclo.findOneAndDelete).not.toHaveBeenCalled()
    })
  })
})
