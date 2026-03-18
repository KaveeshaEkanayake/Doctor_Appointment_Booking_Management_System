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

import { useState } from "react";
import PatientProfileDisplay from "../components/PatentProfileDisplay";
import Sidebar from "../components/SideBar(patient)";
import Header from "../components/Header(patient)";

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
        return <PatientProfileDisplay />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F6FAFF]">
      {/* OVERLAY for mobile */}
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
          setActiveMenu={setActiveSection}
          activeMenu={activeSection}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col p-6 md:p-10">
        <Header
          title="Patient Profile"
          setIsSidebarOpen={setIsSidebarOpen}   // ✅ toggle sidebar
          notificationsCount={3}
        />
        {renderSection()}
      </div>
    </div>
  );
}
