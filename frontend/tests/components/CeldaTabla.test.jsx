import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CeldaTabla from '../../src/components/atomos/CeldaTabla'

describe('CeldaTabla', () => {
  describe('modo estático (por defecto)', () => {
    it('muestra el label como texto', () => {
      render(<CeldaTabla label="Maersk" />)
      expect(screen.getByText('Maersk')).toBeInTheDocument()
    })

    it('aplica la clase base celda-tabla', () => {
      const { container } = render(<CeldaTabla label="Maersk" />)
      expect(container.firstChild).toHaveClass('celda-tabla')
    })

    it('aplica el modificador de tamaño --md por defecto', () => {
      const { container } = render(<CeldaTabla label="Maersk" />)
      expect(container.firstChild).toHaveClass('celda-tabla--md')
    })

    it('aplica el modificador de tamaño --sm', () => {
      const { container } = render(<CeldaTabla label="Maersk" tamanio="sm" />)
      expect(container.firstChild).toHaveClass('celda-tabla--sm')
    })

    it('aplica la clase --body cuando fuente es body', () => {
      const { container } = render(<CeldaTabla label="Maersk" fuente="body" />)
      expect(container.firstChild).toHaveClass('celda-tabla--body')
    })

    it('no renderiza un input en modo estático', () => {
      render(<CeldaTabla label="Maersk" />)
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })
  })

  describe('modo editable', () => {
    it('renderiza un input cuando editable=true', () => {
      render(<CeldaTabla label="10" editable onChange={() => {}} />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('llama a onChange al modificar el valor', () => {
      const handleChange = vi.fn()
      render(<CeldaTabla label="10" editable onChange={handleChange} />)
      const input = screen.getByRole('textbox')
      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: '20' } })
      expect(handleChange).toHaveBeenCalledWith('20')
    })

    it('el input no es readOnly en modo editable', () => {
      render(<CeldaTabla label="10" editable onChange={() => {}} />)
      expect(screen.getByRole('textbox')).not.toHaveAttribute('readOnly')
    })
  })

  describe('modo readonly', () => {
    it('renderiza un input en modo readonly', () => {
      render(<CeldaTabla label="Maersk" readonly />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('el input es readOnly', () => {
      render(<CeldaTabla label="Maersk" readonly />)
      expect(screen.getByRole('textbox')).toHaveAttribute('readOnly')
    })

    it('muestra el valor del label en el input readonly', () => {
      render(<CeldaTabla label="Maersk" readonly />)
      expect(screen.getByRole('textbox')).toHaveValue('Maersk')
    })
  })
})
