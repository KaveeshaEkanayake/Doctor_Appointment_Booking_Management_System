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

// Account APPROVED + profile APPROVED — fully live
const mockProfile = {
  id: 1,
  firstName: "Kaveesha",
  lastName: "Ekanayake",
  email: "kaveesha@test.com",
  phone: "0771234567",
  specialisation: "Cardiology",
  status: "APPROVED",
  profileStatus: "APPROVED",
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
      expect(screen.getByLabelText(/Bio/)).toBeDefined()
      expect(screen.getByLabelText(/Qualifications/)).toBeDefined()
      expect(screen.getByLabelText(/Experience/)).toBeDefined()
      expect(screen.getByLabelText(/Specialization/)).toBeDefined()
      expect(screen.getByLabelText(/Consultation Fee/)).toBeDefined()
    })
  })

  it('should populate form fields with fetched data', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockProfile } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText(/Bio/).value).toBe('Experienced cardiologist')
      expect(screen.getByLabelText(/Qualifications/).value).toBe('MBBS, MD Cardiology')
      expect(screen.getByLabelText(/Experience/).value).toBe('10 years')
      expect(screen.getByLabelText(/Consultation Fee/).value).toBe('2500')
    })
  })

  // profile APPROVED → "Your profile is live"
  it('should show approved status banner when profile is approved', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockProfile } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText(/Your profile is live and visible to patients/)).toBeDefined()
    })
  })

  // account PENDING → locked banner
  it('should show pending status banner for pending doctor', async () => {
    const pendingDoctor = { ...mockProfile, status: "PENDING", profileStatus: "NOT_SUBMITTED" }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: pendingDoctor } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText(/pending admin approval/)).toBeDefined()
    })
  })

  // account REJECTED
  it('should show rejected status banner for rejected doctor', async () => {
    const rejectedDoctor = { ...mockProfile, status: "REJECTED", profileStatus: "NOT_SUBMITTED" }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: rejectedDoctor } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText(/Your account has been rejected/)).toBeDefined()
    })
  })

  // profile PENDING_REVIEW → under review banner
  it('should show under review banner when profile is pending review', async () => {
    const reviewDoctor = { ...mockProfile, profileStatus: "PENDING_REVIEW" }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: reviewDoctor } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText(/Your profile is under review by admin/)).toBeDefined()
    })
  })

  // profile REJECTED → rejected banner
  it('should show profile rejected banner when profile is rejected', async () => {
    const rejectedProfile = { ...mockProfile, profileStatus: "REJECTED" }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: rejectedProfile } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText(/Your profile was rejected/)).toBeDefined()
    })
  })

  // NOT_SUBMITTED → fill in your profile banner
  it('should show not submitted banner when profile is not submitted', async () => {
    const notSubmitted = { ...mockProfile, profileStatus: "NOT_SUBMITTED" }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: notSubmitted } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText(/Please complete your profile and submit it for review/)).toBeDefined()
    })
  })

  it('should update form fields on input change', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockProfile } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText(/Bio/)).toBeDefined()
    })

    fireEvent.change(screen.getByLabelText(/Bio/), {
      target: { name: 'bio', value: 'Updated bio text' }
    })

    expect(screen.getByLabelText(/Bio/).value).toBe('Updated bio text')
  })

  // approved doctor submits → "submitted for review"
  it('should show success message on profile submit for approved doctor', async () => {
    const approvedNotSubmitted = { ...mockProfile, profileStatus: "NOT_SUBMITTED" }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: approvedNotSubmitted } })
    axios.put.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Profile submitted for review successfully.",
        doctor: { ...approvedNotSubmitted, profileStatus: "PENDING_REVIEW" }
      }
    })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText(/Bio/)).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: /Submit for Review/ }))

    await waitFor(() => {
      expect(screen.getByText(/Profile submitted for review/)).toBeDefined()
    })
  })

  // form is locked when account is PENDING
  it('should lock form when account is pending', async () => {
    const pendingDoctor = { ...mockProfile, status: "PENDING", profileStatus: "NOT_SUBMITTED" }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: pendingDoctor } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText(/Bio/)).toBeDefined()
    })

    expect(screen.getByLabelText(/Bio/).disabled).toBe(true)
  })

  // form is locked when profile is PENDING_REVIEW
  it('should lock form when profile is under review', async () => {
    const reviewDoctor = { ...mockProfile, profileStatus: "PENDING_REVIEW" }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: reviewDoctor } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText(/Bio/)).toBeDefined()
    })

    expect(screen.getByLabelText(/Bio/).disabled).toBe(true)
  })

  it('should show error message on save failure', async () => {
    const notSubmitted = { ...mockProfile, profileStatus: "NOT_SUBMITTED" }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: notSubmitted } })
    axios.put.mockRejectedValueOnce({
      response: { data: { message: "Internal server error" } }
    })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText(/Bio/)).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: /Submit for Review/ }))

    await waitFor(() => {
      expect(screen.getByText(/Failed to update profile/)).toBeDefined()
    })
  })

  it('should discard changes and restore original data', async () => {
    const notSubmitted = { ...mockProfile, profileStatus: "NOT_SUBMITTED" }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: notSubmitted } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText(/Bio/).value).toBe('Experienced cardiologist')
    })

    fireEvent.change(screen.getByLabelText(/Bio/), {
      target: { name: 'bio', value: 'Changed bio' }
    })
    expect(screen.getByLabelText(/Bio/).value).toBe('Changed bio')

    fireEvent.click(screen.getByRole('button', { name: 'Discard Changes' }))

    expect(screen.getByLabelText(/Bio/).value).toBe('Experienced cardiologist')
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

    expect(document.querySelector('.animate-spin')).not.toBeNull()
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

  it('should render Change Photo button when form is unlocked', async () => {
    const notSubmitted = { ...mockProfile, profileStatus: "NOT_SUBMITTED" }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: notSubmitted } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText('Change Photo')).toBeDefined()
    })
  })

  it('should open photo modal when Change Photo is clicked', async () => {
    const notSubmitted = { ...mockProfile, profileStatus: "NOT_SUBMITTED" }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: notSubmitted } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText('Change Photo')).toBeDefined()
    })

    fireEvent.click(screen.getByText('Change Photo'))

    expect(screen.getByText('Update Profile Photo')).toBeDefined()
    expect(screen.getByLabelText('Image URL')).toBeDefined()
  })

  it('should show validation errors for empty required fields', async () => {
    const emptyDoctor = {
      ...mockProfile,
      profileStatus: "NOT_SUBMITTED",
      bio: "", qualifications: "", experience: "",
      specialisation: "", consultationFee: ""
    }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: emptyDoctor } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText(/Bio/)).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: /Submit for Review/ }))

    await waitFor(() => {
      expect(screen.getByText('Bio is required')).toBeDefined()
      expect(screen.getByText('Qualifications is required')).toBeDefined()
      expect(screen.getByText('Experience is required')).toBeDefined()
      expect(screen.getByText('Specialisation is required')).toBeDefined()
      expect(screen.getByText('Consultation fee is required')).toBeDefined()
    })
  })

  it('should not submit form when required fields are empty', async () => {
    const emptyDoctor = {
      ...mockProfile,
      profileStatus: "NOT_SUBMITTED",
      bio: "", qualifications: "", experience: "",
      specialisation: "", consultationFee: ""
    }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: emptyDoctor } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText(/Bio/)).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: /Submit for Review/ }))

    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeDefined()
    })

    expect(axios.put).not.toHaveBeenCalled()
  })

  it('should clear validation errors on discard', async () => {
    const emptyDoctor = {
      ...mockProfile,
      profileStatus: "NOT_SUBMITTED",
      bio: "", qualifications: "", experience: "",
      specialisation: "", consultationFee: ""
    }
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: emptyDoctor } })
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText(/Bio/)).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: /Submit for Review/ }))

    await waitFor(() => {
      expect(screen.getByText('Bio is required')).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Discard Changes' }))

    expect(screen.queryByText('Bio is required')).toBeNull()
  })

})