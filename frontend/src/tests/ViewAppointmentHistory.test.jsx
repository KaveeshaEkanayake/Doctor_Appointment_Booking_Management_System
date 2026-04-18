import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter }                        from "react-router-dom";
import ViewAppointmentHistory                  from "../pages/ViewAppointmentHistory";
import axios                                   from "axios";

vi.mock("axios");
vi.mock("../components/SideBar(patient)", () => ({ default: () => <div>Sidebar</div> }));
vi.mock("../components/Header(patient)",  () => ({ default: () => <div>Header</div> }));

const mockAppointments = [
  {
    id:             1,
    doctorName:     "Dr. Kaveesha Ekanayake",
    specialisation: "Radiology",
    date:           "2026-03-15T00:00:00.000Z",
    time:           "10:00 AM",
    reason:         "Back pain",
    notes:          "Patient needs follow-up in 2 weeks",
    status:         "Completed",
    profilePhoto:   null,
    rejectionReason: null,
  },
  {
    id:             2,
    doctorName:     "Dr. John Smith",
    specialisation: "Cardiology",
    date:           "2026-02-10T00:00:00.000Z",
    time:           "02:00 PM",
    reason:         "Chest pain",
    notes:          null,
    status:         "Cancelled",
    profilePhoto:   null,
    rejectionReason: "Doctor unavailable",
  },
  {
    id:             3,
    doctorName:     "Dr. Jane Doe",
    specialisation: "Neurology",
    date:           "2026-01-05T00:00:00.000Z",
    time:           "11:00 AM",
    reason:         "Headache",
    notes:          "Prescribed medication",
    status:         "Missed",
    profilePhoto:   null,
    rejectionReason: null,
  },
];

const mockPayment = {
  id:            1,
  appointmentId: 1,
  amount:        2500,
  cardLast4:     "3456",
  cardName:      "John Smith",
  status:        "SUCCESS",
  paidAt:        "2026-03-15T07:05:27.565Z",
};

const renderPage = () => {
  return render(
    <MemoryRouter>
      <ViewAppointmentHistory />
    </MemoryRouter>
  );
};

