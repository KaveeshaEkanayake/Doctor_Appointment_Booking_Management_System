import Sidebar from "../components/SideBar(patient)";
import Header from "../components/Header(patient)";
import PatientProfileDisplay from "../components/PatentProfileDisplay";
import PatientProfileEdit from "../components/PatientProfileEdit";
import Header from "../components/Header(patient)";

export default function PatientEditProfilePage() {
  const [activeSection, activeMenu] = useState("profile");

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
            onEdit={() => activeMenu("editProfile")}
          />
        );
      case "editProfile":
        return (
          <PatientProfileEdit
            onCancel={() => activeMenu("profile")}
          />
        );
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        setActiveSection={activeMenu}
        activeSection={setActiveMenu}
      />
      <main className="flex-1 p-8">
        <Header />
        {renderSection()}
      </main>
    </div>
  );
}
