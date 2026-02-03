// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/settings.css";

const BACKEND_URL = "https://smart-mcb-1.onrender.com/";

export default function Settings({ onLogout }) {
  // Sensor monitoring toggles
  const [monitorTemperature, setMonitorTemperature] = useState(true);
  const [monitorGas, setMonitorGas] = useState(true);
  const [monitorFlame, setMonitorFlame] = useState(true);

  // Thresholds
  const [tempThreshold, setTempThreshold] = useState(50);
  const [gasThreshold, setGasThreshold] = useState(60);

  // Emergency behavior
  const [autoShutoffMCB, setAutoShutoffMCB] = useState(true);
  const [overrideTimeout, setOverrideTimeout] = useState(10);
  const [buzzerDuration, setBuzzerDuration] = useState(20);

  // SOS settings
  const [sosPressCount, setSosPressCount] = useState(3);
  const [sosSirenDuration, setSosSirenDuration] = useState(20);

  // Display
  const [slideshowInterval, setSlideshowInterval] = useState(3);

  // Existing states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // Loading & error state for sensor data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Logout loading state
  const [loggingOut, setLoggingOut] = useState(false);

  // NEW: SOS test button loading state
  const [testingSOS, setTestingSOS] = useState(false);

  // Poll backend for sensor monitoring states
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/status`);
        setMonitorTemperature(res.data.monitorTemp ?? true);
        setMonitorGas(res.data.monitorGas ?? true);
        setMonitorFlame(res.data.monitorFlame ?? true);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
        setError("Could not load sensor settings. Backend may be offline.");
        setLoading(false);
      }
    };

    fetchSettings();
    const interval = setInterval(fetchSettings, 5000);
    return () => clearInterval(interval);
  }, []);

  // Toggle sensor monitoring
  const toggleSensor = async (sensor, enable, setter) => {
    setter(enable);
    try {
      await axios.get(`${BACKEND_URL}/api/sensor/${sensor}/${enable ? "on" : "off"}`);
    } catch (err) {
      console.error(`Failed to toggle ${sensor}:`, err);
      setter(!enable); // rollback
    }
  };

  // Save threshold on blur
  const saveThreshold = async (type, value, setter) => {
    try {
      await axios.post(`${BACKEND_URL}/api/config/threshold`, { type, value });
      alert(`${type} threshold saved!`);
    } catch (err) {
      alert(`Failed to save ${type} threshold`);
    }
  };

  // NEW: Trigger SOS siren test (calls backend to activate buzzer on ESP32)
  const testSOSSiren = async () => {
    if (testingSOS) return;

    setTestingSOS(true);

    try {
      await axios.get(`${BACKEND_URL}/api/sos/test`);
      alert("SOS siren test started! Buzzer should sound for 20 seconds on device.");
    } catch (err) {
      console.error("SOS test failed:", err);
      alert("Failed to trigger SOS siren. Check backend/ESP32 connection.");
    } finally {
      setTimeout(() => setTestingSOS(false), 20000); // re-enable after 20s
    }
  };

  // Logout – always works
  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    setLoggingOut(true);
    localStorage.removeItem("mcb_auth");
    onLogout();
    window.location.href = "/";
    setTimeout(() => setLoggingOut(false), 1000);
  };

  if (loading) {
    return (
      <div className="settings-page">
        <h2 className="page-title">Settings</h2>
        <p className="loading">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <h2 className="page-title">Settings</h2>

      {error && <p className="error" style={{ textAlign: "center", margin: "16px 0" }}>{error}</p>}

      {/* Account & Security */}
      <div className="settings-section">
        <h3 className="section-header">Account & Security</h3>
        <div className="settings-list">
          <div className="settings-item">
            <span className="item-label">Change Password</span>
            <button className="item-action">Edit</button>
          </div>
          <div className="settings-item">
            <span className="item-label">Enable 2FA</span>
            <label className="switch">
              <input type="checkbox" checked={true} readOnly />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="settings-item danger">
            <span className="item-label">Logout</span>
            <button
              className={`item-action danger logout-btn ${loggingOut ? "loading" : ""}`}
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>

      {/* Sensor Alerts */}
      <div className="settings-section">
        <h3 className="section-header">Sensor Alerts</h3>
        <div className="settings-list">
          <div className="settings-item">
            <span className="item-label">Temperature Alert (DHT11)</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={monitorTemperature}
                onChange={(e) => toggleSensor("temperature", e.target.checked, setMonitorTemperature)}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="settings-item">
            <span className="item-label">Gas Alert (MQ-2)</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={monitorGas}
                onChange={(e) => toggleSensor("gas", e.target.checked, setMonitorGas)}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="settings-item">
            <span className="item-label">Flame Detection Alert</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={monitorFlame}
                onChange={(e) => toggleSensor("flame", e.target.checked, setMonitorFlame)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Emergency Thresholds */}
      <div className="settings-section">
        <h3 className="section-header">Emergency Thresholds</h3>
        <div className="settings-list">
          <div className="settings-item">
            <span className="item-label">Max Temperature (°C)</span>
            <input
              type="number"
              min="30"
              max="80"
              step="1"
              value={tempThreshold}
              onChange={(e) => setTempThreshold(Number(e.target.value))}
              onBlur={() => saveThreshold("temp", tempThreshold, setTempThreshold)}
              className="threshold-input"
            />
          </div>
          <div className="settings-item">
            <span className="item-label">Gas Threshold (%)</span>
            <input
              type="number"
              min="20"
              max="100"
              step="5"
              value={gasThreshold}
              onChange={(e) => setGasThreshold(Number(e.target.value))}
              onBlur={() => saveThreshold("gas", gasThreshold, setGasThreshold)}
              className="threshold-input"
            />
          </div>
        </div>
      </div>

      {/* Emergency Behavior */}
      <div className="settings-section">
        <h3 className="section-header">Emergency Behavior</h3>
        <div className="settings-list">
          <div className="settings-item">
            <span className="item-label">Auto Shutoff MCB on Alert</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={autoShutoffMCB}
                onChange={() => setAutoShutoffMCB(!autoShutoffMCB)}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="settings-item">
            <span className="item-label">Override Window (seconds)</span>
            <input
              type="number"
              min="3"
              max="30"
              value={overrideTimeout}
              onChange={(e) => setOverrideTimeout(Number(e.target.value))}
              className="threshold-input"
            />
          </div>
          <div className="settings-item">
            <span className="item-label">Buzzer Duration (seconds)</span>
            <input
              type="number"
              min="5"
              max="60"
              value={buzzerDuration}
              onChange={(e) => setBuzzerDuration(Number(e.target.value))}
              className="threshold-input"
            />
          </div>
        </div>
      </div>

      {/* SOS Button Configuration – with new Test button */}
      <div className="settings-section">
        <h3 className="section-header">SOS Button Configuration</h3>
        <div className="settings-list">
          <div className="settings-item">
            <span className="item-label">Required Presses</span>
            <input
              type="number"
              min="2"
              max="5"
              value={sosPressCount}
              onChange={(e) => setSosPressCount(Number(e.target.value))}
              className="threshold-input"
            />
          </div>
          <div className="settings-item">
            <span className="item-label">Siren Duration (seconds)</span>
            <input
              type="number"
              min="10"
              max="60"
              value={sosSirenDuration}
              onChange={(e) => setSosSirenDuration(Number(e.target.value))}
              className="threshold-input"
            />
          </div>

          {/* NEW: Test SOS Siren Button */}
          <div className="settings-item">
            <span className="item-label">Test SOS Siren Now</span>
            <button
              className={`test-btn ${testingSOS ? "loading" : ""}`}
              onClick={testSOSSiren}
              disabled={testingSOS}
            >
              {testingSOS ? "Testing..." : "Test Siren"}
            </button>
          </div>
        </div>
      </div>

      {/* Display Preferences */}
      <div className="settings-section">
        <h3 className="section-header">Display Preferences</h3>
        <div className="settings-list">
          <div className="settings-item">
            <span className="item-label">LCD Slideshow Interval (seconds)</span>
            <input
              type="number"
              min="2"
              max="10"
              value={slideshowInterval}
              onChange={(e) => setSlideshowInterval(Number(e.target.value))}
              className="threshold-input"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-section">
        <h3 className="section-header">Notifications</h3>
        <div className="settings-list">
          <div className="settings-item">
            <span className="item-label">Push Notifications</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={() => setNotificationsEnabled(!notificationsEnabled)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <h3 className="section-header">Appearance</h3>
        <div className="settings-list">
          <div className="settings-item">
            <span className="item-label">Dark Mode</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Advanced & Safety */}
      <div className="settings-section">
        <h3 className="section-header">Advanced & Safety</h3>
        <div className="settings-list">
          <div className="settings-item danger">
            <span className="item-label">Factory Reset All Settings</span>
            <button className="item-action danger" onClick={() => alert("Factory reset not implemented yet")}>
              Reset
            </button>
          </div>
          <div className="settings-item">
            <span className="item-label">App Version</span>
            <span className="item-status">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}