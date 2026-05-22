import { test, expect } from '@playwright/test'
import { loginComo } from './helpers/session.js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const contenedoresFixture = require('./fixtures/contenedores.json')
const navierasFixture     = require('./fixtures/navieras.json')
const clientesFixture     = require('./fixtures/clientes.json')

const API = 'http://localhost:3000/api'

// Mocks all API calls needed to render the almacén page.
async function mockAlmacenAPI(page) {
  await page.route(`${API}/contenedores`,         route => route.fulfill({ json: contenedoresFixture }))
  await page.route(`${API}/navieras`,             route => route.fulfill({ json: navierasFixture }))
  await page.route(`${API}/clientes`,             route => route.fulfill({ json: clientesFixture }))
  await page.route(`${API}/informes/generar-datos`, route => route.fulfill({ json: [] }))
}

test.describe('Almacén', () => {
  test.beforeEach(async ({ page }) => {
    await loginComo(page, 'gestor')
    await mockAlmacenAPI(page)
  })

  test('muestra todos los contenedores del fixture', async ({ page }) => {
    await page.goto('/almacen')
    await expect(page.getByText('MSCU1234567')).toBeVisible()
    await expect(page.getByText('MAEU9876543')).toBeVisible()
    await expect(page.getByText('HLCU5551234')).toBeVisible()
    await expect(page.getByText('TGHU0123456')).toBeVisible()
  })

  test('el buscador filtra por código BIC', async ({ page }) => {
    await page.goto('/almacen')

    const buscador = page.getByPlaceholder(/buscar/i)
    await buscador.fill('MSCU')

    await expect(page.getByText('MSCU1234567')).toBeVisible()
    await expect(page.getByText('MAEU9876543')).not.toBeVisible()
  })

  test('limpiar el buscador vuelve a mostrar todos los contenedores', async ({ page }) => {
    await page.goto('/almacen')

    const buscador = page.getByPlaceholder(/buscar/i)
    await buscador.fill('MSCU')
    await buscador.clear()

    await expect(page.getByText('MSCU1234567')).toBeVisible()
    await expect(page.getByText('MAEU9876543')).toBeVisible()
  })

  test('muestra un aviso si la API de contenedores falla', async ({ page }) => {
    await page.route(`${API}/contenedores`, route => route.fulfill({ status: 500, json: {} }))
    await page.goto('/almacen')
    await expect(page.getByText('No se pudieron cargar los contenedores')).toBeVisible()
  })

  test('no muestra el spinner una vez cargados los datos', async ({ page }) => {
    await page.goto('/almacen')
    await expect(page.getByRole('status')).not.toBeVisible()
  })
})
