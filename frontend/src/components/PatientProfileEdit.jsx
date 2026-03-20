// export default function PatientProfileEdit({ onCancel }) {
//   return (
//     <div className="bg-white shadow-md rounded-lg p-10 space-y-6">
//       <h3 className="text-xl font-bold mb-6">Edit Profile</h3>

//       {/* Name */}
//       <div>
//         <label className="block text-gray-700 font-semibold">Name</label>
//         <input
//           type="text"
//           defaultValue="Shane Doe"
//           className="w-full border rounded-lg p-2 mt-2"
//         />
//       </div>

//       {/* Email */}
//       <div>
//         <label className="block text-gray-700 font-semibold">Email</label>
//         <input
//           type="email"
//           defaultValue="shane@gmail.com"
//           className="w-full border rounded-lg p-2 mt-2"
//         />
//       </div>

//       {/* Phone & DOB side by side */}
//       <div className="grid grid-cols-2 gap-6">
//         <div>
//           <label className="block text-gray-700 font-semibold">Phone</label>
//           <input
//             type="text"
//             defaultValue="+94 771212345"
//             className="w-full border rounded-lg p-2 mt-2"
//           />
//         </div>
//         <div>
//           <label className="block text-gray-700 font-semibold">Date of Birth</label>
//           <input
//             type="date"
//             defaultValue="2001-12-21"
//             className="w-full border rounded-lg p-2 mt-2"
//           />
//         </div>
//       </div>

//       {/* Address */}
//       <div>
//         <label className="block text-gray-700 font-semibold">Address</label>
//         <input
//           type="text"
//           defaultValue="Maple street, New York, USA"
//           className="w-full border rounded-lg p-2 mt-2"
//         />
//       </div>

//       {/* Buttons */}
//       <div className="flex justify-end space-x-4 mt-6">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
//         >
//           Discard Changes
//         </button>
//         <button
//           type="button"
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           Save Profile
//         </button>
//       </div>
//     </div>
//   );
// }

// -------------------------------------------------------------------------------

// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function PatientProfileEdit({ onCancel }) {
//   const [formData, setFormData] = useState(null);

