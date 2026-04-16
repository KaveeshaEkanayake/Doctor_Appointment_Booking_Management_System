import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import PatientDeleteAccountPage from '../pages/PatientDeleteAccountPage'

vi.mock('axios')
vi.mock('../assets/Logo04.PNG', () => ({ default: 'test-file-stub' }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../components/SideBar(patient)', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}))

vi.mock('../components/Header(patient)', () => ({
  default: () => <div data-testid="header">Header</div>
}))

const renderPage = () => render(
  <MemoryRouter><PatientDeleteAccountPage /></MemoryRouter>
)

describe('PatientDeleteAccountPage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('token', 'fake-patient-token')
  })

  it('should render the Delete Account heading', () => {
    renderPage()
    expect(screen.getByText('Once deleted, you will be logged out and cannot regain access.')).toBeDefined()
  })

  it('should render the Request Account Deletion button', () => {
    renderPage()
    expect(screen.getByText('Request Account Deletion')).toBeDefined()
  })

  it('should render the warning text', () => {
    renderPage()
    expect(screen.getByText(/All your data will be permanently erased/i)).toBeDefined()
  })

  it('should render the sidebar', () => {
    renderPage()
    expect(screen.getByTestId('sidebar')).toBeDefined()
  })

  it('should render the header', () => {
    renderPage()
    expect(screen.getByTestId('header')).toBeDefined()
  })

  it('should show confirmation modal when Request Account Deletion is clicked', () => {
    renderPage()
    fireEvent.click(screen.getByText('Request Account Deletion'))
    expect(screen.getByText('Confirm Account Deletion')).toBeDefined()
  })

  it('should show irreversible warning in modal', () => {
    renderPage()
    fireEvent.click(screen.getByText('Request Account Deletion'))
    expect(screen.getByText('This action is irreversible.')).toBeDefined()
  })

  it('should close modal when Cancel is clicked', async () => {
    renderPage()
    fireEvent.click(screen.getByText('Request Account Deletion'))
    expect(screen.getByText('Confirm Account Deletion')).toBeDefined()
    fireEvent.click(screen.getByText('Cancel'))
    await waitFor(() => {
      expect(screen.queryByText('Confirm Account Deletion')).toBeNull()
    })
  })

  it('should call delete API on confirm', async () => {
    axios.delete.mockResolvedValueOnce({ data: { success: true } })
    renderPage()
    fireEvent.click(screen.getByText('Request Account Deletion'))
    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        `${import.meta.env.VITE_API_URL}/api/patient/account`,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer fake-patient-token' })
        })
      )
    })
  })

  it('should navigate to home after successful deletion', async () => {
    axios.delete.mockResolvedValueOnce({ data: { success: true } })
    renderPage()
    fireEvent.click(screen.getByText('Request Account Deletion'))
    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('should show error message when API fails', async () => {
    axios.delete.mockRejectedValueOnce(new Error('Network Error'))
    renderPage()
    fireEvent.click(screen.getByText('Request Account Deletion'))
    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => {
      expect(screen.getByText('Failed to delete account. Please try again.')).toBeDefined()
    })
  })

  it('should show Deleting... on button while loading', async () => {
    axios.delete.mockReturnValue(new Promise(() => {}))
    renderPage()
    fireEvent.click(screen.getByText('Request Account Deletion'))
    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => {
      expect(screen.getByText('Deleting...')).toBeDefined()
    })
  })

  it('should disable Cancel and Delete buttons while loading', async () => {
    axios.delete.mockReturnValue(new Promise(() => {}))
    renderPage()
    fireEvent.click(screen.getByText('Request Account Deletion'))
    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => {
      const cancelBtn = screen.getByText('Cancel')
      const deleteBtn = screen.getByText('Deleting...')
      expect(cancelBtn.disabled).toBe(true)
      expect(deleteBtn.disabled).toBe(true)
    })
  })

})