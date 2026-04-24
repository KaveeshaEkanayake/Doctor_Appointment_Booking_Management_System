import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor }    from '@testing-library/react'
import { MemoryRouter }                          from 'react-router-dom'
import axios                                     from 'axios'
import DoctorAppointmentsPage                    from '../pages/DoctorAppointmentsPage'

vi.mock('axios')
vi.mock('../assets/Logo04.PNG', () => ({ default: 'test-file-stub' }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockAppointments = [
  {
    id:          1,
    patientName: "John Smith",
    date:        "2026-12-10T00:00:00.000Z",
    time:        "09:00 AM",
    reason:      "General checkup",
    status:      "PENDING",
  },
  {
    id:          2,
    patientName: "Jane Doe",
    date:        "2026-12-11T00:00:00.000Z",
    time:        "10:00 AM",
    reason:      "Follow up",
    status:      "CONFIRMED",
  },
  {
    id:              3,
    patientName:     "Mark Lee",
    date:            "2026-12-12T00:00:00.000Z",
    time:            "11:00 AM",
    reason:          "Chest pain",
    status:          "CANCELLED",
    rejectionReason: "Doctor unavailable on this day",
  },
]

const renderPage = () => render(
  <MemoryRouter><DoctorAppointmentsPage /></MemoryRouter>
)

describe('DoctorAppointmentsPage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('token', 'fake-doctor-token')
    localStorage.setItem('role', 'doctor')
    localStorage.setItem('user', JSON.stringify({
      firstName: "Arjun",
      lastName:  "Kumar",
      role:      "doctor",
    }))
  })

  it('should render loading spinner initially', () => {
    axios.get.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(document.querySelector('.animate-spin')).not.toBeNull()
  })

  it('should render My Appointments heading', async () => {
  axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
  renderPage()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'My Appointments' })).toBeDefined()
  })
})

  it('should render doctor first name in header', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/Hi, Dr.Arjun/i)).toBeDefined()
    })
  })

  it('should render Pending Requests tab', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Pending Requests')).toBeDefined()
    })
  })

  it('should render Confirmed Appointments tab', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Confirmed')).toBeDefined()
    })
  })

  it('should show pending appointment count badge', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText('1').length).toBeGreaterThan(0)
    })
  })

  it('should render pending patient name', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeDefined()
    })
  })

  it('should render Accept button for pending appointment', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Accept')).toBeDefined()
    })
  })

  it('should render Decline button for pending appointment', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Decline')).toBeDefined()
    })
  })

  it('should open reject modal when Decline is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Decline')).toBeDefined()
    })

    fireEvent.click(screen.getByText('Decline'))

    await waitFor(() => {
      expect(screen.getByText('Reject Appointment')).toBeDefined()
    })
  })

  it('should show patient info in reject modal', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Decline')).toBeDefined()
    })

    fireEvent.click(screen.getByText('Decline'))

    await waitFor(() => {
      expect(screen.getAllByText('John Smith').length).toBeGreaterThan(0)
    })
  })

  it('should show Submit Rejection button in modal', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Decline')).toBeDefined()
    })

    fireEvent.click(screen.getByText('Decline'))

    await waitFor(() => {
      expect(screen.getByText('Submit Rejection')).toBeDefined()
    })
  })

  it('should close modal when Cancel is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Decline')).toBeDefined()
    })

    fireEvent.click(screen.getByText('Decline'))

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeDefined()
    })

    fireEvent.click(screen.getByText('Cancel'))

    await waitFor(() => {
      expect(screen.queryByText('Reject Appointment')).toBeNull()
    })
  })

  it('should confirm appointment when Accept is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Accept')).toBeDefined()
    })

    axios.patch.mockResolvedValueOnce({
      data: { success: true, appointment: { id: 1, status: "CONFIRMED" } }
    })

    fireEvent.click(screen.getByText('Accept'))

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/api/doctor/appointments/1/status'),
        { status: "CONFIRMED" },
        expect.any(Object)
      )
    })
  })

  it('should switch to confirmed tab and show confirmed appointments', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Confirmed')).toBeDefined()
    })

    fireEvent.click(screen.getByText('Confirmed'))

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeDefined()
    })
  })

  it('should show empty state when no pending appointments', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: [] } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('No Pending Requests')).toBeDefined()
    })
  })

  it('should show empty state when no confirmed appointments', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: [] } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Confirmed')).toBeDefined()
    })

    fireEvent.click(screen.getByText('Confirmed'))

    await waitFor(() => {
      expect(screen.getByText('No Confirmed Appointments')).toBeDefined()
    })
  })

  it('should show error when API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'))
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Failed to load appointments.')).toBeDefined()
    })
  })

  it('should submit rejection with reason', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Decline')).toBeDefined()
    })

    fireEvent.click(screen.getByText('Decline'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Doctor unavailable/i)).toBeDefined()
    })

    fireEvent.change(
      screen.getByPlaceholderText(/Doctor unavailable/i),
      { target: { value: "Not available on this day" } }
    )

    axios.patch.mockResolvedValueOnce({
      data: {
        success:     true,
        appointment: {
          id:              1,
          status:          "CANCELLED",
          rejectionReason: "Not available on this day",
        }
      }
    })

    fireEvent.click(screen.getByText('Submit Rejection'))

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/api/doctor/appointments/1/status'),
        { status: "CANCELLED", rejectionReason: "Not available on this day" },
        expect.any(Object)
      )
    })
  })

})