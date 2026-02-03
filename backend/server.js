// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000; // Render uses env PORT

// IMPORTANT: Change this to your ESP32's actual IP address
const ESP_IP = '10.225.183.117';  // ← REPLACE WITH YOUR ESP32 IP
const ESP_URL = `http://${ESP_IP}`;

// Middleware
app.use(cors({ origin: '*' })); // Allow all for now (change to specific domain later)
app.use(express.json());

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check (test backend + optional ESP32 check)
app.get('/health', async (req, res) => {
  try {
    // Optional: ping ESP32 health too
    await axios.get(`${ESP_URL}/health`, { timeout: 5000 });
    res.json({ status: 'Backend OK', esp: 'reachable', time: new Date().toISOString() });
  } catch (err) {
    res.json({ 
      status: 'Backend OK', 
      esp: 'unreachable', 
      error: err.message,
      time: new Date().toISOString() 
    });
  }
});

// 1. Get all status (sensors + MCB states)
app.get('/api/status', async (req, res) => {
  try {
    const response = await axios.get(`${ESP_URL}/api/status`, { timeout: 10000 });
    res.json(response.data);
  } catch (error) {
    console.error('ESP32 status error:', error.message);
    res.status(503).json({ 
      error: 'ESP32 not reachable', 
      details: error.message 
    });
  }
});

// 2. Toggle MCB (relay/servo control)
app.get('/api/mcb/:id/:state', async (req, res) => {
  const { id, state } = req.params;
  try {
    const response = await axios.get(`${ESP_URL}/api/mcb/${id}/${state}`, { timeout: 8000 });
    res.json(response.data);
  } catch (error) {
    console.error('MCB toggle error:', error.message);
    res.status(503).json({ 
      error: 'Failed to toggle MCB', 
      details: error.message 
    });
  }
});

// 3. Toggle sensor monitoring (enable/disable alerts)
app.get('/api/sensor/:sensor/:state', async (req, res) => {
  const { sensor, state } = req.params;
  if (!['temperature', 'gas', 'flame'].includes(sensor)) {
    return res.status(400).json({ error: 'Invalid sensor' });
  }
  try {
    const response = await axios.get(`${ESP_URL}/api/sensor/${sensor}/${state}`, { timeout: 8000 });
    res.json({ success: true, sensor, enabled: state === 'on' });
  } catch (error) {
    console.error('Sensor toggle error:', error.message);
    res.status(503).json({ 
      error: 'Failed to update sensor', 
      details: error.message 
    });
  }
});

// 4. Test SOS siren (triggers 20s buzzer on ESP32)
app.get('/api/sos/test', async (req, res) => {
  try {
    const response = await axios.get(`${ESP_URL}/api/sos/test`, { timeout: 30000 }); // longer timeout for siren
    res.json({ 
      success: true, 
      message: 'SOS siren test triggered', 
      response: response.data 
    });
  } catch (error) {
    console.error('SOS test error:', error.message);
    res.status(503).json({ 
      error: 'Failed to trigger SOS siren', 
      details: error.message 
    });
  }
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Proxying requests to ESP32 at ${ESP_URL}`);
});