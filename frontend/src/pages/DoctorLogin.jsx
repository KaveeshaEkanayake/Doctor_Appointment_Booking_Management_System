// import React, { useState } from "react";
// import axios from "axios";
// import headerImg from "../assets/LoginImg.png";
// import logoImg from "../assets/Logo04.PNG";
// import { useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";

// export default function DoctorLogin() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [statusMessage, setStatusMessage] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_API_URL}/api/auth/doctor-login`,
//         {
//           email,
//           password,
//         }
//       );

//       const { token, approved } = res.data;

      
//       if (!approved) {
//         setStatusMessage(
//           "Your account is pending admin approval. Please wait."
//         );
//         return;
//       }

      
//       localStorage.setItem("token", token);
//       navigate("/doctor/dashboard");

//     } catch (err) {
//       setStatusMessage("Invalid credentials");
//     }
//   };

//   return (
//     <div className="flex h-screen bg-[#F6FAFF]">

//       {/* LEFT SIDE */}
//       <div className="hidden md:flex w-2/4 mt-[160px]">
//         <div className="flex h-full bg-blue-50">
//           <div className="absolute top-14 left-60 flex items-center space-x-2">
//             <img src={logoImg} alt="MediCare Logo" className="h-16" />
//           </div>
//         </div>

//         <div className="absolute top-100 left-0 hidden md:flex w-[900px] h-[580px]">
//           <img src={headerImg} alt="Doctors" className="w-[1600px] h-auto"/>
//         </div>
//       </div>

//       {/* RIGHT SIDE LOGIN */}
//       <div className="w-1/2 flex flex-col justify-center items-center bg-white px-10">

//         <h2 className="mt-6 text-4xl font-bold mb-2 text-black">
//           Doctor Login
//         </h2>

//         <p className="mb-6 text-[#878787]">
//           Don't have a doctor account?{" "}
//           <Link to="/doctor-register" className="text-blue-600 hover:underline">
//             Register
//           </Link>
//         </p>

//         <form
//           onSubmit={handleLogin}
//           className="w-full max-w-md space-y-4 bg-white p-6 rounded-lg"
//         >

//           {/* Email */}
//           <div>
//             <label htmlFor="email" className="block mb-2 text-gray-700">
//               Email Address
//             </label>
//             <input
//               id="email"
//               type="email"
//               placeholder="Email address"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//           </div>

//           {/* Password */}
//           <div>
//             <label htmlFor="password" className="block mb-2 text-gray-700">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               placeholder="********"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
//             />
//           </div>

//           {/* Button */}
//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
//           >
//             Log in
//           </button>

//           {/* Options */}
//           <div className="flex justify-between items-center text-sm">
//             <label className="flex items-center">
//               <input type="checkbox" className="mr-2" /> Remember me
//             </label>
//             <a href="/forgot" className="text-blue-600 hover:underline">
//               Forgot password?
//             </a>
//           </div>

//         </form>

//         {/* STATUS MESSAGE */}
//         {statusMessage && (
//           <div className="mt-6 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800 text-sm w-full max-w-md text-center">
//             {statusMessage}
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import axios from "axios";
import headerImg from "../assets/LoginImg.png";
import logoImg from "../assets/Logo04.PNG";
import { useNavigate, Link } from "react-router-dom";

export default function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/doctor-login`,
        { email, password }
      );

      const { token, approved } = res.data;

      if (!approved) {
        setStatusMessage(
          "Your account is pending admin approval. Please wait."
        );
        return;
      }

      localStorage.setItem("token", token);
      navigate("/doctor/dashboard");
    } catch (err) {
      setStatusMessage("Invalid credentials");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F6FAFF]">

      {/* DESKTOP LEFT SIDE - FULL COVER IMAGE */}
      <div className="hidden md:flex md:w-2/3 h-screen relative">
        <img
          src={headerImg}
          alt="Doctors"
          className="w-full h-full object-cover"
        />

        {/* Logo on top-left */}
        <div className="absolute top-10 left-10">
          <img src={logoImg} alt="MediCare Logo" className="h-14" />
        </div>
      </div>

      {/* MOBILE IMAGE */}
      <div className="md:hidden flex justify-center p-4 bg-blue-50">
        <img
          src={headerImg}
          alt="Doctors"
          className="w-3/4 max-w-xs h-auto object-contain"
        />
      </div>

      {/* RIGHT SIDE / FORM */}
      <div className="flex w-full md:w-1/2 flex-col justify-center items-center bg-white px-6 md:px-10 py-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-black">
          Doctor Login
        </h2>

        <p className="mb-6 text-gray-500 text-sm md:text-base text-center">
          Don't have a doctor account?{" "}
          <Link
            to="/doctor-register"
            className="text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>

        <form
          onSubmit={handleLogin}
          className="w-full max-w-md space-y-4 bg-white p-4 md:p-6 rounded-lg"
        >
          {/* Email */}
          <div>
            <label className="block mb-2 text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Log in
          </button>

          {/* Options */}
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" /> Remember me
            </label>

            <a href="/forgot" className="text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>
        </form>

        {/* Status Message */}
        {statusMessage && (
          <div className="mt-6 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800 text-sm w-full max-w-md text-center">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}