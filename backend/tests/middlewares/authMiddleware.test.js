jest.mock('jsonwebtoken')

const jwt = require('jsonwebtoken')
const authMiddleware = require('../../src/middlewares/authMiddleware')

describe('authMiddleware', () => {
  let req, res, next

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    req = { headers: {} }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    next = jest.fn()
  })

  it('llama a next() y adjunta req.usuario cuando el token es válido', () => {
    const payload = { id: 'user-id', correo: 'test@test.com', rol: 'admin' }
    req.headers.authorization = 'Bearer valid-token'
    jwt.verify.mockReturnValue(payload)

    authMiddleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.usuario).toEqual(payload)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('devuelve 401 si no hay header Authorization', () => {
    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: expect.any(String) }))
    expect(next).not.toHaveBeenCalled()
  })

  it('devuelve 401 si el header no empieza por "Bearer "', () => {
    req.headers.authorization = 'Basic dXNlcjpwYXNz'

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('devuelve 401 si el token es inválido o ha sido manipulado', () => {
    req.headers.authorization = 'Bearer token-manipulado'
    jwt.verify.mockImplementation(() => { throw new Error('invalid signature') })

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('devuelve 401 si el token ha expirado', () => {
    req.headers.authorization = 'Bearer token-expirado'
    jwt.verify.mockImplementation(() => { throw new Error('jwt expired') })

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('pasa el payload completo (id, correo, rol) a req.usuario', () => {
    const payload = { id: 'abc123', correo: 'gestor@empresa.com', rol: 'gestor' }
    req.headers.authorization = 'Bearer un-token'
    jwt.verify.mockReturnValue(payload)

    authMiddleware(req, res, next)

    expect(req.usuario.id).toBe('abc123')
    expect(req.usuario.correo).toBe('gestor@empresa.com')
    expect(req.usuario.rol).toBe('gestor')
  })
})
