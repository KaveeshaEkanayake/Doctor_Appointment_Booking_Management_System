import React from "react";
import logoImg from "../assets/Logo04.PNG";

export default function Footer() {
  return (
    <footer className="bg-[#F6FAFF] mt-auto">

      {/* MAIN FOOTER CONTENT */}
      <div className="px-10 py-8">
        <div className="grid md:grid-cols-5 gap-6">

          {/* Branding */}
          <div>
            <img src={logoImg} alt="MediCare Logo" className="h-10 mb-2" />
            <p className="text-sm text-[#012047]">
               Effortlessly schedule your medical <br/> 
              appointments with MediCare.Connect <br/>
              with healthcare professionals, manage<br/>
              appointments & prioritize your well being.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-2">Company</h4>
            <ul className="space-y-1 text-sm text-[#012047]">
              <li>Home</li>
              <li>About Us</li>
              <li>Contact Us</li>
            </ul>
          </div>

          {/* Specialities */}
          <div>
            <h4 className="font-bold mb-2">Specialities</h4>
            <ul className="space-y-1 text-sm text-[#012047]">
              <li>Neurology</li>
              <li>Cardiologist</li>
              <li>Dentist</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-2">Contact</h4>
            <p className="text-sm text-[#012047]">Kings Street, Colombo</p>
            <p className="text-sm text-[#012047]">+11 23456789</p>
            <p className="text-sm text-[#012047]">medicare@example.com</p>
          </div>

          {/* Email Subscribe */}
          <div>
            {/* <h4 className="font-bold mb-2">Subscribe</h4> */}
            <input
              type="email"
              placeholder="Enter Email"
              className="mt-2 px-3 py-2 rounded text-black w-full border"
            />
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded w-full">
              Submit
            </button>
          </div>

        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="bg-[#E2EDFF] py-4 text-center text-sm text-[#012047] w-full">
        © 2024 MediCare. All Rights Reserved | Privacy Policy | Terms & Conditions
      </div>

    </footer>
  );
}