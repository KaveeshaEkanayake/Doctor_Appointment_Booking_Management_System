import React, { useState, useEffect, useRef } from "react";
import { useNavigate }                         from "react-router-dom";
import axios                                   from "axios";
import Navbar                                  from "../components/Navbar";
import Footer                                  from "../components/Footer";
import { AiOutlineLoading3Quarters }           from "react-icons/ai";
import { ChevronRightIcon }                    from "@heroicons/react/24/solid";
import { PhoneCall, Plus }                     from "lucide-react";

import Img01       from "../assets/img01.png";
import Img02       from "../assets/img02.png";
import Img03       from "../assets/img03.png";
import IconDoctor  from "../assets/IconDoctor.PNG";
import IconClock   from "../assets/IconClock.PNG";
import IconLab     from "../assets/IconLab.PNG";
import IconConsult from "../assets/IconConsult.PNG";
import ImgDoctor   from "../assets/ImgDoctor.png";
import ImgFAQ      from "../assets/ImgFAQ1.PNG";

const API = import.meta.env.VITE_API_URL;

const getStars = (id) => {
  const ratings = [3, 4, 5, 4, 5, 3, 4, 5, 4, 3];
  return ratings[id % ratings.length] || 4;
};

import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { PhoneCall, Plus } from "lucide-react";

import Img01 from "../assets/img01.png";
import Img02 from "../assets/img02.png";
import Img03 from "../assets/img03.png";

import IconDoctor from "../assets/IconDoctor.PNG";
import IconClock from "../assets/IconClock.PNG";
import IconLab from "../assets/IconLab.PNG";
import IconConsult from "../assets/IconConsult.PNG";

import ImgDoctor from "../assets/ImgDoctor.png"

import ImgFAQ from "../assets/ImgFAQ1.PNG"