describe("ViewAppointmentHistory", () => {

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("token", "test-token");
    vi.clearAllMocks();
  });

  // Rendering
  describe("Rendering", () => {
    it("should show loading spinner initially", () => {
      axios.get.mockResolvedValueOnce({ data: { appointments: [] } });
      renderPage();
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("should show empty state when no history", async () => {
      axios.get.mockResolvedValueOnce({ data: { appointments: [] } });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("No appointment history found")).toBeInTheDocument();
      });
    });

    it("should render appointment history table", async () => {
      axios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Dr. Kaveesha Ekanayake")).toBeInTheDocument();
        expect(screen.getByText("Dr. John Smith")).toBeInTheDocument();
      });
    });

    it("should show record count", async () => {
      axios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("3")).toBeInTheDocument();
      });
    });

    it("should show error when API fails", async () => {
      axios.get.mockRejectedValueOnce(new Error("Network error"));
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Failed to load appointment history.")).toBeInTheDocument();
      });
    });
  });

  // Filtering
  describe("Filtering", () => {
    it("should filter by doctor name", async () => {
      axios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Dr. Kaveesha Ekanayake")).toBeInTheDocument();
      });
      fireEvent.change(screen.getByPlaceholderText("Search by doctor name..."), {
        target: { value: "Kaveesha" },
      });
      await waitFor(() => {
        expect(screen.getByText("Dr. Kaveesha Ekanayake")).toBeInTheDocument();
        expect(screen.queryByText("Dr. John Smith")).not.toBeInTheDocument();
      });
    });

    it("should reset filters when Reset is clicked", async () => {
      axios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Dr. Kaveesha Ekanayake")).toBeInTheDocument();
      });
      fireEvent.change(screen.getByPlaceholderText("Search by doctor name..."), {
        target: { value: "Kaveesha" },
      });
      fireEvent.click(screen.getByText("Reset"));
      await waitFor(() => {
        expect(screen.getByText("Dr. John Smith")).toBeInTheDocument();
      });
    });

    it("should show clear filters button when filters applied and no results", async () => {
      axios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Dr. Kaveesha Ekanayake")).toBeInTheDocument();
      });
      fireEvent.change(screen.getByPlaceholderText("Search by doctor name..."), {
        target: { value: "NonExistentDoctor" },
      });
      await waitFor(() => {
        expect(screen.getByText("Clear filters")).toBeInTheDocument();
      });
    });
  });

  // Detail Modal
  it("should open detail modal when row is clicked", async () => {
  axios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });
  axios.get.mockResolvedValueOnce({ data: { success: true, payment: mockPayment } });
  renderPage();
  await waitFor(() => {
    expect(screen.getByText("Dr. Kaveesha Ekanayake")).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText("Dr. Kaveesha Ekanayake"));
  await waitFor(() => {
    expect(screen.getAllByText(/Appointment Details/i).length).toBeGreaterThan(0);
  });
});

    it("should show doctor name in modal", async () => {
      axios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });
      axios.get.mockResolvedValueOnce({ data: { success: true, payment: mockPayment } });
      renderPage();
      await waitFor(() => {
        fireEvent.click(screen.getByText("Dr. Kaveesha Ekanayake"));
      });
      await waitFor(() => {
        expect(screen.getAllByText("Dr. Kaveesha Ekanayake").length).toBeGreaterThan(0);
      });
    });

    it("should show appointment notes in modal", async () => {
      axios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });
      axios.get.mockResolvedValueOnce({ data: { success: true, payment: mockPayment } });
      renderPage();
      await waitFor(() => {
        fireEvent.click(screen.getByText("Dr. Kaveesha Ekanayake"));
      });
      await waitFor(() => {
        expect(screen.getByText("Patient needs follow-up in 2 weeks")).toBeInTheDocument();
      });
    });

    it("should show payment details when payment exists", async () => {
      axios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });
      axios.get.mockResolvedValueOnce({ data: { success: true, payment: mockPayment } });
      renderPage();
      await waitFor(() => {
        fireEvent.click(screen.getByText("Dr. Kaveesha Ekanayake"));
      });
      await waitFor(() => {
        expect(screen.getByText("Rs.3000.00")).toBeInTheDocument();
        expect(screen.getByText(/VISA \*\*\*\* 3456/)).toBeInTheDocument();
        expect(screen.getByText("INV-000001")).toBeInTheDocument();
      });
    });

    it("should show no payment message when payment not found", async () => {
      axios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });
      axios.get.mockRejectedValueOnce(new Error("Not found"));
      renderPage();
      await waitFor(() => {
        fireEvent.click(screen.getByText("Dr. Kaveesha Ekanayake"));
      });
      await waitFor(() => {
        expect(screen.getByText("Payment not made for this appointment")).toBeInTheDocument();
      });
    });

    it("should show rejection reason when appointment cancelled", async () => {
      axios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });
      axios.get.mockRejectedValueOnce(new Error("Not found"));
      renderPage();
      await waitFor(() => {
        fireEvent.click(screen.getByText("Dr. John Smith"));
      });
      await waitFor(() => {
        expect(screen.getByText("Doctor unavailable")).toBeInTheDocument();
      });
    });

    it("should close modal when Close is clicked", async () => {
  axios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });
  axios.get.mockResolvedValueOnce({ data: { success: true, payment: mockPayment } });
  renderPage();
  await waitFor(() => {
    expect(screen.getByText("Dr. Kaveesha Ekanayake")).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText("Dr. Kaveesha Ekanayake"));
  await waitFor(() => {
    expect(screen.getAllByText(/Appointment Details/i).length).toBeGreaterThan(0);
  });
  fireEvent.click(screen.getByText("Close"));
  await waitFor(() => {
    expect(screen.queryByRole("heading", { name: "Appointment Details" })).not.toBeInTheDocument();
  });
});

    it("should show no notes message when notes are null", async () => {
      axios.get.mockResolvedValueOnce({ data: { appointments: mockAppointments } });
      axios.get.mockRejectedValueOnce(new Error("Not found"));
      renderPage();
      await waitFor(() => {
        fireEvent.click(screen.getByText("Dr. John Smith"));
      });
      await waitFor(() => {
        expect(screen.getByText("No notes added for this appointment")).toBeInTheDocument();
      });
    });
  });

