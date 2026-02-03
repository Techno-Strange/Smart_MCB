import { useState, useEffect } from "react";
import axios from "axios";
import "./circuitstatus.css";

const BACKEND_URL = "https://smart-mcb-1.onrender.com/";

export default function CircuitStatus() {
  const [mcbStates, setMcbStates] = useState([false, false, false, false, false, false]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMCBStates = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/status`);
        // Assuming backend returns array under "mcb" or "relays"
        const states = res.data.mcb || res.data.relays || Array(6).fill(false);
        setMcbStates(states);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("MCB fetch error:", err);
        setError("Could not load circuit status");
        setLoading(false);
      }
    };

    fetchMCBStates();
    const interval = setInterval(fetchMCBStates, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleMCB = async (index) => {
    const newState = !mcbStates[index];
    const mcbId = index + 1; // 1-based ID

    try {
      await axios.get(`${BACKEND_URL}/api/mcb/${mcbId}/${newState ? "on" : "off"}`);
      // Optimistic update
      const updated = [...mcbStates];
      updated[index] = newState;
      setMcbStates(updated);
    } catch (err) {
      console.error("Toggle error:", err);
      alert("Could not toggle MCB");
    }
  };

  if (loading) return <div className="card circuit-status"><p>Loading...</p></div>;
  if (error) return <div className="card circuit-status"><p className="error">{error}</p></div>;

  return (
    <div className="card circuit-status">
      <h3 className="card-title">Circuit Status</h3>

      <div className="mcb-grid">
        {mcbStates.map((state, index) => (
          <div key={index} className="mcb-item" onClick={() => toggleMCB(index)}>
            <div className={`mcb-body ${state ? "on" : "off"}`}>
              <div className="mcb-symbol">+</div>
              <div className="mcb-symbol">+</div>
            </div>
            <span className="mcb-label">MCB {index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}