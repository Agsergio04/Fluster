import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BotonEditar from '../../src/components/atomos/BotonEditar'

describe('BotonEditar', () => {
  it('renderiza el texto "Editar"', () => {
    render(<BotonEditar onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()
  })

  it('llama a onClick al hacer clic', () => {
    const handleClick = vi.fn()
    render(<BotonEditar onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button', { name: /editar/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('está deshabilitado cuando disabled=true', () => {
    render(<BotonEditar onClick={() => {}} disabled />)
    expect(screen.getByRole('button', { name: /editar/i })).toBeDisabled()
  })

  it('no está deshabilitado por defecto', () => {
    render(<BotonEditar onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /editar/i })).not.toBeDisabled()
  })

  it('tiene la clase btn-editar', () => {
    render(<BotonEditar onClick={() => {}} />)
    expect(screen.getByRole('button', { name: /editar/i })).toHaveClass('btn-editar')
  })

  it('no llama a onClick cuando está deshabilitado', () => {
    const handleClick = vi.fn()
    render(<BotonEditar onClick={handleClick} disabled />)
    fireEvent.click(screen.getByRole('button', { name: /editar/i }))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
