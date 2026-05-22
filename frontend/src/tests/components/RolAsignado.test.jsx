import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RolAsignado from '../../components/atomos/RolAsignado'

describe('RolAsignado', () => {
  it('muestra "Admin" para el rol admin', () => {
    render(<RolAsignado rol="admin" />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('muestra "Gestor" para el rol gestor', () => {
    render(<RolAsignado rol="gestor" />)
    expect(screen.getByText('Gestor')).toBeInTheDocument()
  })

  it('muestra "Operador" para el rol operador', () => {
    render(<RolAsignado rol="operador" />)
    expect(screen.getByText('Operador')).toBeInTheDocument()
  })

  it('muestra "Operador" por defecto cuando no se pasa rol', () => {
    render(<RolAsignado />)
    expect(screen.getByText('Operador')).toBeInTheDocument()
  })

  it('muestra "Operador" para un rol desconocido', () => {
    render(<RolAsignado rol="desconocido" />)
    expect(screen.getByText('Operador')).toBeInTheDocument()
  })

  it('tiene la clase rol-asignado', () => {
    const { container } = render(<RolAsignado rol="gestor" />)
    expect(container.firstChild).toHaveClass('rol-asignado')
  })
})
