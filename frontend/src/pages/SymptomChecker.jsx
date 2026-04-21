import React, { useState } from "react";
import { useNavigate }     from "react-router-dom";
import axios               from "axios";
import Navbar              from "../components/Navbar";
import Footer              from "../components/Footer";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;

const COMMON_SYMPTOMS = [
  "Fever", "Dry Cough", "Fatigue", "Sore Throat", "Muscle Pain",
  "Chest Pressure", "Shortness of breath", "Dizziness", "Chills",
  "Headache", "Nausea", "Back Pain", "Joint Pain", "Rash",
];

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
      <span key={star} className={`text-lg ${star <= count ? "text-yellow-400" : "text-gray-200"}`}>★</span>
    ))}
  </div>
);

const urgencyConfig = {
  "Low":       { color: "bg-green-100 text-green-700 border-green-200",   icon: "🟢", label: "Low Urgency"    },
  "Medium":    { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "🟡", label: "Medium Urgency" },
  "High":      { color: "bg-orange-100 text-orange-700 border-orange-200", icon: "🟠", label: "High Urgency"   },
  "Emergency": { color: "bg-red-100 text-red-700 border-red-200",          icon: "🔴", label: "Emergency"      },
};

// Shared disclaimer component — avoids duplication
const PrivacyDisclaimer = () => (
  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
    <span className="text-blue-500 mt-0.5">🛡️</span>
    <div>
      <p className="text-xs font-semibold text-blue-600 mb-1">Confidential & Secure</p>
      <p className="text-xs text-blue-500">
        Your health information is processed anonymously. Our AI analyzes your symptoms
        to suggest the most appropriate specialists. This is not a medical diagnosis.
      </p>
    </div>
  </div>
);

