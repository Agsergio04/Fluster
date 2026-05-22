import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CardContenedor from '../../components/moleculas/CardContenedor'

describe('CardContenedor', () => {
  const props = {
    codigoBic: 'MSKU1234567',
    fechaInclusion: '01/01/2024',
    onEditar: vi.fn(),
    onEliminar: vi.fn(),
  }

  it('muestra el código BIC', () => {
    render(<CardContenedor {...props} />)
    expect(screen.getByText('MSKU1234567')).toBeInTheDocument()
  })

  it('muestra la fecha de inclusión', () => {
    render(<CardContenedor {...props} />)
    expect(screen.getByText('01/01/2024')).toBeInTheDocument()
  })

  it('renderiza siempre una imagen', () => {
    const { container } = render(<CardContenedor {...props} />)
    expect(container.querySelector('img')).toBeInTheDocument()
  })

  it('usa alt vacío cuando no hay foto (imagen decorativa)', () => {
    const { container } = render(<CardContenedor {...props} foto={null} />)
    // alt="" → rol ARIA "presentation", no "img"
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('usa alt descriptivo cuando hay foto', () => {
    render(<CardContenedor {...props} foto="data:image/png;base64,abc" />)
    expect(screen.getByRole('img', { name: /foto del contenedor/i })).toBeInTheDocument()
  })

  it('vuelve al placeholder si la imagen da error', () => {
    const { container } = render(<CardContenedor {...props} foto="http://rota.invalid/img.jpg" />)
    const img = container.querySelector('img')
    fireEvent.error(img)
    expect(img).toHaveAttribute('alt', '')
  })

  it('llama a onEditar al hacer clic en el botón editar', () => {
    const onEditar = vi.fn()
    render(<CardContenedor {...props} onEditar={onEditar} />)
    fireEvent.click(screen.getByRole('button', { name: /editar/i }))
    expect(onEditar).toHaveBeenCalledTimes(1)
  })

  it('llama a onEliminar al hacer clic en el botón eliminar', () => {
    const onEliminar = vi.fn()
    render(<CardContenedor {...props} onEliminar={onEliminar} />)
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(onEliminar).toHaveBeenCalledTimes(1)
  })

  it('tiene la clase card-contenedor', () => {
    const { container } = render(<CardContenedor {...props} />)
    expect(container.firstChild).toHaveClass('card-contenedor')
  })
})
