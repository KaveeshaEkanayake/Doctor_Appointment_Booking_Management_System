import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import DoctorAvailabilityPage from '../pages/DoctorAvailabilityPage'

vi.mock('axios')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockToken = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })) +
  "." + btoa(JSON.stringify({ id: 1, email: "doctor@test.com", role: "doctor" })) +
  ".fake-signature";

const mockAvailability = {
  success: true,
  appointmentDuration: 30,
  availability: [
    { id: 1, day: "MONDAY", startTime: "09:00", endTime: "17:00", isActive: true },
    { id: 2, day: "TUESDAY", startTime: "09:00", endTime: "17:00", isActive: true },
    { id: 3, day: "SATURDAY", startTime: "09:00", endTime: "12:00", isActive: false }
  ]
}

const mockProfile = {
  success: true,
  doctor: {
    firstName: "Kaveesha",
    lastName: "Ekanayake",
    profilePhoto: "",
    status: "APPROVED"
  }
}

const mockBothCalls = () => {
  axios.get
    .mockResolvedValueOnce({ data: mockAvailability })
    .mockResolvedValueOnce({ data: mockProfile });
}

const renderPage = () => render(
  <MemoryRouter><DoctorAvailabilityPage /></MemoryRouter>
)

describe('DoctorAvailabilityPage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('token', mockToken)
    localStorage.setItem('role', 'doctor')
  })

  it('should render the availability page with doctor name', async () => {
    mockBothCalls()
    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'My Availability' })).toBeDefined()
      expect(screen.getByText(/Hi, Dr. Kaveesha/)).toBeDefined()
    })
  })

  it('should render all 7 days', async () => {
    mockBothCalls()
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Monday')).toBeDefined()
      expect(screen.getByText('Tuesday')).toBeDefined()
      expect(screen.getByText('Wednesday')).toBeDefined()
      expect(screen.getByText('Thursday')).toBeDefined()
      expect(screen.getByText('Friday')).toBeDefined()
      expect(screen.getByText('Saturday')).toBeDefined()
      expect(screen.getByText('Sunday')).toBeDefined()
    })
  })

  it('should show Unavailable for inactive days', async () => {
    mockBothCalls()
    renderPage()

    await waitFor(() => {
      const unavailableLabels = screen.getAllByText('Unavailable')
      expect(unavailableLabels.length).toBeGreaterThan(0)
    })
  })

  it('should render appointment duration buttons', async () => {
    mockBothCalls()
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('15 mins')).toBeDefined()
      expect(screen.getByText('30 mins')).toBeDefined()
      expect(screen.getByText('60 mins')).toBeDefined()
    })
  })

  it('should render action buttons', async () => {
    mockBothCalls()
    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Reset' })).toBeDefined()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDefined()
      expect(screen.getByRole('button', { name: /Save Availability/ })).toBeDefined()
    })
  })

  it('should toggle day on/off', async () => {
    mockBothCalls()
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Wednesday')).toBeDefined()
    })

    fireEvent.click(screen.getByLabelText('Toggle Wednesday'))

    await waitFor(() => {
      expect(screen.getByLabelText('Wednesday start time')).toBeDefined()
    })
  })

  it('should change appointment duration', async () => {
    mockBothCalls()
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('15 mins')).toBeDefined()
    })

    fireEvent.click(screen.getByText('15 mins'))

    expect(screen.getByText('15 mins').className).toContain('bg-blue-600')
  })

  it('should save availability successfully', async () => {
    mockBothCalls()
    axios.put.mockResolvedValueOnce({
      data: { success: true, message: "Availability updated successfully", ...mockAvailability }
    })
    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Availability/ })).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: /Save Availability/ }))

    await waitFor(() => {
      expect(screen.getByText(/Availability updated successfully/)).toBeDefined()
    })
  })

  it('should show error on save failure', async () => {
    mockBothCalls()
    axios.put.mockRejectedValueOnce({
      response: { data: { message: "Start time must be before end time for MONDAY" } }
    })
    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Availability/ })).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: /Save Availability/ }))

    await waitFor(() => {
      expect(screen.getByText(/Start time must be before end time/)).toBeDefined()
    })
  })

  it('should show error when fetch fails', async () => {
    axios.get.mockRejectedValueOnce({ response: { status: 500 } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Failed to load availability')).toBeDefined()
    })
  })

  it('should show loading spinner initially', () => {
    axios.get.mockReturnValueOnce(new Promise(() => {}))
    renderPage()

    expect(document.querySelector('.animate-spin')).not.toBeNull()
  })

  it('should render sidebar navigation', async () => {
    mockBothCalls()
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeDefined()
      expect(screen.getByText('My Appointments')).toBeDefined()
      expect(screen.getByText('My Availability')).toBeDefined()
      expect(screen.getByText('Profile')).toBeDefined()
      expect(screen.getByText('Logout')).toBeDefined()
    })
  })

  it('should send authorization header', async () => {
    mockBothCalls()
    renderPage()

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/doctor/availability'),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` }
        })
      )
    })
  })

  it('should reset all days to default', async () => {
    mockBothCalls()
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Monday')).toBeDefined()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))

    await waitFor(() => {
      const unavailableLabels = screen.getAllByText('Unavailable')
      expect(unavailableLabels.length).toBe(7)
    })
  })

  it('should show doctor profile avatar in header', async () => {
    mockBothCalls()
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Dr. Kaveesha')).toBeDefined()
    })
  })

})