import { describe, it, expect, beforeEach } from 'vitest'
import {
  guardarSesion,
  limpiarSesion,
  getToken,
  getUsuario,
  isAuthenticated,
  actualizarUsuario,
} from '../../src/services/session'

// Construye un JWT de prueba (header.payload.firma) con el payload indicado.
// El cliente solo lo decodifica (la firma la valida el servidor), así que no
// necesita ser real; sirve para comprobar que el rol se lee del token.
const b64url = obj =>
  btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const fakeJwt = payload => `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.firma`

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
    it('devuelve el objeto usuario con el rol tomado del JWT', () => {
      const usuario = { nombre: 'Ana', rol: 'gestor', correo: 'ana@a.com' }
      guardarSesion(fakeJwt({ id: '1', correo: 'ana@a.com', rol: 'gestor' }), usuario)
      expect(getUsuario()).toEqual(usuario)
    })

    it('devuelve null cuando no hay sesión', () => {
      expect(getUsuario()).toBeNull()
    })

    it('usa el rol del JWT e ignora el del objeto editable (no se puede escalar editando localStorage)', () => {
      guardarSesion(fakeJwt({ rol: 'operador' }), { nombre: 'Ana', rol: 'operador' })
      // Un atacante edita el objeto usuario para auto-asignarse admin
      localStorage.setItem('usuario', JSON.stringify({ nombre: 'Ana', rol: 'admin' }))
      expect(getUsuario().rol).toBe('operador') // sigue el token firmado, no el objeto manipulado
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
      guardarSesion(fakeJwt({ rol: 'operador' }), { nombre: 'Ana', rol: 'operador' })
      actualizarUsuario({ nombre: 'Ana García' })
      expect(getUsuario()).toEqual({ nombre: 'Ana García', rol: 'operador' })
    })

    it('no modifica localStorage si no hay sesión activa', () => {
      actualizarUsuario({ nombre: 'Ana' })
      expect(localStorage.getItem('usuario')).toBeNull()
    })

    it('conserva las propiedades no modificadas', () => {
      guardarSesion(fakeJwt({ rol: 'operador' }), { nombre: 'Ana', rol: 'operador', correo: 'ana@empresa.com' })
      actualizarUsuario({ nombre: 'Ana García' })
      expect(getUsuario()).toEqual({ nombre: 'Ana García', rol: 'operador', correo: 'ana@empresa.com' })
    })
  })
})
