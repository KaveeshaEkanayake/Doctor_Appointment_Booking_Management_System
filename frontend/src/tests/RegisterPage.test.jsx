import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import RegisterPage from '../pages/RegisterPage'

// Mock axios
vi.mock('axios')

// Mock image imports
vi.mock('../assets/LoginImg.png', () => ({ default: 'test-file-stub' }))
vi.mock('../assets/Logo04.PNG', () => ({ default: 'test-file-stub' }))

// Mock react-phone-input-2
vi.mock('react-phone-input-2', () => ({
  default: ({ onChange }) => (
    <input
      placeholder="Phone Number"
      onChange={(e) => onChange(e.target.value)}
    />
  )
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

const renderRegisterPage = () => {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  )
}

describe('RegisterPage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render registration form correctly', () => {
    renderRegisterPage()
    expect(screen.getByLabelText('First Name')).toBeDefined()
    expect(screen.getByLabelText('Last Name')).toBeDefined()
    expect(screen.getByLabelText('Email Address')).toBeDefined()
    expect(screen.getByLabelText('Password')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeDefined()
  })

  it('should show error if email is empty', async () => {
    renderRegisterPage()
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeDefined()
    })
  })

  it('should show error if password is too weak', async () => {
    renderRegisterPage()
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'john@gmail.com', name: 'email' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'weak', name: 'password' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters and include a number')).toBeDefined()
    })
  })

  it('should show success message and redirect to login on successful registration', async () => {
    axios.post.mockResolvedValue({ data: { message: 'Patient registered successfully' } })
    renderRegisterPage()

    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'John', name: 'firstName' }
    })
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'Doe', name: 'lastName' }
    })
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'john@gmail.com', name: 'email' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123', name: 'password' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    await waitFor(() => {
      expect(screen.getByText('Registration successful! Redirecting to login...')).toBeDefined()
    })
  })

  it('should show error message on duplicate email', async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: 'Email already exists' } }
    })
    renderRegisterPage()

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'existing@gmail.com', name: 'email' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123', name: 'password' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }))

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeDefined()
    })
  })

  it('should have a link to login page', () => {
    renderRegisterPage()
    expect(screen.getByText('Log in')).toBeDefined()
  })

})