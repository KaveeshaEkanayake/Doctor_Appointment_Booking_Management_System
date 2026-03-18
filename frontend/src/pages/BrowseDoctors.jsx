import { useState } from "react";
import { doctors } from "../assets/doctors";

function BrowseDoctors() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 10;

  const specialtyColors = {
    Neurologist: "border-teal-500 text-teal-600",
    Cardiologist: "border-blue-500 text-blue-600",
    Psychologist: "border-indigo-500 text-indigo-600",
    Pediatrician: "border-pink-500 text-pink-600",
    Gastroenterologist: "border-orange-500 text-orange-600",
  };

  // Filter doctors by search input
  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

  // Handle page navigation
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Split current page doctors into rows: 4 + 4 + 2
  const rows = [
    currentDoctors.slice(0, 4),
    currentDoctors.slice(4, 8),
    currentDoctors.slice(8, 10),
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-10 flex flex-col items-center">
      {/* PAGE TITLE */}
      <h1 className="text-5xl font-bold text-blue-600 text-center mb-10">
        Browse All Doctors
      </h1>

      {/* SEARCH BAR */}
      <div className="flex justify-center mb-10">

        <div className="flex items-center border border-blue-500 rounded-full p-1 w-[620px] bg-white overflow-hidden">

          <input
            type="text"
            placeholder="Search for Doctors By Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-6 py-2 bg-transparent outline-none"
          />

          <button className="bg-blue-600 text-white px-6 py-2 rounded-full">
            Search
          </button>

        </div>

      </div>

      {/* DOCTOR GRID */}
      {currentDoctors.length === 0 ? (
        <p className="text-center text-gray-500 text-xl">No doctors available</p>
      ) : (
        <div className="flex flex-col gap-6 w-full items-center">
          {rows.map((rowDoctors, rowIndex) =>
            rowDoctors.length > 0 ? (
              <div
                key={rowIndex}
                className="flex flex-wrap gap-6 justify-center w-full"
              >
                {rowDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden w-[23%]"
                  >
                    <div className="w-full h-64 bg-gray-100 overflow-hidden">
                      <img
                        src={doc.image}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className={`text-base font-semibold pl-2 border-l-4 ${
                            specialtyColors[doc.specialty] || "border-gray-400 text-gray-600"
                          }`}
                        >
                          {doc.specialty}
                        </span>

                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            doc.available
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {doc.available ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      <h3 className="font-semibold text-2xl mb-4 mt-4">{doc.name}</h3>
                      <hr className="my-4 border-gray-200" />

                      <button className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full hover:bg-blue-400 transition">
                        📅 Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null
          )}
        </div>
      )}

      {/* PAGINATION BUTTONS */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-10">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1 rounded-full border bg-white hover:bg-gray-200"
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => handlePageChange(num)}
              className={`px-3 py-1 rounded-full border ${
                currentPage === num ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1 rounded-full border bg-white hover:bg-gray-200"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default BrowseDoctors;