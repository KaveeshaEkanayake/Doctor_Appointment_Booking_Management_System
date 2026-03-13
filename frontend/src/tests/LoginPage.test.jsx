import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import LoginPage from '../pages/LoginPage'

vi.mock('axios')

vi.mock('../assets/LoginImg.png', () => ({ default: 'test-file-stub' }))
vi.mock('../assets/Logo04.PNG', () => ({ default: 'test-file-stub' }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

const renderLoginPage = () => {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

describe('LoginPage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should render login form correctly', () => {
    renderLoginPage()
    expect(screen.getByLabelText('Email Address')).toBeDefined()
    expect(screen.getByLabelText('Your Password')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Log in' })).toBeDefined()
  })

  it('should update email and password fields on input', () => {
    renderLoginPage()
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Your Password')

    fireEvent.change(emailInput, { target: { value: 'john@gmail.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('john@gmail.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('should store token and navigate to dashboard on successful login', async () => {
    axios.post.mockResolvedValue({ data: { token: 'fake-jwt-token' } })
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'john@gmail.com' }
    })
    fireEvent.change(screen.getByLabelText('Your Password'), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-jwt-token')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should show error message on invalid credentials', async () => {
    axios.post.mockRejectedValue(new Error('Invalid credentials'))
    renderLoginPage()

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'wrong@gmail.com' }
    })
    fireEvent.change(screen.getByLabelText('Your Password'), {
      target: { value: 'wrongpassword' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeDefined()
    })
  })

  it('should have a link to register page', () => {
    renderLoginPage()
    expect(screen.getByText('Sign up')).toBeDefined()
  })

  it('should have a forgot password link', () => {
    renderLoginPage()
    expect(screen.getByText('Forgot password?')).toBeDefined()
  })

})