jest.mock('../src/services/authService')

const authService = require('../src/services/authService')
const { registrar, login } = require('../src/controllers/authController')

describe('authController', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    req  = { body: {} }
    res  = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    next = jest.fn()
  })

  describe('registrar', () => {
    it('devuelve 201 con el usuario creado', async () => {
      const usuario = { _id: 'u1', nombre: 'Ana', correo: 'ana@test.com', rol: 'operador' }
      authService.registrar.mockResolvedValue(usuario)
      req.body = { nombre: 'Ana', correo: 'ana@test.com', contrasena: '1234', rol: 'operador' }

      await registrar(req, res, next)

      expect(authService.registrar).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(usuario)
      expect(next).not.toHaveBeenCalled()
    })

    it('llama a next cuando el servicio lanza un error', async () => {
      const err = new Error('Correo ya registrado')
      err.status = 409
      authService.registrar.mockRejectedValue(err)

      await registrar(req, res, next)

      expect(next).toHaveBeenCalledWith(err)
      expect(res.status).not.toHaveBeenCalled()
    })
  })

  describe('login', () => {
    it('devuelve 200 con token y datos del usuario', async () => {
      const resultado = { token: 'jwt-token', usuario: { correo: 'ana@test.com', rol: 'gestor' } }
      authService.login.mockResolvedValue(resultado)
      req.body = { correo: 'ana@test.com', contrasena: '1234' }

      await login(req, res, next)

      expect(authService.login).toHaveBeenCalledWith('ana@test.com', '1234')
      expect(res.json).toHaveBeenCalledWith(resultado)
      expect(next).not.toHaveBeenCalled()
    })

    it('llama a next cuando las credenciales son incorrectas', async () => {
      const err = new Error('Credenciales incorrectas')
      err.status = 401
      authService.login.mockRejectedValue(err)

      await login(req, res, next)

      expect(next).toHaveBeenCalledWith(err)
      expect(res.json).not.toHaveBeenCalled()
    })
  })
})
