import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor }    from '@testing-library/react'
import { MemoryRouter }                          from 'react-router-dom'
import axios                                     from 'axios'
import MyAppointments                            from '../pages/MyAppointments'

vi.mock('axios')
vi.mock('../assets/Noappointment.png', () => ({ default: 'test-file-stub' }))
vi.mock('../assets/Logo04.PNG', () => ({ default: 'test-file-stub' }))

vi.mock('../components/DateSelector', () => ({
  default: ({ onSelectDate }) => (
    <button onClick={() => onSelectDate(new Date('2026-12-20'))}>
      Select Date
    </button>
  )
}))

vi.mock('../components/AvailableSlots', () => ({
  default: ({ onSelectTime }) => (
    <button onClick={() => onSelectTime('10:00 AM')}>
      Select Slot
    </button>
  )
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const futureDate = new Date()
futureDate.setMonth(futureDate.getMonth() + 2)
const futureDateStr = futureDate.toISOString()

const mockAppointments = [
  {
    id:              1,
    doctorId:        10,
    doctorName:      "Dr. Tharindu Herath",
    specialisation:  "Cardiology",
    profilePhoto:    null,
    date:            futureDateStr,
    time:            "09:00 AM",
    reason:          "General checkup",
    status:          "Pending",
    rejectionReason: null,
  },
  {
    id:              2,
    doctorId:        10,
    doctorName:      "Dr. Tharindu Herath",
    specialisation:  "Cardiology",
    profilePhoto:    null,
    date:            futureDateStr,
    time:            "10:00 AM",
    reason:          "Follow up",
    status:          "Confirmed",
    rejectionReason: null,
  },
  {
    id:              3,
    doctorId:        10,
    doctorName:      "Dr. Tharindu Herath",
    specialisation:  "Cardiology",
    profilePhoto:    null,
    date:            futureDateStr,
    time:            "11:00 AM",
    reason:          "Chest pain",
    status:          "Cancelled",
    rejectionReason: "Doctor unavailable",
  },
]

const renderPage = () => render(
  <MemoryRouter><MyAppointments /></MemoryRouter>
)

describe('MyAppointments', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('token', 'fake-patient-token')
    localStorage.setItem('role', 'patient')
    localStorage.setItem('user', JSON.stringify({
      firstName: "Test",
      lastName:  "Patient",
    }))
  })

  it('should render My Appointments heading', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('My Appointments')).toBeDefined()
    })
  })

  it('should render pending appointment doctor name', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('Dr. Tharindu Herath').length).toBeGreaterThan(0)
    })
  })

  it('should render Pending status badge', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeDefined()
    })
  })

  it('should render Confirmed status badge', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Confirmed')).toBeDefined()
    })
  })

  it('should show Reschedule button for Pending appointment', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()
    await waitFor(() => {
      const buttons = screen.getAllByText('Reschedule')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  it('should show Reschedule button for Confirmed appointment', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()
    await waitFor(() => {
      const buttons = screen.getAllByText('Reschedule')
      expect(buttons.length).toBe(2)
    })
  })

  it('should not show Reschedule button for Cancelled appointment', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: [mockAppointments[2]] } })
    renderPage()
    await waitFor(() => {
      expect(screen.queryByText('Reschedule')).toBeNull()
    })
  })

  it('should open reschedule modal when Reschedule is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThan(0)
    })
    fireEvent.click(screen.getAllByText('Reschedule')[0])
    await waitFor(() => {
      expect(screen.getByText('Reschedule appointment')).toBeDefined()
    })
  })

  it('should show doctor name in reschedule modal', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThan(0)
    })
    fireEvent.click(screen.getAllByText('Reschedule')[0])
    await waitFor(() => {
      expect(screen.getAllByText('Dr. Tharindu Herath').length).toBeGreaterThan(0)
    })
  })

  it('should show step indicator in reschedule modal', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThan(0)
    })
    fireEvent.click(screen.getAllByText('Reschedule')[0])
    await waitFor(() => {
      expect(screen.getByText('Select date')).toBeDefined()
      expect(screen.getByText('Pick time slot')).toBeDefined()
      expect(screen.getByText('Confirm')).toBeDefined()
    })
  })

  it('should show current appointment info in modal', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThan(0)
    })
    fireEvent.click(screen.getAllByText('Reschedule')[0])
    await waitFor(() => {
      expect(screen.getByText('Current appointment')).toBeDefined()
    })
  })

  it('should close reschedule modal when X is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThan(0)
    })
    fireEvent.click(screen.getAllByText('Reschedule')[0])
    await waitFor(() => {
      expect(screen.getByText('Reschedule appointment')).toBeDefined()
    })
    fireEvent.click(screen.getByText('✕'))
    await waitFor(() => {
      expect(screen.queryByText('Reschedule appointment')).toBeNull()
    })
  })

  it('should close reschedule modal when Cancel button is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThan(0)
    })
    fireEvent.click(screen.getAllByText('Reschedule')[0])
    await waitFor(() => {
      expect(screen.getByText('Reschedule appointment')).toBeDefined()
    })
    fireEvent.click(screen.getByText('Confirm reschedule').closest('div').querySelector('button:first-child'))
    await waitFor(() => {
      expect(screen.queryByText('Reschedule appointment')).toBeNull()
    })
  })

  it('should show Confirm reschedule button disabled when no date selected', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThan(0)
    })
    fireEvent.click(screen.getAllByText('Reschedule')[0])
    await waitFor(() => {
      const confirmBtn = screen.getByText('Confirm reschedule')
      expect(confirmBtn.disabled).toBe(true)
    })
  })

  it('should call reschedule API with correct data', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThan(0)
    })
    fireEvent.click(screen.getAllByText('Reschedule')[0])
    await waitFor(() => {
      expect(screen.getByText('Select Date')).toBeDefined()
    })
    fireEvent.click(screen.getByText('Select Date'))
    fireEvent.click(screen.getByText('Select Slot'))
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    axios.patch.mockResolvedValueOnce({ data: { success: true } })
    fireEvent.click(screen.getByText('Confirm reschedule'))
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining('/api/appointments/1/reschedule'),
        expect.objectContaining({ time: '10:00 AM' }),
        expect.any(Object)
      )
    })
  })

  it('should show error when reschedule API fails', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('Reschedule').length).toBeGreaterThan(0)
    })
    fireEvent.click(screen.getAllByText('Reschedule')[0])
    await waitFor(() => {
      expect(screen.getByText('Select Date')).toBeDefined()
    })
    fireEvent.click(screen.getByText('Select Date'))
    fireEvent.click(screen.getByText('Select Slot'))
    axios.patch.mockRejectedValueOnce({
      response: { data: { message: "This time slot is already booked" } }
    })
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: mockAppointments } })
    fireEvent.click(screen.getByText('Confirm reschedule'))
    await waitFor(() => {
      expect(screen.getByText('This time slot is already booked')).toBeDefined()
    })
  })

  it('should show empty state when no upcoming appointments', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: [] } })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('No Appointments Scheduled')).toBeDefined()
    })
  })

  it('should show Book an Appointment button when no appointments', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: [] } })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Book an Appointment')).toBeDefined()
    })
  })

  it('should navigate to /doctors when Book an Appointment clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, appointments: [] } })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Book an Appointment')).toBeDefined()
    })
    fireEvent.click(screen.getByText('Book an Appointment'))
    expect(mockNavigate).toHaveBeenCalledWith('/doctors')
  })

})