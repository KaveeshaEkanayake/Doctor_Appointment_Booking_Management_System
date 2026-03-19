import React from "react";
import Navbar from "../components/Navbar"; 
import Background from "../assets/Background.png";
import DoctorHero from "../assets/DoctorHero.png";
import Footer from "../components/Footer";  


export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#F6FAFF]">

            {/* WRAPPER (Navbar + Hero Background) */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100">

                {/* BACKGROUND IMAGE */}
                <img
                    src={Background}
                    alt="Background"
                    className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-none pointer-events-none"
                />

                {/* NAVBAR */}
                <Navbar />

                {/* HERO SECTION */}
                <section className="relative flex flex-col md:flex-row items-start justify-between px-10 pt-12 pb-20 min-h-screen">

                    {/* HERO CONTENT */}
                    {/* HERO CONTENT */}
                    <div className="relative max-w-lg mt-6 ml-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-relaxed">
                            <span className="block mb-4 text-[#0E82FD]">Search Doctor,</span>
                            <span className="block text-[#012047]">Make an Appointment</span>
                        </h2>

                        <p className="text-[#465D7C] mb-6 leading-relaxed">
                            Access to expert physicians and surgeons, <br />
                            advanced technologies and top-quality facilities right here.
                        </p>


                        <button className="mt-6 bg-blue-500 text-white px-6 py-4 rounded-full hover:bg-blue-600">
                            Book Appointment
                        </button>
                        {/* Search Bar directly under the button */}
                        <div className="mt-6 flex gap-2">
                            <input
                                type="text"
                                placeholder="Search doctors, clinics, hospitals, etc"
                                className="flex-1 border px-4 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button className="bg-blue-600 text-white px-6 py-1 rounded-full hover:bg-blue-700">
                                Search
                            </button>
                        </div>
                    </div>
                    <div className="mt-10 md:mt-0 md:ml-12 mr-6">
                        <img
                            src={DoctorHero}
                            alt="Doctor pointing"
                            className="w-[450px] md:w-[550px] object-contain "
                        />
                    </div>
                </section>

            </div>

            {/* SPECIALTIES SECTION */}
            <section className="px-10 py-12">
                <h3 className="text-2xl font-semibold mb-6">Find by Speciality</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {[
                        "Urology",
                        "Orthopedic",
                        "Cardiologist",
                        "Dentist",
                        "Neurology",
                        "Pediatric",
                    ].map((spec) => (
                        <div
                            key={spec}
                            className="flex flex-col items-center p-4 bg-white shadow rounded hover:shadow-md"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-full mb-3"></div>
                            <p className="text-gray-700">{spec}</p>
                        </div>
                    ))}
                </div>

                <button className="mt-6 text-blue-600 font-medium">
                    See All Specialties
                </button>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section className="px-10 py-12 bg-gray-50">
                <h3 className="text-2xl font-semibold mb-6">
                    4 easy steps to get your solution
                </h3>

                <div className="grid md:grid-cols-4 gap-6">
                    {[
                        "Search Doctor",
                        "Schedule Appointment",
                        "Check Doctor Profile",
                        "Get Your Solution",
                    ].map((step, i) => (
                        <div
                            key={i}
                            className="p-6 bg-white rounded shadow hover:shadow-md"
                        >
                            <h4 className="font-semibold mb-2">
                                {i + 1}. {step}
                            </h4>

                            <p className="text-gray-600 text-sm">
                                {step === "Search Doctor" &&
                                    "Search for a doctor based on specialization or availability."}
                                {step === "Schedule Appointment" &&
                                    "Choose your preferred doctor and confirm your time slot."}
                                {step === "Check Doctor Profile" &&
                                    "Explore detailed doctor profiles to make informed decisions."}
                                {step === "Get Your Solution" &&
                                    "Discuss your health concerns and receive personalized advice."}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FOOTER */}

            <Footer />
            {/* <footer className="bg-blue-900 text-white px-10 py-8 mt-auto">
                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <h4 className="font-bold text-lg mb-2">MediCare</h4>
                        <p className="text-sm">
                            Effortlessly schedule your medical appointments with MediCare.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-2">Company</h4>
                        <ul className="space-y-1 text-sm">
                            <li>Neurology</li>
                            <li>Cardiologist</li>
                            <li>Dentist</li>
                            <li>About Us</li>
                            <li>Contact Us</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-2">Contact</h4>
                        <p className="text-sm">Kings Street, Colombo</p>
                        <p className="text-sm">+11 23456789</p>
                        <p className="text-sm">medicare@example.com</p>

                        <input
                            type="email"
                            placeholder="Enter Email"
                            className="mt-3 px-3 py-2 rounded text-black w-full"
                        />
                        <button className="mt-2 bg-blue-600 px-4 py-2 rounded">
                            Submit
                        </button>
                    </div>
                </div>

                <div className="mt-6 text-xs text-gray-300">
                    Privacy Policy | Terms & Conditions
                </div>
            </footer> */}

        </div>
    );
}