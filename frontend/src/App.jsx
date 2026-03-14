import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DoctorRegistration from "./pages/DoctorRegistration";
import DoctorLogin from "./pages/DoctorLogin";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/doctor-registration" element={<DoctorRegistration />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/doctor-login" element={<DoctorLogin />} />
    </Routes>
  );
}

export default App;