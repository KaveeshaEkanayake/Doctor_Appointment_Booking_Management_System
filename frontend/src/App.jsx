import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DoctorRegistration from "./pages/DoctorRegistration";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import DoctorAvailabilityPage from "./pages/DoctorAvailabilityPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MyAppointments from "./pages/MyAppointments";
import PatientProfilePage from "./pages/PatientProfilePage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminDoctorsPage from "./pages/AdminDoctorsPage";
import DoctorsPage from "./pages/DoctorsPage";
import DoctorPublicProfilePage from "./pages/DoctorPublicProfilePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import AppointmentReviewPage from "./pages/AppointmentReviewPage";
import AppointmentConfirmationPage from "./pages/AppointmentConfirmationPage";
import DoctorAppointmentsPage from "./pages/DoctorAppointmentsPage";
import MySchedule from "./pages/MySchedule";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/doctor/register" element={<DoctorRegistration />} />
      <Route path="/my-appointments" element={<MyAppointments />} />
      <Route path="/patient/profile" element={<PatientProfilePage />} />
      <Route path="/doctors" element={<DoctorsPage />} />
      <Route path="/doctors/:id" element={<DoctorPublicProfilePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/appointments/review" element={<AppointmentReviewPage />} />
      <Route path="/appointments/confirmation" element={<AppointmentConfirmationPage />} />
      <Route path="/doctor/schedule" element={<MySchedule />} />

      {/* Admin public */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin protected */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDoctorsPage />
          </ProtectedRoute>
        }
      />

      {/* Doctor protected */}
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
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorAppointmentsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;