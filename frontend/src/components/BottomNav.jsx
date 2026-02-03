import "./bottomnav.css";

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
        onClick={() => onTabChange("dashboard")}
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Dashboard</span>
      </button>

      <button
        className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
        onClick={() => onTabChange("settings")}
      >
        <span className="nav-icon">⚙️</span>
        <span className="nav-label">Settings</span>
      </button>

      <button
        className={`nav-item ${activeTab === "logs" ? "active" : ""}`}
        onClick={() => onTabChange("logs")}
      >
        <span className="nav-icon">📋</span>
        <span className="nav-label">Logs</span>
      </button>
    </nav>
  );
}