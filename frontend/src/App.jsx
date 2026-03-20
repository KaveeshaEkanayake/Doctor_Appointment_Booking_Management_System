import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage              from "./pages/LoginPage";
import RegisterPage           from "./pages/RegisterPage";
import DoctorRegistration     from "./pages/DoctorRegistration";
import DoctorDashboard        from "./pages/DoctorDashboard";
import DoctorProfilePage      from "./pages/DoctorProfilePage";
import DoctorAvailabilityPage from "./pages/DoctorAvailabilityPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MyAppointments from "./pages/MyAppointments";
import SearchFilterDoctors from "./pages/SearchFilterDoctors";
import PatientProfilePage from "./pages/PatientProfilePage";
import BrowseDoctors from "./pages/BrowseDoctors";
import ProtectedRoute         from "./components/ProtectedRoute";
import MyAppointments         from "./pages/MyAppointments";
import PatientProfilePage     from "./pages/PatientProfilePage";
import AdminLoginPage         from "./pages/AdminLoginPage";
import AdminDashboardPage     from "./pages/AdminDashboardPage";
import AdminDoctorsPage       from "./pages/AdminDoctorsPage";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/"                element={<LoginPage />} />
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/register"        element={<RegisterPage />} />
      <Route path="/doctor/register" element={<DoctorRegistration />} />
      <Route path="/my-appointments" element={<MyAppointments />} />
      <Route path="/search-doctors" element={<SearchFilterDoctors />} />
      <Route path="/browse-doctors" element={<BrowseDoctors />} /> 
      <Route path="/search-doctors" element={<SearchFilterDoctors />} /> 
      <Route path="/patent/profile" element={<PatientProfilePage />} />
      <Route path="/patient/profile" element={<PatientProfilePage />} />

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
    </Routes>
  );
}

export default App;