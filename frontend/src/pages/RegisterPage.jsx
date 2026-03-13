import React, { useState } from "react";
import axios from "axios";
import headerImg from "../assets/LoginImg.png";
import logoImg from "../assets/Logo04.PNG"; // optional
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const [statusMessage, setStatusMessage] = useState("");
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");

  const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: ""
});

const [statusType, setStatusType] = useState(""); // "error" or "success"

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};


const validateForm = () => {
  const { email, password } = formData;
  const passwordRegex = /^(?=.*\d).{8,}$/; // min 8 chars, at least one number

  if (!email) {
    setStatusMessage("Email is required");
    setStatusType("error");
    return false;
  }
  if (!passwordRegex.test(password)) {
    setStatusMessage("Password must be at least 8 characters and include a number");
    setStatusType("error");
    return false;
  }
  return true;
};


  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const res = await axios.post("http://localhost:5000/login", {
  //       email,
  //       password,
  //     });
  //     localStorage.setItem("token", res.data.token);
  //     alert("Login successful!");
  //   } catch (err) {
  //     alert("Invalid credentials");
  //   }
  // };

  // Check for existing token on page load (session persistence)
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     axios
  //       .get("http://localhost:5000/verify", {
  //         headers: { Authorization: `Bearer ${token}` },
  //       })
  //       .then(() => navigate("/dashboard"))
  //       .catch(() => localStorage.removeItem("token"));
  //   }
  // }, [navigate]);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("http://localhost:5000/login", {
//         email,
//         password,
//       });
//       localStorage.setItem("token", res.data.token);
//       navigate("/dashboard"); // redirect after login
//     } catch (err) {
//       setStatusMessage("Invalid credentials");
//     }
//   };

const handleRegister = async (e) => {
  e.preventDefault();

  // simple frontend validation before sending
  const passwordRegex = /^(?=.*\d).{8,}$/; // min 8 chars, at least one number
  if (!formData.email) {
    setStatusMessage("Email is required");
    setStatusType("error");
    return;
  }
  if (!passwordRegex.test(formData.password)) {
    setStatusMessage("Password must be at least 8 characters and include a number");
    setStatusType("error");
    return;
  }

  try {
    const res = await axios.post("${import.meta.env.VITE_API_URL}/api/auth/register", formData);

    // success message
    setStatusMessage("Registration successful! Redirecting to login...");
    setStatusType("success");

    // redirect after a short delay
    setTimeout(() => navigate("/register"), 2000);
  } catch (err) {
    // backend should send { message: "Email already exists" } if duplicate
    setStatusMessage(err.response?.data?.message || "Registration failed");
    setStatusType("error");
  }
};



  return (
    <div className="flex h-screen bg-[#F6FAFF]">
      {/* Left side with image, logo, and overlay buttons */}
      <div className="hidden md:flex w-2/4 mt-[160px]">
        <div className=" flex h-full bg-blue-50">
            {/* Logo */}
            <div className="absolute top-14 left-60 flex items-center space-x-2">
              <img src={logoImg} alt="MediCare Logo" className="h-16" />
              {/* <span className="text-2xl font-bold text-blue-700">MediCare</span> */}
            </div>
        </div>

        <div className="absolute top-100 left-0 hidden md:flex w-[900px] h-[580px] ">
        {/* Background image */}
        <img
            src={headerImg}
            alt="Doctors"
            className="w-[1600px] h-auto "
        />
        </div>

        {/* Logo */}
        {/* <div className="absolute top-6 left-6 flex items-center space-x-2">
          <img src={logoImg} alt="MediCare Logo" className="h-10" />
          <span className="text-2xl font-bold text-blue-700">MediCare</span>
        </div> */}
      </div>

      {/* Right side login form */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white px-10">

         {/* Logo */}
        {/* <div className="absolute top-20 right- flex items-center space-x-2">
          <img src={logoImg} alt="MediCare Logo" className="h-25" />
          <span className="text-2xl font-bold text-blue-700">MediCare</span>
        </div> */}

        <h2 className="mt-6 text-4xl font-bold mb-1 text-black-700">Hey There</h2>
        <p className="mb-6 text-[#878787]">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>

        <form
          onSubmit={handleRegister}
          className="w-full max-w-md space-y-3 bg-white p-6 rounded-lg "
        >
          {/* Forst Name field */}
          <div>
            <label className="block mb-2 text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="First Name "
            //   value={formData.firstName}
            //   onChange={handleChange}
            onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}

              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Last Name field */}
          <div>
            <label className="block mb-2 text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name "
            //   value={formData.lastName}
            //   onChange={handleChange}
            onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}

              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

           {/* Phone Number field */}
           <div>
                <label className="block mb-2 text-gray-700">Phone Number</label>
                <PhoneInput
                    country={"lk"} // default Sri Lanka flag + code (+94)
                    value={phone}
                    onChange={(value) => setPhone(value)}
                    containerClass="w-full border rounded-md focus-within:ring-2 focus-within:ring-blue-400 flex"
                    inputClass="flex-1 px-3 py-2 border-l rounded-r-md focus:outline-none"
                    buttonClass="border-r rounded-l-md"
                />
            </div>


          {/* Email field */}
          <div>
            <label className="block mb-2 text-gray-700">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Email Address "
            //   value={formData.email}
            //   onChange={handleChange}
            onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}

              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Password field */}
          <div>
            <label className="block mb-2 text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              placeholder="* * * * * * * * * * * "
            //   value={formData.password}
            //   onChange={handleChange}
            onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Remember me + Forgot password */}
          {/* <div className="flex justify-between items-center text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" /> Remember me
            </label>
            <a href="/forgot" className="text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div> */}

          {/* Register button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Sign Up
          </button>

          {/* Remember me + Forgot password */}
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" /> Remember me
            </label>
          </div>
          
        </form>
        
        {/* Error message box */}
        {statusMessage && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800 text-sm w-full max-w-md text-center">
            {statusMessage}
          </div>
        )}

      </div>
    </div>
  );
}
