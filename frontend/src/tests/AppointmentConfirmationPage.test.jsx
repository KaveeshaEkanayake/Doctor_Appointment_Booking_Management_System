import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent }             from '@testing-library/react'
import { MemoryRouter, Route, Routes }           from 'react-router-dom'
import AppointmentConfirmationPage               from '../pages/AppointmentConfirmationPage'

vi.mock('../assets/Logo04.PNG', () => ({ default: 'test-file-stub' }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockState = {
  reason:   "General Consultation",
  date:     "March 23, 2026",
  time:     "09:00 AM",
  provider: "Dr. John Smith",
}

const renderPage = (state = mockState) => render(
  <MemoryRouter
    initialEntries={[{ pathname: "/appointments/confirmation", state }]}
  >
    <Routes>
      <Route path="/appointments/confirmation" element={<AppointmentConfirmationPage />} />
    </Routes>
  </MemoryRouter>
)

describe('AppointmentConfirmationPage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render success heading', () => {
    renderPage()
    expect(screen.getByText('Appointment Booked Successfully!')).toBeDefined()
  })

  it('should render success message', () => {
    renderPage()
    expect(screen.getByText(/Your appointment has been confirmed/i)).toBeDefined()
  })

  it('should render reason', () => {
    renderPage()
    expect(screen.getByText('General Consultation')).toBeDefined()
  })

  it('should render date', () => {
    renderPage()
    expect(screen.getByText('March 23, 2026')).toBeDefined()
  })

  it('should render time', () => {
    renderPage()
    expect(screen.getByText('09:00 AM')).toBeDefined()
  })

  it('should render provider name', () => {
    renderPage()
    expect(screen.getByText(/Dr. John Smith/i)).toBeDefined()
  })

  it('should render View My Appointments button', () => {
    renderPage()
    expect(screen.getByText('View My Appointments')).toBeDefined()
  })

  it('should render Browse More Doctors button', () => {
    renderPage()
    expect(screen.getByText('Browse More Doctors')).toBeDefined()
  })

  it('should navigate to /my-appointments when View My Appointments clicked', () => {
    renderPage()
    fireEvent.click(screen.getByText('View My Appointments'))
    expect(mockNavigate).toHaveBeenCalledWith('/my-appointments')
  })

  it('should navigate to /doctors when Browse More Doctors clicked', () => {
    renderPage()
    fireEvent.click(screen.getByText('Browse More Doctors'))
    expect(mockNavigate).toHaveBeenCalledWith('/doctors')
  })

  it('should render REASON label', () => {
    renderPage()
    expect(screen.getByText('Reason')).toBeDefined()
  })

  it('should render DATE label', () => {
    renderPage()
    expect(screen.getByText('Date')).toBeDefined()
  })

  it('should render TIME label', () => {
    renderPage()
    expect(screen.getByText('Time')).toBeDefined()
  })

  it('should render PROVIDER label', () => {
    renderPage()
    expect(screen.getByText('Provider')).toBeDefined()
  })

  it('should show no details message when state is missing', () => {
    render(
      <MemoryRouter initialEntries={["/appointments/confirmation"]}>
        <Routes>
          <Route path="/appointments/confirmation" element={<AppointmentConfirmationPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText(/No appointment details found/i)).toBeDefined()
  })

})