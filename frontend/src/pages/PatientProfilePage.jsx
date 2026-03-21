import { useState } from "react";
import Sidebar          from "../components/SideBar(patient)";
import Header           from "../components/Header(patient)";
import PatentProfileDisplay from "../components/PatentProfileDisplay";
import PatientProfileEdit   from "../components/PatientProfileEdit";

export default function PatientProfilePage() {
  const [activeSection,  setActiveSection]  = useState("profile");
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return (
          <PatentProfileDisplay
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
        return (
          <PatentProfileDisplay
            onEdit={() => setActiveSection("editProfile")}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#F6FAFF]">

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed md:static top-0 left-0 h-full transform transition-transform duration-300 z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar
          activeMenu={activeSection}
          setActiveMenu={setActiveSection}
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto">
        <Header
          title="Profile"
          setIsSidebarOpen={setIsSidebarOpen}
          notificationsCount={0}
        />
        {renderSection()}
      </div>
    </div>
  );
}