import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { ChevronRightIcon } from "@heroicons/react/24/solid";

import location from "../assets/location.png";
import phone from "../assets/phone.png";
import mail from "../assets/mail.png";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* <main className="flex-1 flex items-center justify-center">
        <div className="text-center py-24">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            This page is coming soon. We're working on it!
          </p>
        </div>
      </main> */}

      <div className="w-full h-full overflow-x-hidden bg-white">
        {/* Hero Section */}
        <section className="relative bg-blue-50 py-10 sm:py-12 lg:py-14">
          {/* Background shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-28 h-28 sm:w-40 sm:h-40 bg-blue-200 rounded-full opacity-30" />
            <div className="absolute bottom-8 right-6 sm:bottom-10 sm:right-20 w-36 h-36 sm:w-56 sm:h-56 bg-blue-100 rounded-full opacity-40" />
            <div className="absolute top-1/2 left-1/2 w-44 h-44 sm:w-72 sm:h-72 bg-white rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center items-center text-sm sm:text-base text-blue-600 mb-3 sm:mb-4">
              <span>Home</span>
              <ChevronRightIcon className="w-4 h-4 mx-1" />
              <span className="font-medium">Contact Us</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-900">
              Contact Us
            </h1>
          </div>
        </section>

        {/* Section 02 */}
        <div className="flex justify-center items-center py-12 md:py-60 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
            
            {/* Left Side */}
            <div className="w-full md:w-[400px] mt-10">
              <p className="text-blue-600 text-sm mb-2">Get in touch</p>
              <h2 className="text-black font-bold text-lg mb-6">Have Any Question?</h2>

              {/* Address */}
              <div className="bg-white border border-gray-300 rounded-lg p-4 flex items-center gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-center">
                  <img src={location} alt="Location Icon" className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-md text-black font-medium">Address</p>
                  <p className="text-sm text-gray-600">Kings Street, Colombo</p>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-white border border-gray-300 rounded-lg p-4 flex items-center gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-center">
                  <img src={phone} alt="Phone Icon" className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-md text-black font-medium">Phone Number</p>
                  <p className="text-sm text-gray-600">+11 234 5789</p>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white border border-gray-300 rounded-lg p-4 flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-center">
                  <img src={mail} alt="Mail Icon" className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-md text-black font-medium">Email Address</p>
                  <p className="text-sm text-gray-600">medicare@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-[500px] bg-blue-50 p-8 rounded-lg shadow-md">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="text-black font-medium mb-1 block">Name</label>
                  <input type="text" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"/>
                </div>

                {/* Email */}
                <div>
                  <label className="text-black font-medium mb-1 block">Email</label>
                  <input type="email" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"/>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-black font-medium mb-1 block">Phone Number</label>
                  <input type="tel" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"/>
                </div>

                {/* Services */}
                <div>
                  <label className="text-black font-medium mb-1 block">Services</label>
                  <input type="text" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"/>
                </div>

                {/* Message */}
                <div className="md:col-span-2">
                  <label className="text-black font-medium mb-1 block">Message</label>
                  <textarea rows="4" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"></textarea>
                </div>

                {/* Button */}
                <div>
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-700 transition">
                    Send Message
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}