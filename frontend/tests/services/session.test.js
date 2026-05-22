import { describe, it, expect, beforeEach } from 'vitest'
import {
  guardarSesion,
  limpiarSesion,
  getToken,
  getUsuario,
  isAuthenticated,
  actualizarUsuario,
} from '../../src/services/session'

describe('session', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('guardarSesion', () => {
    it('guarda el token en localStorage', () => {
      guardarSesion('mi-token', { nombre: 'Ana' })
      expect(localStorage.getItem('token')).toBe('mi-token')
    })

    it('guarda el usuario serializado como JSON', () => {
      const usuario = { nombre: 'Ana', rol: 'operador' }
      guardarSesion('mi-token', usuario)
      expect(JSON.parse(localStorage.getItem('usuario'))).toEqual(usuario)
    })
  })

  describe('limpiarSesion', () => {
    it('elimina token y usuario de localStorage', () => {
      guardarSesion('mi-token', { nombre: 'Ana' })
      limpiarSesion()
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('usuario')).toBeNull()
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

    it('no modifica localStorage si no hay sesión activa', () => {
      actualizarUsuario({ nombre: 'Ana' })
      expect(localStorage.getItem('usuario')).toBeNull()
    })

    it('conserva las propiedades no modificadas', () => {
      guardarSesion('token', { nombre: 'Ana', rol: 'operador', correo: 'ana@empresa.com' })
      actualizarUsuario({ rol: 'gestor' })
      expect(getUsuario()).toEqual({ nombre: 'Ana', rol: 'gestor', correo: 'ana@empresa.com' })
    })
  })
})
