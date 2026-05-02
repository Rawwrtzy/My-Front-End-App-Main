export default function Navbar({ currentPage, onNavigate, user, onLogout }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "patientMonitoring", label: "Patients" },
    { id: "queueManagement", label: "Queue" },
    { id: "reports", label: "Reports" },
    { id: "devices", label: "Devices" },
    { id: "users", label: "Users" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <nav className="navbar">
      <div className="nav-items">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-link ${currentPage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="navbar-right">
        <div className="user-section">
          <span className="user-name">{user?.name}</span>
          <span className="user-role">{user?.role}</span>
        </div>
        <button 
          className="logout-btn-nav" 
          onClick={(e) => {
            e.stopPropagation();
            onLogout();
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}