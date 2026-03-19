import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor }  from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AdminLoginPage from "../pages/AdminLoginPage";

vi.mock("axios");

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => mockNavigate,
}));

const renderPage = () =>
  render(<MemoryRouter><AdminLoginPage /></MemoryRouter>);

describe("AdminLoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders email and password inputs", () => {
    renderPage();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your password/i)).toBeInTheDocument();
  });

  it("renders Log in button", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("renders Admin Portal label", () => {
    renderPage();
    expect(screen.getByText(/admin portal/i)).toBeInTheDocument();
  });

  it("calls /api/admin/login with correct payload", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: "test-token",
        admin: { id: 1, email: "admin@dams.com", role: "admin" },
      },
    });

    renderPage();
    await userEvent.type(screen.getByLabelText(/email address/i), "admin@dams.com");
    await userEvent.type(screen.getByLabelText(/your password/i), "Admin@1234");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/login"),
        { email: "admin@dams.com", password: "Admin@1234" }
      );
    });
  });

  it("stores token and role=admin in localStorage on success", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: "test-token",
        admin: { id: 1, email: "admin@dams.com", role: "admin" },
      },
    });

    renderPage();
    await userEvent.type(screen.getByLabelText(/email address/i), "admin@dams.com");
    await userEvent.type(screen.getByLabelText(/your password/i), "Admin@1234");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("test-token");
      expect(localStorage.getItem("role")).toBe("admin");
    });
  });

  it("redirects to /admin/dashboard on success", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: "test-token",
        admin: { id: 1, email: "admin@dams.com", role: "admin" },
      },
    });

    renderPage();
    await userEvent.type(screen.getByLabelText(/email address/i), "admin@dams.com");
    await userEvent.type(screen.getByLabelText(/your password/i), "Admin@1234");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("shows error on invalid credentials", async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });

    renderPage();
    await userEvent.type(screen.getByLabelText(/email address/i), "wrong@dams.com");
    await userEvent.type(screen.getByLabelText(/your password/i), "badpass");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it("shows generic error on network failure", async () => {
    axios.post.mockRejectedValueOnce(new Error("Network Error"));

    renderPage();
    await userEvent.type(screen.getByLabelText(/email address/i), "admin@dams.com");
    await userEvent.type(screen.getByLabelText(/your password/i), "Admin@1234");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});