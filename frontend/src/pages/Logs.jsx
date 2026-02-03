// src/pages/Logs.jsx
import { useState, useEffect } from "react";
import "../styles/logs.css";

export default function Logs() {
  // Example: mock data (in real app, fetch from API, WebSocket, or local storage)
  const [logs, setLogs] = useState([
    {
      id: 1,
      timestamp: "2025-02-01 13:45:22",
      type: "MCB",
      message: "MCB 3 turned ON manually",
      level: "info",
    },
    {
      id: 2,
      timestamp: "2025-02-01 13:44:10",
      type: "Sensor",
      message: "Motion detected by PIR → Auto Up triggered",
      level: "info",
    },
    {
      id: 3,
      timestamp: "2025-02-01 13:42:55",
      type: "Alert",
      message: "Air Quality dropped to POOR (MQ-2)",
      level: "warning",
    },
    {
      id: 4,
      timestamp: "2025-02-01 13:40:30",
      type: "MCB",
      message: "MCB 5 tripped due to overload",
      level: "error",
    },
    {
      id: 5,
      timestamp: "2025-02-01 13:38:12",
      type: "System",
      message: "Device reconnected after power restore",
      level: "success",
    },
    // ... more entries
  ]);

  // Optional: filter controls
  const [filterType, setFilterType] = useState("all");

  const filteredLogs = filterType === "all"
    ? logs
    : logs.filter(log => log.type.toLowerCase() === filterType.toLowerCase());

  return (
    <div className="logs-page">
      <h2 className="page-title">Logs & Events</h2>

      {/* Filter controls */}
      <div className="logs-filter">
        <span className="filter-label">Show:</span>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Events</option>
          <option value="mcb">MCB Actions</option>
          <option value="sensor">Sensor Triggers</option>
          <option value="alert">Alerts & Warnings</option>
          <option value="system">System Events</option>
        </select>
      </div>

      {/* Logs list */}
      <div className="logs-list">
        {filteredLogs.length === 0 ? (
          <div className="no-logs">
            <p>No logs found for the selected filter.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className={`log-item ${log.level}`}>
              <div className="log-header">
                <span className="log-timestamp">{log.timestamp}</span>
                <span className={`log-type ${log.type.toLowerCase()}`}>
                  {log.type}
                </span>
              </div>
              <div className="log-message">{log.message}</div>
              <div className={`log-level-badge ${log.level}`}>
                {log.level.toUpperCase()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Optional: Load more / Clear logs buttons */}
      <div className="logs-actions">
        <button className="action-btn load-more">Load More</button>
        <button className="action-btn clear-logs danger">Clear All Logs</button>
      </div>
    </div>
  );
}