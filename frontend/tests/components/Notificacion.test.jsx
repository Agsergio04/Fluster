import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Notificacion from '../../src/components/atomos/Notificacion'

describe('Notificacion', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('no renderiza nada cuando mensaje está vacío', () => {
    const { container } = render(<Notificacion mensaje="" onCerrar={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renderiza el mensaje cuando se proporciona', () => {
    render(<Notificacion mensaje="Operación completada" onCerrar={() => {}} />)
    expect(screen.getByText('Operación completada')).toBeInTheDocument()
  })

  it('tiene role="alert" para accesibilidad', () => {
    render(<Notificacion mensaje="Aviso" onCerrar={() => {}} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('llama a onCerrar al hacer clic en el botón de cierre', () => {
    const onCerrar = vi.fn()
    render(<Notificacion mensaje="Aviso" onCerrar={onCerrar} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar notificación' }))
    expect(onCerrar).toHaveBeenCalledTimes(1)
  })

  it('llama a onCerrar automáticamente después de 4000ms por defecto', () => {
    const onCerrar = vi.fn()
    render(<Notificacion mensaje="Aviso" onCerrar={onCerrar} />)
    act(() => vi.advanceTimersByTime(4000))
    expect(onCerrar).toHaveBeenCalledTimes(1)
  })

  it('no llama a onCerrar antes de que expire la duración', () => {
    const onCerrar = vi.fn()
    render(<Notificacion mensaje="Aviso" onCerrar={onCerrar} />)
    act(() => vi.advanceTimersByTime(3999))
    expect(onCerrar).not.toHaveBeenCalled()
  })

  it('respeta una duración personalizada', () => {
    const onCerrar = vi.fn()
    render(<Notificacion mensaje="Aviso" onCerrar={onCerrar} duracion={2000} />)
    act(() => vi.advanceTimersByTime(1999))
    expect(onCerrar).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onCerrar).toHaveBeenCalledTimes(1)
  })
})
