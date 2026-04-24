import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/SideBar(patient)";
import Header  from "../components/Header(patient)";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const API         = import.meta.env.VITE_API_URL;
const SERVICE_FEE = 500;

export default function InvoicePage() {
  const navigate      = useNavigate();
  const { paymentId } = useParams();
  const [payment, setPayment]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await axios.get(`${API}/api/payments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const found = res.data.payments.find((p) => p.id === parseInt(paymentId));
        setPayment(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayment();
  }, [paymentId]);

  const totalAmount    = payment ? payment.amount + SERVICE_FEE : 0;
  const invoiceNumber  = payment ? `INV-${String(payment.id).padStart(6, "0")}` : "";

  const handlePrint = () => {
    window.print();
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
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 print:hidden`}
      >
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto">
        <Header
          title="Invoice"
          setIsSidebarOpen={setIsSidebarOpen}
          notificationsCount={0}
        />

        <div className="flex justify-center mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <AiOutlineLoading3Quarters className="animate-spin text-2xl text-blue-500" />
            </div>
          ) : !payment ? (
            <p className="text-gray-500">Payment not found.</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-6 w-full max-w-md">

              {/* Header actions */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => navigate("/patient/billing")}
                  className="flex items-center gap-2 text-gray-500 text-sm hover:text-gray-700"
                >
                  ← Payment Record
                </button>
                <button
                  onClick={handlePrint}
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition print:hidden"
                >
                  Download PDF
                </button>
              </div>

              {/* Invoice number */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-gray-800">Invoice</h2>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {invoiceNumber}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500">Appointment with :</p>
                <p className="text-sm font-semibold text-gray-800">{payment.doctorName}</p>
                <p className="text-xs text-gray-500">{payment.specialisation}</p>
              </div>

              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Appointment Status:</span>
                <span className="text-green-600 font-medium">Paid</span>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Consultation Fee :</span>
                <span className="text-gray-800">Rs.{payment.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Service Fee :</span>
                <span className="text-gray-800">Rs.{SERVICE_FEE.toFixed(2)}</span>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between text-sm font-semibold mb-4">
                <span className="text-gray-800">Total Amount :</span>
                <span className="text-gray-800">Rs.{totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Payment Method :</span>
                <span className="text-blue-600 font-medium">
                  VISA **** {payment.cardLast4}
                </span>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Date :</span>
                <span className="text-gray-700">
                  {new Date(payment.paidAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric"
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-500">Time :</span>
                <span className="text-gray-700">
                  {new Date(payment.paidAt).toLocaleTimeString("en-US", {
                    hour: "2-digit", minute: "2-digit"
                  })}
                </span>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}