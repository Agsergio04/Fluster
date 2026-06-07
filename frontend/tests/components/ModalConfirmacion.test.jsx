import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ModalConfirmacion from '../../src/components/moleculas/ModalConfirmacion'

describe('ModalConfirmacion', () => {
  const base = {
    titulo: 'Borrar contenedor',
    mensaje: '¿Seguro que quieres borrar el contenedor BLKU2580360?',
    onConfirmar: () => {},
    onCancelar: () => {},
  }

  it('renderiza como alertdialog con título y mensaje', () => {
    render(<ModalConfirmacion {...base} />)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Borrar contenedor')).toBeInTheDocument()
    expect(screen.getByText(/BLKU2580360/)).toBeInTheDocument()
  })

  it('usa las etiquetas por defecto Cancelar y Borrar', () => {
    render(<ModalConfirmacion {...base} />)
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Borrar' })).toBeInTheDocument()
  })

  it('llama a onConfirmar al pulsar el botón de confirmar', () => {
    const onConfirmar = vi.fn()
    render(<ModalConfirmacion {...base} onConfirmar={onConfirmar} />)
    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }))
    expect(onConfirmar).toHaveBeenCalledTimes(1)
  })

  it('llama a onCancelar al pulsar Cancelar', () => {
    const onCancelar = vi.fn()
    render(<ModalConfirmacion {...base} onCancelar={onCancelar} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancelar).toHaveBeenCalledTimes(1)
  })

  it('cierra con la tecla Escape', () => {
    const onCancelar = vi.fn()
    render(<ModalConfirmacion {...base} onCancelar={onCancelar} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancelar).toHaveBeenCalledTimes(1)
  })

  it('cierra al hacer clic en el fondo pero no dentro del panel', () => {
    const onCancelar = vi.fn()
    const { container } = render(<ModalConfirmacion {...base} onCancelar={onCancelar} />)

    // Clic dentro del panel: no cierra (stopPropagation)
    fireEvent.click(screen.getByRole('alertdialog'))
    expect(onCancelar).not.toHaveBeenCalled()

    // Clic en el overlay de fondo: cierra
    fireEvent.click(container.querySelector('.modal-confirmacion'))
    expect(onCancelar).toHaveBeenCalledTimes(1)
  })

  it('deshabilita ambos botones y muestra el texto de carga mientras procesa', () => {
    render(<ModalConfirmacion {...base} cargando textoCargando="Borrando…" />)
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Borrando…' })).toBeDisabled()
  })
})
