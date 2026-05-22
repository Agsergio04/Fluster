import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BotonEliminar from '../../src/components/atomos/BotonEliminar'

describe('BotonEliminar', () => {
  it('renderiza el texto "Eliminar"', () => {
    render(<BotonEliminar onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
  })

  it('llama a onClick al hacer clic', () => {
    const handleClick = vi.fn()
    render(<BotonEliminar onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('está deshabilitado cuando disabled=true', () => {
    render(<BotonEliminar onClick={() => {}} disabled />)
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeDisabled()
  })

  it('no está deshabilitado por defecto', () => {
    render(<BotonEliminar onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /eliminar/i })).not.toBeDisabled()
  })

  it('tiene la clase btn-eliminar', () => {
    render(<BotonEliminar onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /eliminar/i })).toHaveClass('btn-eliminar')
  })

  it('no llama a onClick cuando está deshabilitado', () => {
    const handleClick = vi.fn()
    render(<BotonEliminar onClick={handleClick} disabled />)
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
