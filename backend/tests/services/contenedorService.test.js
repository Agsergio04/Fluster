jest.mock('../../src/models/Contenedor')
jest.mock('../../src/models/Naviera')
jest.mock('../../src/models/Ciclo')

const Contenedor = require('../../src/models/Contenedor')
const Naviera = require('../../src/models/Naviera')
const Ciclo = require('../../src/models/Ciclo')
const {
  crear,
  listar,
  obtenerPorId,
  actualizar,
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
  // registrarEntradaPuerto (INACTIVO â†’ PUERTO)
  // ---------------------------------------------------------------------------
  describe('registrarEntradaPuerto', () => {
    it('transiciona de INACTIVO a PUERTO y crea un ciclo con los dÃ­as libres de la naviera', async () => {
      const contenedor = makeContenedor('INACTIVO')
      const naviera = makeNaviera()

      Contenedor.findById.mockResolvedValue(contenedor)
      Naviera.findById.mockResolvedValue(naviera)
      Ciclo.create.mockResolvedValue({})
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...contenedor, estado: 'PUERTO' }),
      })

      const result = await registrarEntradaPuerto('cont-id', new Date('2025-02-01'), 'cliente-id')

      expect(Ciclo.create).toHaveBeenCalledWith(expect.objectContaining({
        contenedorId: 'cont-id',
        clienteId: 'cliente-id',
        demurrage: expect.objectContaining({ diasLibres: 5 }),
      }))
      expect(result.estado).toBe('PUERTO')
    })

    it('el ciclo se crea con fechaInicio = fecha de entrada a puerto (el demurrage arranca al mover, en free time)', async () => {
      const contenedor = makeContenedor('INACTIVO', { fechaInicioLibre: new Date('2025-01-15') })

      Contenedor.findById.mockResolvedValue(contenedor)
      Naviera.findById.mockResolvedValue(makeNaviera())
      Ciclo.create.mockResolvedValue({})
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...contenedor, estado: 'PUERTO' }),
      })

      await registrarEntradaPuerto('cont-id', new Date('2025-02-01'), 'cliente-id')

      expect(Ciclo.create).toHaveBeenCalledWith(expect.objectContaining({
        demurrage: expect.objectContaining({ fechaInicio: new Date('2025-02-01') }),
      }))
    })

    it('lanza error 404 si el contenedor no existe', async () => {
      Contenedor.findById.mockResolvedValue(null)

      await expect(
        registrarEntradaPuerto('no-existe', new Date(), 'cliente-id')
      ).rejects.toMatchObject({ status: 404 })

      expect(Ciclo.create).not.toHaveBeenCalled()
    })

    it('lanza error 422 si el contenedor no estÃ¡ en INACTIVO', async () => {
      Contenedor.findById.mockResolvedValue(makeContenedor('PUERTO'))

      await expect(
        registrarEntradaPuerto('cont-id', new Date(), 'cliente-id')
      ).rejects.toMatchObject({ status: 422 })

      expect(Ciclo.create).not.toHaveBeenCalled()
    })

    it('lanza error 422 si el contenedor estÃ¡ en estado CLIENTE', async () => {
      Contenedor.findById.mockResolvedValue(makeContenedor('CLIENTE'))

      await expect(
        registrarEntradaPuerto('cont-id', new Date(), 'cliente-id')
      ).rejects.toMatchObject({ status: 422 })
    })
  })

  // ---------------------------------------------------------------------------
  // registrarSalidaPuerto (PUERTO â†’ CLIENTE)
  // ---------------------------------------------------------------------------
  describe('registrarSalidaPuerto', () => {
    it('transiciona de PUERTO a CLIENTE y calcula el coste de demurrage', async () => {
      // 10 dÃ­as desde 01/01 hasta 11/01, diasLibres=5 â†’ 5 facturables
      // tramo 1 (dÃ­as 1-5, 50â‚¬/dÃ­a): 5 dÃ­as Ã— 50â‚¬ = 250â‚¬
      const ciclo = makeCiclo({
        demurrage: { fechaInicio: new Date('2025-01-01'), diasLibres: 5 },
      })

      Contenedor.findById.mockResolvedValue(makeContenedor('PUERTO'))
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

    it('calcula coste 0 cuando los dÃ­as transcurridos no superan los dÃ­as libres', async () => {
      // 3 dÃ­as transcurridos, 5 libres â†’ 0 facturables â†’ coste 0
      const ciclo = makeCiclo({
        demurrage: { fechaInicio: new Date('2025-01-01'), diasLibres: 10 },
      })

      Contenedor.findById.mockResolvedValue(makeContenedor('PUERTO'))
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

    it('calcula el coste correctamente cuando hay dÃ­as en mÃºltiples tramos', async () => {
      // 12 dÃ­as, diasLibres=0 â†’ 12 facturables
      // tramo 1 (dÃ­as 1-5,  10â‚¬): 5 dÃ­as Ã— 10â‚¬ =  50â‚¬
      // tramo 2 (dÃ­as 6-10, 20â‚¬): 5 dÃ­as Ã— 20â‚¬ = 100â‚¬
      // tramo 3 (dÃ­as 11+,  40â‚¬): 2 dÃ­as Ã— 40â‚¬ =  80â‚¬  â†’ total: 230â‚¬
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

      Contenedor.findById.mockResolvedValue(makeContenedor('PUERTO'))
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

    it('abre el tramo de detention con la fecha de salida y los dÃ­as libres de la naviera', async () => {
      const fechaSalida = new Date('2025-01-11')
      const ciclo = makeCiclo({
        demurrage: { fechaInicio: new Date('2025-01-01'), diasLibres: 5 },
      })

      Contenedor.findById.mockResolvedValue(makeContenedor('PUERTO'))
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

    it('lanza error 422 si el contenedor no estÃ¡ en PUERTO', async () => {
      Contenedor.findById.mockResolvedValue(makeContenedor('CLIENTE'))

      await expect(registrarSalidaPuerto('cont-id', new Date())).rejects.toMatchObject({ status: 422 })
    })
  })

  // ---------------------------------------------------------------------------
  // registrarDevolucion (CLIENTE â†’ INACTIVO)
  // ---------------------------------------------------------------------------
  describe('registrarDevolucion', () => {
    it('transiciona de CLIENTE a INACTIVO y cierra el ciclo con el coste total', async () => {
      // 3 dÃ­as desde 11/01 hasta 14/01, diasLibresDetention=7 â†’ 0 facturables â†’ costeDetention=0
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

    it('calcula correctamente el coste de detention cuando hay dÃ­as facturables', async () => {
      // 15 dÃ­as de detention, diasLibres=7 â†’ 8 facturables
      // tramo 1 (dÃ­as 1-5, 30â‚¬): 5 Ã— 30 = 150â‚¬
      // tramo 2 (dÃ­as 6+,  60â‚¬): 3 Ã— 60 = 180â‚¬ â†’ total detention: 330â‚¬
      // costeTotal = 250(demurrage) + 330(detention) = 580â‚¬
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

      // 26/01 - 11/01 = 15 dÃ­as, diasLibres=7 â†’ 8 facturables
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

    it('cierra el ciclo con fechaCierre igual a la fecha de devoluciÃ³n', async () => {
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

    it('lanza error 422 si el contenedor no estÃ¡ en CLIENTE', async () => {
      Contenedor.findById.mockResolvedValue(makeContenedor('INACTIVO'))

      await expect(registrarDevolucion('cont-id', new Date())).rejects.toMatchObject({ status: 422 })
    })

    it('lanza error 404 si el contenedor no existe', async () => {
      Contenedor.findById.mockResolvedValue(null)

      await expect(registrarDevolucion('no-existe', new Date())).rejects.toMatchObject({ status: 404 })
    })
  })

  // ---------------------------------------------------------------------------
  // cancelarCiclo (PUERTO â†’ INACTIVO sin coste)
  // ---------------------------------------------------------------------------
  describe('cancelarCiclo', () => {
    it('cancela el ciclo activo y devuelve el contenedor a INACTIVO', async () => {
      Contenedor.findById.mockResolvedValue(makeContenedor('PUERTO'))
      Ciclo.findOneAndDelete.mockResolvedValue({})
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ estado: 'INACTIVO', fechaEntradaPuerto: null }),
      })

      const result = await cancelarCiclo('cont-id')

      expect(Ciclo.findOneAndDelete).toHaveBeenCalledWith({ contenedorId: 'cont-id', fechaCierre: null })
      expect(result.estado).toBe('INACTIVO')
      expect(result.fechaEntradaPuerto).toBeNull()
    })

    it('lanza error 422 si el contenedor no estÃ¡ en PUERTO', async () => {
      Contenedor.findById.mockResolvedValue(makeContenedor('CLIENTE'))

      await expect(cancelarCiclo('cont-id')).rejects.toMatchObject({ status: 422 })
      expect(Ciclo.findOneAndDelete).not.toHaveBeenCalled()
    })

    it('lanza error 422 si el contenedor estÃ¡ en INACTIVO', async () => {
      Contenedor.findById.mockResolvedValue(makeContenedor('INACTIVO'))

      await expect(cancelarCiclo('cont-id')).rejects.toMatchObject({ status: 422 })
    })

    it('lanza error 404 si el contenedor no existe', async () => {
      Contenedor.findById.mockResolvedValue(null)

      await expect(cancelarCiclo('no-existe')).rejects.toMatchObject({ status: 404 })
      expect(Ciclo.findOneAndDelete).not.toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // crear
  // ---------------------------------------------------------------------------
  describe('crear', () => {
    it('crea un contenedor en estado INACTIVO con los datos proporcionados', async () => {
      const datos = { codigoBIC: 'MSCU1234567', creadoPor: 'user-id' }
      const mockContenedor = { _id: 'cont-id', estado: 'INACTIVO', ...datos, navieraId: 'nav-id' }
      Naviera.findOne.mockResolvedValue({ _id: 'nav-id' })
      Contenedor.create.mockResolvedValue(mockContenedor)

      const result = await crear(datos)

      expect(Naviera.findOne).toHaveBeenCalledWith({ codigo: 'MSC' })
      expect(Contenedor.create).toHaveBeenCalledWith(
        expect.objectContaining({ codigoBIC: 'MSCU1234567', navieraId: 'nav-id', creadoPor: 'user-id' })
      )
      expect(result).toEqual(mockContenedor)
    })
  })

  // ---------------------------------------------------------------------------
  // listar
  // ---------------------------------------------------------------------------
  describe('listar', () => {
    const mockPopulateSortLean = (data) =>
      Contenedor.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(data),
            }),
          }),
        }),
      })

    it('devuelve todos los contenedores sin filtros', async () => {
      const mockContenedores = [{ _id: 'c1' }, { _id: 'c2' }]
      mockPopulateSortLean(mockContenedores)

      const result = await listar()

      expect(Contenedor.find).toHaveBeenCalledWith({})
      expect(result).toEqual(mockContenedores)
    })

    it('filtra por estado cuando se proporciona', async () => {
      mockPopulateSortLean([])

      await listar({ estado: 'PUERTO' })

      expect(Contenedor.find).toHaveBeenCalledWith(expect.objectContaining({ estado: 'PUERTO' }))
    })

    it('filtra por navieraId cuando se proporciona', async () => {
      mockPopulateSortLean([])

      await listar({ navieraId: 'nav-id' })

      expect(Contenedor.find).toHaveBeenCalledWith(expect.objectContaining({ navieraId: 'nav-id' }))
    })

    it('filtra por clienteId buscando primero los contenedorIds en los ciclos', async () => {
      Ciclo.find.mockReturnValue({ distinct: jest.fn().mockResolvedValue(['c1', 'c2']) })
      mockPopulateSortLean([{ _id: 'c1' }, { _id: 'c2' }])

      const result = await listar({ clienteId: 'cli-id' })

      expect(Ciclo.find).toHaveBeenCalledWith({ clienteId: 'cli-id' })
      expect(Contenedor.find).toHaveBeenCalledWith(
        expect.objectContaining({ _id: { $in: ['c1', 'c2'] } })
      )
      expect(result).toHaveLength(2)
    })
  })

  // ---------------------------------------------------------------------------
  // obtenerPorId
  // ---------------------------------------------------------------------------
  describe('obtenerPorId', () => {
    it('devuelve el contenedor con su historial de ciclos', async () => {
      const mockContenedor = { _id: 'cont-id', codigoBIC: 'MSCU1234567', estado: 'INACTIVO' }
      const mockCiclos = [{ _id: 'ciclo-1', costeTotal: 300 }]

      Contenedor.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockContenedor),
        }),
      })
      Ciclo.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockCiclos),
          }),
        }),
      })

      const result = await obtenerPorId('cont-id')

      expect(result.codigoBIC).toBe('MSCU1234567')
      expect(result.ciclos).toEqual(mockCiclos)
    })

    it('lanza error 404 si el contenedor no existe', async () => {
      Contenedor.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      })

      await expect(obtenerPorId('no-existe')).rejects.toMatchObject({ status: 404 })
    })
  })

  // ---------------------------------------------------------------------------
  // actualizar
  // ---------------------------------------------------------------------------
  describe('actualizar', () => {
    it('actualiza los campos permitidos correctamente', async () => {
      const updated = { _id: 'cont-id', codigoBIC: 'MSCU9999999', tipo: '40HC' }
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(updated),
      })

      const result = await actualizar('cont-id', { codigoBIC: 'MSCU9999999', tipo: '40HC' })

      expect(result).toEqual(updated)
    })

    it('ignora los campos protegidos aunque vengan en el body', async () => {
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: 'cont-id' }),
      })

      await actualizar('cont-id', {
        codigoBIC: 'MSCU9999999',
        estado: 'PUERTO',
        fechaEntradaPuerto: new Date(),
        fechaSalidaPuerto: new Date(),
        fechaDevolucion: new Date(),
      })

      const updateArg = Contenedor.findByIdAndUpdate.mock.calls[0][1]
      expect(updateArg.estado).toBeUndefined()
      expect(updateArg.fechaEntradaPuerto).toBeUndefined()
      expect(updateArg.fechaSalidaPuerto).toBeUndefined()
      expect(updateArg.fechaDevolucion).toBeUndefined()
    })

    it('lanza error 404 si el contenedor no existe', async () => {
      Contenedor.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      })

      await expect(actualizar('no-existe', { codigoBIC: 'MSCU0000001' })).rejects.toMatchObject({ status: 404 })
    })
  })
})