export default function SymptomChecker() {
  const navigate = useNavigate();

  const [step, setStep]               = useState(1);
  const [inputValue, setInputValue]   = useState("");
  const [symptoms, setSymptoms]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [analysis, setAnalysis]       = useState(null);
  const [doctors, setDoctors]         = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

  // Fix: normalize case to prevent duplicate "Fever" and "fever"
  const addSymptom = (sym) => {
    const trimmed    = sym.trim();
    if (!trimmed) return;
    const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    if (!symptoms.map((s) => s.toLowerCase()).includes(normalized.toLowerCase())) {
      setSymptoms((prev) => [...prev, normalized]);
    }
    setInputValue("");
  };

  const removeSymptom = (sym) => {
    setSymptoms((prev) => prev.filter((s) => s !== sym));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSymptom(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && symptoms.length > 0) {
      setSymptoms((prev) => prev.slice(0, -1));
    }
  };

  // Fix: server-side filtering by specialisation
  const fetchDoctors = async (specialisation) => {
    setDoctorsLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/doctors`, {
        params: { specialisation },
      });
      setDoctors(data.doctors || []);
    } catch {
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const analyseSymptoms = async () => {
    if (symptoms.length === 0) {
      setError("Please enter at least one symptom.");
      return;
    }
    setError("");
    setLoading(true);
    setStep(2);

    try {
      // Fix: API key moved to backend — no longer exposed client-side
      const res = await axios.post(
        `${API}/api/symptom-checker`,
        { symptoms },
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "AI analysis failed");
      }

      const parsed = res.data.analysis;

      if (!SPECIALISATIONS.includes(parsed.specialisation)) {
        parsed.specialisation = "General Practice";
      }

      setAnalysis(parsed);
      setStep(3);
      await fetchDoctors(parsed.specialisation);

    } catch (err) {
      setError(err.response?.data?.message || "AI analysis failed. Please try again.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (doctorId) => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");
    if (!token) { navigate("/login"); return; }
    if (role !== "patient") return;
    navigate(`/doctors/${doctorId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          {[
            { num: 1, label: "Describe Symptoms", icon: "🔍" },
            { num: 2, label: "AI Analysis",        icon: "🤖" },
            { num: 3, label: "Specialist Results", icon: "👨‍⚕️" },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition ${
                  step === s.num
                    ? "bg-blue-600 border-blue-600 text-white"
                    : step > s.num
                    ? "bg-blue-100 border-blue-300 text-blue-600"
                    : "bg-white border-gray-200 text-gray-400"
                }`}>
                  {s.icon}
                </div>
                <p className={`text-xs mt-1 font-medium ${step === s.num ? "text-blue-600" : "text-gray-400"}`}>
                  {s.label}
                </p>
              </div>
              {i < 2 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 ${step > s.num ? "bg-blue-300" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1 — Input */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">How are you feeling today?</h1>
              <p className="text-gray-500 text-sm">
                Describe your symptoms in your own words. The more detail you provide, the better our AI can assist you.
              </p>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-6 mb-4">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-sm font-semibold text-gray-700">Symptom Description</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Step 1 of 2</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Enter one or more symptoms to begin analysis</p>

              {/* Tags input */}
              <div
                className="border rounded-xl p-3 min-h-[80px] flex flex-wrap gap-2 mb-3 focus-within:ring-2 focus-within:ring-blue-400 cursor-text"
                onClick={() => document.getElementById("symptom-input").focus()}
              >
                {symptoms.map((sym) => (
                  <span
                    key={sym}
                    className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200 h-7"
                  >
                    {sym}
                    {/* Fix: added aria-label for accessibility */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeSymptom(sym); }}
                      aria-label={`Remove symptom ${sym}`}
                      className="ml-1 text-blue-400 hover:text-blue-600 font-bold leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  id="symptom-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={symptoms.length === 0 ? "e.g. persistent headache, nausea..." : "Add more..."}
                  className="flex-1 min-w-[120px] outline-none text-sm text-gray-700 bg-transparent h-7"
                />
              </div>

              <p className="text-xs text-gray-400 mb-4">
                Press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Enter</kbd> or{" "}
                <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Comma</kbd> to add
              </p>

              {/* Common suggestions */}
              <div className="mb-5">
                <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1">
                  💡 Common Suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.filter((s) => !symptoms.map(s => s.toLowerCase()).includes(s.toLowerCase())).map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => addSymptom(sym)}
                      className="text-xs border border-gray-200 text-gray-600 px-3 py-1 rounded-full hover:border-blue-400 hover:text-blue-600 transition"
                    >
                      + {sym}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                🤖 AI analysis will take ~3 seconds
              </p>

              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

              <button
                type="button"
                onClick={analyseSymptoms}
                disabled={symptoms.length === 0}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit Symptoms
              </button>
            </div>

            <PrivacyDisclaimer />
          </div>
        )}

        {/* Step 2 — Loading */}
        {step === 2 && (
          <div className="text-center py-10">
            <div className="bg-blue-50 rounded-2xl p-10 mb-6">
              <div className="text-6xl mb-4">🤖</div>
              <AiOutlineLoading3Quarters className="animate-spin text-3xl text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-blue-600 mb-2">Please Wait.....</h2>
              <p className="text-sm text-gray-500">AI analysis will take ~3 seconds</p>
            </div>

            <PrivacyDisclaimer />

            {/* Fix: disabled while loading to prevent race condition */}
            <button
              type="button"
              disabled={loading}
              onClick={() => { if (!loading) { setStep(1); } }}
              className={`mt-6 text-sm underline ${
                loading ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ← Adjust Symptoms
            </button>
          </div>
        )}

        {/* Step 3 — Results */}
        {step === 3 && analysis && (
          <div>

            {/* AI Recommendation Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-medium">
                  AI Recommendation
                </span>
                <span className="text-xs text-gray-500">
                  {analysis.confidence} Confidence Match
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                  urgencyConfig[analysis.urgency]?.color || "bg-gray-100 text-gray-600"
                }`}>
                  {urgencyConfig[analysis.urgency]?.icon} {urgencyConfig[analysis.urgency]?.label}
                </span>
              </div>
              <p className="text-base font-semibold text-gray-800 mb-1">
                🏥 We recommend seeing a{" "}
                <span className="text-blue-600">{analysis.specialisation}</span> specialist
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Based on your reported symptoms, our clinical AI model suggests a consultation with a {analysis.specialisation} specialist.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => { setStep(1); setAnalysis(null); setDoctors([]); }}
                  className="text-xs border border-gray-300 text-gray-600 px-4 py-1.5 rounded-full hover:bg-gray-100 transition"
                >
                  ← Adjust Symptoms
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/doctors")}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  Browse all doctors →
                </button>
              </div>
            </div>

            {/* AI Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

              {/* Possible Conditions */}
              <div className="bg-white rounded-xl border p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-700 mb-3">🔍 Possible Conditions</p>
                <ul className="space-y-1.5">
                  {analysis.possibleConditions?.map((cond, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-blue-400 mt-0.5">•</span> {cond}
                    </li>
                  ))}
                </ul>
              </div>

              {/* What to Expect */}
              <div className="bg-white rounded-xl border p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-700 mb-3">📋 What to Expect</p>
                <p className="text-xs text-gray-600 leading-relaxed">{analysis.whatToExpect}</p>
              </div>

              {/* Do's and Don'ts */}
              <div className="bg-white rounded-xl border p-4 shadow-sm">
                <p className="text-xs font-semibold text-gray-700 mb-2">✅ Do's</p>
                <ul className="space-y-1 mb-3">
                  {analysis.dos?.map((d, i) => (
                    <li key={i} className="text-xs text-green-600 flex items-start gap-1.5">
                      <span className="mt-0.5">✓</span> {d}
                    </li>
                  ))}
                </ul>
                <p className="text-xs font-semibold text-gray-700 mb-2">❌ Don'ts</p>
                <ul className="space-y-1">
                  {analysis.donts?.map((d, i) => (
                    <li key={i} className="text-xs text-red-500 flex items-start gap-1.5">
                      <span className="mt-0.5">✗</span> {d}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Doctors List */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    Available Specialists
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {doctors.length} found
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400">
                    Top-rated {analysis.specialisation} specialists available for your specific needs
                  </p>
                </div>
              </div>

              {doctorsLoading ? (
                <div className="flex justify-center py-8">
                  <AiOutlineLoading3Quarters className="animate-spin text-2xl text-blue-500" />
                </div>
              ) : doctors.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl border p-8 text-center">
                  <p className="text-3xl mb-3">🔍</p>
                  <h3 className="text-base font-semibold text-gray-700 mb-1">No Specialists Found</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    No {analysis.specialisation} specialists are currently available.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/doctors")}
                    className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm hover:bg-blue-700 transition"
                  >
                    Browse All Doctors
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md overflow-hidden transition"
                    >
                      <div className="w-full h-44 bg-gray-50 overflow-hidden">
                        {doc.profilePhoto ? (
                          <img
                            src={doc.profilePhoto}
                            alt={`Dr. ${doc.firstName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-blue-100 bg-blue-50">
                            {doc.firstName?.[0]}
                          </div>
                        )}
                      </div>
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
                        <h3 className="font-bold text-gray-800 text-sm mt-2 mb-2">
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
                        <button
                          type="button"
                          onClick={() => handleBookNow(doc.id)}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition text-xs font-medium"
                        >
                          📅 Book Appointment
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Not what you were looking for */}
            <div className="bg-gray-50 rounded-2xl border p-6 text-center mb-4">
              <p className="text-2xl mb-2">🎯</p>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Not what you were looking for?</h3>
              <p className="text-xs text-gray-400 mb-4">
                If these results don't seem to match your concerns, you can explore other specialties manually.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/doctors")}
                  className="text-xs border border-gray-300 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-100 transition"
                >
                  Browse All Doctors
                </button>
                <button
                  type="button"
                  onClick={() => { setStep(1); setAnalysis(null); setDoctors([]); }}
                  className="text-xs border border-blue-400 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-50 transition flex items-center gap-1"
                >
                  <FiSearch className="text-xs" /> Search Again
                </button>
              </div>
            </div>

            {/* AI Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
              <p className="text-xs text-yellow-700 flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>
                  <strong>Disclaimer:</strong> This is AI-powered and not a medical diagnosis.
                  The suggestions provided are for informational purposes only. Please consult a
                  qualified healthcare professional for proper medical advice and treatment.
                </span>
              </p>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}