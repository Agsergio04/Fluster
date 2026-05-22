import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('../../src/services/contenedorService', () => ({
  listarContenedores: vi.fn(),
}))

import { listarContenedores } from '../../src/services/contenedorService'
import useContenedores from '../../src/hooks/useContenedores'

describe('useContenedores', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('inicia con la lista vacía y cargando=true', () => {
    listarContenedores.mockResolvedValue([])
    const { result } = renderHook(() => useContenedores())
    expect(result.current.contenedores).toEqual([])
    expect(result.current.cargando).toBe(true)
  })

  it('carga los contenedores y pone cargando=false al resolver', async () => {
    const datos = [{ _id: '1', codigoBIC: 'MSCU1234567' }]
    listarContenedores.mockResolvedValue(datos)
    const { result } = renderHook(() => useContenedores())
    await waitFor(() => expect(result.current.cargando).toBe(false))
    expect(result.current.contenedores).toEqual(datos)
  })

  it('pone cargando=false incluso cuando la petición falla', async () => {
    listarContenedores.mockRejectedValue(new Error('Error de red'))
    const { result } = renderHook(() => useContenedores())
    await waitFor(() => expect(result.current.cargando).toBe(false))
  })

  it('establece el aviso de error cuando la petición falla', async () => {
    listarContenedores.mockRejectedValue(new Error('Error de red'))
    const { result } = renderHook(() => useContenedores())
    await waitFor(() => expect(result.current.cargando).toBe(false))
    expect(result.current.aviso).toBe('No se pudieron cargar los contenedores')
  })

  it('setContenedores permite actualizar la lista localmente', async () => {
    listarContenedores.mockResolvedValue([])
    const { result } = renderHook(() => useContenedores())
    await waitFor(() => expect(result.current.cargando).toBe(false))
    const nuevos = [{ _id: '2', codigoBIC: 'TEST1234567' }]
    act(() => result.current.setContenedores(nuevos))
    expect(result.current.contenedores).toEqual(nuevos)
  })

  it('inicia sin aviso de error', () => {
    listarContenedores.mockResolvedValue([])
    const { result } = renderHook(() => useContenedores())
    expect(result.current.aviso).toBe('')
  })
})
