import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/SideBar(patient)";
import Header  from "../components/Header(patient)";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiCreditCard } from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;

export default function BillingPage() {
  const navigate                              = useNavigate();
  const [payments, setPayments]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [isSidebarOpen, setIsSidebarOpen]     = useState(false);
  const [refundModal, setRefundModal]         = useState(null);
  const [refunding, setRefunding]             = useState(false);
  const [refundError, setRefundError]         = useState("");
  const [refundSuccess, setRefundSuccess]     = useState("");
  const token = localStorage.getItem("token");

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API}/api/payments/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRefund = async () => {
    setRefunding(true);
    setRefundError("");
    try {
      await axios.delete(
        `${API}/api/payments/${refundModal.id}/refund`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRefundSuccess("Payment refunded and appointment cancelled successfully.");
      await fetchPayments();
      setTimeout(() => {
        setRefundModal(null);
        setRefundSuccess("");
      }, 2000);
    } catch (err) {
      setRefundError(err.response?.data?.message || "Failed to process refund. Please try again.");
    } finally {
      setRefunding(false);
    }
  };

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
          title="Billing"
          setIsSidebarOpen={setIsSidebarOpen}
          notificationsCount={0}
        />

        <div className="bg-white rounded-xl shadow-sm border p-5 mt-4">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Payment History</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <AiOutlineLoading3Quarters className="animate-spin text-2xl text-blue-500" />
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FiCreditCard className="text-4xl mb-3" />
              <p className="text-sm">No payments made yet</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_auto] bg-gray-100 px-3 py-1.5 rounded-md text-gray-600 font-medium text-xs gap-x-4 mb-2">
                <p>Invoice No.</p>
                <p>Doctor</p>
                <p className="text-center">Date Paid</p>
                <p className="text-center">Amount</p>
                <p className="text-right">Status</p>
                <p></p>
              </div>

              <div className="space-y-1.5">
                {payments.map((payment, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_auto] items-center border rounded-md px-3 py-2 gap-x-4 hover:bg-gray-50 transition"
                  >
                    <p className="text-xs font-medium text-blue-600">
                      INV-{String(payment.id).padStart(6, "0")}
                    </p>
                    <div>
                      <p className="text-sm font-medium text-gray-800 truncate">{payment.doctorName}</p>
                      <p className="text-xs text-gray-500 truncate">{payment.specialisation}</p>
                    </div>
                    <p className="text-sm text-center text-gray-600">
                      {new Date(payment.paidAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric"
                      })}
                    </p>
                    <p className="text-sm text-center font-medium text-gray-800">
                      Rs.{(payment.amount + 500).toFixed(2)}
                    </p>
                    <div className="flex justify-end">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {payment.status}
                      </span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/patient/billing/invoice/${payment.id}`)}
                        className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                      >
                        View Invoice
                      </button>
                      <button
                        onClick={() => { setRefundModal(payment); setRefundError(""); setRefundSuccess(""); }}
                        className="text-xs text-red-500 hover:underline whitespace-nowrap"
                      >
                        Cancel & Refund
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-500 text-2xl">↩</span>
              </div>
            </div>

            {refundSuccess ? (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-500 text-2xl">✓</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Refund Successful!</h2>
                <p className="text-sm text-gray-500">{refundSuccess}</p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-800 text-center mb-2">
                  Cancel & Refund Payment?
                </h2>
                <p className="text-sm text-gray-500 text-center mb-5">
                  This will cancel your appointment and refund your payment. This action cannot be undone.
                </p>

                {/* Payment details */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Invoice</span>
                    <span className="font-medium text-blue-600">
                      INV-{String(refundModal.id).padStart(6, "0")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Doctor</span>
                    <span className="font-medium text-gray-800">{refundModal.doctorName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Appointment</span>
                    <span className="font-medium text-gray-800">
                      {new Date(refundModal.date).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric"
                      })} · {refundModal.time}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Refund Amount</span>
                    <span className="font-semibold text-green-600">
                      Rs.{(refundModal.amount + 500).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-5">
                  <p className="text-xs text-orange-600">
                    ⚠ Once cancelled, the appointment slot will be released and your payment will be refunded within 3-5 business days (mock).
                  </p>
                </div>

                {refundError && (
                  <p className="text-red-500 text-sm text-center mb-3">{refundError}</p>
                )}

                <button
                  onClick={handleRefund}
                  disabled={refunding}
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl mb-3 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {refunding && <AiOutlineLoading3Quarters className="animate-spin" />}
                  {refunding ? "Processing Refund..." : "Yes, Cancel & Refund"}
                </button>
                <button
                  onClick={() => setRefundModal(null)}
                  disabled={refunding}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition"
                >
                  No, Keep Payment
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}