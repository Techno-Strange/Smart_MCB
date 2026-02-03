// src/App.jsx
import { useState, useEffect } from "react";

import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Logs from "./pages/Logs";

import BottomNav from "./components/BottomNav";
import Login from "./components/Login";

import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount (from localStorage)
  useEffect(() => {
    const authStatus = localStorage.getItem("mcb_auth") === "true";
    setIsAuthenticated(authStatus);
  }, []);

  // Handle successful login
  const handleLoginSuccess = () => {
    localStorage.setItem("mcb_auth", "true");
    setIsAuthenticated(true);
    setActiveTab("dashboard"); // Redirect to dashboard after login
  };

  // Handle logout – always works, independent of backend
  const handleLogout = () => {
    // Optional: Ask for confirmation (remove if you want instant logout)
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("mcb_auth");
      setIsAuthenticated(false);
      setActiveTab("dashboard"); // Reset tab (optional)

      // Force clean redirect to login
      window.location.reload(); // Ensures fresh state (recommended for safety)
    }
  };

  // Show Login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Authenticated view
  return (
    <div className="app-container">
      <main className="main-content">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "settings" && <Settings onLogout={handleLogout} />}
        {activeTab === "logs" && <Logs />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;