export default function AboutPage() {
  const navigate = useNavigate();

  const [doctors,        setDoctors]        = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [showLeft,       setShowLeft]       = useState(false);
  const [showRight,      setShowRight]      = useState(true);

  const doctorRef = useRef(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(`${API}/api/doctors`);
        setDoctors(data.doctors);
      } catch {
        // silently fail
      } finally {
        setDoctorsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const el = doctorRef.current;
    const handleScroll = () => {
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      setShowLeft(el.scrollLeft > 10);
      setShowRight(el.scrollLeft < maxScroll - 10);
    };
    if (el) {
      el.addEventListener("scroll", handleScroll);
      handleScroll();
    }
    return () => el?.removeEventListener("scroll", handleScroll);
  }, [doctors]);

  const features = [
    {
      icon:        IconDoctor,
      title:       "Qualified Staff of Doctors",
      description: "Our platform exclusively partners with highly qualified doctors who bring expertise and commitment to delivering top-notch healthcare.",
    },
    {
      icon:        IconClock,
      title:       "24 Hours Service",
      description: "Experience healthcare access with our 24/7 service. Whether day or night, you can find and book appointments easily.",
    },
    {
      icon:        IconLab,
      title:       "Quality Lab Services",
      description: "Partnering with accredited labs, your health is our priority, and our quality lab services reflect our dedication to excellence.",
    },
    {
      icon:        IconConsult,
      title:       "Free Consultations",
      description: "Your well-being is important, and our commitment to providing accessible care begins with a free initial consultation.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="w-full h-full overflow-x-hidden bg-white">

        {/* ── Hero Section ── */}
        <section className="relative bg-blue-50 py-10 sm:py-12 lg:py-14">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-28 h-28 sm:w-40 sm:h-40 bg-blue-200 rounded-full opacity-30" />
            <div className="absolute bottom-8 right-6 sm:bottom-10 sm:right-20 w-36 h-36 sm:w-56 sm:h-56 bg-blue-100 rounded-full opacity-40" />
            <div className="absolute top-1/2 left-1/2 w-44 h-44 sm:w-72 sm:h-72 bg-white rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center items-center text-sm sm:text-base text-blue-600 mb-3 sm:mb-4">
              <span>Home</span>
              <ChevronRightIcon className="w-4 h-4 mx-1" />
              <span className="font-medium">About Us</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-900">
              About Us
            </h1>
          </div>
        </section>

        {/* ── About Section ── */}
        <section className="w-full bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-1">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[48%_52%] gap-10 xl:gap-16 items-center">

            {/* Desktop image layout */}
            <div className="relative w-full min-h-[450px] hidden md:block">
              <div className="absolute bottom-40 top-0 left-0 w-[48%] h-[300px] rounded-2xl overflow-hidden">
                <img src={Img01} alt="Doctors" className="w-full h-80 object-cover" />
              </div>
              <div className="absolute top-0 right-0 w-[46%] h-[120px] bg-blue-600 text-white rounded-2xl flex items-center justify-center text-center px-4">
                <p className="text-2xl font-semibold leading-relaxed">Over 5+ <br /> Years Experience</p>
              </div>
              <div className="absolute top-[140px] right-0 w-[46%] h-[360px] rounded-2xl overflow-hidden">
                <img src={Img03} alt="Doctor" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-40 bottom-0 left-0 w-[48%] h-[180px] rounded-2xl overflow-hidden mt-40">
                <img src={Img02} alt="Female doctor" className="w-full h-50" />
              </div>
            </div>

            {/* Mobile image layout */}
            <div className="grid grid-cols-2 gap-1 md:hidden">
              <div className="rounded-2xl overflow-hidden h-[300px] mt-3">
                <img src={Img01} alt="Doctors" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="bg-blue-600 text-white rounded-2xl h-[100px] flex items-center justify-center text-center px-4">
                  <p className="text-lg font-semibold leading-relaxed">Over 5+ <br /> Years Experience</p>
                </div>
                <div className="rounded-2xl overflow-hidden h-[220px]">
                  <img src={Img02} alt="Doctor" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Right side content */}
            <div className="w-full h-full mt-10">
              <p className="text-blue-600 font-medium text-lg mb-2">About Our Company</p>
              <h2 className="text-3xl md:text-4xl xl:text-4xl font-bold text-[#0b1b3f] leading-tight mb-6 flex items-start gap-2">
                We Are Always Ensure Best
                <span className="text-blue-500 mt-1">
                  <Plus size={26} strokeWidth={3} />
                </span>
              </h2>
              <p className="text-gray-600 text-base md:text-lg leading-8 mb-6">
                At MediCare, we understand that healthcare should be simple, fast, and accessible for everyone.
                Our mission is to streamline the process of finding trusted doctors and booking appointments online,
                so patients can receive quality medical care without delays or complications.
              </p>
              <p className="text-gray-600 text-base md:text-lg leading-8 mb-10">
                We provide a smart and user-friendly platform that connects patients with qualified healthcare
                professionals across multiple specialties. Whether you need a routine check-up, specialist
                consultation, follow-up visit, or urgent medical attention, MediCare makes it easy to schedule
                appointments anytime, anywhere.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-md shrink-0">
                  <PhoneCall size={22} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm md:text-base">Need Emergency?</p>
                  <p className="text-2xl font-semibold text-[#0b1b3f]">+11 2345789</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why Choose Us ── */}
        <section className="py-1 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <p className="text-blue-600 font-medium text-base sm:text-lg mb-2">Our Features</p>
              <h2 className="text-3xl md:text-4xl xl:text-4xl font-bold text-[#0b1b3f] leading-tight mb-6 flex items-center justify-center gap-2">
                Why Choose Us
                <span className="text-blue-500 mt-1">
                  <Plus size={26} strokeWidth={3} />
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
              {features.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition duration-300"
                >
                  <div className="flex justify-center mb-4">
                    <img src={item.icon} alt={item.title} className="h-12 w-12 object-contain" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-600 mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-6">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="relative bg-blue-500 py-8 px-4 md:px-6 lg:px-12 max-w-7xl mx-auto my-12 rounded-2xl overflow-hidden h-[450px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center relative z-10">
            <div className="text-center md:text-left text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                Be on Your Way to Feeling Better with MediCare
              </h2>
              <p className="text-sm md:text-base mb-6 leading-relaxed">
                Be on your way to feeling better as we prioritize your health journey
                with personalized and accessible services.
              </p>
              <button
                className="bg-white text-blue-600 font-semibold px-5 py-2 rounded-3xl shadow-md hover:bg-gray-100 transition"
                onClick={() => navigate("/contact")}
              >
                Contact With Us
              </button>
            </div>
            <div className="flex justify-center md:justify-end">
              <img src={ImgDoctor} alt="Doctor" className="w-64 md:w-80 rounded-lg object-cover" />
            </div>
          </div>
          <div className="absolute right-10 top-1/2 w-24 h-24 md:w-40 md:h-40 bg-blue-400 rounded-full opacity-30 transform -translate-y-1/2" />
        </section>

        {/* ── Doctors Section ── */}
        <section className="px-10 py-16 bg-[#F6FAFF]">
          <h3 className="text-2xl font-semibold text-center mb-10 text-[#012047]">
            Our Specialist Doctors
          </h3>

          {doctorsLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
              <AiOutlineLoading3Quarters className="animate-spin text-xl" />
              <span className="text-sm">Loading doctors...</span>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              <p className="text-lg">No doctors available at the moment.</p>
            </div>
          ) : (
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
                style={{ maxWidth: "calc(4 * 250px + 3 * 24px)", scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => navigate(`/doctors/${doc.id}`)}
                    className="min-w-[250px] bg-white rounded-2xl p-4 shadow hover:shadow-lg cursor-pointer transition"
                  >
                    {doc.profilePhoto ? (
                      <img
                        src={doc.profilePhoto}
                        alt={`Dr. ${doc.firstName}`}
                        className="w-full h-[180px] object-cover rounded-xl mb-4"
                      />
                    ) : (
                      <div className="w-full h-[180px] bg-blue-50 rounded-xl mb-4 flex items-center justify-center text-5xl font-bold text-blue-200">
                        {doc.firstName?.[0]}
                      </div>
                    )}
                    <div className="flex gap-2 mb-2">
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        {doc.specialisation}
                      </span>
                    </div>
                    <h4 className="font-semibold text-[#012047]">
                      Dr. {doc.firstName} {doc.lastName}
                    </h4>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= getStars(doc.id) ? "text-yellow-400 text-sm" : "text-gray-200 text-sm"}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    {doc.consultationFee && (
                      <p className="text-xs text-gray-400 mt-1">Rs {doc.consultationFee}</p>
                    )}
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
          )}

          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate("/doctors")}
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
            >
              View All Doctors
            </button>
          </div>
        </section>

        {/* ── FAQ Section ── */}
        <section className="py-16 bg-white px-4 md:px-8 lg:px-16">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0b1b3f] mb-8 text-left">
                Frequently Asked Questions
              </h2>
              <img
                src={ImgFAQ}
                alt="Consultation"
                className="w-full h-full max-w-100 rounded-lg object-cover"
              />
            </div>

            <div className="mt-0 md:mt-0 lg:mt-10">
              <div className="space-y-6">
                <div className="mt-0 md:mt-6 lg:mt-20">
                  <h3 className="text-lg font-semibold text-black mb-2">
                    How Do I Book An Appointment With A Doctor?
                  </h3>
                  <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                    Yes, simply visit our website and log in or create an account.
                    Search for a doctor based on specialization, location, or availability
                    & confirm your booking.
                  </p>
                </div>

                {[
                  "Can I Request A Specific Doctor When Booking My Appointment?",
                  "What Should I Do If I Need To Cancel Or Reschedule My Appointment?",
                  "What If I'm Running Late For My Appointment?",
                  "Can I Book Appointments For Family Members Or Dependents?",
                ].map((question, i) => (
                  <div key={i} className="bg-blue-100 rounded-lg p-3">
                    <h3 className="text-md ml-4 font-semibold text-black flex items-center justify-between cursor-pointer">
                      {question}
                      <button className="bg-white rounded-lg mt-1 mr-2 w-8 h-8 flex items-center justify-center text-blue-600 font-bold">
                        +
                      </button>
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}