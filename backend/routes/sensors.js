const express = require('express');
const axios = require('axios');
const router = express.Router();
const ESP_URL = 'http://192.168.1.100';

router.get('/all', async (req, res) => {
  try {
    const espRes = await axios.get(`${ESP_URL}/api/status`);
    res.json({
      temperature: espRes.data.temperature,
      humidity: espRes.data.humidity,
      gasLevel: espRes.data.gas,
      flame: espRes.data.flame,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'ESP32 unreachable' });
  }
});

module.exports = router;