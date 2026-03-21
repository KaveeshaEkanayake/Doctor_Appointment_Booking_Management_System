import React, { useRef, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Background from "../assets/Background.png";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

import Urology from "../assets/Urology.png";
import Orthopedic from "../assets/Orthopedic.png";
import Cardiologist from "../assets/Cardiologist.png";
import Dentist from "../assets/Dentist.jpg";
import Neurology from "../assets/Neurology.png";
import Pediatrist from "../assets/Pediatrist.png";

import Da from "../assets/Da.png";
import Db from "../assets/Db.png";
import Dc from "../assets/Dc.png";
import Dd from "../assets/Dd.png";
import Banner2 from "../assets/Banner2.png";
import faq from "../assets/faq.png";

import { FaHeartbeat, FaBone, FaBrain, FaBaby, FaStethoscope, FaRunning } from "react-icons/fa";

export default function HomePage() {
    const navigate = useNavigate();
    const [showAllSpecialities, setShowAllSpecialities] = useState(false);

    const scrollRef = useRef(null);
    const doctorRef = useRef(null);

    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const scrollLeft = () => {
        scrollRef.current?.scrollBy({
            left: -300,
            behavior: "smooth",
        });
    };

    const scrollRight = () => {
        scrollRef.current?.scrollBy({
            left: 300,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        const el = doctorRef.current;

        const handleScroll = () => {
            const scrollLeft = el.scrollLeft;
            const maxScroll = el.scrollWidth - el.clientWidth;

            setShowLeft(scrollLeft > 10);
            setShowRight(scrollLeft < maxScroll - 10);
        };

        if (el) {
            el.addEventListener("scroll", handleScroll);
            handleScroll();
        }

        return () => el?.removeEventListener("scroll", handleScroll);
    }, []);

    const specialities = [
        { name: "Urology", img: Urology, icon: FaRunning },
        { name: "Orthopedic", img: Orthopedic, icon: FaBone },
        { name: "Cardiologist", img: Cardiologist, icon: FaHeartbeat },
        { name: "Dentist", img: Dentist, icon: FaStethoscope },
        { name: "Neurology", img: Neurology, icon: FaBrain },
        { name: "Pediatric", img: Pediatrist, icon: FaBaby },

        { name: "Test 1", img: Urology, icon: FaBone },
        { name: "Test 22", img: Urology, icon: FaBone },
        { name: "Test 3", img: Urology, icon: FaBaby },
        { name: "Test 4", img: Urology, icon: FaBrain },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#F6FAFF]">

            <div className="relative overflow-hidden bg-blue-50 md:bg-gradient-to-r md:from-blue-50 md:to-blue-100 min-h-[70vh] md:min-h-screen">

                <img
                    src={Background}
                    alt="Background"
                    className=" hidden md:block absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-none pointer-events-none"
                />

                <Navbar />

                <section className="relative flex flex-col md:flex-row items-start justify-between px-6 md:px-10 pt-16 md:pt-20 pb-16 min-h-screen">

                    <div className="relative max-w-lg mt-20 ml-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-relaxed">
                            <span className="block mb-4 text-[#0E82FD]">Search Doctor,</span>
                            <span className="block text-[#012047]">Make an Appointment</span>
                        </h2>

                        <p className="text-sm md:text-base text-[#465D7C] mb-6 leading-relaxed">
                            Access to expert physicians and surgeons, <br />
                            advanced technologies and top-quality facilities right here.
                        </p>

                        <button
                            onClick={() => navigate("/appointments")}
                            className="mt-6 bg-blue-500 text-white px-6 py-3 md:py-4 rounded-full w-full md:w-auto"
                        >
                            Book Appointment
                        </button>

                        <div className="mt-6 flex flex-col md:flex-row gap-2">
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


                </section>
            </div>

            {/* SPECIALITIES */}
            <section className="px-10 py-16 bg-white ">

                <div className="max-w-[calc(5*180px+4*24px)] mx-auto mb-12 flex justify-between items-center">

                    <div>
                        <h3 className="text-3xl font-bold text-[#012047] mb-6">
                            Find by Speciality
                        </h3>
                        <p className="text-sm text-gray-500">
                            Simply browse through our extensive list of trusted doctors,
                            schedule your appointment <br /> hassle-free.
                        </p>
                    </div>

                    {!showAllSpecialities && (
                        <div className="flex gap-3">
                            <button onClick={scrollLeft} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">‹</button>
                            <button onClick={scrollRight} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">›</button>
                        </div>
                    )}

                </div>

                {/* SLIDER VIEW */}
                {!showAllSpecialities && (
                    <div className="flex justify-center">
                        <div
                            ref={scrollRef}
                            className="flex gap-8 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory mt-8"
                            style={{
                                maxWidth: "calc(5 * 180px + 4 * 24px)",
                                scrollbarWidth: "none",
                                msOverflowStyle: "none"
                            }}
                        >
                            <style>
                                {`
                        div::-webkit-scrollbar {
                            display: none;
                        }
                    `}
                            </style>

                            {specialities.map((item, i) => (
                                <div
                                    key={i}
                                    className="min-w-[180px] snap-start h-[260px] rounded-2xl overflow-hidden cursor-pointer flex flex-col items-center justify-center text-white transition-all duration-300 group relative hover:scale-105"
                                    style={{
                                        backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.4)), url(${item.img})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                >
                                    <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>

                                    <div className="w-12 h-12 flex items-center justify-center rounded-xl mb-4 bg-white/90 text-blue-600 relative z-10 group-hover:bg-white">
                                        <item.icon size={24} strokeWidth={2.2} />
                                    </div>

                                    <p className="font-medium relative z-10">{item.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* GRID VIEW */}
                {showAllSpecialities && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 px-4 md:px-10 mt-8">
                        {specialities.map((item, i) => (
                            <div
                                key={i}
                                className="h-[200px] rounded-2xl overflow-hidden cursor-pointer flex flex-col items-center justify-center text-white transition-all duration-300 hover:scale-105 relative"
                                style={{
                                    backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.4)), url(${item.img})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                }}
                            >
                                <div className="absolute inset-0 bg-blue-600 opacity-0 hover:opacity-70 transition-opacity duration-300"></div>

                                <div className="w-12 h-12 flex items-center justify-center rounded-xl mb-4 bg-white/90 text-blue-600 relative z-10">
                                    <item.icon size={24} strokeWidth={2.2} />
                                </div>

                                <p className="font-medium relative z-10">{item.name}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => setShowAllSpecialities(!showAllSpecialities)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-full"
                    >
                        {showAllSpecialities ? "Show Less" : "See All Specialities"}
                    </button>
                </div>

            </section>

            {/* DOCTORS SECTION */}
            <section className="px-10 py-16 bg-[#F6FAFF]">

                <h3 className="text-2xl font-semibold text-center mb-10 text-[#012047]">
                    Our Specialist Doctors
                </h3>

                <div className="flex justify-center relative">

                    {showLeft && (
                        <button
                            onClick={() => doctorRef.current?.scrollBy({ left: -250, behavior: "smooth" })}
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center z-10"
                        >
                            ‹
                        </button>
                    )}

                    <div
                        ref={doctorRef}
                        className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
                        style={{
                            maxWidth: "calc(4 * 250px + 3 * 24px)",
                            scrollbarWidth: "none",
                            msOverflowStyle: "none"
                        }}
                    >
                        <style>
                            {`
                                div::-webkit-scrollbar {
                                    display: none;
                                }
                            `}
                        </style>

                        {[
                            { name: "Dr Rajan Sharma", role: "Cardiologist", img: Da },
                            { name: "Dr Piers Clifford", role: "Consultant Cardiologist", img: Db },
                            { name: "Dr Jonathan Behar", role: "Cardiologist", img: Dc },
                            { name: "Dr Julian Collinson", role: "Consultant Cardiologist", img: Dd },
                            { name: "Dr Test 1", role: "Cardiologist", img: Da },
                            { name: "Dr Test 2", role: "Cardiologist", img: Da },
                        ].map((doc, i) => (
                            <div key={i} className="min-w-[250px] bg-white rounded-2xl p-4 shadow hover:shadow-lg">
                                <img src={doc.img} className="w-full h-[180px] object-cover rounded-xl mb-4" />
                                <div className="flex gap-2 mb-2">
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                        Cardiology
                                    </span>
                                </div>
                                <h4 className="font-semibold text-[#012047]">{doc.name}</h4>
                                <p className="text-sm text-gray-500">{doc.role}</p>
                            </div>
                        ))}
                    </div>

                    {showRight && (
                        <button
                            onClick={() => doctorRef.current?.scrollBy({ left: 250, behavior: "smooth" })}
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center z-10"
                        >
                            ›
                        </button>
                    )}

                </div>
            </section>

            {/* BANNER */}
            <div className="w-full flex justify-center py-10">
                <img
                    src={Banner2}
                    alt="Banner"
                    className="w-full max-w-6xl object-contain"
                />
            </div>


            {/* FAQ SECTION */}
            <section className="px-10 py-16 bg-white">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">

                    {/* LEFT IMAGE */}
                    <div className="flex justify-center md:sticky md:top-10 h-fit">
                        <img
                            src={faq}
                            alt="FAQ"
                            className="w-full max-w-md object-contain"
                        />
                    </div>

                    {/* RIGHT FAQ */}
                    <div>
                        <h3 className="text-2xl font-semibold text-[#012047] mb-6">
                            Frequently Asked Questions
                        </h3>

                        {[
                            {
                                q: "How do I book an appointment with a doctor?",
                                a: "Simply visit our website and log in or create an account. Search for a doctor based on specialization, location, or availability and confirm your booking."
                            },
                            {
                                q: "Can I request a specific doctor when booking?",
                                a: "Yes, you can choose your preferred doctor while making the appointment."
                            },
                            {
                                q: "What should I do if I need to cancel or reschedule?",
                                a: "You can cancel or reschedule your appointment from your dashboard."
                            },
                            {
                                q: "What if I’m running late for my appointment?",
                                a: "Please inform the clinic as soon as possible. Your slot may be adjusted."
                            },
                            {
                                q: "Can I book for family members?",
                                a: "Yes, you can book appointments for dependents using your account."
                            }
                        ].map((item, i) => (
                            <details
                                key={i}
                                className="mb-3 bg-blue-50 rounded-lg p-4 cursor-pointer group"
                            >
                                <summary className="font-medium text-[#012047] flex justify-between items-center">
                                    {item.q}
                                    <span className="group-open:rotate-45 transition-transform">+</span>
                                </summary>
                                <p className="text-sm text-gray-600 mt-2">
                                    {item.a}
                                </p>
                            </details>
                        ))}
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    );
}
