import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import PatientProfilePage from '../pages/PatientProfilePage'

vi.mock('axios')
vi.mock('../assets/Logo04.PNG',      () => ({ default: 'test-file-stub' }))
vi.mock('../assets/profile_pic.png', () => ({ default: 'test-file-stub' }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockPatient = {
  id:          1,
  firstName:   "John",
  lastName:    "Smith",
  email:       "john@test.com",
  phone:       "0771234567",
  address:     "123 Main St, Colombo",
  dateOfBirth: "2000-01-15T00:00:00.000Z",
}

const renderPage = () => render(
  <MemoryRouter><PatientProfilePage /></MemoryRouter>
)

describe('PatientProfilePage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('token', 'fake-patient-token')
    localStorage.setItem('role', 'patient')
    localStorage.setItem('user', JSON.stringify(mockPatient))
  })

  it('should render loading spinner initially', () => {
    axios.get.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(document.querySelector('.animate-spin')).not.toBeNull()
  })

  it('should render patient name after loading', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText(/John/i).length).toBeGreaterThan(0)
    })
  })

  it('should render My Profile section', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText('My Profile').length).toBeGreaterThan(0)
    })
  })

  it('should render Personal Information section', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText('Personal Information').length).toBeGreaterThan(0)
    })
  })

  it('should render patient email', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText('john@test.com').length).toBeGreaterThan(0)
    })
  })

  it('should render patient phone', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('0771234567')).toBeDefined()
    })
  })

  it('should render patient address', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText('123 Main St, Colombo').length).toBeGreaterThan(0)
    })
  })

  it('should render Edit buttons', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText(/✎ Edit/i).length).toBeGreaterThan(0)
    })
  })

  it('should switch to edit form when Edit is clicked', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
      .mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText(/✎ Edit/i).length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getAllByText(/✎ Edit/i)[0])

    await waitFor(() => {
      expect(screen.getAllByText(/Edit Personal Information/i).length).toBeGreaterThan(0)
    })
  })

  it('should show Save Changes button in edit mode', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
      .mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText(/✎ Edit/i).length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getAllByText(/✎ Edit/i)[0])

    await waitFor(() => {
      expect(screen.getAllByText('Save Changes').length).toBeGreaterThan(0)
    })
  })

  it('should show Cancel button in edit mode', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
      .mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText(/✎ Edit/i).length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getAllByText(/✎ Edit/i)[0])

    await waitFor(() => {
      expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0)
    })
  })

  it('should return to profile view when Cancel is clicked', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
      .mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
      .mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText(/✎ Edit/i).length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getAllByText(/✎ Edit/i)[0])

    await waitFor(() => {
      expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getAllByText('Cancel')[0])

    await waitFor(() => {
      expect(screen.getAllByText('My Profile').length).toBeGreaterThan(0)
    })
  })

  it('should show error when API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'))
    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/Failed to load profile/i)).toBeDefined()
    })
  })

  it('should render sidebar with Profile link', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText('Profile').length).toBeGreaterThan(0)
    })
  })

  it('should render sidebar with Appointment link', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Appointment')).toBeDefined()
    })
  })

  it('should show email as read only in edit mode', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
      .mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText(/✎ Edit/i).length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getAllByText(/✎ Edit/i)[0])

    await waitFor(() => {
      expect(screen.getAllByText(/cannot be changed/i).length).toBeGreaterThan(0)
    })
  })

  it('should show success message after saving profile', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
      .mockResolvedValueOnce({ data: { success: true, patient: mockPatient } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText(/✎ Edit/i).length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getAllByText(/✎ Edit/i)[0])

    await waitFor(() => {
      expect(screen.getAllByText('Save Changes').length).toBeGreaterThan(0)
    })

    axios.put.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Profile updated successfully",
        patient: mockPatient
      }
    })

    fireEvent.click(screen.getAllByText('Save Changes')[0])

    await waitFor(() => {
      expect(screen.getAllByText(/Profile updated successfully/i).length).toBeGreaterThan(0)
    })
  })

})