import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Spinner from '../../components/atomos/Spinner'

describe('Spinner', () => {
  it('renderiza con tamaño md por defecto', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveClass('spinner--md')
  })

  it('renderiza con tamaño sm', () => {
    render(<Spinner tamanio="sm" />)
    expect(screen.getByRole('status')).toHaveClass('spinner--sm')
  })

  it('renderiza con tamaño lg', () => {
    render(<Spinner tamanio="lg" />)
    expect(screen.getByRole('status')).toHaveClass('spinner--lg')
  })

  it('tiene siempre la clase base "spinner"', () => {
    render(<Spinner tamanio="sm" />)
    expect(screen.getByRole('status')).toHaveClass('spinner')
  })

  it('tiene aria-label "Cargando" para lectores de pantalla', () => {
    render(<Spinner />)
    expect(screen.getByRole('status', { name: 'Cargando' })).toBeInTheDocument()
  })
})
