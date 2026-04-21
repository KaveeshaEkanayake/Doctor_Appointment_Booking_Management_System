import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter }                        from "react-router-dom";
import BillingPage                             from "../pages/BillingPage";
import axios                                   from "axios";

vi.mock("axios");
vi.mock("../components/SideBar(patient)", () => ({ default: () => <div>Sidebar</div> }));
vi.mock("../components/Header(patient)",  () => ({ default: () => <div>Header</div> }));

const mockPayments = [
  {
    id:             1,
    appointmentId:  575,
    doctorName:     "Dr. Kaveesha Ekanayake",
    specialisation: "Radiology",
    date:           "2026-04-16T00:00:00.000Z",
    time:           "10:00 AM",
    amount:         2500,
    cardLast4:      "3456",
    cardName:       "John Smith",
    status:         "SUCCESS",
    paidAt:         "2026-04-18T07:05:27.565Z",
  },
  {
    id:             2,
    appointmentId:  576,
    doctorName:     "Dr. Kaveesha Ekanayake",
    specialisation: "Radiology",
    date:           "2026-04-20T00:00:00.000Z",
    time:           "04:00 PM",
    amount:         2500,
    cardLast4:      "3456",
    cardName:       "John Smith",
    status:         "SUCCESS",
    paidAt:         "2026-04-18T08:00:00.000Z",
  },
];

const renderBillingPage = () => {
  return render(
    <MemoryRouter>
      <BillingPage />
    </MemoryRouter>
  );
};

describe("BillingPage", () => {

  beforeEach(() => {
    localStorage.setItem("token", "test-token");
    vi.clearAllMocks();
  });

  it("should show loading spinner initially", () => {
    axios.get.mockResolvedValueOnce({ data: { payments: [] } });
    renderBillingPage();
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should show empty state when no payments", async () => {
    axios.get.mockResolvedValueOnce({ data: { payments: [] } });
    renderBillingPage();
    await waitFor(() => {
      expect(screen.getByText("No payments made yet")).toBeInTheDocument();
    });
  });

  it("should show payment history", async () => {
    axios.get.mockResolvedValueOnce({ data: { payments: mockPayments } });
    renderBillingPage();
    await waitFor(() => {
      expect(screen.getAllByText(/INV-000001/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/INV-000002/).length).toBeGreaterThan(0);
    });
  });

  it("should show correct total amount including service fee", async () => {
    axios.get.mockResolvedValueOnce({ data: { payments: mockPayments } });
    renderBillingPage();
    await waitFor(() => {
      const amounts = screen.getAllByText("Rs.3000.00");
      expect(amounts.length).toBeGreaterThan(0);
    });
  });

  it("should show doctor name and specialisation", async () => {
    axios.get.mockResolvedValueOnce({ data: { payments: mockPayments } });
    renderBillingPage();
    await waitFor(() => {
      expect(screen.getAllByText("Dr. Kaveesha Ekanayake").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Radiology").length).toBeGreaterThan(0);
    });
  });

  it("should show Cancel & Refund button", async () => {
    axios.get.mockResolvedValueOnce({ data: { payments: mockPayments } });
    renderBillingPage();
    await waitFor(() => {
      const refundBtns = screen.getAllByText("Cancel & Refund");
      expect(refundBtns.length).toBeGreaterThan(0);
    });
  });

  it("should open refund modal when Cancel & Refund is clicked", async () => {
    axios.get.mockResolvedValueOnce({ data: { payments: mockPayments } });
    renderBillingPage();
    await waitFor(() => {
      fireEvent.click(screen.getAllByText("Cancel & Refund")[0]);
    });
    expect(screen.getByText("Cancel & Refund Payment?")).toBeInTheDocument();
    expect(screen.getAllByText(/INV-000001/).length).toBeGreaterThan(0);
  });

  it("should close refund modal when No Keep Payment is clicked", async () => {
    axios.get.mockResolvedValueOnce({ data: { payments: mockPayments } });
    renderBillingPage();
    await waitFor(() => {
      fireEvent.click(screen.getAllByText("Cancel & Refund")[0]);
    });
    fireEvent.click(screen.getByText("No, Keep Payment"));
    await waitFor(() => {
      expect(screen.queryByText("Cancel & Refund Payment?")).not.toBeInTheDocument();
    });
  });

  it("should process refund successfully", async () => {
    axios.get.mockResolvedValueOnce({ data: { payments: mockPayments } });
    axios.delete.mockResolvedValueOnce({ data: { success: true } });
    axios.get.mockResolvedValueOnce({ data: { payments: [mockPayments[1]] } });

    renderBillingPage();

    await waitFor(() => {
      fireEvent.click(screen.getAllByText("Cancel & Refund")[0]);
    });

    fireEvent.click(screen.getByText("Yes, Cancel & Refund"));

    await waitFor(() => {
      expect(screen.getAllByText("Refund Successful!").length).toBeGreaterThan(0);
    });
  });

  it("should show error when refund fails", async () => {
    axios.get.mockResolvedValueOnce({ data: { payments: mockPayments } });
    axios.delete.mockRejectedValueOnce({
      response: { data: { message: "Failed to process refund. Please try again." } }
    });

    renderBillingPage();

    await waitFor(() => {
      fireEvent.click(screen.getAllByText("Cancel & Refund")[0]);
    });

    fireEvent.click(screen.getByText("Yes, Cancel & Refund"));

    await waitFor(() => {
      expect(screen.getByText("Failed to process refund. Please try again.")).toBeInTheDocument();
    });
  });

  it("should show View Invoice button", async () => {
    axios.get.mockResolvedValueOnce({ data: { payments: mockPayments } });
    renderBillingPage();
    await waitFor(() => {
      const invoiceBtns = screen.getAllByText("View Invoice");
      expect(invoiceBtns.length).toBeGreaterThan(0);
    });
  });

});