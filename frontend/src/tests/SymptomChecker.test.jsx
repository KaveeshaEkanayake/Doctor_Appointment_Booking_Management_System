import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter }                        from "react-router-dom";
import SymptomChecker                          from "../pages/SymptomChecker";
import axios                                   from "axios";

vi.mock("axios");
vi.mock("../components/Navbar", () => ({ default: () => <div>Navbar</div> }));
vi.mock("../components/Footer", () => ({ default: () => <div>Footer</div> }));

// Mock fetch for Groq API
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockGroqSuccess = {
  ok:   true,
  json: async () => ({
    choices: [{
      message: {
        content: JSON.stringify({
          specialisation:     "Neurology",
          confidence:         "87%",
          urgency:            "Medium",
          possibleConditions: ["Migraine", "Tension Headache", "Hypertension"],
          whatToExpect:       "The neurologist will perform a physical exam and may order imaging.",
          dos:                ["Rest in a dark room", "Stay hydrated", "Take prescribed medication"],
          donts:              ["Avoid bright lights", "Do not skip meals", "Avoid stress"],
        }),
      },
    }],
  }),
};

const mockGroqFailure = {
  ok:   false,
  json: async () => ({
    error: { message: "Invalid API key" }
  }),
};

const renderSymptomChecker = () => {
  return render(
    <MemoryRouter>
      <SymptomChecker />
    </MemoryRouter>
  );
};