//   useEffect(() => {
//     axios.get("http://localhost:5000/api/patient/1")
//       .then(res => setFormData(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   if (!formData) return <p className="p-4">Loading...</p>;

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSave = () => {
//     axios.put("http://localhost:5000/api/patient/1", formData)
//       .then(res => {
//         alert("Profile updated successfully!");
//         onCancel(); // go back to display view
//       })
//       .catch(err => console.error(err));
//   };

//   return (
//     <div className="bg-white shadow-md rounded-lg p-10 space-y-6">
//       <h3 className="text-xl font-bold mb-6">Edit Profile</h3>

//       {/* Name */}
//       <div>
//         <label className="block text-gray-700 font-semibold">Name</label>
//         <input
//           type="text"
//           name="name"
//           value={formData.name}
//           onChange={handleChange}
//           className="w-full border rounded-lg p-2 mt-2"
//         />
//       </div>

//       {/* Email */}
//       <div>
//         <label className="block text-gray-700 font-semibold">Email</label>
//         <input
//           type="email"
//           name="email"
//           value={formData.email}
//           onChange={handleChange}
//           className="w-full border rounded-lg p-2 mt-2"
//         />
//       </div>

//       {/* Phone & DOB side by side */}
//       <div className="grid grid-cols-2 gap-6">
//         <div>
//           <label className="block text-gray-700 font-semibold">Phone</label>
//           <input
//             type="text"
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//             className="w-full border rounded-lg p-2 mt-2"
//           />
//         </div>
//         <div>
//           <label className="block text-gray-700 font-semibold">Date of Birth</label>
//           <input
//             type="date"
//             name="dob"
//             value={formData.dob?.substring(0,10)} // format YYYY-MM-DD
//             onChange={handleChange}
//             className="w-full border rounded-lg p-2 mt-2"
//           />
//         </div>
//       </div>

//       {/* Address */}
//       <div>
//         <label className="block text-gray-700 font-semibold">Address</label>
//         <input
//           type="text"
//           name="address"
//           value={formData.address}
//           onChange={handleChange}
//           className="w-full border rounded-lg p-2 mt-2"
//         />
//       </div>

//       {/* Buttons */}
//       <div className="flex justify-end space-x-4 mt-6">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
//         >
//           Discard Changes
//         </button>
//         <button
//           type="button"
//           onClick={handleSave}
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           Save Profile
//         </button>
//       </div>
//     </div>
//   );
// }


// -----------------------------------------------------------------------------------

// import { useEffect, useState } from "react";
// import axios from "axios";

// export default function PatientProfileEdit({ onCancel }) {
//   const [formData, setFormData] = useState(null);

//   useEffect(() => {
//     axios.get("http://localhost:5000/api/patient/1")
//       .then(res => setFormData(res.data))
//       .catch(err => console.error(err));
//   }, []);

//   if (!formData) return <p className="p-4">Loading...</p>;

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSave = () => {
//     axios.put("http://localhost:5000/api/patient/1", formData)
//       .then(() => {
//         alert("Profile updated successfully!");
//         onCancel();
//       })
//       .catch(err => console.error(err));
//   };

//   return (
//     <div className="bg-white shadow-md rounded-lg p-10 space-y-6">
//       <h3 className="text-xl font-bold mb-6">Edit Profile</h3>

//       <div>
//         <label className="block text-gray-700 font-semibold">Name</label>
//         <input
//           type="text"
//           name="name"
//           value={formData.name || ""}
//           onChange={handleChange}
//           className="w-full border rounded-lg p-2 mt-2"
//         />
//       </div>

//       <div>
//         <label className="block text-gray-700 font-semibold">Email</label>
//         <input
//           type="email"
//           name="email"
//           value={formData.email || ""}
//           onChange={handleChange}
//           className="w-full border rounded-lg p-2 mt-2"
//         />
//       </div>

//       <div className="grid grid-cols-2 gap-6">
//         <div>
//           <label className="block text-gray-700 font-semibold">Phone</label>
//           <input
//             type="text"
//             name="phone"
//             value={formData.phone || ""}
//             onChange={handleChange}
//             className="w-full border rounded-lg p-2 mt-2"
//           />
//         </div>
//         <div>
//           <label className="block text-gray-700 font-semibold">Date of Birth</label>
//           <input
//             type="date"
//             name="dob"
//             value={formData.dob ? formData.dob.substring(0,10) : ""}
//             onChange={handleChange}
//             className="w-full border rounded-lg p-2 mt-2"
//           />
//         </div>
//       </div>

//       <div>
//         <label className="block text-gray-700 font-semibold">Address</label>
//         <input
//           type="text"
//           name="address"
//           value={formData.address || ""}
//           onChange={handleChange}
//           className="w-full border rounded-lg p-2 mt-2"
//         />
//       </div>

//       <div className="flex justify-end space-x-4 mt-6">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
//         >
//           Discard Changes
//         </button>
//         <button
//           type="button"
//           onClick={handleSave}
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           Save Profile
//         </button>
//       </div>
//     </div>
//   );
// }

// =================================================================================================================

// export default function PatientProfileEdit({ onCancel }) {
//   return (
//     <div className="bg-white shadow-md rounded-lg p-10 space-y-6">
//       <h3 className="text-xl font-bold mb-6">Edit Profile</h3>

//       {/* Name */}
//       <div>
//         <label className="block text-gray-700 font-semibold">Name</label>
//         <input
//           type="text"
//           defaultValue="Shane Doe"
//           className="w-full border rounded-lg p-2 mt-2"
//         />
//       </div>

//       {/* Email */}
//       <div>
//         <label className="block text-gray-700 font-semibold">Email</label>
//         <input
//           type="email"
//           defaultValue="shane@gmail.com"
//           className="w-full border rounded-lg p-2 mt-2"
//         />
//       </div>

//       {/* Phone & DOB side by side */}
//       <div className="grid grid-cols-2 gap-6">
//         <div>
//           <label className="block text-gray-700 font-semibold">Phone</label>
//           <input
//             type="text"
//             defaultValue="+94 771212345"
//             className="w-full border rounded-lg p-2 mt-2"
//           />
//         </div>
//         <div>
//           <label className="block text-gray-700 font-semibold">Date of Birth</label>
//           <input
//             type="date"
//             defaultValue="2001-12-21"
//             className="w-full border rounded-lg p-2 mt-2"
//           />
//         </div>
//       </div>

//       {/* Address */}
//       <div>
//         <label className="block text-gray-700 font-semibold">Address</label>
//         <input
//           type="text"
//           defaultValue="Maple street, New York, USA"
//           className="w-full border rounded-lg p-2 mt-2"
//         />
//       </div>

//       {/* Buttons */}
//       <div className="flex justify-end space-x-4 mt-6">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
//         >
//           Discard Changes
//         </button>
//         <button
//           type="button"
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           Save Profile
//         </button>
//       </div>
//     </div>
//   );
// }

// ==============================================================================================================

// export default function PatientProfileEdit({ onCancel }) {
//   return (
//     <div className="bg-white shadow-md rounded-lg p-10 space-y-6">
//       <h3 className="text-xl font-bold mb-6">Edit Profile</h3>

//       {/* Name */}
//       <div>
//         <label className="block text-gray-700 font-semibold">Name</label>
//         <input
//           type="text"
//           defaultValue="Shane Doe"
//           className="w-full border rounded-lg p-2 mt-2"
//         />
//       </div>

//       {/* Email */}
//       <div>
//         <label className="block text-gray-700 font-semibold">Email</label>
//         <input
//           type="email"
//           defaultValue="shane@gmail.com"
//           className="w-full border rounded-lg p-2 mt-2"
//         />
//       </div>

//       {/* Phone & DOB side by side */}
//       <div className="grid grid-cols-2 gap-6">
//         <div>
//           <label className="block text-gray-700 font-semibold">Phone</label>
//           <input
//             type="text"
//             defaultValue="+94 771212345"
//             className="w-full border rounded-lg p-2 mt-2"
//           />
//         </div>
//         <div>
//           <label className="block text-gray-700 font-semibold">Date of Birth</label>
//           <input
//             type="date"
//             defaultValue="2001-12-21"
//             className="w-full border rounded-lg p-2 mt-2"
//           />
//         </div>
//       </div>

//       {/* Address */}
//       <div>
//         <label className="block text-gray-700 font-semibold">Address</label>
//         <input
//           type="text"
//           defaultValue="Maple street, New York, USA"
//           className="w-full border rounded-lg p-2 mt-2"
//         />
//       </div>

//       {/* Buttons */}
//       <div className="flex justify-end space-x-4 mt-6">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
//         >
//           Discard Changes
//         </button>
//         <button
//           type="button"
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           Save Profile
//         </button>
//       </div>
//     </div>
//   );
// }

// ===================================================================================

import { useEffect, useState } from "react";
import axios from "axios";

export default function PatientProfileEdit({ onCancel }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/patient/1")
      .then(res => setFormData(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!formData) return <p className="p-4">Loading...</p>;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    axios.put("http://localhost:5000/api/patient/1", formData)
      .then(() => {
        alert("Profile updated successfully!");
        onCancel();
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-10 space-y-6">
      <h3 className="text-xl font-bold mb-6">Edit Profile</h3>

      <div>
        <label className="block text-gray-700 font-semibold">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mt-2"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mt-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-semibold">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mt-2"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob ? formData.dob.substring(0,10) : ""}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mt-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-700 font-semibold">Address</label>
        <input
          type="text"
          name="address"
          value={formData.address || ""}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 mt-2"
        />
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
        >
          Discard Changes
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
}