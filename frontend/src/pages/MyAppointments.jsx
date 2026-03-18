// import React, { useState, useEffect } from "react";
// import { NavLink, useNavigate, useLocation } from "react-router-dom";
// import logoImg from "../assets/Logo04.PNG";
// import profile_pic from "../assets/profile_pic.png";
// import {
//   FaHome,
//   FaCalendarAlt,
//   FaUser,
//   FaSignOutAlt,
//   FaBars,
//   FaBell,
// } from "react-icons/fa";
// import Noappointment from "../assets/Noappointment.png";
// import axios from "axios";
// import Sidebar from "../components/SideBar(patient)";
// import Header from "../components/Header(patient)";

// export default function MyAppointments() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [appointments, setAppointments] = useState([]);
//   const [activeMenu, setActiveMenu] = useState("upcoming");
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [notificationsCount, setNotificationsCount] = useState(0);

//   useEffect(() => {
//     document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
//   }, [isSidebarOpen]);

//   const fetchAppointments = async () => {
//     try {
//       const res = await axios.get("/api/auth/my-appointments");
//       setAppointments(Array.isArray(res.data) ? res.data : []);
//     } catch (error) {
//       console.error("Error fetching appointments:", error);
//       setAppointments([]);
//     }
//   };

//   const fetchNotificationsCount = async () => {
//     try {
//       const res = await axios.get("/api/notifications/count");
//       setNotificationsCount(res.data.count || 0);
//     } catch (error) {
//       console.error("Error fetching notifications count:", error);
//       setNotificationsCount(0);
//     }
//   };

//   useEffect(() => {
//     fetchAppointments();
//     fetchNotificationsCount();
//   }, []);

//   const getStatusStyle = (status) => {
//     if (status === "Confirmed") return "bg-green-100 text-green-700";
//     if (status === "Rescheduled") return "bg-blue-100 text-blue-700";
//     if (status === "Canceled") return "bg-red-100 text-red-700";
//     if (status === "Pending") return "bg-yellow-100 text-yellow-700";
//     if (status === "Completed") return "bg-gray-100 text-gray-700";
//     if (status === "Missed") return "bg-red-200 text-red-800";
//     return "bg-gray-100 text-gray-600";
//   };

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const tomorrow = new Date(today);
//   tomorrow.setDate(today.getDate() + 1);

//   const isToday = (date) => {
//     const d = new Date(date);
//     d.setHours(0, 0, 0, 0);
//     return d.getTime() === today.getTime();
//   };

//   const isTomorrow = (date) => {
//     const d = new Date(date);
//     d.setHours(0, 0, 0, 0);
//     return d.getTime() === tomorrow.getTime();
//   };

//   const filteredAppointments = appointments
//     .filter((appt) => {
//       const apptDate = new Date(appt.date);
//       apptDate.setHours(0, 0, 0, 0);
//       if (activeMenu === "upcoming") {
//         return apptDate >= today && appt.status !== "Completed" && appt.status !== "Missed";
//       } else {
//         return apptDate < today || appt.status === "Completed" || appt.status === "Missed";
//       }
//     })
//     .sort((a, b) => new Date(b.date) - new Date(a.date));

//   const linkClass = (path) =>
//     location.pathname === path
//       ? "flex items-center gap-2 text-blue-600 font-semibold"
//       : "flex items-center gap-2 text-gray-600 hover:text-blue-600";

//   return (
//     <div className="flex h-screen bg-[#F6FAFF]">
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black opacity-30 z-40 md:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* SIDEBAR
//       <div
//         className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-100 p-6 transform transition-transform duration-300 z-50
//         ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
//       >
//         <div className="flex items-center mb-10">
//           <img src={logoImg} className="h-10 mr-2" />
//         </div>

//         <div className="space-y-6">
//           <NavLink to="/dashboard" className={linkClass("/dashboard")}>
//             <FaHome /> Dashboard
//           </NavLink>

//           <NavLink to="/my-appointments" className={linkClass("/my-appointments")}>
//             <FaCalendarAlt /> Appointment
//           </NavLink>

