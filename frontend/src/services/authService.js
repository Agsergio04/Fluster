import apiClient from './apiClient'
import { guardarSesion } from './session'

/**
 * Autentica al usuario y guarda la sesión automáticamente.
 * El llamador recibe el objeto usuario y no necesita gestionar el token.
 *
 * @param {string} correo
 * @param {string} contrasena
 * @returns {object} Datos del usuario autenticado
 */
export async function login(correo, contrasena) {
  const { data } = await apiClient.post('/auth/login', { correo, contrasena })
  guardarSesion(data.token, data.usuario)
  return data.usuario
}

/**
 * Crea una cuenta nueva. No inicia sesión automáticamente: el usuario
 * debe hacer login con sus credenciales tras el registro.
 *
 * @param {string} nombre
 * @param {string} correo
 * @param {string} contrasena
 * @param {'gestor'|'operador'} rol
 */
export async function registro(nombre, correo, contrasena, rol) {
  const { data } = await apiClient.post('/auth/registro', { nombre, correo, contrasena, rol })
  return data
}