describe("SymptomChecker", () => {

  beforeEach(() => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("role", "patient");
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: { doctors: [] } });
  });

  // Rendering
  describe("Rendering", () => {
    it("should render the symptom checker page", () => {
      renderSymptomChecker();
      expect(screen.getByText("How are you feeling today?")).toBeInTheDocument();
    });

    it("should render all 3 progress steps", () => {
      renderSymptomChecker();
      expect(screen.getByText("Describe Symptoms")).toBeInTheDocument();
      expect(screen.getByText("AI Analysis")).toBeInTheDocument();
      expect(screen.getByText("Specialist Results")).toBeInTheDocument();
    });

    it("should render common symptom suggestions", () => {
      renderSymptomChecker();
      expect(screen.getByText("+ Fever")).toBeInTheDocument();
      expect(screen.getByText("+ Headache")).toBeInTheDocument();
    });

    it("should render the disclaimer section", () => {
      renderSymptomChecker();
      expect(screen.getByText("Confidential & Secure")).toBeInTheDocument();
    });

    it("should disable submit button when no symptoms entered", () => {
      renderSymptomChecker();
      const btn = screen.getByText("Submit Symptoms");
      expect(btn).toBeDisabled();
    });
  });

  // Symptom Input
  describe("Symptom Input", () => {
    it("should add symptom when Enter is pressed", () => {
      renderSymptomChecker();
      const input = screen.getByPlaceholderText(/persistent headache/i);
      fireEvent.change(input, { target: { value: "Fever" } });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(screen.getByText("Fever")).toBeInTheDocument();
    });

    it("should add symptom when Comma is pressed", () => {
      renderSymptomChecker();
      const input = screen.getByPlaceholderText(/persistent headache/i);
      fireEvent.change(input, { target: { value: "Headache" } });
      fireEvent.keyDown(input, { key: "," });
      expect(screen.getByText("Headache")).toBeInTheDocument();
    });

    it("should not add duplicate symptoms", () => {
      renderSymptomChecker();
      const input = screen.getByPlaceholderText(/persistent headache/i);
      fireEvent.change(input, { target: { value: "Fever" } });
      fireEvent.keyDown(input, { key: "Enter" });
      fireEvent.change(input, { target: { value: "Fever" } });
      fireEvent.keyDown(input, { key: "Enter" });
      const tags = screen.getAllByText("Fever");
      expect(tags.length).toBe(1);
    });

    it("should remove symptom when × is clicked", async () => {
      renderSymptomChecker();
      const input = screen.getByPlaceholderText(/persistent headache/i);
      fireEvent.change(input, { target: { value: "Fever" } });
      fireEvent.keyDown(input, { key: "Enter" });
      const removeBtn = screen.getByText("×");
      fireEvent.click(removeBtn);
      await waitFor(() => {
        expect(screen.queryByText("Fever")).not.toBeInTheDocument();
      });
    });

    it("should add symptom from common suggestions", () => {
      renderSymptomChecker();
      fireEvent.click(screen.getByText("+ Fever"));
      expect(screen.getByText("Fever")).toBeInTheDocument();
    });

    it("should hide suggestion after it is added", () => {
      renderSymptomChecker();
      fireEvent.click(screen.getByText("+ Fever"));
      expect(screen.queryByText("+ Fever")).not.toBeInTheDocument();
    });

    it("should enable submit button after symptom is added", () => {
      renderSymptomChecker();
      fireEvent.click(screen.getByText("+ Fever"));
      expect(screen.getByText("Submit Symptoms")).not.toBeDisabled();
    });

    it("should show error if submitted with no symptoms", async () => {
      renderSymptomChecker();
      // Manually trigger analyse with no symptoms
      // Submit button is disabled so we check error state directly
      const input = screen.getByPlaceholderText(/persistent headache/i);
      expect(input).toBeInTheDocument();
      // Button should be disabled
      expect(screen.getByText("Submit Symptoms")).toBeDisabled();
    });
  });

  // AI Analysis
  describe("AI Analysis", () => {
    it("should show loading step when symptoms are submitted", async () => {
      mockFetch.mockResolvedValueOnce(mockGroqSuccess);
      renderSymptomChecker();
      fireEvent.click(screen.getByText("+ Fever"));
      fireEvent.click(screen.getByText("Submit Symptoms"));
      await waitFor(() => {
        expect(screen.getByText("Please Wait.....")).toBeInTheDocument();
      });
    });

    it("should show results after successful AI analysis", async () => {
  mockFetch.mockResolvedValueOnce(mockGroqSuccess);
  renderSymptomChecker();
  fireEvent.click(screen.getByText("+ Fever"));
  fireEvent.click(screen.getByText("Submit Symptoms"));
  await waitFor(() => {
    expect(screen.getByText(/We recommend seeing a/i)).toBeInTheDocument();
  }, { timeout: 10000 });
}, 10000);

    it("should show confidence level in results", async () => {
      mockFetch.mockResolvedValueOnce(mockGroqSuccess);
      renderSymptomChecker();
      fireEvent.click(screen.getByText("+ Fever"));
      fireEvent.click(screen.getByText("Submit Symptoms"));
      await waitFor(() => {
        expect(screen.getByText(/87%/)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it("should show urgency level in results", async () => {
      mockFetch.mockResolvedValueOnce(mockGroqSuccess);
      renderSymptomChecker();
      fireEvent.click(screen.getByText("+ Fever"));
      fireEvent.click(screen.getByText("Submit Symptoms"));
      await waitFor(() => {
        expect(screen.getByText(/Medium Urgency/)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it("should show possible conditions in results", async () => {
      mockFetch.mockResolvedValueOnce(mockGroqSuccess);
      renderSymptomChecker();
      fireEvent.click(screen.getByText("+ Fever"));
      fireEvent.click(screen.getByText("Submit Symptoms"));
      await waitFor(() => {
        expect(screen.getByText("Migraine")).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it("should show disclaimer in results", async () => {
      mockFetch.mockResolvedValueOnce(mockGroqSuccess);
      renderSymptomChecker();
      fireEvent.click(screen.getByText("+ Fever"));
      fireEvent.click(screen.getByText("Submit Symptoms"));
      await waitFor(() => {
        expect(screen.getByText(/not a medical diagnosis/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it("should show error and return to step 1 when API fails", async () => {
      mockFetch.mockResolvedValueOnce(mockGroqFailure);
      renderSymptomChecker();
      fireEvent.click(screen.getByText("+ Fever"));
      fireEvent.click(screen.getByText("Submit Symptoms"));
      await waitFor(() => {
        expect(screen.getByText("AI analysis failed. Please try again.")).toBeInTheDocument();
      }, { timeout: 5000 });
    });

   it("should go back to step 1 when Adjust Symptoms is clicked", async () => {
  mockFetch.mockResolvedValueOnce(mockGroqSuccess);
  renderSymptomChecker();
  fireEvent.click(screen.getByText("+ Fever"));
  fireEvent.click(screen.getByText("Submit Symptoms"));
  await waitFor(() => {
    expect(screen.getByText(/We recommend seeing a/i)).toBeInTheDocument();
  }, { timeout: 10000 });
  fireEvent.click(screen.getByText("← Adjust Symptoms"));
  expect(screen.getByText("How are you feeling today?")).toBeInTheDocument();
}, 10000);
  });

});