const express = require('express');
const axios = require('axios');
const router = express.Router();
const { io } = require('../server');
const ESP_URL = 'http://192.168.1.100'; // ← your ESP32 IP

// Get all MCB states
router.get('/status', async (req, res) => {
  try {
    const espRes = await axios.get(`${ESP_URL}/api/status`);
    res.json(espRes.data);
  } catch (err) {
    res.status(500).json({ error: 'ESP32 unreachable' });
  }
});

// Toggle single MCB
router.post('/toggle', async (req, res) => {
  const { id, state } = req.body; // id: 1-6, state: true/false
  try {
    const espRes = await axios.get(`${ESP_URL}/api/mcb/${id}/${state ? 'on' : 'off'}`);
    // Broadcast update to all connected clients
    io.emit('mcbUpdate', { id, state });
    res.json(espRes.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle MCB' });
  }
});

module.exports = router;