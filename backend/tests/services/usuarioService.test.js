jest.mock('../../src/models/Usuario')
jest.mock('../../src/models/Contenedor')
jest.mock('../../src/models/Evento')
jest.mock('../../src/models/Informe')
jest.mock('bcrypt')

const bcrypt = require('bcrypt')
const Usuario = require('../../src/models/Usuario')
const Contenedor = require('../../src/models/Contenedor')
const Evento = require('../../src/models/Evento')
const Informe = require('../../src/models/Informe')
const { listar, obtenerPorId, actualizar, cambiarContrasena, eliminar } = require('../../src/services/usuarioService')

describe('usuarioService', () => {
  beforeEach(() => jest.clearAllMocks())

  // ---------------------------------------------------------------------------
  // listar
  // ---------------------------------------------------------------------------
  describe('listar', () => {
    it('devuelve todos los usuarios sin contraseña', async () => {
      const mockUsers = [
        { _id: '1', nombre: 'Admin', rol: 'admin' },
        { _id: '2', nombre: 'Gestor', rol: 'gestor' },
      ]
      Usuario.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockUsers),
        }),
      })

      const result = await listar()

      expect(result).toEqual(mockUsers)
      expect(Usuario.find).toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // obtenerPorId
  // ---------------------------------------------------------------------------
  describe('obtenerPorId', () => {
    it('devuelve el usuario si existe', async () => {
      const mockUser = { _id: 'user-id', nombre: 'Test', rol: 'gestor' }
      Usuario.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockUser),
        }),
      })

      const result = await obtenerPorId('user-id')

      expect(result).toEqual(mockUser)
    })

    it('lanza error 404 si el usuario no existe', async () => {
      Usuario.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      })

      await expect(obtenerPorId('non-existent')).rejects.toMatchObject({ status: 404 })
    })
  })

  // ---------------------------------------------------------------------------
  // actualizar
  // ---------------------------------------------------------------------------
  describe('actualizar', () => {
    it('actualiza el usuario correctamente', async () => {
      const mockUser = { _id: 'user-id', rol: 'gestor', nombre: 'Antiguo' }
      const updatedUser = { _id: 'user-id', nombre: 'Nuevo', rol: 'gestor' }

      Usuario.findById.mockResolvedValue(mockUser)
      Usuario.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(updatedUser),
        }),
      })

      const result = await actualizar('user-id', { nombre: 'Nuevo' })

      expect(result.nombre).toBe('Nuevo')
    })

    it('lanza error 404 si el usuario no existe', async () => {
      Usuario.findById.mockResolvedValue(null)

      await expect(actualizar('non-existent', { nombre: 'Test' })).rejects.toMatchObject({ status: 404 })
    })

    it('lanza error 409 si el nuevo correo ya está en uso por otro usuario', async () => {
      Usuario.findById.mockResolvedValue({ _id: 'user-id', rol: 'gestor' })
      Usuario.findOne.mockResolvedValue({ _id: 'otro-id', correo: 'ocupado@test.com' })

      await expect(
        actualizar('user-id', { correo: 'ocupado@test.com' })
      ).rejects.toMatchObject({ status: 409 })
    })

    it('lanza error 409 al intentar cambiar el rol del único admin', async () => {
      Usuario.findById.mockResolvedValue({ _id: 'user-id', rol: 'admin' })
      Usuario.findOne.mockResolvedValue(null)
      Usuario.countDocuments.mockResolvedValue(1)

      await expect(
        actualizar('user-id', { rol: 'gestor' })
      ).rejects.toMatchObject({ status: 409 })
    })

    it('permite cambiar el rol si hay más de un admin', async () => {
      const mockUser = { _id: 'user-id', rol: 'admin' }
      const updatedUser = { _id: 'user-id', rol: 'gestor' }

      Usuario.findById.mockResolvedValue(mockUser)
      Usuario.findOne.mockResolvedValue(null)
      Usuario.countDocuments.mockResolvedValue(2)
      Usuario.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(updatedUser),
        }),
      })

      const result = await actualizar('user-id', { rol: 'gestor' })

      expect(result.rol).toBe('gestor')
    })

    it('lanza error 403 al intentar cambiar el rol de un admin protegido', async () => {
      Usuario.findById.mockResolvedValue({ _id: 'user-id', rol: 'admin', protegido: true })
      Usuario.findOne.mockResolvedValue(null)

      await expect(
        actualizar('user-id', { rol: 'gestor' })
      ).rejects.toMatchObject({ status: 403 })
      expect(Usuario.findByIdAndUpdate).not.toHaveBeenCalled()
    })

    it('permite editar el nombre de un admin protegido (solo se protege el rol)', async () => {
      Usuario.findById.mockResolvedValue({ _id: 'user-id', rol: 'admin', protegido: true })
      Usuario.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: 'user-id', nombre: 'Nuevo', rol: 'admin' }),
        }),
      })

      const result = await actualizar('user-id', { nombre: 'Nuevo' })

      expect(result.nombre).toBe('Nuevo')
    })

    it('no incluye contrasena en la actualización aunque venga en el body', async () => {
      const mockUser = { _id: 'user-id', rol: 'gestor' }
      Usuario.findById.mockResolvedValue(mockUser)
      Usuario.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: 'user-id', nombre: 'Test', rol: 'gestor' }),
        }),
      })

      await actualizar('user-id', { nombre: 'Test', contrasena: 'hack' })

      const updateArg = Usuario.findByIdAndUpdate.mock.calls[0][1]
      expect(updateArg.contrasena).toBeUndefined()
    })
  })

  // ---------------------------------------------------------------------------
  // cambiarContrasena
  // ---------------------------------------------------------------------------
  describe('cambiarContrasena', () => {
    it('cambia la contraseña cuando la contraseña actual es correcta', async () => {
      Usuario.findById.mockResolvedValue({ _id: 'user-id', contrasena: 'old-hash' })
      bcrypt.compare.mockResolvedValue(true)
      bcrypt.hash.mockResolvedValue('new-hash')
      Usuario.findByIdAndUpdate.mockResolvedValue({})

      await expect(cambiarContrasena('user-id', 'old-pass', 'new-pass')).resolves.not.toThrow()
      expect(bcrypt.hash).toHaveBeenCalledWith('new-pass', 10)
    })

    it('lanza error 422 si la contraseña actual no coincide', async () => {
      Usuario.findById.mockResolvedValue({ _id: 'user-id', contrasena: 'hash' })
      bcrypt.compare.mockResolvedValue(false)

      await expect(cambiarContrasena('user-id', 'wrong', 'new')).rejects.toMatchObject({ status: 422 })
    })

    it('lanza error 404 si el usuario no existe', async () => {
      Usuario.findById.mockResolvedValue(null)

      await expect(cambiarContrasena('non-existent', 'old', 'new')).rejects.toMatchObject({ status: 404 })
    })
  })

  // ---------------------------------------------------------------------------
  // eliminar
  // ---------------------------------------------------------------------------
  describe('eliminar', () => {
    it('elimina un usuario no-admin correctamente', async () => {
      const mockUser = { _id: 'user-id', rol: 'gestor', deleteOne: jest.fn().mockResolvedValue({}) }
      Usuario.findById.mockResolvedValue(mockUser)

      await expect(eliminar('user-id')).resolves.not.toThrow()
      expect(mockUser.deleteOne).toHaveBeenCalled()
    })

    it('elimina un admin cuando hay más de uno', async () => {
      const mockUser = { _id: 'user-id', rol: 'admin', deleteOne: jest.fn().mockResolvedValue({}) }
      Usuario.findById.mockResolvedValue(mockUser)
      Usuario.countDocuments.mockResolvedValue(2)

      await expect(eliminar('user-id')).resolves.not.toThrow()
      expect(mockUser.deleteOne).toHaveBeenCalled()
    })

    it('lanza error 409 al intentar eliminar el único admin', async () => {
      const mockUser = { _id: 'user-id', rol: 'admin', deleteOne: jest.fn() }
      Usuario.findById.mockResolvedValue(mockUser)
      Usuario.countDocuments.mockResolvedValue(1)

      await expect(eliminar('user-id')).rejects.toMatchObject({ status: 409 })
      expect(mockUser.deleteOne).not.toHaveBeenCalled()
    })

    it('lanza error 404 si el usuario no existe', async () => {
      Usuario.findById.mockResolvedValue(null)

      await expect(eliminar('non-existent')).rejects.toMatchObject({ status: 404 })
    })

    it('lanza error 403 al intentar eliminar un admin protegido', async () => {
      const mockUser = { _id: 'user-id', rol: 'admin', protegido: true, deleteOne: jest.fn() }
      Usuario.findById.mockResolvedValue(mockUser)

      await expect(eliminar('user-id')).rejects.toMatchObject({ status: 403 })
      expect(mockUser.deleteOne).not.toHaveBeenCalled()
    })

    it('lanza error 409 (restrict) si el usuario tiene datos asociados', async () => {
      const mockUser = { _id: 'user-id', rol: 'gestor', deleteOne: jest.fn() }
      Usuario.findById.mockResolvedValue(mockUser)
      Contenedor.exists.mockResolvedValueOnce({ _id: 'cont-1' })

      await expect(eliminar('user-id')).rejects.toMatchObject({ status: 409 })
      expect(mockUser.deleteOne).not.toHaveBeenCalled()
    })
  })
})
