// src/components/Login.jsx
import { useState } from "react";
import "./login.css";

const CORRECT_PIN = "2580"; // ← Change this to your desired PIN

export default function Login({ onLoginSuccess }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      onLoginSuccess();
      setError("");
    } else {
      setError("Incorrect PIN");
      setPin("");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Smart MCB Control</h1>
        <p className="subtitle">Enter PIN to access controls</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            autoFocus
            className="pin-input"
          />

          <button type="submit" className="login-btn">
            Enter
          </button>

          {error && <p className="error-message">{error}</p>}
        </form>

        <p className="hint">Default PIN: 2580 (change in code)</p>
      </div>
    </div>
  );
}