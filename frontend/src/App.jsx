import React from "react";
<<<<<<< HEAD
import { Routes, Route } from "react-router-dom";
=======
import DoctorRegistration from "./pages/DoctorRegistration";
  
// import AppointmentPage from "./pages/AppointmentPage";
>>>>>>> feature/frontend/docRegistration
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function App() {
<<<<<<< HEAD
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
=======

    // return <AppointmentPage />;
  return <LoginPage />;
  
  return <DoctorRegistration/>

}

export default App;





>>>>>>> feature/frontend/docRegistration
