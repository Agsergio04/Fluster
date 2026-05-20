import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import InputContrasenia from '../../components/atomos/InputContrasenia'

describe('InputContrasenia', () => {
  it('renderiza como tipo password por defecto', () => {
    const { container } = render(<InputContrasenia id="pwd" label="Contraseña" value="" onChange={() => {}} />)
    expect(container.querySelector('#pwd')).toHaveAttribute('type', 'password')
  })

  it('muestra el label cuando se proporciona', () => {
    render(<InputContrasenia id="pwd" label="Contraseña" value="" onChange={() => {}} />)
    expect(screen.getByText('Contraseña')).toBeInTheDocument()
  })

  it('muestra el mensaje de error cuando se proporciona', () => {
    render(<InputContrasenia id="pwd" label="Contraseña" error="Contraseña incorrecta" value="" onChange={() => {}} />)
    expect(screen.getByText('Contraseña incorrecta')).toBeInTheDocument()
  })

  it('el botón del ojo tiene aria-label "Mostrar contraseña" inicialmente', () => {
    render(<InputContrasenia id="pwd" label="Contraseña" value="" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeInTheDocument()
  })

  it('al pulsar el botón del ojo cambia el tipo del input a text', () => {
    const { container } = render(<InputContrasenia id="pwd" label="Contraseña" value="" onChange={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(container.querySelector('#pwd')).toHaveAttribute('type', 'text')
  })

  it('al pulsar el botón del ojo dos veces vuelve al tipo password', () => {
    const { container } = render(<InputContrasenia id="pwd" label="Contraseña" value="" onChange={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(container.querySelector('#pwd')).toHaveAttribute('type', 'password')
  })

  it('el aria-label del botón cambia a "Ocultar contraseña" cuando está visible', () => {
    render(<InputContrasenia id="pwd" label="Contraseña" value="" onChange={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeInTheDocument()
  })

  it('llama a onChange al escribir en el campo', () => {
    const handleChange = vi.fn()
    const { container } = render(<InputContrasenia id="pwd" label="Contraseña" value="" onChange={handleChange} />)
    fireEvent.change(container.querySelector('#pwd'), { target: { value: 'abc' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('no muestra el hint cuando hay error', () => {
    render(<InputContrasenia id="pwd" label="Contraseña" error="Error" hint="Mínimo 8 caracteres" value="" onChange={() => {}} />)
    expect(screen.queryByText('Mínimo 8 caracteres')).not.toBeInTheDocument()
  })
})
