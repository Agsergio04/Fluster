import { test, expect } from '@playwright/test'
import { loginComo } from './helpers/session.js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const semaforoFixture   = require('./fixtures/semaforo.json')
const navierasFixture   = require('./fixtures/navieras.json')
const clientesFixture   = require('./fixtures/clientes.json')

const API = 'http://localhost:3000/api'

// Mocks all API calls needed to render the semáforo page.
async function mockSemaforoAPI(page) {
  await page.route(`${API}/semaforo`,  route => route.fulfill({ json: semaforoFixture }))
  await page.route(`${API}/navieras`, route => route.fulfill({ json: navierasFixture }))
  await page.route(`${API}/clientes`, route => route.fulfill({ json: clientesFixture }))
}

test.describe('Semáforo', () => {
  test.beforeEach(async ({ page }) => {
    await loginComo(page, 'gestor')
    await mockSemaforoAPI(page)
  })

  test('muestra el título de la página', async ({ page }) => {
    await page.goto('/semaforo')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Estado de los contenedores')
  })

  test('muestra el contenedor de sin-coste (freeTime)', async ({ page }) => {
    await page.goto('/semaforo')
    await expect(page.getByText('MSCU1234567')).toBeVisible()
  })

  test('muestra el contenedor de primer tramo', async ({ page }) => {
    await page.goto('/semaforo')
    await expect(page.getByText('MAEU9876543')).toBeVisible()
  })

  test('muestra el contenedor de segundo tramo', async ({ page }) => {
    await page.goto('/semaforo')
    await expect(page.getByText('HLCU5551234')).toBeVisible()
  })

  test('muestra el contenedor inactivo', async ({ page }) => {
    await page.goto('/semaforo')
    await expect(page.getByText('TGHU0123456')).toBeVisible()
  })

  test('muestra el cliente asociado al contenedor de primer tramo', async ({ page }) => {
    await page.goto('/semaforo')
    await expect(page.getByText('Importaciones García')).toBeVisible()
  })

  test('no muestra el spinner de carga una vez que se reciben los datos', async ({ page }) => {
    await page.goto('/semaforo')
    await expect(page.getByText('Cargando contenedores...')).not.toBeVisible()
  })

  test('muestra un aviso si la API falla', async ({ page }) => {
    await page.route(`${API}/semaforo`, route => route.fulfill({ status: 500, json: {} }))
    await page.goto('/semaforo')
    await expect(page.getByText('No se pudieron cargar los contenedores')).toBeVisible()
  })
})
