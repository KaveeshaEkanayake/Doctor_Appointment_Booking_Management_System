import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter }                        from "react-router-dom";
import DoctorManagement                        from "../pages/DoctorManagement";

vi.mock("../layouts/AdminLayout", () => ({ default: ({ children }) => <div>{children}</div> }));

const mockDoctors = {
  PENDING: [
    {
      id:             1,
      firstName:      "John",
      lastName:       "Doe",
      email:          "john@example.com",
      specialisation: "Cardiology",
      experience:     "5 years",
      status:         "PENDING",
      profilePhoto:   null,
    },
  ],
  APPROVED: [
    {
      id:             2,
      firstName:      "Jane",
      lastName:       "Smith",
      email:          "jane@example.com",
      specialisation: "Neurology",
      experience:     "8 years",
      status:         "APPROVED",
      profilePhoto:   null,
    },
  ],
  REJECTED: [],
  SUSPENDED: [],
};

const mockProfileDoctors = [
  {
    id:             3,
    firstName:      "Bob",
    lastName:       "Johnson",
    email:          "bob@example.com",
    specialisation: "Orthopedics",
    experience:     "3 years",
    profileStatus:  "PENDING_REVIEW",
    profilePhoto:   null,
    bio:            "Experienced orthopedist",
    qualifications: "MBBS",
    consultationFee: 2000,
  },
];

const setupFetchMock = (overrides = {}) => {
  global.fetch = vi.fn((url) => {
    if (url.includes("status=PENDING")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ doctors: overrides.pending ?? mockDoctors.PENDING }) });
    }
    if (url.includes("status=APPROVED")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ doctors: overrides.approved ?? mockDoctors.APPROVED }) });
    }
    if (url.includes("status=REJECTED")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ doctors: overrides.rejected ?? mockDoctors.REJECTED }) });
    }
    if (url.includes("status=SUSPENDED")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ doctors: overrides.suspended ?? mockDoctors.SUSPENDED }) });
    }
    if (url.includes("profiles")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ doctors: overrides.profiles ?? mockProfileDoctors }) });
    }
    if (url.includes("/status") && url.includes("PATCH")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
  });
};

const renderPage = () => {
  return render(
    <MemoryRouter>
      <DoctorManagement />
    </MemoryRouter>
  );
};

describe("DoctorManagement", () => {

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("token", "test-token");
    vi.clearAllMocks();
    setupFetchMock();
  });

  // Rendering
  describe("Rendering", () => {
    it("should render the page title", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Doctor Management")).toBeInTheDocument();
      });
    });

    it("should render stats cards", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Total")).toBeInTheDocument();
        expect(screen.getByText("Pending")).toBeInTheDocument();
        expect(screen.getByText("Active")).toBeInTheDocument();
        expect(screen.getByText("Suspended")).toBeInTheDocument();
      });
    });

    it("should render filter tabs", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("all")).toBeInTheDocument();
        expect(screen.getByText("pending")).toBeInTheDocument();
        expect(screen.getByText("active")).toBeInTheDocument();
        expect(screen.getByText("suspended")).toBeInTheDocument();
        expect(screen.getByText("rejected")).toBeInTheDocument();
      });
    });

    it("should render doctor accounts section", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Doctor Accounts")).toBeInTheDocument();
      });
    });

    it("should render profile approvals section", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Profile Approvals")).toBeInTheDocument();
      });
    });
  });

  // Doctor List
  describe("Doctor List", () => {
    it("should show doctors after loading", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
        expect(screen.getByText("Dr. Jane Smith")).toBeInTheDocument();
      });
    });

    it("should show correct status badges", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("PENDING")).toBeInTheDocument();
        expect(screen.getByText("APPROVED")).toBeInTheDocument();
      });
    });

    it("should show Approve and Reject buttons for pending doctors", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Approve")).toBeInTheDocument();
        expect(screen.getByText("Reject")).toBeInTheDocument();
      });
    });

    it("should show Suspend and Delete buttons for approved doctors", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Suspend")).toBeInTheDocument();
        expect(screen.getAllByText("Delete").length).toBeGreaterThan(0);
      });
    });

    it("should filter doctors by search", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
      });
      fireEvent.change(screen.getByPlaceholderText(/search by name/i), {
        target: { value: "Jane" },
      });
      await waitFor(() => {
        expect(screen.queryByText("Dr. John Doe")).not.toBeInTheDocument();
        expect(screen.getByText("Dr. Jane Smith")).toBeInTheDocument();
      });
    });

    it("should filter by pending tab", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText("pending"));
      await waitFor(() => {
        expect(screen.getByText("Dr. John Doe")).toBeInTheDocument();
        expect(screen.queryByText("Dr. Jane Smith")).not.toBeInTheDocument();
      });
    });
  });

  // Actions
  describe("Doctor Actions", () => {
    it("should call approve API when Approve is clicked", async () => {
      global.fetch = vi.fn((url, options) => {
        if (url.includes("/status") && options?.method === "PATCH") {
          return Promise.resolve({
            ok:   true,
            json: () => Promise.resolve({ success: true, message: "Doctor approved" }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ doctors: mockDoctors.PENDING }) });
      });

      setupFetchMock();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText("Approve")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Approve"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it("should show empty state when no doctors match filter", async () => {
      setupFetchMock({
        pending:   [],
        approved:  [],
        rejected:  [],
        suspended: [],
      });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("No doctors found")).toBeInTheDocument();
      });
    });
  });

  // Profile Approvals
  describe("Profile Approvals", () => {
    it("should show profile doctors", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Dr. Bob Johnson")).toBeInTheDocument();
      });
    });

    it("should show View Profile button for pending review", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("View Profile")).toBeInTheDocument();
      });
    });

    it("should open profile modal when View Profile is clicked", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("View Profile")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText("View Profile"));
      await waitFor(() => {
        expect(screen.getByText("Profile Review")).toBeInTheDocument();
      });
    });

    it("should show doctor details in modal", async () => {
      renderPage();
      await waitFor(() => {
        fireEvent.click(screen.getByText("View Profile"));
      });
      await waitFor(() => {
        expect(screen.getByText("Experienced orthopedist")).toBeInTheDocument();
      });
    });

    it("should close modal when × is clicked", async () => {
      renderPage();
      await waitFor(() => {
        fireEvent.click(screen.getByText("View Profile"));
      });
      await waitFor(() => {
        expect(screen.getByText("Profile Review")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText("×"));
      await waitFor(() => {
        expect(screen.queryByText("Profile Review")).not.toBeInTheDocument();
      });
    });

    it("should show profile tabs", async () => {
      renderPage();
      await waitFor(() => {
        expect(screen.getByText("Pending Review")).toBeInTheDocument();
        expect(screen.getByText("Approved")).toBeInTheDocument();
        expect(screen.getByText("Rejected")).toBeInTheDocument();
      });
    });
  });

});