process.env.JWT_SECRET = 'test_secret'

const request = require('supertest')
const app = require('../../src/app')
const { conectar, desconectar, limpiar } = require('./dbSetup')

beforeAll(conectar)
afterAll(desconectar)
afterEach(limpiar)

/** Registra e inicia sesión con un rol y devuelve el token JWT real. */
async function tokenDe(rol) {
  const correo = `${rol}@test.com`
  await request(app)
    .post('/api/auth/registro')
    .send({ nombre: rol, correo, contrasena: 'secreto123', rol })
  const res = await request(app)
    .post('/api/auth/login')
    .send({ correo, contrasena: 'secreto123' })
  return res.body.token
}

describe('Integración: Clientes (CRUD con autenticación y roles)', () => {
  it('rechaza el acceso sin token con 401', async () => {
    const res = await request(app).get('/api/clientes')
    expect(res.status).toBe(401)
  })

  it('rechaza a un operador con 403 (la ruta es solo de gestor)', async () => {
    const token = await tokenDe('operador')
    const res = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it('un gestor puede crear un cliente y recuperarlo en el listado', async () => {
    const token = await tokenDe('gestor')

    const creado = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Mercadona' })

    expect(creado.status).toBe(201)
    expect(creado.body.nombre).toBe('Mercadona')
    expect(creado.body._id).toBeDefined()

    const listado = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${token}`)

    expect(listado.status).toBe(200)
    expect(listado.body).toHaveLength(1)
    expect(listado.body[0].nombre).toBe('Mercadona')
  })

  it('un gestor puede actualizar un cliente existente', async () => {
    const token = await tokenDe('gestor')

    const creado = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Lidl' })

    const actualizado = await request(app)
      .put(`/api/clientes/${creado.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Lidl España' })

    expect(actualizado.status).toBe(200)
    expect(actualizado.body.nombre).toBe('Lidl España')
  })

  it('un gestor puede eliminar un cliente', async () => {
    const token = await tokenDe('gestor')

    const creado = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Carrefour' })

    const eliminado = await request(app)
      .delete(`/api/clientes/${creado.body._id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(eliminado.status).toBe(204)

    const listado = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${token}`)

    expect(listado.body).toHaveLength(0)
  })

  it('devuelve 404 al obtener un cliente inexistente', async () => {
    const token = await tokenDe('gestor')
    const idInexistente = '507f1f77bcf86cd799439011'

    const res = await request(app)
      .get(`/api/clientes/${idInexistente}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})
