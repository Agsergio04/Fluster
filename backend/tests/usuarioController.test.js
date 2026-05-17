jest.mock('../src/services/usuarioService')

const usuarioService = require('../src/services/usuarioService')
const {
  listar,
  obtener,
  actualizar,
  cambiarNombre,
  cambiarContrasena,
  eliminar,
  actualizarFoto,
} = require('../src/controllers/usuarioController')

describe('usuarioController', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req  = { params: { id: 'u1' }, body: {}, usuario: { id: 'u1', rol: 'gestor' } }
    res  = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() }
    next = jest.fn()
  })

  describe('listar', () => {
    it('devuelve la lista de usuarios', async () => {
      const usuarios = [{ _id: 'u1' }, { _id: 'u2' }]
      usuarioService.listar.mockResolvedValue(usuarios)

      await listar(req, res, next)

      expect(res.json).toHaveBeenCalledWith(usuarios)
      expect(next).not.toHaveBeenCalled()
    })

    it('llama a next cuando el servicio falla', async () => {
      usuarioService.listar.mockRejectedValue(new Error('Error'))
      await listar(req, res, next)
      expect(next).toHaveBeenCalled()
    })
  })

  describe('obtener', () => {
    it('devuelve el usuario por id', async () => {
      const usuario = { _id: 'u1', nombre: 'Ana' }
      usuarioService.obtenerPorId.mockResolvedValue(usuario)

      await obtener(req, res, next)

      expect(usuarioService.obtenerPorId).toHaveBeenCalledWith('u1')
      expect(res.json).toHaveBeenCalledWith(usuario)
    })

    it('llama a next con 404 si el usuario no existe', async () => {
      const err = new Error('Usuario no encontrado')
      err.status = 404
      usuarioService.obtenerPorId.mockRejectedValue(err)
      await obtener(req, res, next)
      expect(next).toHaveBeenCalledWith(err)
    })
  })

  describe('actualizar', () => {
    it('devuelve el usuario actualizado', async () => {
      const actualizado = { _id: 'u1', rol: 'gestor' }
      usuarioService.actualizar.mockResolvedValue(actualizado)
      req.body = { rol: 'gestor' }

      await actualizar(req, res, next)

      expect(usuarioService.actualizar).toHaveBeenCalledWith('u1', req.body)
      expect(res.json).toHaveBeenCalledWith(actualizado)
    })
  })

  describe('cambiarNombre', () => {
    it('actualiza el nombre del propio usuario', async () => {
      const actualizado = { _id: 'u1', nombre: 'Nuevo nombre' }
      usuarioService.actualizar.mockResolvedValue(actualizado)
      req.body = { nombre: 'Nuevo nombre' }

      await cambiarNombre(req, res, next)

      expect(usuarioService.actualizar).toHaveBeenCalledWith('u1', { nombre: 'Nuevo nombre' })
      expect(res.json).toHaveBeenCalledWith(actualizado)
    })

    it('devuelve 403 si intenta cambiar el nombre de otro usuario', async () => {
      req.usuario.id = 'otro-id'

      await cambiarNombre(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: expect.any(String) }))
      expect(usuarioService.actualizar).not.toHaveBeenCalled()
    })

    it('devuelve 400 si el nombre está vacío', async () => {
      req.body = { nombre: '   ' }

      await cambiarNombre(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: expect.any(String) }))
      expect(usuarioService.actualizar).not.toHaveBeenCalled()
    })

    it('devuelve 400 si el nombre no está presente', async () => {
      req.body = {}

      await cambiarNombre(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(usuarioService.actualizar).not.toHaveBeenCalled()
    })
  })

  describe('cambiarContrasena', () => {
    it('devuelve 204 al cambiar la contraseña del propio usuario', async () => {
      usuarioService.cambiarContrasena.mockResolvedValue()
      req.body = { contrasenaActual: 'old', contrasenaNueva: 'new' }

      await cambiarContrasena(req, res, next)

      expect(usuarioService.cambiarContrasena).toHaveBeenCalledWith('u1', 'old', 'new')
      expect(res.status).toHaveBeenCalledWith(204)
      expect(res.send).toHaveBeenCalled()
    })

    it('devuelve 403 si intenta cambiar la contraseña de otro usuario', async () => {
      req.usuario.id = 'otro-id'

      await cambiarContrasena(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(usuarioService.cambiarContrasena).not.toHaveBeenCalled()
    })

    it('llama a next cuando la contraseña actual es incorrecta', async () => {
      const err = new Error('Contraseña actual incorrecta')
      err.status = 401
      usuarioService.cambiarContrasena.mockRejectedValue(err)
      req.body = { contrasenaActual: 'wrong', contrasenaNueva: 'new' }

      await cambiarContrasena(req, res, next)

      expect(next).toHaveBeenCalledWith(err)
    })
  })

  describe('eliminar', () => {
    it('devuelve 204 al eliminar el usuario', async () => {
      usuarioService.eliminar.mockResolvedValue()

      await eliminar(req, res, next)

      expect(usuarioService.eliminar).toHaveBeenCalledWith('u1')
      expect(res.status).toHaveBeenCalledWith(204)
      expect(res.send).toHaveBeenCalled()
    })

    it('llama a next cuando es el último administrador', async () => {
      const err = new Error('No se puede eliminar el único administrador')
      err.status = 409
      usuarioService.eliminar.mockRejectedValue(err)

      await eliminar(req, res, next)

      expect(next).toHaveBeenCalledWith(err)
    })
  })

  describe('actualizarFoto', () => {
    it('devuelve el usuario con la foto actualizada', async () => {
      const actualizado = { _id: 'u1', foto: 'data:image/png;base64,...' }
      usuarioService.actualizarFoto.mockResolvedValue(actualizado)
      req.body = { foto: 'data:image/png;base64,...' }

      await actualizarFoto(req, res, next)

      expect(usuarioService.actualizarFoto).toHaveBeenCalledWith('u1', 'data:image/png;base64,...')
      expect(res.json).toHaveBeenCalledWith(actualizado)
    })

    it('devuelve 403 si intenta actualizar la foto de otro usuario', async () => {
      req.usuario.id = 'otro-id'

      await actualizarFoto(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(usuarioService.actualizarFoto).not.toHaveBeenCalled()
    })
  })
})
