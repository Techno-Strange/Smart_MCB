// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

// IMPORTANT: Change this to your ESP32's actual IP address
const ESP_IP = '10.225.183.117';  // ← REPLACE WITH YOUR ESP32 IP
const ESP_URL = `http://${ESP_IP}`;

// Middleware
app.use(cors());                // Allow frontend to connect
app.use(express.json());

// Health check (test if backend is running)
app.get('/health', (req, res) => {
  res.json({ status: 'Backend OK', time: new Date().toISOString() });
});

// 1. Get all status (sensors + MCB states)
app.get('/api/status', async (req, res) => {
  try {
    const response = await axios.get(`${ESP_URL}/api/status`);
    res.json(response.data);
  } catch (error) {
    console.error('ESP32 status error:', error.message);
    res.status(503).json({ error: 'ESP32 not reachable' });
  }
});

// 2. Toggle MCB (relay/servo control)
app.get('/api/mcb/:id/:state', async (req, res) => {
  const { id, state } = req.params;
  try {
    const response = await axios.get(`${ESP_URL}/api/mcb/${id}/${state}`);
    res.json(response.data);
  } catch (error) {
    console.error('MCB toggle error:', error.message);
    res.status(503).json({ error: 'Failed to toggle MCB' });
  }
});

// 3. Toggle sensor monitoring (enable/disable alerts)
app.get('/api/sensor/:sensor/:state', async (req, res) => {
  const { sensor, state } = req.params;
  // Allowed sensors: temperature, gas, flame
  if (!['temperature', 'gas', 'flame'].includes(sensor)) {
    return res.status(400).json({ error: 'Invalid sensor' });
  }
  try {
    const response = await axios.get(`${ESP_URL}/api/sensor/${sensor}/${state}`);
    res.json({ success: true, sensor, enabled: state === 'on' });
  } catch (error) {
    console.error('Sensor toggle error:', error.message);
    res.status(503).json({ error: 'Failed to update sensor' });
  }
});

// NEW: Test SOS siren (triggers 20s buzzer on ESP32)
app.get('/api/sos/test', async (req, res) => {
  try {
    const response = await axios.get(`${ESP_URL}/api/sos/test`);
    res.json({ success: true, message: 'SOS siren test triggered', response: response.data });
  } catch (error) {
    console.error('SOS test error:', error.message);
    res.status(503).json({ error: 'Failed to trigger SOS siren', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Proxying requests to ESP32 at ${ESP_URL}`);
});