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
import ViewAppointmentHistory from "./pages/ViewAppointmentHistory";
import PatientDashboard from "./pages/PatientDashboard";
import PasswordResetReq from "./pages/PasswordRestReq";
import PasswordResetLinkSent from "./pages/PasswordResetLinkSent";
import PasswordResetPage from "./pages/PasswordResetPage";
import PasswordUpdatedSuccess from "./pages/PasswordUpdatedSuccess";
import PatientDeleteAccountPage from "./pages/PatientDeleteAccountPage";
import MySchedule from "./pages/MySchedule";
import AdminPatientManagementPage from "./pages/AdminPatientManagementPage";

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
      <Route path="/history" element={<ViewAppointmentHistory />} />
      <Route path="/appointments/confirmation" element={<AppointmentConfirmationPage />} />
      <Route path="/doctor/schedule" element={<MySchedule />} />
     

      {/* Password reset routes */}
      <Route path="/forgot-password" element={<PasswordResetReq />} />
      <Route path="/forgot-password/sent" element={<PasswordResetLinkSent />} />
      <Route path="/forgot-password/reset" element={<PasswordResetPage />} />
      <Route path="/forgot-password/resetsuccess" element={<PasswordUpdatedSuccess />} />

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
      <Route
        path="/admin/patients"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminPatientManagementPage />
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
      <Route
        path="/doctor/schedule"
        element={
          <ProtectedRoute allowedRole="doctor">
            <MySchedule />
          </ProtectedRoute>
        }
      />

      {/* Patient protected */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/acc-delete"
        element={
          <ProtectedRoute allowedRole="patient">
            <PatientDeleteAccountPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;