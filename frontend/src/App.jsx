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
import SearchFilterDoctors from "./pages/SearchFilterDoctors";
import PatientProfilePage from "./pages/PatientProfilePage";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/doctor/register" element={<DoctorRegistration />} />
      <Route path="/my-appointments" element={<MyAppointments />} />
      <Route path="/search-doctors" element={<SearchFilterDoctors />} />  
      <Route path="/patent/profile" element={<PatientProfilePage />} />

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
    </Routes>
  );
}

export default App;