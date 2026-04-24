import React, { useState, useMemo } from "react";
import {
  FaPaypal,
  FaGooglePay,
  FaApplePay,
  FaCcVisa,
  FaCcMastercard,
  FaDownload
} from "react-icons/fa";

export default function PaymentHistory() {

  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // 🔽 PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const payments = [
    { id: "INV-001", doctor: "Dr. Sandun Perera", date: "2026-03-12T09:30:00", method: "PayPal", amount: "1200.00" },
    { id: "INV-002", doctor: "Dr. Nimal Surendra", date: "2026-02-05T11:15:00", method: "Visa", amount: "850.00" },
    { id: "INV-003", doctor: "Dr. Kavindi Silva", date: "2026-01-25T14:45:00", method: "Mastercard", amount: "600.00" },
    { id: "INV-004", doctor: "Dr. Isuru Bandara", date: "2026-01-10T08:00:00", method: "Google Pay", amount: "950.00" },
    { id: "INV-005", doctor: "Dr. Dilini Perera", date: "2025-12-28T16:20:00", method: "Apple Pay", amount: "1500.00" },
    { id: "INV-006", doctor: "Dr. Amal Silva", date: "2025-11-18T09:15:00", method: "Visa", amount: "2000.00" },
    { id: "INV-007", doctor: "Dr. Ravi Perera", date: "2025-10-02T12:00:00", method: "Mastercard", amount: "750.00" }
  ];

  // 🔽 FILTER + SORT
  const filteredPayments = useMemo(() => {
    return payments
      .filter(p =>
        p.doctor.toLowerCase().includes(search.toLowerCase()) ||
        new Date(p.date).toLocaleDateString().includes(search)
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [search]);

  // 🔽 PAGINATION
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  // 💳 ICONS (react-icons)
  const getIcon = (method) => {
    switch (method) {
      case "PayPal": return <FaPaypal className="text-2xl" />;
      case "Visa": return <FaCcVisa className="text-2xl" />;
      case "Mastercard": return <FaCcMastercard className="text-2xl" />;
      case "Google Pay": return <FaGooglePay className="text-2xl" />;
      case "Apple Pay": return <FaApplePay className="text-2xl" />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#c3cfe4]">

      <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto">

        <h1 className="text-3xl font-bold mb-10">Payment History</h1>

        <div className="bg-white border rounded-2xl p-6">

          {/* 🔽 SEARCH */}
          <div className="flex gap-4 mb-6">

            <input
              type="text"
              placeholder="Search doctor or date..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-72 border px-3 py-2 rounded-lg text-sm"
            />

            <button
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
              className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm text-white font-semibold"
            >
              Reset
            </button>

          </div>

          {/* 🔽 TABLE HEADER */}
          <div className="grid grid-cols-[1.2fr_2fr_2fr_2fr_1fr_0.5fr] bg-[#c3cfe4] px-4 py-3 rounded-lg text-base font-bold">
            <p>Invoice No</p>
            <p>Doctor Name</p>
            <p>Date & Time</p>
            <p>Payment Method</p>
            <p>Amount</p>
            <p></p>
          </div>

          {/* 🔽 TABLE BODY */}
          <div className="mt-2 space-y-2">

            {paginatedPayments.length === 0 ? (
              <p className="text-center text-gray-500 py-6">
                No payments found
              </p>
            ) : (
              paginatedPayments.map(p => (
                <div
                  key={p.id}
                  className="grid grid-cols-[1.2fr_2fr_2fr_2fr_1fr_0.5fr] border px-4 py-3 rounded-lg items-center"
                >
                  <p>{p.id}</p>
                  <p>{p.doctor}</p>
                  <p>{new Date(p.date).toLocaleString()}</p>

                  {/* 💳 PAYMENT METHOD */}
                  <div className="flex items-center gap-3">
                    {getIcon(p.method)}
                    <span className="text-sm">{p.method}</span>
                  </div>

                  <p className="font-semibold">Rs. {p.amount}</p>

                  {/* ⬇ DOWNLOAD */}
                  <button
                    onClick={() => setSelectedInvoice(p)}
                    className="text-blue-600 hover:text-blue-800 text-xl"
                  >
                    <FaDownload />
                  </button>

                </div>
              ))
            )}

          </div>

          {/* 🔽 PAGINATION */}
          <div className="flex justify-center items-center mt-6 gap-2">

            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;

              if (
                page === 1 ||
                page === totalPages ||
                Math.abs(currentPage - page) <= 1
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                );
              }

              if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return <span key={page}>...</span>;
              }

              return null;
            })}

            <button
              onClick={() =>
                setCurrentPage(prev => Math.min(prev + 1, totalPages))
              }
              className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
            >
              Next
            </button>

          </div>

        </div>

      </div>

      {/* 🧾 MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">

            <h2 className="text-xl font-bold mb-4">Invoice</h2>

            <p><strong>Invoice No:</strong> {selectedInvoice.id}</p>
            <p><strong>Doctor Name:</strong> {selectedInvoice.doctor}</p>
            <p><strong>Date:</strong> {new Date(selectedInvoice.date).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> {selectedInvoice.method}</p>
            <p><strong>Amount Paid:</strong> Rs. {selectedInvoice.amount}</p>

            <div className="mt-6 flex justify-between">

              <button
                onClick={() => setSelectedInvoice(null)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Close
              </button>

              <button
                onClick={() => alert("Downloading PDF...")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                <FaDownload />
                Download Invoice
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}