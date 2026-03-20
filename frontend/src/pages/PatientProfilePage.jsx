// import { useState } from "react";
// import PatientProfileDisplay from "../components/PatentProfileDisplay";
// import Sidebar from "../components/SideBar(patient)";
// import Header from "../components/Header(patient)";  // ✅ fixed filename

// // Example placeholders for other sections
// function DashboardHome() {
//   return <p>Dashboard content here...</p>;
// }
// function UpcomingAppointments() {
//   return <p>Upcoming appointments content here...</p>;
// }
// function PastAppointments() {
//   return <p>Past appointments content here...</p>;
// }

// export default function PatientProfilePage() {
//   const [activeSection, setActiveSection] = useState("profile");
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

//   const renderSection = () => {
//     switch (activeSection) {
//       case "dashboard":
//         return <DashboardHome />;
//       case "upcoming":
//         return <UpcomingAppointments />;
//       case "past":
//         return <PastAppointments />;
//       case "profile":
//         return <PatientProfileDisplay />;
//       default:
//         return <DashboardHome />;
//     }
//   };

//   return (
//     <div className="flex h-screen bg-[#F6FAFF]">
//       {/* Sidebar */}
//       {isSidebarOpen && (
//         <Sidebar
//           setActiveMenu={setActiveSection}   // ✅ match Sidebar props
//           activeMenu={activeSection}
//         />
//       )}

//       {/* Main Content */}
//       <main className="flex-1 p-8">
//         <Header
//           title="Patient Profile"            // ✅ pass title
//           setIsSidebarOpen={setIsSidebarOpen} // ✅ toggle sidebar
//           notificationsCount={3}             // ✅ example notifications
//         />
//         {renderSection()}
//       </main>
//     </div>
//   );
// }

// ----------------------------------------------------------------------------------------

// =======================================================================================================

// import { useState } from "react";
// import PatientProfileDisplay from "../components/PatientProfileDisplay";
// import Sidebar from "../components/SideBar(patient)";
// import Header from "../components/Header(patient)";

