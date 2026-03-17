import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DoctorRegistration from "./pages/DoctorRegistration";
<<<<<<< HEAD
import DoctorLogin from "./pages/DoctorLogin";
import MyAppointments from "./pages/MyAppointments";
=======
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import DoctorAvailabilityPage from "./pages/DoctorAvailabilityPage";
import ProtectedRoute from "./components/ProtectedRoute";
>>>>>>> 7900a3e517b72aff568286b90ea06fa1ddb82ff4

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
<<<<<<< HEAD
      <Route path="/doctor-registration" element={<DoctorRegistration />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/doctor-login" element={<DoctorLogin />} />
      <Route path="/my-appointments" element={<MyAppointments />} />

=======
      <Route path="/doctor/register" element={<DoctorRegistration />} />

      {/* Doctor protected routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/availability"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorAvailabilityPage />
          </ProtectedRoute>
        }
      />
>>>>>>> 7900a3e517b72aff568286b90ea06fa1ddb82ff4
    </Routes>
  );
}

export default App;