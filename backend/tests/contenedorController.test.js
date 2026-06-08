jest.mock('../src/services/contenedorService')

const contenedorService = require('../src/services/contenedorService')
const {
  crear,
  listar,
  obtener,
  actualizar,
  editarContenedor,
  eliminar,
  entradaPuerto,
  salidaPuerto,
  devolucion,
  cancelarCiclo,
  revertirSalidaPuerto,
} = require('../src/controllers/contenedorController')

describe('contenedorController', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req  = { params: { id: 'c1' }, body: {}, query: {}, usuario: { id: 'user-id', rol: 'operador' } }
    res  = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() }
    next = jest.fn()
  })

  describe('crear', () => {
    it('devuelve 201 con el contenedor creado, incluyendo creadoPor del token', async () => {
      const contenedor = { _id: 'c1', codigoBIC: 'MSCU1234567', creadoPor: 'user-id' }
      contenedorService.crear.mockResolvedValue(contenedor)
      req.body = { codigoBIC: 'MSCU1234567' }

      await crear(req, res, next)

      expect(contenedorService.crear).toHaveBeenCalledWith({ codigoBIC: 'MSCU1234567', creadoPor: 'user-id' })
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(contenedor)
      expect(next).not.toHaveBeenCalled()
    })

    it('llama a next cuando el servicio falla', async () => {
      contenedorService.crear.mockRejectedValue(new Error('Error'))
      await crear(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('listar', () => {
    it('un operador solo recibe sus propios contenedores (añade creadoPorId)', async () => {
      const contenedores = [{ _id: 'c1' }, { _id: 'c2' }]
      contenedorService.listar.mockResolvedValue(contenedores)
      req.query = { estado: 'INACTIVO' }
      req.usuario = { id: 'user-id', rol: 'operador' }

      await listar(req, res, next)

      expect(contenedorService.listar).toHaveBeenCalledWith({ estado: 'INACTIVO', creadoPorId: 'user-id' })
      expect(res.json).toHaveBeenCalledWith(contenedores)
    })

    it('un gestor recibe todos los contenedores (sin filtro creadoPorId)', async () => {
      const contenedores = [{ _id: 'c1' }, { _id: 'c2' }]
      contenedorService.listar.mockResolvedValue(contenedores)
      req.query = { estado: 'INACTIVO' }
      req.usuario = { id: 'gestor-id', rol: 'gestor' }

      await listar(req, res, next)

      expect(contenedorService.listar).toHaveBeenCalledWith({ estado: 'INACTIVO' })
      expect(res.json).toHaveBeenCalledWith(contenedores)
    })
  })

  describe('obtener', () => {
    it('devuelve el contenedor por id', async () => {
      const contenedor = { _id: 'c1', codigoBIC: 'MSCU1234567' }
      contenedorService.obtenerPorId.mockResolvedValue(contenedor)

      await obtener(req, res, next)

      expect(contenedorService.obtenerPorId).toHaveBeenCalledWith('c1', 'user-id')
      expect(res.json).toHaveBeenCalledWith(contenedor)
    })

    it('llama a next con 404 si el contenedor no existe', async () => {
      const err = new Error('Contenedor no encontrado')
      err.status = 404
      contenedorService.obtenerPorId.mockRejectedValue(err)
      await obtener(req, res, next)
      expect(next).toHaveBeenCalledWith(err)
    })
  })

  describe('actualizar', () => {
    it('devuelve el contenedor actualizado', async () => {
      const actualizado = { _id: 'c1', codigoBIC: 'MSCU9999999' }
      contenedorService.actualizar.mockResolvedValue(actualizado)
      req.body = { codigoBIC: 'MSCU9999999' }

      await actualizar(req, res, next)

      expect(contenedorService.actualizar).toHaveBeenCalledWith('c1', req.body)
      expect(res.json).toHaveBeenCalledWith(actualizado)
    })
  })

  describe('editarContenedor', () => {
    it('filtra solo los campos permitidos y llama al servicio', async () => {
      const actualizado = { _id: 'c1', codigoBIC: 'MSCU9999999' }
      contenedorService.actualizar.mockResolvedValue(actualizado)
      req.body = { codigoBIC: 'MSCU9999999', foto: null, campoNoPermitido: 'x' }

      await editarContenedor(req, res, next)

      expect(contenedorService.actualizar).toHaveBeenCalledWith('c1', {
        codigoBIC: 'MSCU9999999',
        foto: null,
      }, 'user-id')
      expect(res.json).toHaveBeenCalledWith(actualizado)
    })

    it('no incluye campos no definidos en el body', async () => {
      contenedorService.actualizar.mockResolvedValue({ _id: 'c1' })
      req.body = { foto: 'data:image/png;base64,...' }

      await editarContenedor(req, res, next)

      expect(contenedorService.actualizar).toHaveBeenCalledWith('c1', {
        foto: 'data:image/png;base64,...',
      }, 'user-id')
    })

    it('aplica el código BIC y la foto aunque también se cambie la fecha (no los descarta)', async () => {
      contenedorService.editarFechaInicioLibre.mockResolvedValue({ _id: 'c1' })
      const actualizado = { _id: 'c1', codigoBIC: 'MSCU9999999', foto: 'data:img' }
      contenedorService.actualizar.mockResolvedValue(actualizado)
      req.body = { fechaInicioLibre: '2026-01-15T00:00:00.000Z', codigoBIC: 'MSCU9999999', foto: 'data:img' }

      await editarContenedor(req, res, next)

      expect(contenedorService.editarFechaInicioLibre).toHaveBeenCalledWith('c1', '2026-01-15T00:00:00.000Z', 'user-id')
      expect(contenedorService.actualizar).toHaveBeenCalledWith('c1', {
        codigoBIC: 'MSCU9999999',
        foto: 'data:img',
      }, 'user-id')
      expect(res.json).toHaveBeenCalledWith(actualizado)
      expect(next).not.toHaveBeenCalled()
    })

    it('actualiza solo la fecha cuando es el único campo enviado', async () => {
      const actualizado = { _id: 'c1', fechaInicioLibre: '2026-01-15T00:00:00.000Z' }
      contenedorService.editarFechaInicioLibre.mockResolvedValue(actualizado)
      req.body = { fechaInicioLibre: '2026-01-15T00:00:00.000Z' }

      await editarContenedor(req, res, next)

      expect(contenedorService.editarFechaInicioLibre).toHaveBeenCalledWith('c1', '2026-01-15T00:00:00.000Z', 'user-id')
      expect(contenedorService.actualizar).not.toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith(actualizado)
    })
  })

  describe('eliminar', () => {
    it('devuelve 204 al eliminar el contenedor', async () => {
      contenedorService.eliminar.mockResolvedValue()

      await eliminar(req, res, next)

      expect(contenedorService.eliminar).toHaveBeenCalledWith('c1', 'user-id')
      expect(res.status).toHaveBeenCalledWith(204)
      expect(res.send).toHaveBeenCalled()
    })

    it('llama a next cuando el contenedor está activo', async () => {
      const err = new Error('No se puede eliminar un contenedor activo')
      err.status = 409
      contenedorService.eliminar.mockRejectedValue(err)
      await eliminar(req, res, next)
      expect(next).toHaveBeenCalledWith(err)
    })
  })

  describe('entradaPuerto', () => {
    it('registra la entrada a puerto con clienteId del body', async () => {
      const contenedor = { _id: 'c1', estado: 'PUERTO' }
      contenedorService.registrarEntradaPuerto.mockResolvedValue(contenedor)
      req.body = { clienteId: 'cli1' }

      await entradaPuerto(req, res, next)

      expect(contenedorService.registrarEntradaPuerto).toHaveBeenCalledWith('c1', 'cli1')
      expect(res.json).toHaveBeenCalledWith(contenedor)
    })

    it('llama a next con 422 si la transición no es válida', async () => {
      const err = new Error('Transición no válida')
      err.status = 422
      contenedorService.registrarEntradaPuerto.mockRejectedValue(err)
      await entradaPuerto(req, res, next)
      expect(next).toHaveBeenCalledWith(err)
    })
  })

  describe('salidaPuerto', () => {
    it('registra la salida de puerto sin parámetro fecha (usa la actual internamente)', async () => {
      const contenedor = { _id: 'c1', estado: 'CLIENTE' }
      contenedorService.registrarSalidaPuerto.mockResolvedValue(contenedor)
      req.body = {}

      await salidaPuerto(req, res, next)

      expect(contenedorService.registrarSalidaPuerto).toHaveBeenCalledWith('c1')
      expect(res.json).toHaveBeenCalledWith(contenedor)
    })

    it('llama a next cuando hay error', async () => {
      const err = new Error('Error en la salida')
      contenedorService.registrarSalidaPuerto.mockRejectedValue(err)
      await salidaPuerto(req, res, next)
      expect(next).toHaveBeenCalledWith(err)
    })
  })

  describe('devolucion', () => {
    it('registra la devolución sin parámetro fecha (usa la actual internamente)', async () => {
      const contenedor = { _id: 'c1', estado: 'INACTIVO' }
      contenedorService.registrarDevolucion.mockResolvedValue(contenedor)
      req.body = {}

      await devolucion(req, res, next)

      expect(contenedorService.registrarDevolucion).toHaveBeenCalledWith('c1')
      expect(res.json).toHaveBeenCalledWith(contenedor)
    })

    it('llama a next cuando hay error', async () => {
      const err = new Error('Error en la devolución')
      contenedorService.registrarDevolucion.mockRejectedValue(err)
      await devolucion(req, res, next)
      expect(next).toHaveBeenCalledWith(err)
    })
  })

  describe('cancelarCiclo', () => {
    it('cancela el ciclo activo y devuelve el contenedor actualizado', async () => {
      const contenedor = { _id: 'c1', estado: 'INACTIVO' }
      contenedorService.cancelarCiclo.mockResolvedValue(contenedor)

      await cancelarCiclo(req, res, next)

      expect(contenedorService.cancelarCiclo).toHaveBeenCalledWith('c1')
      expect(res.json).toHaveBeenCalledWith(contenedor)
    })
  })

  describe('revertirSalidaPuerto', () => {
    it('revierte la salida a puerto y devuelve el contenedor actualizado', async () => {
      const contenedor = { _id: 'c1', estado: 'PUERTO' }
      contenedorService.revertirSalidaPuerto.mockResolvedValue(contenedor)

      await revertirSalidaPuerto(req, res, next)

      expect(contenedorService.revertirSalidaPuerto).toHaveBeenCalledWith('c1')
      expect(res.json).toHaveBeenCalledWith(contenedor)
    })
  })
})
