import { test, expect } from '@playwright/test'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const authFixtures = require('./fixtures/auth.json')

const API = 'http://localhost:3000/api'

// Intercepts POST /api/auth/login and returns the given fixture response.
async function mockLogin(page, respuesta) {
  await page.route(`${API}/auth/login`, route =>
    route.fulfill({ status: 200, json: respuesta })
  )
}

// Intercepts POST /api/auth/login and simulates an error response.
async function mockLoginError(page, status, body) {
  await page.route(`${API}/auth/login`, route =>
    route.fulfill({ status, json: body })
  )
}

test.describe('Login', () => {
  test('gestor es redirigido a /semaforo tras iniciar sesión', async ({ page }) => {
    await mockLogin(page, authFixtures.gestor)

    await page.goto('/login')
    await page.locator('#login-correo').fill('gestor@fluster.com')
    await page.locator('#login-contrasenia').fill('contraseña123')
    await page.locator('form').evaluate(f => f.requestSubmit())

    await expect(page).toHaveURL('/semaforo')
  })

  test('operador es redirigido a /meter-contenedor tras iniciar sesión', async ({ page }) => {
    await mockLogin(page, authFixtures.operador)

    await page.goto('/login')
    await page.locator('#login-correo').fill('operador@fluster.com')
    await page.locator('#login-contrasenia').fill('contraseña123')
    await page.locator('form').evaluate(f => f.requestSubmit())

    await expect(page).toHaveURL('/meter-contenedor')
  })

  test('admin es redirigido a /panel-de-control tras iniciar sesión', async ({ page }) => {
    await mockLogin(page, authFixtures.admin)

    await page.goto('/login')
    await page.locator('#login-correo').fill('admin@fluster.com')
    await page.locator('#login-contrasenia').fill('contraseña123')
    await page.locator('form').evaluate(f => f.requestSubmit())

    await expect(page).toHaveURL('/panel-de-control')
  })

  test('error de correo incorrecto se muestra bajo el campo de correo', async ({ page }) => {
    await mockLoginError(page, 401, { mensaje: 'Correo no registrado', campo: 'correo' })

    await page.goto('/login')
    await page.locator('#login-correo').fill('noexiste@fluster.com')
    await page.locator('#login-contrasenia').fill('contraseña123')
    await page.locator('form').evaluate(f => f.requestSubmit())

    await expect(page.locator('.input__error').first()).toContainText('Correo no registrado')
    await expect(page).toHaveURL('/login')
  })

  test('error de contraseña incorrecta se muestra bajo el campo de contraseña', async ({ page }) => {
    await mockLoginError(page, 401, { mensaje: 'Contraseña incorrecta', campo: 'contrasenia' })

    await page.goto('/login')
    await page.locator('#login-correo').fill('gestor@fluster.com')
    await page.locator('#login-contrasenia').fill('malacontra')
    await page.locator('form').evaluate(f => f.requestSubmit())

    await expect(page.locator('.input__error').first()).toContainText('Contraseña incorrecta')
    await expect(page).toHaveURL('/login')
  })

  test('no redirige si el correo está vacío', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#login-contrasenia').fill('contraseña123')
    await page.locator('form').evaluate(f => f.requestSubmit())

    await expect(page).toHaveURL('/login')
    await expect(page.locator('.input__error').first()).toContainText('Introduce tu correo')
  })

  test('no redirige si la contraseña está vacía', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#login-correo').fill('gestor@fluster.com')
    await page.locator('form').evaluate(f => f.requestSubmit())

    await expect(page).toHaveURL('/login')
    await expect(page.locator('.input__error').first()).toContainText('Introduce tu contraseña')
  })
})
