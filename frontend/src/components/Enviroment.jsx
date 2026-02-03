// src/components/Environment.jsx (no change needed in JSX - keep as is)
import { useState, useEffect } from "react";
import axios from "axios";
import "./enviroment.css";

const BACKEND_URL = "http://localhost:3000";

export default function Environment() {
  // Your existing code - unchanged
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [gasLevel, setGasLevel] = useState(null);
  const [flameDetected, setFlameDetected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/status`);
        setTemperature(res.data.temperature);
        setHumidity(res.data.humidity);
        setGasLevel(res.data.gasLevel);
        setFlameDetected(res.data.flame);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Environment fetch error:", err);
        setError("Could not load environmental data");
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (type, value) => {
    if (value === null) return "unknown";
    // Your existing status logic - unchanged
    if (type === "temp") {
      if (value <= 24) return "good";
      if (value <= 28) return "normal";
      return "bad";
    }
    if (type === "humidity") {
      if (value >= 30 && value <= 60) return "good";
      if (value <= 75) return "normal";
      return "bad";
    }
    if (type === "gas") {
      if (value < 60) return "good";
      if (value < 80) return "normal";
      return "bad";
    }
    if (type === "flame") {
      return value ? "bad" : "good";
    }
    return "good";
  };

  if (loading) return <div className="environment-section"><p>Loading...</p></div>;
  if (error) return <div className="environment-section"><p className="error">{error}</p></div>;

  return (
    <div className="environment-section">
      <h3 className="section-title">Environmental</h3>

      <div className="env-boxes">
        {/* Your boxes - unchanged */}
        <div className={`env-box ${getStatusClass("temp", temperature)}`}>
          <span className="env-label">Temperature (DHT11)</span>
          <strong className="env-value">
            {temperature !== null ? `${temperature.toFixed(1)} °C` : "—"}
          </strong>
          <span className="env-status">
            {temperature !== null ? (temperature <= 24 ? "GOOD" : temperature <= 28 ? "NORMAL" : "HIGH") : "N/A"}
          </span>
        </div>

        <div className={`env-box ${getStatusClass("humidity", humidity)}`}>
          <span className="env-label">Humidity (DHT11)</span>
          <strong className="env-value">
            {humidity !== null ? `${humidity}%` : "—"}
          </strong>
          <span className="env-status">
            {humidity !== null ? (humidity >= 30 && humidity <= 60 ? "IDEAL" : humidity <= 75 ? "HIGH" : "VERY HIGH") : "N/A"}
          </span>
        </div>

        <div className={`env-box ${getStatusClass("gas", gasLevel)}`}>
          <span className="env-label">Gas Level (MQ-2)</span>
          <strong className="env-value">
            {gasLevel !== null ? `${gasLevel.toFixed(1)}%` : "—"}
          </strong>
          <span className="env-status">
            {gasLevel !== null ? (gasLevel < 60 ? "SAFE" : gasLevel < 80 ? "MODERATE" : "DANGER") : "N/A"}
          </span>
        </div>

        <div className={`env-box ${getStatusClass("flame", flameDetected)}`}>
          <span className="env-label">Flame Detection</span>
          <strong className="env-value">
            {flameDetected !== null ? (flameDetected ? "DETECTED" : "NONE") : "—"}
          </strong>
          <span className="env-status">
            {flameDetected !== null ? (flameDetected ? "DANGER" : "SAFE") : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}