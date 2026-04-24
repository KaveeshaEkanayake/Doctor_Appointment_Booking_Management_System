import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import MySchedule from '../pages/MySchedule'

vi.mock('axios')
vi.mock('../assets/Logo04.PNG', () => ({ default: 'test-file-stub' }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../layouts/DoctorLayout', () => ({
  default: ({ children }) => <div data-testid="doctor-layout">{children}</div>
}))

// Use current week date so calendar renders them
const today = new Date()
const todayISO = today.toISOString()

const mockAppointments = [
  {
    id:              1,
    patientId:       1,
    patientName:     "John Smith",
    patientPhone:    "0771234567",
    date:            todayISO,
    time:            "10:00 AM",
    reason:          "Checkup",
    status:          "CONFIRMED",
    notes:           null,
    rejectionReason: null,
  },
]

const mockBlockedSlots = [
  {
    id:        1,
    doctorId:  1,
    date:      todayISO,
    startTime: "08:00",
    endTime:   "09:00",
    reason:    "Lunch break",
  },
]

const renderPage = () => render(
  <MemoryRouter><MySchedule /></MemoryRouter>
)

describe('MySchedule', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('token', 'fake-doctor-token')
    axios.get.mockResolvedValue({
      data: {
        success:      true,
        appointments: mockAppointments,
        blockedSlots: mockBlockedSlots,
      }
    })
  })

  it('should render My Schedule heading', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('My Schedule')).toBeDefined()
    })
  })

  it('should render the doctor layout', async () => {
    renderPage()
    expect(screen.getByTestId('doctor-layout')).toBeDefined()
  })

  it('should render Block Slot button', async () => {
    renderPage()
    expect(screen.getByText('+ Block Slot')).toBeDefined()
  })

  it('should render Edit Availability button', async () => {
    renderPage()
    expect(screen.getByText('Edit Availability')).toBeDefined()
  })

  it('should fetch schedule on load', async () => {
    renderPage()
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled()
    })
  })

  it('should render appointment on calendar after load', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeDefined()
    }, { timeout: 5000 })
  })

  it('should render blocked slot on calendar', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Blocked')).toBeDefined()
    }, { timeout: 5000 })
  })

  it('should show block slot modal when Block Slot is clicked', async () => {
    renderPage()
    fireEvent.click(screen.getByText('+ Block Slot'))
    expect(screen.getByText('Block a Time Slot')).toBeDefined()
  })

  it('should close block slot modal when Cancel is clicked', async () => {
    renderPage()
    fireEvent.click(screen.getByText('+ Block Slot'))
    expect(screen.getByText('Block a Time Slot')).toBeDefined()
    fireEvent.click(screen.getByText('Cancel'))
    await waitFor(() => {
      expect(screen.queryByText('Block a Time Slot')).toBeNull()
    })
  })

  it('should show error if reason is empty when blocking slot', async () => {
    renderPage()
    fireEvent.click(screen.getByText('+ Block Slot'))
    fireEvent.click(screen.getByText('Block Slot'))
    await waitFor(() => {
      expect(screen.getByText('Please enter a reason for blocking this slot.')).toBeDefined()
    })
  })

  it('should show appointment detail modal when appointment is clicked', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeDefined()
    }, { timeout: 5000 })
    fireEvent.click(screen.getByText('John Smith'))
    await waitFor(() => {
      expect(screen.getByText('Appointment Details')).toBeDefined()
    })
  })

  it('should show patient name in appointment detail modal', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeDefined()
    }, { timeout: 5000 })
    fireEvent.click(screen.getByText('John Smith'))
    await waitFor(() => {
      expect(screen.getAllByText('John Smith').length).toBeGreaterThan(0)
    })
  })

  it('should close appointment detail modal when Close is clicked', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('John Smith')).toBeDefined()
    }, { timeout: 5000 })
    fireEvent.click(screen.getByText('John Smith'))
    await waitFor(() => {
      expect(screen.getByText('Appointment Details')).toBeDefined()
    })
    fireEvent.click(screen.getByText('Close'))
    await waitFor(() => {
      expect(screen.queryByText('Appointment Details')).toBeNull()
    })
  })

  it('should navigate to availability page when Edit Availability is clicked', async () => {
    renderPage()
    fireEvent.click(screen.getByText('Edit Availability'))
    expect(mockNavigate).toHaveBeenCalledWith('/doctor/availability')
  })

  it('should call block API when block form is submitted with reason', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true, blockedSlot: { id: 2 } } })
    renderPage()
    fireEvent.click(screen.getByText('+ Block Slot'))
    fireEvent.change(screen.getByPlaceholderText(/Lunch break/i), {
      target: { value: 'Meeting' }
    })
    fireEvent.click(screen.getByText('Block Slot'))
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled()
    })
  })

  it('should call unblock API when Unblock is clicked', async () => {
    axios.delete.mockResolvedValueOnce({ data: { success: true } })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Blocked')).toBeDefined()
    }, { timeout: 5000 })
    const unblockBtn = screen.getByText('Unblock')
    fireEvent.click(unblockBtn)
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalled()
    })
  })

  it('should show AM/PM time labels on calendar', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('8:00 AM').length).toBeGreaterThan(0)
    })
  })

  it('should fetch new schedule when week navigation is clicked', async () => {
    renderPage()
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1)
    })
    fireEvent.click(screen.getByText('▶'))
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2)
    })
  })

})