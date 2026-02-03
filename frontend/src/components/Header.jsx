// src/components/Header.jsx
import { useState } from "react";
import "./header.css";

export default function Header() {
  const [isMicActive, setIsMicActive] = useState(false);

  const handleBack = () => {
    console.log("Back clicked");
    // window.history.back(); // or react-router navigate(-1)
  };

  const handleMicClick = () => {
    setIsMicActive(!isMicActive);
    console.log(isMicActive ? "Mic off" : "Mic on");
  };

  return (
    <header className="header">
      <button 
        className="icon-btn back-btn" 
        onClick={handleBack}
        aria-label="Go back"
      >
        ←
      </button>

      <h1 className="header-title">Smart MCB Control</h1>

      <button 
        className={`icon-btn mic-btn ${isMicActive ? "active" : ""}`}
        onClick={handleMicClick}
        aria-label={isMicActive ? "Stop voice" : "Start voice"}
      >
        🎤
      </button>
    </header>
  );
}