import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PasswordResetReq from '../pages/PasswordRestReq'

vi.mock('../assets/Logo04.PNG', () => ({ default: 'test-file-stub' }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

global.fetch = vi.fn()

const renderPage = () => render(
  <MemoryRouter><PasswordResetReq /></MemoryRouter>
)

describe('PasswordResetReq', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render forgot password form', () => {
    renderPage()
    expect(screen.getByPlaceholderText('Enter your email address')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeDefined()
  })

  it('should render back to login link', () => {
    renderPage()
    expect(screen.getByText('Back to login')).toBeDefined()
  })

  it('should update email field on input', () => {
    renderPage()
    const emailInput = screen.getByPlaceholderText('Enter your email address')
    fireEvent.change(emailInput, { target: { value: 'test@gmail.com' } })
    expect(emailInput.value).toBe('test@gmail.com')
  })

  it('should call API and navigate on successful submission', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })

    renderPage()
    fireEvent.change(
      screen.getByPlaceholderText('Enter your email address'),
      { target: { value: 'test@gmail.com' } }
    )
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/forgot-password/sent')
    })
  })

  it('should show error message on failed API call', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, message: 'Failed to send reset link' })
    })

    renderPage()
    fireEvent.change(
      screen.getByPlaceholderText('Enter your email address'),
      { target: { value: 'test@gmail.com' } }
    )
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }))

    await waitFor(() => {
      expect(screen.getByText('Failed to send reset link')).toBeDefined()
    })
  })

  it('should show loading state while submitting', async () => {
    global.fetch.mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true })
      }), 100))
    )

    renderPage()
    fireEvent.change(
      screen.getByPlaceholderText('Enter your email address'),
      { target: { value: 'test@gmail.com' } }
    )
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sending...' })).toBeDefined()
    })
  })

})