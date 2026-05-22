import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const authFixtures = require('../fixtures/auth.json')

/**
 * Inyecta token y datos de usuario en localStorage antes de que la
 * página cargue, simulando una sesión activa sin pasar por el login real.
 *
 * Debe llamarse ANTES de page.goto() para que el script se ejecute
 * en el contexto de la primera navegación.
 *
 * @param {import('@playwright/test').Page} page
 * @param {'gestor' | 'operador' | 'admin'} rol
 */
export async function loginComo(page, rol) {
  const { token, usuario } = authFixtures[rol]
  await page.addInitScript(({ token, usuario }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(usuario))
  }, { token, usuario })
}
