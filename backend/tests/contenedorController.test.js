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

      expect(contenedorService.obtenerPorId).toHaveBeenCalledWith('c1')
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
      })
      expect(res.json).toHaveBeenCalledWith(actualizado)
    })

    it('no incluye campos no definidos en el body', async () => {
      contenedorService.actualizar.mockResolvedValue({ _id: 'c1' })
      req.body = { foto: 'data:image/png;base64,...' }

      await editarContenedor(req, res, next)

      expect(contenedorService.actualizar).toHaveBeenCalledWith('c1', {
        foto: 'data:image/png;base64,...',
      })
    })
  })

  describe('eliminar', () => {
    it('devuelve 204 al eliminar el contenedor', async () => {
      contenedorService.eliminar.mockResolvedValue()

      await eliminar(req, res, next)

      expect(contenedorService.eliminar).toHaveBeenCalledWith('c1')
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
    it('registra la entrada a puerto y devuelve el contenedor actualizado', async () => {
      const contenedor = { _id: 'c1', estado: 'PUERTO' }
      contenedorService.registrarEntradaPuerto.mockResolvedValue(contenedor)
      req.body = { fecha: '2025-06-01', clienteId: 'cli1' }

      await entradaPuerto(req, res, next)

      expect(contenedorService.registrarEntradaPuerto).toHaveBeenCalledWith('c1', '2025-06-01', 'cli1')
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
    it('registra la salida de puerto y devuelve el contenedor actualizado', async () => {
      const contenedor = { _id: 'c1', estado: 'CLIENTE' }
      contenedorService.registrarSalidaPuerto.mockResolvedValue(contenedor)
      req.body = { fecha: '2025-06-10' }

      await salidaPuerto(req, res, next)

      expect(contenedorService.registrarSalidaPuerto).toHaveBeenCalledWith('c1', '2025-06-10')
      expect(res.json).toHaveBeenCalledWith(contenedor)
    })
  })

  describe('devolucion', () => {
    it('registra la devolución y devuelve el contenedor actualizado', async () => {
      const contenedor = { _id: 'c1', estado: 'INACTIVO' }
      contenedorService.registrarDevolucion.mockResolvedValue(contenedor)
      req.body = { fecha: '2025-06-20' }

      await devolucion(req, res, next)

      expect(contenedorService.registrarDevolucion).toHaveBeenCalledWith('c1', '2025-06-20')
      expect(res.json).toHaveBeenCalledWith(contenedor)
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