//           <div className="ml-6 mt-2 text-sm space-y-2">
//             <p
//               onClick={() => setActiveMenu("upcoming")}
//               className={`cursor-pointer ${
//                 activeMenu === "upcoming"
//                   ? "bg-blue-100 text-blue-600 px-2 py-1 rounded"
//                   : "text-gray-500"
//               }`}
//             >
//               Upcoming Appointment
//             </p>

//             <p
//               onClick={() => setActiveMenu("past")}
//               className={`cursor-pointer ${
//                 activeMenu === "past"
//                   ? "bg-blue-100 text-blue-600 px-2 py-1 rounded"
//                   : "text-gray-500"
//               }`}
//             >
//               Past Appointment
//             </p>
//           </div>

//           <NavLink to="/profile" className={linkClass("/profile")}>
//             <FaUser /> Profile
//           </NavLink>

//           <NavLink to="/logout" className={linkClass("/logout")}>
//             <FaSignOutAlt /> Logout
//           </NavLink>
//         </div>
//       </div> */}

//       <div
//         className={`fixed md:static top-0 left-0 h-full transform transition-transform duration-300 z-50
//         ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
//       >
//         <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
//       </div>




//       {/* MAIN CONTENT */}
//       <div className="flex-1 flex flex-col p-6 md:p-10">
//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center gap-4">
//             <FaBars className="text-xl cursor-pointer md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
//             <h2 className="text-2xl font-semibold">My Appointments</h2>
//           </div>

//           <div className="flex items-center space-x-4">
//             <div className="relative cursor-pointer" onClick={() => navigate("/notifications")}>
//               <FaBell className="text-lg" />
//               {notificationsCount > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
//                   {notificationsCount}
//                 </span>
//               )}
//             </div>

//             <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/profile")}>
//               <img src={profile_pic} className="w-9 h-9 rounded-full" />
//               <span className="text-sm">Shane Doe</span>
//             </div>
//           </div>
//         </div>

//         {/* TABLE */}
//         <div className="border rounded-xl p-5 bg-white">
//           {filteredAppointments.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-16">
//               <img src={Noappointment} className="w-40 mb-5" />
//               <h3 className="text-lg font-semibold mb-1">No Appointments Scheduled</h3>
//               <p className="text-gray-500 text-sm mb-3">
//                 You have no {activeMenu === "upcoming" ? "upcoming" : "past"} appointments
//               </p>
//               {/* Restored Book Appointment Button */}
//               <button
//                 onClick={() => navigate("/book-appointment")}
//                 className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mt-4"
//               >
//                 Book an appointment
//               </button>
//             </div>
//           ) : (
//             <>
//               <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr] bg-gray-100 px-3 py-1.5 rounded-md text-gray-600 font-medium text-xs gap-x-4">
//                 <p>Doctor Name</p>
//                 <p className="text-center">Date</p>
//                 <p className="text-center">Time</p>
//                 <p className="text-right">Status</p>
//               </div>

//               <div className="mt-2 space-y-1.5">
//                 {filteredAppointments.map((appointment, index) => {
//                   const todayRow = isToday(appointment.date);
//                   const fullDateTime = `${new Date(appointment.date).toLocaleDateString()} ${appointment.time}`;

//                   return (
//                     <div
//                       key={index}
//                       className={`grid grid-cols-[2fr_1.5fr_1fr_1fr] items-center border rounded-md px-3 py-1.5 gap-x-4 transition
//                         ${todayRow ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"}`}
//                     >
//                       <p className="truncate text-sm">{appointment.doctorName}</p>

//                       <div className="flex flex-col items-center text-sm gap-1">
//                         <span className="truncate cursor-pointer" title={fullDateTime}>
//                           {new Date(appointment.date).toLocaleDateString()}
//                         </span>
//                         <div className="flex gap-1 flex-wrap justify-center">
//                           {isToday(appointment.date) && (
//                             <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">
//                               Today
//                             </span>
//                           )}
//                           {isTomorrow(appointment.date) && (
//                             <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full">
//                               Tomorrow
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       <p className="text-center text-sm">{appointment.time}</p>

//                       <div className="flex justify-end">
//                         <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(appointment.status)}`}>
//                           {appointment.status}
//                         </span>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Noappointment from "../assets/Noappointment.png";
import axios from "axios";
import Sidebar from "../components/SideBar(patient)";
import Header from "../components/Header(patient)";

