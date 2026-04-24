import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/SideBar(patient)";
import Header  from "../components/Header(patient)";

const API         = import.meta.env.VITE_API_URL;
const SERVICE_FEE = 500;

export default function PaymentPage() {
  const navigate          = useNavigate();
  const { appointmentId } = useParams();
  const { state }         = useLocation();
  const appointment       = state?.appointment;

  const [step, setStep]               = useState(1);
  const [payment, setPayment]         = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cardName,    setCardName]    = useState("");
  const [cardNumber,  setCardNumber]  = useState("");
  const [month,       setMonth]       = useState("");
  const [year,        setYear]        = useState("");
  const [cvv,         setCvv]         = useState("");
  const [errors,      setErrors]      = useState({});
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState("");

  const consultationFee = appointment?.consultationFee || 0;
  const totalAmount     = consultationFee + SERVICE_FEE;

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    return cleaned.replace(/(.{4})/g, "$1 ").trim();
  };

  const validate = () => {
    const newErrors = {};
    if (!cardName.trim()) newErrors.cardName = "Name on card is required";
    if (cardNumber.replace(/\s/g, "").length !== 16) newErrors.cardNumber = "Card number must be 16 digits";
    if (!month) newErrors.month = "Month is required";
    if (!year)  newErrors.year  = "Year is required";
    if (!/^\d{3,4}$/.test(cvv)) newErrors.cvv = "CVV must be 3-4 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const token  = localStorage.getItem("token");
      const expiry = `${month}/${year.slice(-2)}`;
      const res = await axios.post(
        `${API}/api/payments`,
        {
          appointmentId: parseInt(appointmentId),
          cardName:      cardName.trim(),
          cardNumber:    cardNumber.replace(/\s/g, ""),
          expiry,
          cvv,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayment(res.data.payment);
      setStep(3);
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const invoiceNumber = payment ? `INV-${String(payment.id).padStart(6, "0")}` : "";

  return (
    <div className="flex h-screen bg-[#F6FAFF]">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className={`fixed md:static top-0 left-0 h-full transform transition-transform duration-300 z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto">
        <Header
          title="Payment"
          setIsSidebarOpen={setIsSidebarOpen}
          notificationsCount={0}
        />

        <div className="flex justify-center mt-6">

          {/* Step 1 — Payment Summary */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 w-full max-w-md">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 text-sm mb-4 hover:text-gray-700"
              >
                ← Back
              </button>

              <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h2>

              <p className="text-sm font-medium text-gray-800 mb-1">
                Appointment with {appointment?.doctorName}
              </p>
              <p className="text-xs text-gray-500">
                Date : {appointment ? new Date(appointment.date).toLocaleDateString("en-CA") : "—"}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Time : {appointment?.time}
              </p>

              <hr className="mb-4" />

              <div className="flex justify-between text-sm text-gray-700 mb-2">
                <span>Consultation Fee:</span>
                <span>Rs.{consultationFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700 mb-4">
                <span>Service Fee:</span>
                <span>Rs.{SERVICE_FEE.toFixed(2)}</span>
              </div>

              <hr className="mb-4" />

              <div className="flex justify-between font-semibold text-gray-800 mb-6">
                <span>Total Amount :</span>
                <span>Rs.{totalAmount.toFixed(2)}</span>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Proceed to Pay
              </button>
            </div>
          )}

          {/* Step 2 — Card Details */}
          {step === 2 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 w-full max-w-md">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-gray-500 text-sm mb-4 hover:text-gray-700"
              >
                ← Back
              </button>

              <h2 className="text-lg font-semibold text-gray-800 mb-4">Credit Card Details</h2>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-gray-500">Payment Method</span>
                <div className="flex gap-2 ml-2">
                  <span className="text-xs border rounded px-2 py-0.5 text-red-500 font-bold">MC</span>
                  <span className="text-xs border rounded px-2 py-0.5 text-blue-600 font-bold">VISA</span>
                  <span className="text-xs border rounded px-2 py-0.5 text-blue-400 font-bold">AE</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">Name on card</label>
                <input
                  type="text"
                  placeholder="John Smith"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
              </div>

              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">Card number</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
              </div>

              <div className="mb-3">
                <label className="text-xs text-gray-500 mb-1 block">Card expiration</label>
                <div className="flex gap-2">
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const m = String(i + 1).padStart(2, "0");
                      return <option key={m} value={m}>{m}</option>;
                    })}
                  </select>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const y = new Date().getFullYear() + i;
                      return <option key={y} value={y}>{y}</option>;
                    })}
                  </select>
                </div>
                {(errors.month || errors.year) && (
                  <p className="text-red-500 text-xs mt-1">Expiry date is required</p>
                )}
              </div>

              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1 block">CVV</label>
                <input
                  type="password"
                  placeholder="Code"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
              </div>

              {submitError && (
                <p className="text-red-500 text-sm text-center mb-3">{submitError}</p>
              )}

              <button
                onClick={handlePayment}
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Continue"}
              </button>
            </div>
          )}

          {/* Step 3 — Success */}
          {step === 3 && (
            <div className="bg-white rounded-xl shadow-sm border p-6 w-full max-w-md text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-left">
                ← Payment Successful!
              </h2>

              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl">✓</span>
              </div>

              <h2 className="text-lg font-semibold text-gray-800 mb-2">Payment Complete!</h2>
              <p className="text-sm text-gray-500 mb-4">
                Your Payment of Rs.{totalAmount.toFixed(2)} has been received
              </p>

              <div className="bg-gray-50 rounded-lg p-4 text-left text-sm mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Invoice Number:</span>
                  <span className="text-gray-800 font-medium">{invoiceNumber}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Appointment Status:</span>
                  <span className="text-green-600 font-medium">Paid</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Recorded On:</span>
                  <span className="text-gray-700 text-xs">
                    {payment ? new Date(payment.paidAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    }) + " at " + new Date(payment.paidAt).toLocaleTimeString("en-US", {
                      hour: "2-digit", minute: "2-digit"
                    }) : "—"}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/patient/billing/invoice/${payment?.id}`)}
                  className="text-blue-500 text-xs hover:underline mt-1"
                >
                  Go to Payment Record
                </button>
              </div>

              <button
                onClick={() => navigate("/patient/billing")}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Back to Dashboard
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}