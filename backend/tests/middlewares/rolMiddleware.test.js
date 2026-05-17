const verificarRol = require('../../src/middlewares/rolMiddleware')

describe('rolMiddleware', () => {
  let res, next

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    next = jest.fn()
  })

  it('llama a next() cuando el usuario tiene el rol permitido', () => {
    const req = { usuario: { rol: 'admin' } }

    verificarRol('admin')(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('llama a next() cuando el rol está en una lista de varios roles permitidos', () => {
    const req = { usuario: { rol: 'gestor' } }

    verificarRol('admin', 'gestor')(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('devuelve 403 cuando el usuario no tiene ninguno de los roles permitidos', () => {
    const req = { usuario: { rol: 'operador' } }

    verificarRol('admin', 'gestor')(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ mensaje: expect.any(String) }))
    expect(next).not.toHaveBeenCalled()
  })

  it('devuelve 403 aunque el rol del usuario exista pero no esté en la lista', () => {
    const req = { usuario: { rol: 'admin' } }

    verificarRol('gestor', 'operador')(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('permite todos los roles cuando se incluyen los tres en la lista', () => {
    const roles = ['admin', 'gestor', 'operador']

    for (const rol of roles) {
      const req = { usuario: { rol } }
      verificarRol('admin', 'gestor', 'operador')(req, res, next)
    }

    expect(next).toHaveBeenCalledTimes(3)
  })

  it('cada llamada genera un middleware independiente', () => {
    const middlewareAdmin = verificarRol('admin')
    const middlewareGestor = verificarRol('gestor')

    const reqAdmin = { usuario: { rol: 'admin' } }
    const reqGestor = { usuario: { rol: 'gestor' } }

    middlewareAdmin(reqAdmin, res, next)
    middlewareGestor(reqGestor, res, next)

    expect(next).toHaveBeenCalledTimes(2)
  })
})
