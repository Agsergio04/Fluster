process.env.JWT_SECRET = 'test_secret'

const request = require('supertest')
const app = require('../../src/app')
const { conectar, desconectar, limpiar } = require('./dbSetup')

beforeAll(conectar)
afterAll(desconectar)
afterEach(limpiar)

const usuarioValido = {
  nombre: 'Ana Gestora',
  correo: 'ana@test.com',
  contrasena: 'secreto123',
  rol: 'gestor',
}

describe('Integración: Auth (ruta → controlador → servicio → MongoDB)', () => {
  describe('POST /api/auth/registro', () => {
    it('registra un usuario y devuelve 201 sin la contraseña', async () => {
      const res = await request(app).post('/api/auth/registro').send(usuarioValido)

      expect(res.status).toBe(201)
      expect(res.body.correo).toBe('ana@test.com')
      expect(res.body.rol).toBe('gestor')
      expect(res.body.contrasena).toBeUndefined()
    })

    it('persiste la contraseña hasheada, nunca en texto plano', async () => {
      await request(app).post('/api/auth/registro').send(usuarioValido)

      const Usuario = require('../../src/models/Usuario')
      const guardado = await Usuario.findOne({ correo: 'ana@test.com' })
      expect(guardado.contrasena).not.toBe('secreto123')
      expect(guardado.contrasena).toMatch(/^\$2[aby]\$/) // formato bcrypt
    })

    it('devuelve 409 si el correo ya existe', async () => {
      await request(app).post('/api/auth/registro').send(usuarioValido)
      const res = await request(app).post('/api/auth/registro').send(usuarioValido)

      expect(res.status).toBe(409)
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/registro').send(usuarioValido)
    })

    it('devuelve token y usuario con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ correo: 'ana@test.com', contrasena: 'secreto123' })

      expect(res.status).toBe(200)
      expect(res.body.token).toBeDefined()
      expect(res.body.usuario.rol).toBe('gestor')
      expect(res.body.usuario.correo).toBe('ana@test.com')
    })

    it('devuelve 401 con contraseña incorrecta', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ correo: 'ana@test.com', contrasena: 'incorrecta' })

      expect(res.status).toBe(401)
    })

    it('devuelve 401 si el correo no está registrado', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ correo: 'nadie@test.com', contrasena: 'secreto123' })

      expect(res.status).toBe(401)
    })
  })
})
