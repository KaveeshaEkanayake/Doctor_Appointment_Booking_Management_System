import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor }    from '@testing-library/react'
import { MemoryRouter, Route, Routes }           from 'react-router-dom'
import axios                                     from 'axios'
import AppointmentReviewPage                     from '../pages/AppointmentReviewPage'

vi.mock('axios')
vi.mock('../assets/Logo04.PNG', () => ({ default: 'test-file-stub' }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockState = {
  doctorId: "1",
  date:     "2026-03-23T00:00:00.000Z",
  time:     "09:00 AM",
  reason:   "",
}

const mockDoctor = {
  id:              1,
  firstName:       "John",
  lastName:        "Smith",
  specialisation:  "Cardiology",
  profilePhoto:    "",
  consultationFee: 2500,
}

const renderPage = (state = mockState) => render(
  <MemoryRouter
    initialEntries={[{ pathname: "/appointments/review", state }]}
  >
    <Routes>
      <Route path="/appointments/review" element={<AppointmentReviewPage />} />
    </Routes>
  </MemoryRouter>
)

describe('AppointmentReviewPage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.setItem('token', 'fake-patient-token')
    localStorage.setItem('role', 'patient')
  })

  it('should render Review Appointment heading', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Review Appointment')).toBeDefined()
    })
  })

  it('should render doctor name after loading', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Dr. John Smith')).toBeDefined()
    })
  })

  it('should render date and time', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/09:00 AM/i)).toBeDefined()
    })
  })

  it('should render reason for visit textarea', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/describe your symptoms/i)).toBeDefined()
    })
  })

  it('should render Back button', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Back')).toBeDefined()
    })
  })

  it('should render Confirm Booking button', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Confirm Booking')).toBeDefined()
    })
  })

  it('should navigate back when Back is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Back')).toBeDefined()
    })

    fireEvent.click(screen.getByText('Back'))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('should update reason when typing', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/describe your symptoms/i)).toBeDefined()
    })

    fireEvent.change(
      screen.getByPlaceholderText(/describe your symptoms/i),
      { target: { value: 'Chest pain' } }
    )

    expect(screen.getByPlaceholderText(/describe your symptoms/i).value).toBe('Chest pain')
  })

  it('should navigate to confirmation on successful booking', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Confirm Booking')).toBeDefined()
    })

    axios.post.mockResolvedValueOnce({
      data: {
        success:     true,
        message:     "Appointment booked successfully",
        appointment: {
          time:   "09:00 AM",
          doctor: { firstName: "John", lastName: "Smith" },
        },
      }
    })

    fireEvent.click(screen.getByText('Confirm Booking'))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/appointments/confirmation",
        expect.objectContaining({ state: expect.any(Object) })
      )
    })
  })

  it('should show error message when booking fails', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Confirm Booking')).toBeDefined()
    })

    axios.post.mockRejectedValueOnce({
      response: { data: { message: "This time slot is already booked" } }
    })

    fireEvent.click(screen.getByText('Confirm Booking'))

    await waitFor(() => {
      expect(screen.getByText('This time slot is already booked')).toBeDefined()
    })
  })

  it('should show no appointment data when state is missing', () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
    render(
      <MemoryRouter initialEntries={["/appointments/review"]}>
        <Routes>
          <Route path="/appointments/review" element={<AppointmentReviewPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText(/No appointment data found/i)).toBeDefined()
  })

  it('should render Selected Specialist label', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Selected Specialist')).toBeDefined()
    })
  })

  it('should render DATE & TIME label', async () => {
  axios.get.mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
  renderPage()

  await waitFor(() => {
    expect(screen.getByText(/date & time/i)).toBeDefined()
  })
})

})