import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ModalEditarContenedor from '../../src/components/moleculas/ModalEditarContenedor'

describe('ModalEditarContenedor — validación del código BIC', () => {
  const baseItem = { id: '1', codigoBic: '', foto: null, fechaInicioLibre: '2025-01-01' }

  it('no permite actualizar con un BIC inválido y muestra el error', () => {
    const onActualizar = vi.fn()
    render(<ModalEditarContenedor item={baseItem} onActualizar={onActualizar} onCancelar={() => {}} />)

    fireEvent.change(screen.getByLabelText('Código BIC'), { target: { value: 'MSC12' } })
    fireEvent.click(screen.getByRole('button', { name: /actualizar/i }))

    expect(screen.getByText(/4 letras seguidas de 7 números/i)).toBeInTheDocument()
    expect(onActualizar).not.toHaveBeenCalled()
  })

  it('rechaza un BIC de más de 11 caracteres', () => {
    const onActualizar = vi.fn()
    render(<ModalEditarContenedor item={baseItem} onActualizar={onActualizar} onCancelar={() => {}} />)

    fireEvent.change(screen.getByLabelText('Código BIC'), { target: { value: 'MSCU12345678' } })
    fireEvent.click(screen.getByRole('button', { name: /actualizar/i }))

    expect(onActualizar).not.toHaveBeenCalled()
  })

  it('permite actualizar con un BIC válido y lo normaliza a mayúsculas', async () => {
    const onActualizar = vi.fn().mockResolvedValue()
    render(<ModalEditarContenedor item={baseItem} onActualizar={onActualizar} onCancelar={() => {}} />)

    fireEvent.change(screen.getByLabelText('Código BIC'), { target: { value: 'msku1234567' } })
    fireEvent.click(screen.getByRole('button', { name: /actualizar/i }))

    await waitFor(() => expect(onActualizar).toHaveBeenCalledTimes(1))
    expect(onActualizar).toHaveBeenCalledWith('1', expect.objectContaining({ codigoBIC: 'MSKU1234567' }))
  })

  it('limita el campo BIC a 11 caracteres', () => {
    render(<ModalEditarContenedor item={baseItem} onActualizar={vi.fn()} onCancelar={() => {}} />)
    expect(screen.getByLabelText('Código BIC')).toHaveAttribute('maxLength', '11')
  })
})
