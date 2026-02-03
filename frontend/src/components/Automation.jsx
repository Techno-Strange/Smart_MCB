import { useState, useEffect } from "react";
import axios from "axios";
import "./automation.css";

const BACKEND_URL = "https://smart-mcb-1.onrender.com/";

export default function Automation() {
  // Motion Detection
  const [motionDetectionEnabled, setMotionDetectionEnabled] = useState(true);
  const [autoUpDownEnabled, setAutoUpDownEnabled] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState(30);

  // Sensor monitoring toggles
  const [monitorTemperature, setMonitorTemperature] = useState(true);
  const [monitorGas, setMonitorGas] = useState(true);
  const [monitorFlame, setMonitorFlame] = useState(true);

  // Fetch current sensor monitoring states from backend
  useEffect(() => {
    const fetchSensorStates = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/sensors/status`);
        setMonitorTemperature(res.data.monitorTemp ?? true);
        setMonitorGas(res.data.monitorGas ?? true);
        setMonitorFlame(res.data.monitorFlame ?? true);
      } catch (err) {
        console.error("Failed to fetch sensor states:", err);
      }
    };

    fetchSensorStates();
    const interval = setInterval(fetchSensorStates, 5000); // sync every 5s

    return () => clearInterval(interval);
  }, []);

  // Toggle sensor monitoring on backend
  const toggleSensor = async (sensor, enable) => {
    try {
      await axios.get(`${BACKEND_URL}/api/sensor/${sensor}/${enable ? "on" : "off"}`);
      // UI will update on next poll
    } catch (err) {
      console.error(`Toggle ${sensor} failed:`, err);
      alert(`Could not toggle ${sensor} monitoring`);
    }
  };

  return (
    <>
      <h3 className="card-title">Automation</h3>

      <div className="card automation">
        {/* Motion Detection */}
        <div className="motion-section">
          <div className="section-title">Motion Detection</div>

          <div className="auto-item toggle-row">
            <div className="sensor-label">
              <span className="status-dot good"></span>
              PIR Sensor
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={motionDetectionEnabled}
                onChange={() => setMotionDetectionEnabled(!motionDetectionEnabled)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="auto-item toggle-row">
            <span>Auto Up/Down</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={autoUpDownEnabled}
                onChange={() => setAutoUpDownEnabled(!autoUpDownEnabled)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="auto-item slider-row">
            <div className="slider-label">
              <span className="gear-icon">⚙️</span>
              Delay (seconds)
            </div>
            <div className="slider-container">
              <input
                type="range"
                min="5"
                max="180"
                step="5"
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(Number(e.target.value))}
                className="delay-slider"
              />
              <span className="slider-value">{delaySeconds} s</span>
            </div>
          </div>
        </div>

        {/* Sensor Monitoring */}
        <div className="sensor-section">
          <div className="section-title">Sensor Monitoring</div>

          <div className="auto-item toggle-row">
            <span>Temperature Alert (DHT11)</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={monitorTemperature}
                onChange={() => {
                  const newVal = !monitorTemperature;
                  setMonitorTemperature(newVal);
                  toggleSensor("temperature", newVal);
                }}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="auto-item toggle-row">
            <span>Gas Alert (MQ-2)</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={monitorGas}
                onChange={() => {
                  const newVal = !monitorGas;
                  setMonitorGas(newVal);
                  toggleSensor("gas", newVal);
                }}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="auto-item toggle-row">
            <span>Flame Alert</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={monitorFlame}
                onChange={() => {
                  const newVal = !monitorFlame;
                  setMonitorFlame(newVal);
                  toggleSensor("flame", newVal);
                }}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}