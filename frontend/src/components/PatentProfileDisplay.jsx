// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function PatientProfileDisplay() {
//   const [patient, setPatient] = useState(null);

//   useEffect(() => {
//     axios.get("http://localhost:5000/api/patient/1") // example ID
//       .then(res => setPatient(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   if (!patient) return <p>Loading...</p>;

//   return (
//     <main className="flex-1 p-8">
//       <h2 className="text-2xl font-semibold mb-6">Hi, {patient.name}!</h2>

//       {/* My Profile Section */}
//       <div className="bg-white shadow-md rounded-lg p-6 mb-6">
//         <div className="flex justify-between items-start mb-4">
//           <h3 className="text-xl font-bold">My Profile</h3>
//           <button className="text-blue-600 hover:underline text-sm">✎ Edit</button>
//         </div>
//         <div className="flex items-center space-x-4">
//           <img
//             src={patient.photoUrl || "/default-photo.png"}
//             alt="Patient"
//             className="w-20 h-20 rounded-full border"
//           />
//           <div>
//             <p className="text-lg font-semibold">{patient.name}</p>
//             <p className="text-gray-600">{patient.email}</p>
//             <p className="text-gray-600">📍 {patient.address}</p>
//           </div>
//         </div>
//       </div>

//       {/* Personal Information Section */}
//       <div className="bg-white shadow-md rounded-lg p-10">
//         <div className="flex justify-between items-start mb-10">
//           <h3 className="text-xl font-bold">Personal Information</h3>
//           <button className="text-blue-600 hover:underline text-sm">✎ Edit</button>
//         </div>
//         <div className="grid grid-cols-2 gap-10">
//           <div>
//             <p className="text-gray-700 font-semibold ml-20">Name</p>
//             <p className="text-gray-600 ml-20">{patient.name}</p>
//           </div>
//           <div>
//             <p className="text-gray-700 font-semibold">Phone Number</p>
//             <p className="text-gray-600">{patient.phone}</p>
//           </div>
//           <div>
//             <p className="text-gray-700 font-semibold ml-20">Date of Birth</p>
//             <p className="text-gray-600 ml-20">{new Date(patient.dob).toLocaleDateString()}</p>
//           </div>
//           <div>
//             <p className="text-gray-700 font-semibold">Address</p>
//             <p className="text-gray-600">{patient.address}</p>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }


// ----------------------------------------------------------------------------------------------

import { useEffect, useState } from "react";
import axios from "axios";

export default function PatientProfileDisplay() {
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/patient/1")
      .then(res => setPatient(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!patient) return <p className="p-4">Loading...</p>;

  return (
    <main className="flex-1 p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-semibold mb-6">
        Hi, {patient.name}!
      </h2>

      {/* My Profile Section */}
      <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg md:text-xl font-bold">My Profile</h3>
          <button className="text-blue-600 hover:underline text-sm">✎ Edit</button>
        </div>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <img
            src={patient.photoUrl || "/default-photo.png"}
            alt="Patient"
            className="w-20 h-20 rounded-full border"
          />
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold">{patient.name}</p>
            <p className="text-gray-600">{patient.email}</p>
            <p className="text-gray-600">📍 {patient.address}</p>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-white shadow-md rounded-lg p-6 md:p-10">
        <div className="flex justify-between items-center mb-6 md:mb-10">
          <h3 className="text-lg md:text-xl font-bold">Personal Information</h3>
          <button className="text-blue-600 hover:underline text-sm">✎ Edit</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div>
            <p className="text-gray-700 font-semibold">Name</p>
            <p className="text-gray-600">{patient.name}</p>
          </div>
          <div>
            <p className="text-gray-700 font-semibold">Phone Number</p>
            <p className="text-gray-600">{patient.phone}</p>
          </div>
          <div>
            <p className="text-gray-700 font-semibold">Date of Birth</p>
            <p className="text-gray-600">{new Date(patient.dob).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-700 font-semibold">Address</p>
            <p className="text-gray-600">{patient.address}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