// export default function PatientProfilePage() {
//   const [activeSection, setActiveSection] = useState("profile");
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const renderSection = () => {
//     switch (activeSection) {
//       case "dashboard":
//         return <DashboardHome />;
//       case "upcoming":
//         return <UpcomingAppointments />;
//       case "past":
//         return <PastAppointments />;
//       case "profile":
//         return <PatientProfileDisplay />;
//       default:
//         return <DashboardHome />;
//     }
//   };

//   return (
//     <div className="flex h-screen bg-[#F6FAFF]">
//       {/* OVERLAY for mobile */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black opacity-30 z-40 md:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* SIDEBAR */}
//       <div
//         className={`fixed md:static top-0 left-0 h-full transform transition-transform duration-300 z-50
//         ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
//       >
//         <Sidebar
//           setActiveMenu={setActiveSection}
//           activeMenu={activeSection}
//         />
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="flex-1 flex flex-col p-6 md:p-10">
//         <Header
//           title="Patient Profile"
//           setIsSidebarOpen={setIsSidebarOpen}   // ✅ toggle sidebar
//           notificationsCount={3}
//         />
//         {renderSection()}
//       </div>
//     </div>
//   );
// }

// =========================================================================================================

// --------------------------------------------------------------------------------

// import { useState } from "react";
// // import PatientProfileDisplay from "../components/PatientProfileDisplay";
// // import PatientProfileEdit from "../components/PatientProfileEdit";
// // import Sidebar from "../components/SideBar(patient)";
// // import Header from "../components/Header(patient)";
// import PatientProfileEdit from "../components/PatientProfileEdit";
// import PatentProfileDisplay from "../components/PatentProfileDisplay";
// import Sidebar from "../components/SideBar(patient)";
// import Header from "../components/Header(patient)";

// export default function PatientProfilePage() {
//   const [activeSection, setActiveSection] = useState("profile");
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const renderSection = () => {
//     switch (activeSection) {
//       case "dashboard":
//         return <DashboardHome />;
//       case "upcoming":
//         return <UpcomingAppointments />;
//       case "past":
//         return <PastAppointments />;
//       case "profile":
//         return (
//           <PatentProfileDisplay
//             onEdit={() => setActiveSection("editProfile")}
//           />
//         );
//       case "editProfile":
//         return (
//           <PatientProfileEdit
//             onCancel={() => setActiveSection("profile")}
//           />
//         );
//       default:
//         return <DashboardHome />;
//     }
//   };

//   return (
//     <div className="flex h-screen bg-[#F6FAFF]">
//       {/* Overlay for mobile */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black opacity-30 z-40 md:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div
//         className={`fixed md:static top-0 left-0 h-full transform transition-transform duration-300 z-50
//         ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
//       >
//         <Sidebar
//           setActiveMenu={setActiveSection}
//           activeMenu={activeSection}
//         />
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col p-6 md:p-10">
//         <Header
//           title="Patient Profile"
//           setIsSidebarOpen={setIsSidebarOpen}
//           notificationsCount={3}
//         />
//         {renderSection()}
//       </div>
//     </div>
//   );
// }

// --------------------------------------------------------------------------------------

// import { useState } from "react";
// import PatientProfileDisplay from "../components/PatientProfileDisplay";
// import PatientProfileEdit from "../components/PatientProfileEdit";
// import Sidebar from "../components/SideBar(patient)";
// import Header from "../components/Header(patient)";

// // TEMP FIX (avoid crash)
// const DashboardHome = () => <div>Dashboard</div>;
// const UpcomingAppointments = () => <div>Upcoming</div>;
// const PastAppointments = () => <div>Past</div>;

// export default function PatientProfilePage() {
//   const [activeSection, setActiveSection] = useState("profile");
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const renderSection = () => {
//     switch (activeSection) {
//       case "profile":
//         return (
//           <PatientProfileDisplay
//             onEdit={() => setActiveSection("editProfile")}
//           />
//         );

//       case "editProfile":
//         return (
//           <PatientProfileEdit
//             onCancel={() => setActiveSection("profile")}
//           />
//         );

//       case "dashboard":
//         return <DashboardHome />;

//       case "upcoming":
//         return <UpcomingAppointments />;

//       case "past":
//         return <PastAppointments />;

//       default:
//         return <DashboardHome />;
//     }
//   };

//   return (
//     <div className="flex h-screen bg-[#F6FAFF]">
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black opacity-30 z-40 md:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       <div
//         className={`fixed md:static top-0 left-0 h-full transform transition-transform duration-300 z-50
//         ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
//       >
//         <Sidebar
//           setActiveMenu={setActiveSection}
//           activeMenu={activeSection}
//         />
//       </div>

//       <div className="flex-1 flex flex-col p-6 md:p-10">
//         <Header
//           title="Patient Profile"
//           setIsSidebarOpen={setIsSidebarOpen}
//           notificationsCount={3}
//         />

//         {renderSection()}
//       </div>
//     </div>
//   );
// }

// =====================================================================================================

// import { useState } from "react";
// import Sidebar from "../components/SideBar(patient)";
// import Header from "../components/Header(patient)";
// import PatientProfileDisplay from "../components/PatientProfileDisplay";
// import PatientProfileEdit from "../components/PatientProfileEdit";

// export default function PatientProfilePage() {
  
// const [activeSection, activeMenu] = useState("profile");

//   const renderSection = () => {
//     switch (activeSection) {
//       case "dashboard":
//         return <DashboardHome />;
//       case "upcoming":
//         return <UpcomingAppointments />;
//       case "past":
//         return <PastAppointments />;
//       case "profile":
//         return (
//           <PatientProfileDisplay
//             onEdit={() => activeMenu("editProfile")}
//           />
//         );
//       case "editProfile":
//         return (
//           <PatientProfileEdit
//             onCancel={() => activeMenu("profile")}
//           />
//         );
//       default:
//         return <DashboardHome />;
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       <Sidebar
//         setActiveSection={activeMenu}
//         activeSection={setActiveMenu}
//       />
//       <main className="flex-1 p-8">
//         <Header />
//         {renderSection()}
//       </main>
//     </div>
//   );
// }

// ===========================================================================

import { useState } from "react";
import Sidebar from "../components/SideBar(patient)";
import Header from "../components/Header(patient)";
import PatientProfileDisplay from "../components/PatentProfileDisplay";
import PatientProfileEdit from "../components/PatientProfileEdit";

const DashboardHome = () => <div>Dashboard</div>;
const UpcomingAppointments = () => <div>Upcoming Appointments</div>;
const PastAppointments = () => <div>Past Appointments</div>;

export default function PatientProfilePage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardHome />;
      case "upcoming":
        return <UpcomingAppointments />;
      case "past":
        return <PastAppointments />;
      case "profile":
        return (
          <PatientProfileDisplay
            onEdit={() => setActiveSection("editProfile")}
          />
        );
      case "editProfile":
        return (
          <PatientProfileEdit
            onCancel={() => setActiveSection("profile")}
          />
        );
      default:
        return <PatientProfileDisplay onEdit={() => setActiveSection("editProfile")} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeMenu={activeSection}
        setActiveMenu={setActiveSection}
      />

      <main className="flex-1 p-8">
        <Header
          title="Patient Profile"
          setIsSidebarOpen={setIsSidebarOpen}
          notificationsCount={1}
        />
        {renderSection()}
      </main>
    </div>
  );
}

// <Route path="/patient/editprofile" element={<PatientEditProfilePage />} />
