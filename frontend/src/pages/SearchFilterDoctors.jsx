import { useState } from "react";
import { doctors } from "../assets/doctors";

function SearchFilterDoctors() {

  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [gender, setGender] = useState("");
  const [availability, setAvailability] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortOrder, setSortOrder] = useState("");

  const [openSpecialty, setOpenSpecialty] = useState(true);
  const [openGender, setOpenGender] = useState(true);
  const [openAvailability, setOpenAvailability] = useState(true);

  const specialtyColors = {
    Neurologist: "border-teal-500 text-teal-600",
    Cardiologist: "border-blue-500 text-blue-600",
    Psychologist: "border-indigo-500 text-indigo-600",
    Pediatrician: "border-pink-500 text-pink-600",
    Gastroenterologist: "border-orange-500 text-orange-600",
  };

  const filteredDoctors = doctors
    .filter((doc) => {

      const matchesSearch =
        doc.name.toLowerCase().includes(search.toLowerCase());

      const matchesSpecialty =
        specialty ? doc.specialty === specialty : true;

      const matchesGender =
        gender ? doc.gender === gender : true;

      let matchesAvailability = true;

      if (onlyAvailable)
        matchesAvailability = doc.available;

      return (
        matchesSearch &&
        matchesSpecialty &&
        matchesGender &&
        matchesAvailability
      );
    })
    .sort((a, b) => {

      if (sortOrder === "low")
        return a.id - b.id;

      if (sortOrder === "high")
        return b.id - a.id;

      return 0;
    });

  return (

    <div className="min-h-screen bg-gray-100 p-10">

      {/* TITLE */}

      <h1 className="text-5xl font-bold text-blue-600 text-center mb-10">
        Search Doctors
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

      <div className="flex gap-8">

        {/* FILTER SIDEBAR */}

        <aside className="w-72 bg-white rounded-xl p-6 shadow-sm h-fit mb-20">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-3xl font-bold">
              Filter
            </h2>

            <button
              className="underline text-blue-600 text-sm"
              onClick={() => {
                setSpecialty("");
                setGender("");
                setAvailability("");
              }}
            >
              Clear All
            </button>

          </div>

          <hr className="mb-4" />

          {/* SPECIALTIES */}

          <div className="mb-4">

            <div
              className="flex justify-between cursor-pointer text-xl font-semibold mb-2"
              onClick={() => setOpenSpecialty(!openSpecialty)}
            >
              Specialties
              <span>{openSpecialty ? "⌃" : "⌄"}</span>
            </div>

            {openSpecialty && [

              "Neurologist",
              "Cardiologist",
              "Psychologist",
              "Pediatrician",
              "Gastroenterologist",

            ].map((spec) => (

              <label key={spec} className="flex items-center gap-2 mb-2">

                <input
                  type="radio"
                  name="specialty"
                  value={spec}
                  checked={specialty === spec}
                  onChange={(e) => setSpecialty(e.target.value)}
                />

                {spec}

              </label>

            ))}

          </div>

          <hr className="mb-4" />

          {/* GENDER */}

          <div className="mb-4">

            <div
              className="flex justify-between cursor-pointer text-xl font-semibold mb-2"
              onClick={() => setOpenGender(!openGender)}
            >
              Gender
              <span>{openGender ? "⌃" : "⌄"}</span>
            </div>

            {openGender && ["Male", "Female"].map((g) => (

              <label key={g} className="flex items-center gap-2 mb-2">

                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={(e) => setGender(e.target.value)}
                />

                {g}

              </label>

            ))}

          </div>

          <hr className="mb-4" />

          {/* AVAILABILITY */}

          <div>

            <div
              className="flex justify-between cursor-pointer text-xl font-semibold mb-2"
              onClick={() => setOpenAvailability(!openAvailability)}
            >
              Availability
              <span>{openAvailability ? "⌃" : "⌄"}</span>
            </div>

            {openAvailability && (

              <>
                <label className="flex items-center gap-2 mb-2">
                  <input type="radio" name="availability" />
                  Available Today
                </label> 

                <label className="flex items-center gap-2 mb-2">
                  <input type="radio" name="availability" />
                  Available Tomorrow
                </label>

                <label className="flex items-center gap-2 mb-2">
                  <input type="radio" name="availability" />
                  Available in Next 7 Days
                </label>

                <label className="flex items-center gap-2 mb-2">
                  <input type="radio" name="availability" />
                  Available in Next 30 Days
                </label>
              </>

            )}

          </div>

        </aside>

        {/* MAIN CONTENT */}

        <main className="flex-1">

          {/* TOP BAR */}

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-lg font-semibold">

              Showing
              <span className="text-blue-600">
                {" "}{filteredDoctors.length}{" "}
              </span>

              Doctors For You

            </h2>

            <div className="flex items-center gap-6">

              {/* AVAILABILITY TOGGLE */}

              <div className="flex items-center gap-2">

                Availability

                <button
                  onClick={() => setOnlyAvailable(true)}
                  className={`px-2 py-1 rounded ${
                    onlyAvailable
                      ? "bg-green-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  ✓
                </button>

                <button
                  onClick={() => setOnlyAvailable(false)}
                  className={`px-2 py-1 rounded ${
                    !onlyAvailable
                      ? "bg-gray-400 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  ✗
                </button>

              </div>

              {/* SORT */}

              <div className="flex items-center gap-2">

                Sort By

                <select
                  className="border rounded px-2 py-1"
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="">
                    Select
                  </option>

                  <option value="low">
                    Price (Low to High)
                  </option>

                  <option value="high">
                    Price (High to Low)
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* DOCTOR GRID */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredDoctors.map((doc) => (

              <div
                key={doc.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden"
              >

                {/* IMAGE */}

                <div className="w-full h-64 bg-gray-100 overflow-hidden">

                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-full h-full object-cover"
                  />

                </div>

                {/* CONTENT */}

                <div className="p-4">

                  <div className="flex justify-between items-center mb-2">

                    <span
                      className={`text-base font-semibold pl-2 border-l-4 ${
                        specialtyColors[doc.specialty] ||
                        "border-gray-400 text-gray-600"
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

                  <h3 className="font-semibold text-2xl mb-4 mt-4">
                    {doc.name}
                  </h3>

                  <hr className="my-4 border-gray-200" />

                  <button
                    className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full hover:bg-blue-400 transition"
                  >
                    📅 Book Now
                  </button>

                </div>

              </div>

            ))}

          </div>

        </main>

      </div>

    </div>

  );
}

export default SearchFilterDoctors;