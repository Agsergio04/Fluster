jest.mock('../../src/models/Usuario')
jest.mock('bcrypt')
jest.mock('jsonwebtoken')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Usuario = require('../../src/models/Usuario')
const { registrar, login } = require('../../src/services/authService')

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
  })

  describe('registrar', () => {
    it('crea un usuario nuevo y devuelve el objeto sin contraseña', async () => {
      Usuario.findOne.mockResolvedValue(null)
      bcrypt.hash.mockResolvedValue('hashed-password')
      Usuario.create.mockResolvedValue({
        toObject: () => ({
          _id: 'user-id',
          nombre: 'Test',
          correo: 'test@test.com',
          rol: 'operador',
          contrasena: 'hashed-password',
        }),
      })

      const result = await registrar({
        nombre: 'Test',
        correo: 'test@test.com',
        contrasena: '1234',
        rol: 'operador',
      })

      expect(result.contrasena).toBeUndefined()
      expect(result.correo).toBe('test@test.com')
      expect(result.nombre).toBe('Test')
      expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10)
    })

    it('llama a Usuario.create con la contraseña hasheada, nunca en texto plano', async () => {
      Usuario.findOne.mockResolvedValue(null)
      bcrypt.hash.mockResolvedValue('hashed-password')
      Usuario.create.mockResolvedValue({
        toObject: () => ({ _id: 'id', nombre: 'A', correo: 'a@a.com', rol: 'gestor' }),
      })

      await registrar({ nombre: 'A', correo: 'a@a.com', contrasena: 'plain', rol: 'gestor' })

      const createArgs = Usuario.create.mock.calls[0][0]
      expect(createArgs.contrasena).toBe('hashed-password')
      expect(createArgs.contrasena).not.toBe('plain')
    })

    it('lanza error 409 si el correo ya está registrado', async () => {
      Usuario.findOne.mockResolvedValue({ correo: 'test@test.com' })

      await expect(
        registrar({ nombre: 'Test', correo: 'test@test.com', contrasena: '1234', rol: 'operador' })
      ).rejects.toMatchObject({ status: 409 })

      expect(Usuario.create).not.toHaveBeenCalled()
    })

    it('rechaza con 403 el intento de registrarse como admin (escalada de privilegios)', async () => {
      await expect(
        registrar({ nombre: 'Hacker', correo: 'h@h.com', contrasena: '1234', rol: 'admin' })
      ).rejects.toMatchObject({ status: 403, campo: 'rol' })

      expect(Usuario.findOne).not.toHaveBeenCalled()
      expect(Usuario.create).not.toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('devuelve token y datos del usuario con credenciales correctas', async () => {
      const mockUser = {
        _id: 'user-id',
        nombre: 'Test',
        correo: 'test@test.com',
        rol: 'gestor',
        contrasena: 'hashed',
      }
      Usuario.findOne.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(true)
      jwt.sign.mockReturnValue('jwt-token')

      const result = await login('test@test.com', '1234')

      expect(result.token).toBe('jwt-token')
      expect(result.usuario.correo).toBe('test@test.com')
      expect(result.usuario.rol).toBe('gestor')
      expect(result.usuario.contrasena).toBeUndefined()
    })

    it('el token se firma con el id, correo y rol del usuario', async () => {
      const mockUser = { _id: 'user-id', nombre: 'Test', correo: 'test@test.com', rol: 'admin', contrasena: 'hashed' }
      Usuario.findOne.mockResolvedValue(mockUser)
      bcrypt.compare.mockResolvedValue(true)
      jwt.sign.mockReturnValue('jwt-token')

      await login('test@test.com', '1234')

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user-id', correo: 'test@test.com', rol: 'admin' },
        'test-secret',
        { algorithm: 'HS256' }
      )
    })

    it('lanza error 401 si el usuario no existe', async () => {
      Usuario.findOne.mockResolvedValue(null)

      await expect(login('no@existe.com', '1234')).rejects.toMatchObject({ status: 401 })
    })

    it('lanza error 401 si la contraseña es incorrecta', async () => {
      Usuario.findOne.mockResolvedValue({ correo: 'test@test.com', contrasena: 'hashed' })
      bcrypt.compare.mockResolvedValue(false)

      await expect(login('test@test.com', 'wrong')).rejects.toMatchObject({ status: 401 })
    })

    it('distingue el error por campo: correo no registrado marca el campo "correo"', async () => {
      Usuario.findOne.mockResolvedValue(null)
      const err = await login('no@existe.com', '1234').catch(e => e)

      expect(err.campo).toBe('correo')
      expect(err.message).toBe('El correo no está registrado')
    })

    it('distingue el error por campo: contraseña incorrecta marca el campo "contrasena"', async () => {
      Usuario.findOne.mockResolvedValue({ correo: 'test@test.com', contrasena: 'hashed' })
      bcrypt.compare.mockResolvedValue(false)
      const err = await login('test@test.com', 'wrong').catch(e => e)

      expect(err.campo).toBe('contrasena')
      expect(err.message).toBe('Contraseña incorrecta')
    })
  })
})
