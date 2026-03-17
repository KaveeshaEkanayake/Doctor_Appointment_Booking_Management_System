import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DoctorRegistration from "./pages/DoctorRegistration";
import DoctorLogin from "./pages/DoctorLogin";
import MyAppointments from "./pages/MyAppointments";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/doctor-registration" element={<DoctorRegistration />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/doctor-login" element={<DoctorLogin />} />
      <Route path="/my-appointments" element={<MyAppointments />} />

    </Routes>
  );
}

export default App;