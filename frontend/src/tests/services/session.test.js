import { describe, it, expect, beforeEach } from 'vitest'
import {
  guardarSesion,
  limpiarSesion,
  getToken,
  getUsuario,
  isAuthenticated,
  actualizarUsuario,
} from '../../services/session'

describe('session', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  describe('guardarSesion', () => {
    it('guarda el token en sessionStorage', () => {
      guardarSesion('mi-token', { nombre: 'Ana' })
      expect(sessionStorage.getItem('token')).toBe('mi-token')
    })

    it('guarda el usuario serializado como JSON', () => {
      const usuario = { nombre: 'Ana', rol: 'operador' }
      guardarSesion('mi-token', usuario)
      expect(JSON.parse(sessionStorage.getItem('usuario'))).toEqual(usuario)
    })
  })

  describe('limpiarSesion', () => {
    it('elimina token y usuario de sessionStorage', () => {
      guardarSesion('mi-token', { nombre: 'Ana' })
      limpiarSesion()
      expect(sessionStorage.getItem('token')).toBeNull()
      expect(sessionStorage.getItem('usuario')).toBeNull()
    })
  })

  describe('getToken', () => {
    it('devuelve el token cuando hay sesión activa', () => {
      guardarSesion('abc123', { nombre: 'Ana' })
      expect(getToken()).toBe('abc123')
    })

    it('devuelve null cuando no hay sesión', () => {
      expect(getToken()).toBeNull()
    })
  })

  describe('getUsuario', () => {
    it('devuelve el objeto usuario cuando hay sesión', () => {
      const usuario = { nombre: 'Ana', rol: 'gestor' }
      guardarSesion('token', usuario)
      expect(getUsuario()).toEqual(usuario)
    })

    it('devuelve null cuando no hay sesión', () => {
      expect(getUsuario()).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('devuelve true cuando hay token guardado', () => {
      guardarSesion('token', { nombre: 'Ana' })
      expect(isAuthenticated()).toBe(true)
    })

    it('devuelve false cuando no hay token', () => {
      expect(isAuthenticated()).toBe(false)
    })
  })

  describe('actualizarUsuario', () => {
    it('aplica cambios parciales sobre el usuario existente', () => {
      guardarSesion('token', { nombre: 'Ana', rol: 'operador' })
      actualizarUsuario({ nombre: 'Ana García' })
      expect(getUsuario()).toEqual({ nombre: 'Ana García', rol: 'operador' })
    })

    it('no modifica sessionStorage si no hay sesión activa', () => {
      actualizarUsuario({ nombre: 'Ana' })
      expect(sessionStorage.getItem('usuario')).toBeNull()
    })

    it('conserva las propiedades no modificadas', () => {
      guardarSesion('token', { nombre: 'Ana', rol: 'operador', correo: 'ana@empresa.com' })
      actualizarUsuario({ rol: 'gestor' })
      expect(getUsuario()).toEqual({ nombre: 'Ana', rol: 'gestor', correo: 'ana@empresa.com' })
    })
  })
})
