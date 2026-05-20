import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Input from '../../components/atomos/Input'

describe('Input', () => {
  it('renderiza el label cuando se proporciona', () => {
    render(<Input id="email" label="Correo electrónico" value="" onChange={() => {}} />)
    expect(screen.getByText('Correo electrónico')).toBeInTheDocument()
  })

  it('no renderiza el span de label cuando no se pasa label', () => {
    const { container } = render(<Input id="email" value="" onChange={() => {}} />)
    expect(container.querySelector('.input__label')).toBeNull()
  })

  it('muestra el mensaje de error cuando se proporciona', () => {
    render(<Input id="email" label="Email" error="Correo inválido" value="" onChange={() => {}} />)
    expect(screen.getByText('Correo inválido')).toBeInTheDocument()
  })

  it('aplica la clase input--error cuando hay error', () => {
    const { container } = render(<Input id="email" label="Email" error="Error" value="" onChange={() => {}} />)
    expect(container.firstChild).toHaveClass('input--error')
  })

  it('muestra el hint cuando no hay error', () => {
    render(<Input id="email" label="Email" hint="Ej: usuario@empresa.com" value="" onChange={() => {}} />)
    expect(screen.getByText('Ej: usuario@empresa.com')).toBeInTheDocument()
  })

  it('no muestra el hint cuando hay error', () => {
    render(<Input id="email" label="Email" error="Error" hint="Ej: usuario@empresa.com" value="" onChange={() => {}} />)
    expect(screen.queryByText('Ej: usuario@empresa.com')).not.toBeInTheDocument()
  })

  it('muestra el indicador de campo requerido cuando required=true', () => {
    render(<Input id="email" label="Email" required value="" onChange={() => {}} />)
    expect(screen.getByTitle('required')).toBeInTheDocument()
  })

  it('no muestra el indicador requerido cuando required=false', () => {
    render(<Input id="email" label="Email" value="" onChange={() => {}} />)
    expect(screen.queryByTitle('required')).not.toBeInTheDocument()
  })

  it('llama a onChange al escribir en el campo', () => {
    const handleChange = vi.fn()
    render(<Input id="email" label="Email" value="" onChange={handleChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('el campo está deshabilitado cuando disabled=true', () => {
    render(<Input id="email" label="Email" value="" onChange={() => {}} disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('usa el tipo text por defecto', () => {
    render(<Input id="email" label="Email" value="" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
  })
})
