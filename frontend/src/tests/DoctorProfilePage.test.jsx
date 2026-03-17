import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import DoctorProfilePage from '../pages/DoctorProfilePage'

vi.mock('axios')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockProfile = {
  id: 1,
  firstName: "Kaveesha",
  lastName: "Ekanayake",
  email: "kaveesha@test.com",
  phone: "0771234567",
  specialisation: "Cardiology",
  status: "APPROVED",
  profilePhoto: "",
  bio: "Experienced cardiologist",
  qualifications: "MBBS, MD Cardiology",
  experience: "10 years",
  consultationFee: 2500,
  createdAt: "2026-03-17T00:00:00.000Z",
  updatedAt: "2026-03-17T00:00:00.000Z"
}

const renderProfilePage = () => render(
  <MemoryRouter><DoctorProfilePage /></MemoryRouter>
)

describe('DoctorProfilePage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('token', 'fake-doctor-token')
    localStorage.setItem('role', 'doctor')
  })

  it('should render profile page with doctor data', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockProfile } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Profile' })).toBeDefined()
      expect(screen.getByText('Dr. Kaveesha Ekanayake')).toBeDefined()
    })
  })

  it('should render all form fields', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockProfile } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText('Bio')).toBeDefined()
      expect(screen.getByLabelText('Qualifications')).toBeDefined()
      expect(screen.getByLabelText('Experience (Years)')).toBeDefined()
      expect(screen.getByLabelText('Specialization')).toBeDefined()
      expect(screen.getByLabelText('Consultation Fee (Rs)')).toBeDefined()
    })
  })

  it('should populate form fields with fetched data', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockProfile } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText('Bio').value).toBe('Experienced cardiologist')
      expect(screen.getByLabelText('Qualifications').value).toBe('MBBS, MD Cardiology')
      expect(screen.getByLabelText('Experience (Years)').value).toBe('10 years')
      expect(screen.getByLabelText('Consultation Fee (Rs)').value).toBe('2500')
    })
  })

  it('should show approved status banner', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockProfile } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText(/Your profile is live and visible to patients/)).toBeDefined()
    })
  })

  it('should show pending status banner for pending doctor', async () => {
    const pendingDoctor = { ...mockProfile, status: "PENDING" }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: pendingDoctor } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText(/pending admin approval/)).toBeDefined()
    })
  })

  it('should show rejected status banner for rejected doctor', async () => {
    const rejectedDoctor = { ...mockProfile, status: "REJECTED" }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: rejectedDoctor } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText(/Your account has been rejected/)).toBeDefined()
    })
  })

  it('should update form fields on input change', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockProfile } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText('Bio')).toBeDefined()
    })

    fireEvent.change(screen.getByLabelText('Bio'), {
      target: { name: 'bio', value: 'Updated bio text' }
    })

    expect(screen.getByLabelText('Bio').value).toBe('Updated bio text')
  })

  it('should show success message on profile save for approved doctor', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockProfile } })
    axios.put.mockResolvedValueOnce({
      data: { success: true, message: "Profile updated successfully", doctor: mockProfile }
    })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText('Bio')).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: /Save Profile/ }))

    await waitFor(() => {
      expect(screen.getByText(/Profile Updated Successfully!/)).toBeDefined()
    })
  })

  it('should show approval message on save for pending doctor', async () => {
    const pendingDoctor = { ...mockProfile, status: "PENDING" }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: pendingDoctor } })
    axios.put.mockResolvedValueOnce({
      data: { success: true, message: "Profile updated successfully", doctor: pendingDoctor }
    })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText('Bio')).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: /Save Profile/ }))

    await waitFor(() => {
      expect(screen.getByText(/will be visible once approved by admin/)).toBeDefined()
    })
  })

  it('should show error message on save failure', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockProfile } })
    axios.put.mockRejectedValueOnce({
      response: { data: { message: "Internal server error" } }
    })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText('Bio')).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: /Save Profile/ }))

    await waitFor(() => {
      expect(screen.getByText(/Failed to update profile/)).toBeDefined()
    })
  })

  it('should discard changes and restore original data', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockProfile } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText('Bio').value).toBe('Experienced cardiologist')
    })

    fireEvent.change(screen.getByLabelText('Bio'), {
      target: { name: 'bio', value: 'Changed bio' }
    })
    expect(screen.getByLabelText('Bio').value).toBe('Changed bio')

    fireEvent.click(screen.getByRole('button', { name: 'Discard Changes' }))

    expect(screen.getByLabelText('Bio').value).toBe('Experienced cardiologist')
  })

  it('should show error when profile fetch fails', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 500 } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText('Failed to load profile')).toBeDefined()
    })
  })

  it('should show loading spinner initially', () => {
    axios.get.mockReturnValueOnce(new Promise(() => {}))
    renderProfilePage()

    expect(document.querySelector('.animate-spin')).toBeDefined()
  })

  it('should render sidebar navigation links', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockProfile } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeDefined()
      expect(screen.getByText('My Appointments')).toBeDefined()
      expect(screen.getByText('My Availability')).toBeDefined()
      expect(screen.getByText('Logout')).toBeDefined()
    })
  })

  it('should send authorization header with API calls', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockProfile } })
    renderProfilePage()

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/doctor/profile'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer fake-doctor-token' }
        })
      )
    })
  })

  it('should render Change Photo button', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockProfile } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText('Change Photo')).toBeDefined()
    })
  })

})