// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import CircuitStatus from "../components/CircuitStatus";
import Automation from "../components/Automation";
import Environment from "../components/Enviroment";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import "../styles/dashboard.css"; // optional custom dashboard styles

const BACKEND_URL = "https://smart-mcb-1.onrender.com/";

export default function Dashboard() {
  const [sensorData, setSensorData] = useState({
    temperature: null,
    humidity: null,
    gasLevel: null,
    flame: null,
  });
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Poll backend every 5 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/status`);
        const data = res.data;
        setSensorData({
          temperature: data.temperature ?? null,
          humidity: data.humidity ?? null,
          gasLevel: data.gasLevel ?? null,
          flame: data.flame ?? null,
        });
        setLoading(false);
        setError(null);

        // Determine alert message (priority: flame > gas > temp)
        let message = "";
        if (data.flame === true) {
          message = "🔥 FLAME DETECTED! Immediate action required!";
        } else if (data.gasLevel >= 60) {
          message = "☣️ GAS LEAK DETECTED! High risk!";
        } else if (data.temperature >= 50) {
          message = "🔥 HIGH TEMPERATURE! Risk of overheating!";
        }
        setAlertMessage(message);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Unable to load data. Check connection.");
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  // Close alert banner (temporary dismiss)
  const dismissAlert = () => setAlertMessage("");

  return (
    <div className="dashboard-page">
      <Header />

      <main className="dashboard-content">
        {/* Alert Banner - appears at top when needed */}
        {alertMessage && (
          <div className="alert-banner danger">
            <span className="alert-text">{alertMessage}</span>
            <button className="alert-close" onClick={dismissAlert}>
              ×
            </button>
          </div>
        )}

        {loading && <p className="loading">Loading dashboard...</p>}
        {error && <p className="error">{error}</p>}

        <CircuitStatus />
        <Automation />
        <Environment />
      </main>

      <BottomNav />
    </div>
  );
}