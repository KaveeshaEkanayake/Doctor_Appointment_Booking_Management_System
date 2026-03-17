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
  return { ...actual, useNavigate: () => mockNavigate }
})

const renderLoginPage = () => render(
  <MemoryRouter><LoginPage /></MemoryRouter>
)

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

  it('should render patient and doctor role selector', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: 'Patient' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Doctor' })).toBeDefined()
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

  it('should store token and navigate to patient dashboard on successful patient login', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 'fake-jwt-token' } })
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
      expect(mockNavigate).toHaveBeenCalledWith('/patient/dashboard')
    })
  })

  it('should navigate to doctor dashboard on successful doctor login', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: 'fake-doctor-token' } })
    renderLoginPage()

    fireEvent.click(screen.getByRole('button', { name: 'Doctor' }))
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'doctor@gmail.com' }
    })
    fireEvent.change(screen.getByLabelText('Your Password'), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-doctor-token')
      expect(mockNavigate).toHaveBeenCalledWith('/doctor/dashboard')
    })
  })

  it('should show error message on invalid credentials', async () => {
    axios.post.mockRejectedValueOnce({ response: { status: 401 } })
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

  it('should show pending message for doctor awaiting approval', async () => {
    renderLoginPage()

    // ✅ Switch to doctor role FIRST
    fireEvent.click(screen.getByRole('button', { name: 'Doctor' }))

    // ✅ Then set up mock
    axios.post.mockRejectedValueOnce({
      response: {
        status: 403,
        data: { message: 'Your account is awaiting approval from the administrator' }
      }
    })

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'doctor@gmail.com' }
    })
    fireEvent.change(screen.getByLabelText('Your Password'), {
      target: { value: 'password123' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => {
      expect(screen.getByText('Your account is awaiting approval from the administrator')).toBeDefined()
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