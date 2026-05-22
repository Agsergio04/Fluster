import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import useTema from '../../src/hooks/useTema'

function mockMatchMedia(prefersDark) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: prefersDark,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('useTema', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('devuelve "light" por defecto cuando no hay preferencia guardada ni de sistema', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useTema())
    expect(result.current[0]).toBe('light')
  })

  it('devuelve "dark" cuando la preferencia del sistema es dark y no hay valor guardado', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useTema())
    expect(result.current[0]).toBe('dark')
  })

  it('respeta el valor guardado en localStorage sobre la preferencia del sistema', () => {
    localStorage.setItem('tema', 'dark')
    mockMatchMedia(false)
    const { result } = renderHook(() => useTema())
    expect(result.current[0]).toBe('dark')
  })

  it('aplica el tema como atributo data-theme en documentElement', () => {
    mockMatchMedia(false)
    renderHook(() => useTema())
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('toggleTema cambia de light a dark', () => {
    localStorage.setItem('tema', 'light')
    mockMatchMedia(false)
    const { result } = renderHook(() => useTema())
    act(() => result.current[1]())
    expect(result.current[0]).toBe('dark')
  })

  it('toggleTema cambia de dark a light', () => {
    localStorage.setItem('tema', 'dark')
    mockMatchMedia(true)
    const { result } = renderHook(() => useTema())
    act(() => result.current[1]())
    expect(result.current[0]).toBe('light')
  })

  it('persiste el nuevo tema en localStorage tras el toggle', () => {
    localStorage.setItem('tema', 'light')
    mockMatchMedia(false)
    const { result } = renderHook(() => useTema())
    act(() => result.current[1]())
    expect(localStorage.getItem('tema')).toBe('dark')
  })

  it('actualiza el atributo data-theme al hacer toggle', () => {
    localStorage.setItem('tema', 'light')
    mockMatchMedia(false)
    const { result } = renderHook(() => useTema())
    act(() => result.current[1]())
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
