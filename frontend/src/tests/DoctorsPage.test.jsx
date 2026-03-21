import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import DoctorsPage from '../pages/DoctorsPage'

vi.mock('axios')
vi.mock('../assets/Logo04.PNG', () => ({ default: 'test-file-stub' }))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockDoctors = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    specialisation: "Cardiology",
    profilePhoto: "",
    bio: "Experienced cardiologist",
    experience: "10 years",
    consultationFee: 2500,
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Doe",
    specialisation: "Neurology",
    profilePhoto: "",
    bio: "Expert neurologist",
    experience: "8 years",
    consultationFee: 1500,
  },
  {
    id: 3,
    firstName: "Mark",
    lastName: "Lee",
    specialisation: "Cardiology",
    profilePhoto: "",
    bio: "Heart specialist",
    experience: "12 years",
    consultationFee: 3000,
  },
]

const renderPage = () => render(
  <MemoryRouter><DoctorsPage /></MemoryRouter>
)

describe('DoctorsPage', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should render search bar', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search for Doctors By Name/i)).toBeDefined()
    })
  })

  it('should render filter sidebar with Specialities', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Filter')).toBeDefined()
      expect(screen.getAllByText('Specialities').length).toBeGreaterThan(0)
    })
  })

  it('should render Sort By Price dropdown', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Sort By Price')).toBeDefined()
      expect(screen.getByRole('combobox')).toBeDefined()
    })
  })

  it('should show loading spinner initially', () => {
    axios.get.mockReturnValueOnce(new Promise(() => {}))
    renderPage()

    expect(document.querySelector('.animate-spin')).not.toBeNull()
  })

  it('should render doctor cards after loading', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Dr. John Smith')).toBeDefined()
      expect(screen.getByText('Dr. Jane Doe')).toBeDefined()
      expect(screen.getByText('Dr. Mark Lee')).toBeDefined()
    })
  })

  it('should show doctor count', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('3')).toBeDefined()
    })
  })

  it('should show specialisation on doctor card', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText('Cardiology').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Neurology').length).toBeGreaterThan(0)
    })
  })

  it('should show experience badge on doctor card', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('+10 years')).toBeDefined()
      expect(screen.getByText('+8 years')).toBeDefined()
    })
  })

  it('should show Available badge on each card', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      const badges = screen.getAllByText('Available')
      expect(badges.length).toBe(mockDoctors.length)
    })
  })

  it('should show Book Now button for each doctor', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      const buttons = screen.getAllByText(/Book Now/i)
      expect(buttons.length).toBe(mockDoctors.length)
    })
  })

  it('should filter doctors by search input dynamically', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Dr. John Smith')).toBeDefined()
    })

    fireEvent.change(screen.getByPlaceholderText(/Search for Doctors By Name/i), {
      target: { value: 'Jane' }
    })

    await waitFor(() => {
      expect(screen.queryByText('Dr. John Smith')).toBeNull()
      expect(screen.getByText('Dr. Jane Doe')).toBeDefined()
    })
  })

  it('should filter doctors by specialisation radio', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Dr. Jane Doe')).toBeDefined()
    })

    const cardiologyRadio = screen.getByDisplayValue('Cardiology')
    fireEvent.click(cardiologyRadio)

    await waitFor(() => {
      expect(screen.queryByText('Dr. Jane Doe')).toBeNull()
      expect(screen.getByText('Dr. John Smith')).toBeDefined()
      expect(screen.getByText('Dr. Mark Lee')).toBeDefined()
    })
  })

  it('should show no doctors available when search finds nothing', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Dr. John Smith')).toBeDefined()
    })

    fireEvent.change(screen.getByPlaceholderText(/Search for Doctors By Name/i), {
      target: { value: 'zzznomatch' }
    })

    await waitFor(() => {
      expect(screen.getByText('No Doctors Available')).toBeDefined()
    })
  })

  it('should show clear all filters button when search finds nothing', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Dr. John Smith')).toBeDefined()
    })

    fireEvent.change(screen.getByPlaceholderText(/Search for Doctors By Name/i), {
      target: { value: 'zzznomatch' }
    })

    await waitFor(() => {
      expect(screen.getByText('Clear all filters')).toBeDefined()
    })
  })

  it('should clear filters when Clear All is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Dr. John Smith')).toBeDefined()
    })

    fireEvent.change(screen.getByPlaceholderText(/Search for Doctors By Name/i), {
      target: { value: 'Jane' }
    })

    await waitFor(() => {
      expect(screen.queryByText('Dr. John Smith')).toBeNull()
    })

    fireEvent.click(screen.getByText('Clear All'))

    await waitFor(() => {
      expect(screen.getByText('Dr. John Smith')).toBeDefined()
    })
  })

  it('should sort doctors by price low to high', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Dr. John Smith')).toBeDefined()
    })

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'low' }
    })

    await waitFor(() => {
      const names = screen.getAllByText(/Dr\. /i).map((el) => el.textContent)
      const janeIndex = names.findIndex((n) => n.includes('Jane Doe'))
      const johnIndex = names.findIndex((n) => n.includes('John Smith'))
      expect(janeIndex).toBeLessThan(johnIndex)
    })
  })

  it('should sort doctors by price high to low', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Dr. John Smith')).toBeDefined()
    })

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'high' }
    })

    await waitFor(() => {
      const names = screen.getAllByText(/Dr\. /i).map((el) => el.textContent)
      const markIndex = names.findIndex((n) => n.includes('Mark Lee'))
      const janeIndex = names.findIndex((n) => n.includes('Jane Doe'))
      expect(markIndex).toBeLessThan(janeIndex)
    })
  })

  it('should show empty state when no doctors returned from API', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: [] } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('No Doctors Available')).toBeDefined()
    })
  })

  it('should show error message on API failure', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'))
    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/Failed to load doctors/i)).toBeDefined()
    })
  })

  it('should call /api/doctors without requiring login', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/doctors')
      )
    })

    expect(axios.get).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: expect.anything() })
      })
    )
  })

  it('should redirect to login when Book Now clicked and not logged in', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText(/Book Now/i).length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getAllByText(/Book Now/i)[0])

    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('should navigate to booking page when patient clicks Book Now', async () => {
    localStorage.setItem('token', 'fake-patient-token')
    localStorage.setItem('role', 'patient')

    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText(/Book Now/i).length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getAllByText(/Book Now/i)[0])

    expect(mockNavigate).toHaveBeenCalledWith(
      `/appointments/book/${mockDoctors[0].id}`
    )
  })

  it('should show message when doctor clicks Book Now', async () => {
    localStorage.setItem('token', 'fake-doctor-token')
    localStorage.setItem('role', 'doctor')

    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText(/Book Now/i).length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getAllByText(/Book Now/i)[0])

    await waitFor(() => {
      expect(screen.getByText(/Please use a patient account to book appointments/i)).toBeDefined()
    })
  })

  it('should show message when admin clicks Book Now', async () => {
    localStorage.setItem('token', 'fake-admin-token')
    localStorage.setItem('role', 'admin')

    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText(/Book Now/i).length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getAllByText(/Book Now/i)[0])

    await waitFor(() => {
      expect(screen.getByText(/Admins cannot book appointments/i)).toBeDefined()
    })
  })

  it('should show pagination when doctors exceed 10', async () => {
    const manyDoctors = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      firstName: `Doctor${i + 1}`,
      lastName: "Test",
      specialisation: "Cardiology",
      profilePhoto: "",
      experience: "5 years",
      consultationFee: 1000,
    }))

    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: manyDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Next')).toBeDefined()
      expect(screen.getByText('Prev')).toBeDefined()
    })
  })

  it('should not show pagination when doctors are 10 or fewer', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.queryByText('Next')).toBeNull()
      expect(screen.queryByText('Prev')).toBeNull()
    })
  })

  it('should render navbar', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getAllByAltText('MediCare').length).toBeGreaterThan(0)
    })
  })

  it('should render footer', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, doctors: mockDoctors } })
    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/Copyright/i)).toBeDefined()
    })
  })

})