export default function MyAppointments() {
  const navigate = useNavigate();
  const location = useLocation();

  const [appointments, setAppointments] = useState([]);
  const [activeMenu, setActiveMenu] = useState("upcoming");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
  }, [isSidebarOpen]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("/api/auth/my-appointments");
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    }
  };

  const fetchNotificationsCount = async () => {
    try {
      const res = await axios.get("/api/notifications/count");
      setNotificationsCount(res.data.count || 0);
    } catch (error) {
      console.error("Error fetching notifications count:", error);
      setNotificationsCount(0);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchNotificationsCount();
  }, []);

  const getStatusStyle = (status) => {
    if (status === "Confirmed") return "bg-green-100 text-green-700";
    if (status === "Rescheduled") return "bg-blue-100 text-blue-700";
    if (status === "Canceled") return "bg-red-100 text-red-700";
    if (status === "Pending") return "bg-yellow-100 text-yellow-700";
    if (status === "Completed") return "bg-gray-100 text-gray-700";
    if (status === "Missed") return "bg-red-200 text-red-800";
    return "bg-gray-100 text-gray-600";
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isToday = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  const isTomorrow = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === tomorrow.getTime();
  };

  const filteredAppointments = appointments
    .filter((appt) => {
      const apptDate = new Date(appt.date);
      apptDate.setHours(0, 0, 0, 0);

      if (activeMenu === "upcoming") {
        return (
          apptDate >= today &&
          appt.status !== "Completed" &&
          appt.status !== "Missed"
        );
      } else {
        return (
          apptDate < today ||
          appt.status === "Completed" ||
          appt.status === "Missed"
        );
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="flex h-screen bg-[#F6FAFF]">

      {/* OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed md:static top-0 left-0 h-full transform transition-transform duration-300 z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col p-6 md:p-10">

        {/* ✅ REUSABLE HEADER */}
        <Header
          title="My Appointments"
          setIsSidebarOpen={setIsSidebarOpen}
          notificationsCount={notificationsCount}
        />

        {/* TABLE */}
        <div className="border rounded-xl p-5 bg-white">
          {filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <img src={Noappointment} className="w-40 mb-5" />
              <h3 className="text-lg font-semibold mb-1">
                No Appointments Scheduled
              </h3>
              <p className="text-gray-500 text-sm mb-3">
                You have no {activeMenu === "upcoming" ? "upcoming" : "past"} appointments
              </p>

              <button
                onClick={() => navigate("/book-appointment")}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mt-4"
              >
                Book an appointment
              </button>
            </div>
          ) : (
            <>
              {/* TABLE HEADER */}
              <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr] bg-gray-100 px-3 py-1.5 rounded-md text-gray-600 font-medium text-xs gap-x-4">
                <p>Doctor Name</p>
                <p className="text-center">Date</p>
                <p className="text-center">Time</p>
                <p className="text-right">Status</p>
              </div>

              {/* TABLE BODY */}
              <div className="mt-2 space-y-1.5">
                {filteredAppointments.map((appointment, index) => {
                  const todayRow = isToday(appointment.date);
                  const fullDateTime = `${new Date(
                    appointment.date
                  ).toLocaleDateString()} ${appointment.time}`;

                  return (
                    <div
                      key={index}
                      className={`grid grid-cols-[2fr_1.5fr_1fr_1fr] items-center border rounded-md px-3 py-1.5 gap-x-4 transition
                      ${todayRow ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"}`}
                    >
                      <p className="truncate text-sm">
                        {appointment.doctorName}
                      </p>

                      <div className="flex flex-col items-center text-sm gap-1">
                        <span
                          className="truncate cursor-pointer"
                          title={fullDateTime}
                        >
                          {new Date(appointment.date).toLocaleDateString()}
                        </span>

                        <div className="flex gap-1 flex-wrap justify-center">
                          {isToday(appointment.date) && (
                            <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">
                              Today
                            </span>
                          )}

                          {isTomorrow(appointment.date) && (
                            <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full">
                              Tomorrow
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-center text-sm">
                        {appointment.time}
                      </p>

                      <div className="flex justify-end">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}