import React, { useState, useEffect, useRef } from "react";
import { useNavigate }                         from "react-router-dom";
import axios                                   from "axios";
import Navbar                                  from "../components/Navbar";
import Footer                                  from "../components/Footer";
import { AiOutlineLoading3Quarters }           from "react-icons/ai";
import { FiSearch }                            from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;

const PAGE_SIZE = 10;

const SPECIALISATIONS = [
  "General Surgery", "Cardiology", "Dermatology", "Neurology",
  "Orthopedics", "Pediatrics", "Psychiatry", "Ophthalmology",
  "ENT", "Gynecology", "Urology", "Oncology", "Radiology",
  "Anesthesiology", "General Practice",
];

const specialtyColors = {
  "Cardiology":       "border-blue-500 text-blue-600",
  "Neurology":        "border-teal-500 text-teal-600",
  "Psychiatry":       "border-indigo-500 text-indigo-600",
  "Pediatrics":       "border-pink-500 text-pink-600",
  "Dermatology":      "border-orange-500 text-orange-600",
  "General Surgery":  "border-red-500 text-red-600",
  "Orthopedics":      "border-yellow-600 text-yellow-700",
  "Ophthalmology":    "border-purple-500 text-purple-600",
  "ENT":              "border-green-500 text-green-600",
  "Gynecology":       "border-rose-500 text-rose-600",
  "Urology":          "border-cyan-500 text-cyan-600",
  "Oncology":         "border-gray-500 text-gray-600",
  "Radiology":        "border-violet-500 text-violet-600",
  "Anesthesiology":   "border-amber-500 text-amber-600",
  "General Practice": "border-lime-600 text-lime-700",
};

const getStars = (id) => {
  const ratings = [3, 4, 5, 4, 5, 3, 4, 5, 4, 3];
  return ratings[id % ratings.length] || 4;
};

const StarRating = ({ count }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`text-lg ${star <= count ? "text-yellow-400" : "text-gray-200"}`}
      >
        ★
      </span>
    ))}
  </div>
);

const BookNowButton = ({ doctorId }) => {
  const navigate    = useNavigate();
  const token       = localStorage.getItem("token");
  const role        = localStorage.getItem("role");
  const [msg, setMsg] = useState("");
  const timeoutRef  = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleClick = () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (role === "doctor") {
      setMsg("Please use a patient account to book appointments.");
      timeoutRef.current = setTimeout(() => setMsg(""), 3000);
      return;
    }
    if (role === "admin") {
      setMsg("Admins cannot book appointments.");
      timeoutRef.current = setTimeout(() => setMsg(""), 3000);
      return;
    }
    navigate(`/appointments/book/${doctorId}`);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition text-xs font-medium"
      >
        📅 Book Now
      </button>
      {msg && (
        <p className="text-xs text-red-500 mt-1">{msg}</p>
      )}
    </div>
  );
};

