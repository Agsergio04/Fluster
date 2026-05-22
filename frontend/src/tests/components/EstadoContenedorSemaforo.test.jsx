import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EstadoContenedorSemaforo from '../../components/atomos/EstadoContenedorSemaforo'

describe('EstadoContenedorSemaforo', () => {
  it('muestra "Inactivo" por defecto', () => {
    render(<EstadoContenedorSemaforo />)
    expect(screen.getByText('Inactivo')).toBeInTheDocument()
  })

  it('muestra aria-label "Inactivo" para estado inactivo', () => {
    render(<EstadoContenedorSemaforo estado="inactivo" />)
    expect(screen.getByLabelText('Inactivo')).toBeInTheDocument()
  })

  it('aplica el modificador --inactivo para estado inactivo', () => {
    const { container } = render(<EstadoContenedorSemaforo estado="inactivo" />)
    expect(container.firstChild).toHaveClass('estado-contenedor-semaforo--inactivo')
  })

  it('aplica el modificador --free para estado puerto-free', () => {
    const { container } = render(<EstadoContenedorSemaforo estado="puerto-free" />)
    expect(container.firstChild).toHaveClass('estado-contenedor-semaforo--free')
  })

  it('aplica el modificador --primer para estado puerto-primer', () => {
    const { container } = render(<EstadoContenedorSemaforo estado="puerto-primer" />)
    expect(container.firstChild).toHaveClass('estado-contenedor-semaforo--primer')
  })

  it('aplica el modificador --segundo para estado cliente-segundo', () => {
    const { container } = render(<EstadoContenedorSemaforo estado="cliente-segundo" />)
    expect(container.firstChild).toHaveClass('estado-contenedor-semaforo--segundo')
  })

  it('muestra etiqueta corta "Puerto" para estado puerto-free', () => {
    render(<EstadoContenedorSemaforo estado="puerto-free" />)
    expect(screen.getByText('Puerto')).toBeInTheDocument()
  })

  it('muestra etiqueta corta "Cliente" para estado cliente-primer', () => {
    render(<EstadoContenedorSemaforo estado="cliente-primer" />)
    expect(screen.getByText('Cliente')).toBeInTheDocument()
  })

  it('aria-label usa el label largo aunque la etiqueta visible sea corta', () => {
    render(<EstadoContenedorSemaforo estado="puerto-primer" />)
    expect(screen.getByLabelText('Puerto — Primer tramo')).toBeInTheDocument()
  })

  it('usa "inactivo" como fallback para estados desconocidos', () => {
    const { container } = render(<EstadoContenedorSemaforo estado="estado-inexistente" />)
    expect(container.firstChild).toHaveClass('estado-contenedor-semaforo--inactivo')
  })
})
