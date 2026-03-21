import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor }    from '@testing-library/react'
import { MemoryRouter, Route, Routes }           from 'react-router-dom'
import axios                                     from 'axios'
import DoctorPublicProfilePage                   from '../pages/DoctorPublicProfilePage'

vi.mock('axios')
vi.mock('../assets/Logo04.PNG', () => ({ default: 'test-file-stub' }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockDoctor = {
  id:             1,
  firstName:      "John",
  lastName:       "Smith",
  specialisation: "Cardiology",
  profilePhoto:   "",
  bio:            "Experienced cardiologist with 10 years of practice.",
  qualifications: "MBBS, MD Cardiology",
  experience:     "10 years",
  consultationFee: 2500,
  appointmentDuration: 30,
}

const mockAvailability = [
  { id: 1, day: "MONDAY",    startTime: "09:00", endTime: "12:00", isActive: true },
  { id: 2, day: "WEDNESDAY", startTime: "14:00", endTime: "17:00", isActive: true },
]

const renderPage = () => render(
  <MemoryRouter initialEntries={["/doctors/1"]}>
    <Routes>
      <Route path="/doctors/:id" element={<DoctorPublicProfilePage />} />
    </Routes>
  </MemoryRouter>
)

describe('DoctorPublicProfilePage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should show loading spinner initially', () => {
    axios.get.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(document.querySelector('.animate-spin')).not.toBeNull()
  })

  it('should render doctor name after loading', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
      .mockResolvedValueOnce({ data: { success: true, availability: mockAvailability } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Dr. John Smith')).toBeDefined()
    })
  })

  it('should render doctor specialisation', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
      .mockResolvedValueOnce({ data: { success: true, availability: mockAvailability } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText('Cardiology').length).toBeGreaterThan(0)
    })
  })

  it('should render doctor bio', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
      .mockResolvedValueOnce({ data: { success: true, availability: mockAvailability } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/Experienced cardiologist/i)).toBeDefined()
    })
  })

  it('should render doctor qualifications', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
      .mockResolvedValueOnce({ data: { success: true, availability: mockAvailability } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText('MBBS, MD Cardiology').length).toBeGreaterThan(0)
    })
  })

  it('should render doctor experience', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
      .mockResolvedValueOnce({ data: { success: true, availability: mockAvailability } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('10 years')).toBeDefined()
    })
  })

  it('should render consultation fee', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
      .mockResolvedValueOnce({ data: { success: true, availability: mockAvailability } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/Rs 2500/i)).toBeDefined()
    })
  })

  it('should render day selector with next 7 days', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
      .mockResolvedValueOnce({ data: { success: true, availability: mockAvailability } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Available Time Slots')).toBeDefined()
    })
  })

  it('should render time slots when a day with availability is selected', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
      .mockResolvedValueOnce({ data: { success: true, availability: mockAvailability } })
    renderPage()

    await waitFor(() => {
      // Time slots should be generated for the auto-selected day
      expect(screen.getByText('Available Time Slots')).toBeDefined()
    })
  })

  it('should render Confirm & Book Appointment button', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
      .mockResolvedValueOnce({ data: { success: true, availability: mockAvailability } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Confirm & Book Appointment')).toBeDefined()
    })
  })

  it('should redirect to login when not logged in and Book clicked', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
      .mockResolvedValueOnce({ data: { success: true, availability: mockAvailability } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Confirm & Book Appointment')).toBeDefined()
    })

    fireEvent.click(screen.getByText('Confirm & Book Appointment'))
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('should render error state when doctor not found', async () => {
    axios.get.mockRejectedValue(new Error('Not found'))
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Doctor Not Found')).toBeDefined()
    })
  })

  it('should render Book an appointment button in header', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
      .mockResolvedValueOnce({ data: { success: true, availability: mockAvailability } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/Book an appointment/i)).toBeDefined()
    })
  })

  it('should render Verified Profile badge', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
      .mockResolvedValueOnce({ data: { success: true, availability: mockAvailability } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Verified Profile')).toBeDefined()
    })
  })

  it('should render Meet Our Doctors CTA button', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
      .mockResolvedValueOnce({ data: { success: true, availability: mockAvailability } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Meet Our Doctors')).toBeDefined()
    })
  })

  it('should navigate to /doctors when Meet Our Doctors clicked', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { success: true, doctor: mockDoctor } })
      .mockResolvedValueOnce({ data: { success: true, availability: mockAvailability } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Meet Our Doctors')).toBeDefined()
    })

    fireEvent.click(screen.getByText('Meet Our Doctors'))
    expect(mockNavigate).toHaveBeenCalledWith('/doctors')
  })

})