export default function DoctorsPage() {
  const [allDoctors,    setAllDoctors]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [search,        setSearch]        = useState("");
  const [specialty,     setSpecialty]     = useState("");
  const [sortOrder,     setSortOrder]     = useState("");
  const [currentPage,   setCurrentPage]   = useState(1);
  const [openSpecialty, setOpenSpecialty] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get(`${API}/api/doctors`);
        setAllDoctors(data.doctors);
      } catch {
        setError("Failed to load doctors. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filtered = allDoctors
    .filter((doc) => {
      const matchesSearch = `${doc.firstName} ${doc.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesSpecialty = specialty
        ? doc.specialisation === specialty
        : true;
      return matchesSearch && matchesSpecialty;
    })
    .sort((a, b) => {
      if (sortOrder === "low")  return (a.consultationFee ?? 0) - (b.consultationFee ?? 0);
      if (sortOrder === "high") return (b.consultationFee ?? 0) - (a.consultationFee ?? 0);
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleClearAll = () => {
    setSpecialty("");
    setSortOrder("");
    setSearch("");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">

        {/* Search bar */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center border border-blue-400 rounded-full px-2 py-1 w-full max-w-2xl bg-white shadow-sm">
            <FiSearch className="ml-3 text-gray-400 text-lg flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for Doctors By Name"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              onKeyDown={(e) => { if (e.key === "Enter") setCurrentPage(1); }}
              className="flex-1 px-4 py-2 bg-transparent outline-none text-sm"
            />
            <button
              onClick={() => setCurrentPage(1)}
              className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex gap-8">

          {/* Filter sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">

              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-800">Filter</h2>
                <button
                  onClick={handleClearAll}
                  className="text-blue-600 text-sm underline hover:text-blue-700"
                >
                  Clear All
                </button>
              </div>

              <hr className="mb-5" />

              {/* Specialities */}
              <div className="mb-5">
                <div
                  className="flex justify-between items-center cursor-pointer mb-3"
                  onClick={() => setOpenSpecialty(!openSpecialty)}
                >
                  <span className="text-sm font-semibold text-gray-700">Specialities</span>
                  <span className="text-gray-400 text-xs">{openSpecialty ? "▲" : "▼"}</span>
                </div>

                {openSpecialty && (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {SPECIALISATIONS.map((spec) => (
                      <label key={spec} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="specialty"
                          value={spec}
                          checked={specialty === spec}
                          onChange={(e) => { setSpecialty(e.target.value); setCurrentPage(1); }}
                          className="accent-blue-600"
                        />
                        <span className="text-sm text-gray-600">{spec}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <hr className="mb-5" />

              {/* Sort */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Sort By Price</p>
                <select
                  className="border border-gray-200 rounded-lg px-3 py-2 w-full text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={sortOrder}
                  onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
                >
                  <option value="">Default</option>
                  <option value="low">Price (Low to High)</option>
                  <option value="high">Price (High to Low)</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">

            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-medium text-gray-700">
                Showing{" "}
                <span className="text-blue-600 font-bold">{filtered.length}</span>{" "}
                Doctors For You
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-xl px-4 py-3 mb-6">
                {error}
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center py-32 text-gray-400 gap-2">
                <AiOutlineLoading3Quarters className="animate-spin text-2xl" />
                <span className="text-sm">Loading doctors...</span>
              </div>

            /* Empty state */
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <p className="text-6xl mb-4">🩺</p>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">No Doctors Available</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Currently, there are no active doctors available.<br />
                  Please check later.
                </p>
                {(search || specialty) && (
                  <button
                    onClick={handleClearAll}
                    className="text-blue-600 underline text-sm"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

            /* Doctor grid */
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginated.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md overflow-hidden transition"
                    >
                      {/* Photo */}
                      <div className="w-full h-52 bg-gray-50 overflow-hidden">
                        {doc.profilePhoto ? (
                          <img
                            src={doc.profilePhoto}
                            alt={`Dr. ${doc.firstName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-blue-100 bg-blue-50">
                            {doc.firstName?.[0]}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-semibold pl-2 border-l-4 ${
                            specialtyColors[doc.specialisation] || "border-gray-400 text-gray-600"
                          }`}>
                            {doc.specialisation}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            Available
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-800 text-base mt-2 mb-3">
                          Dr. {doc.firstName} {doc.lastName}
                        </h3>

                        <div className="flex items-center justify-between mb-3">
                          {doc.experience && (
                            <span className="bg-gray-900 text-white text-xs px-3 py-1 rounded-full font-medium">
                              +{doc.experience.replace(/\D/g, "") || "0"} years
                            </span>
                          )}
                          <StarRating count={getStars(doc.id)} />
                        </div>

                        <hr className="border-gray-100 mb-3" />
                        <BookNowButton doctorId={doc.id} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-1.5 rounded-full border text-sm bg-white hover:bg-gray-50 disabled:opacity-40 transition"
                    >
                      Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => handlePageChange(num)}
                        className={`px-4 py-1.5 rounded-full border text-sm transition ${
                          currentPage === num
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-1.5 rounded-full border text-sm bg-white hover:bg-gray-50 disabled:opacity-40 transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}