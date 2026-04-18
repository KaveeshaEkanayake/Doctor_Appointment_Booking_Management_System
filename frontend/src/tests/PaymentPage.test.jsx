import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes }         from "react-router-dom";
import PaymentPage                             from "../pages/PaymentPage";
import axios                                   from "axios";

vi.mock("axios");
vi.mock("../components/SideBar(patient)", () => ({ default: () => <div>Sidebar</div> }));
vi.mock("../components/Header(patient)",  () => ({ default: () => <div>Header</div> }));

const mockAppointment = {
  id:              1,
  doctorName:      "Dr. Kaveesha Ekanayake",
  specialisation:  "Radiology",
  date:            "2026-05-01T00:00:00.000Z",
  time:            "10:00 AM",
  consultationFee: 2500,
  status:          "Confirmed",
};

const renderPaymentPage = () => {
  return render(
    <MemoryRouter initialEntries={[{
      pathname: "/patient/payment/1",
      state:    { appointment: mockAppointment }
    }]}>
      <Routes>
        <Route path="/patient/payment/:appointmentId" element={<PaymentPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("PaymentPage", () => {

  beforeEach(() => {
    localStorage.setItem("token", "test-token");
    vi.clearAllMocks();
  });

  // Step 1 — Summary
  describe("Step 1 — Payment Summary", () => {
    it("should render payment summary", () => {
      renderPaymentPage();
      expect(screen.getByText("Payment Summary")).toBeInTheDocument();
      expect(screen.getByText(/Dr. Kaveesha Ekanayake/)).toBeInTheDocument();
    });

    it("should show consultation fee and service fee", () => {
      renderPaymentPage();
      expect(screen.getByText("Rs.2500.00")).toBeInTheDocument();
      expect(screen.getByText("Rs.500.00")).toBeInTheDocument();
    });

    it("should show correct total amount", () => {
      renderPaymentPage();
      expect(screen.getByText("Rs.3000.00")).toBeInTheDocument();
    });

    it("should navigate to step 2 when Proceed to Pay is clicked", () => {
      renderPaymentPage();
      fireEvent.click(screen.getByText("Proceed to Pay"));
      expect(screen.getByText("Credit Card Details")).toBeInTheDocument();
    });
  });

  // Step 2 — Card Details
  describe("Step 2 — Card Details", () => {
    beforeEach(() => {
      renderPaymentPage();
      fireEvent.click(screen.getByText("Proceed to Pay"));
    });

    it("should render card form fields", () => {
      expect(screen.getByPlaceholderText("John Smith")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("0000 0000 0000 0000")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Code")).toBeInTheDocument();
    });

    it("should show validation errors when form is empty", async () => {
      fireEvent.click(screen.getByText("Continue"));
      await waitFor(() => {
        expect(screen.getByText("Name on card is required")).toBeInTheDocument();
      });
    });

    it("should show error for invalid card number", async () => {
      fireEvent.change(screen.getByPlaceholderText("John Smith"), { target: { value: "John Smith" } });
      fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), { target: { value: "1234" } });
      fireEvent.click(screen.getByText("Continue"));
      await waitFor(() => {
        expect(screen.getByText("Card number must be 16 digits")).toBeInTheDocument();
      });
    });

    it("should show error for invalid CVV", async () => {
      fireEvent.change(screen.getByPlaceholderText("John Smith"), { target: { value: "John Smith" } });
      fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), { target: { value: "1234567890123456" } });
      fireEvent.change(screen.getByPlaceholderText("Code"), { target: { value: "1" } });
      fireEvent.click(screen.getByText("Continue"));
      await waitFor(() => {
        expect(screen.getByText("CVV must be 3-4 digits")).toBeInTheDocument();
      });
    });

    it("should format card number with spaces", () => {
      const input = screen.getByPlaceholderText("0000 0000 0000 0000");
      fireEvent.change(input, { target: { value: "1234567890123456" } });
      expect(input.value).toBe("1234 5678 9012 3456");
    });

    it("should call API and show success on valid submission", async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          payment: {
            id:            1,
            appointmentId: 1,
            amount:        2500,
            cardLast4:     "3456",
            status:        "SUCCESS",
            paidAt:        "2026-04-18T07:05:27.565Z",
          }
        }
      });

      fireEvent.change(screen.getByPlaceholderText("John Smith"), { target: { value: "John Smith" } });
      fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), { target: { value: "1234567890123456" } });
      fireEvent.change(screen.getByPlaceholderText("Code"), { target: { value: "123" } });

      // Select month and year
      fireEvent.change(screen.getByDisplayValue("Month"), { target: { value: "12" } });
      fireEvent.change(screen.getByDisplayValue("Year"),  { target: { value: "2027" } });

      fireEvent.click(screen.getByText("Continue"));

      await waitFor(() => {
        expect(screen.getByText("Payment Complete!")).toBeInTheDocument();
      });
    });

    it("should show error message on payment failure", async () => {
      axios.post.mockRejectedValueOnce({
        response: { data: { message: "Payment failed. Please try again." } }
      });

      fireEvent.change(screen.getByPlaceholderText("John Smith"), { target: { value: "John Smith" } });
      fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), { target: { value: "1234567890123456" } });
      fireEvent.change(screen.getByPlaceholderText("Code"), { target: { value: "123" } });
      fireEvent.change(screen.getByDisplayValue("Month"), { target: { value: "12" } });
      fireEvent.change(screen.getByDisplayValue("Year"),  { target: { value: "2027" } });

      fireEvent.click(screen.getByText("Continue"));

      await waitFor(() => {
        expect(screen.getByText("Payment failed. Please try again.")).toBeInTheDocument();
      });
    });
  });

  // Step 3 — Success
  describe("Step 3 — Payment Success", () => {
    it("should show invoice number after payment", async () => {
      renderPaymentPage();
      fireEvent.click(screen.getByText("Proceed to Pay"));

      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          payment: {
            id:            1,
            appointmentId: 1,
            amount:        2500,
            cardLast4:     "3456",
            status:        "SUCCESS",
            paidAt:        "2026-04-18T07:05:27.565Z",
          }
        }
      });

      fireEvent.change(screen.getByPlaceholderText("John Smith"), { target: { value: "John Smith" } });
      fireEvent.change(screen.getByPlaceholderText("0000 0000 0000 0000"), { target: { value: "1234567890123456" } });
      fireEvent.change(screen.getByPlaceholderText("Code"), { target: { value: "123" } });
      fireEvent.change(screen.getByDisplayValue("Month"), { target: { value: "12" } });
      fireEvent.change(screen.getByDisplayValue("Year"),  { target: { value: "2027" } });

      fireEvent.click(screen.getByText("Continue"));

      await waitFor(() => {
        expect(screen.getByText("INV-000001")).toBeInTheDocument();
        expect(screen.getByText("Payment Complete!")).toBeInTheDocument();
        expect(screen.getByText(/3000\.00/)).toBeInTheDocument();
      });
    });
  });

});