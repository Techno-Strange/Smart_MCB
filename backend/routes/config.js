const express = require('express');
const router = express.Router();
const ESP_URL = 'http://192.168.1.100';

// Update temperature threshold
router.post('/temp_threshold', async (req, res) => {
  const { value } = req.body;
  try {
    // Assuming ESP32 has endpoint like /api/config/temp/:value
    await axios.get(`${ESP_URL}/api/config/temp/${value}`);
    res.json({ success: true, value });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update threshold' });
  }
});

// Similar for gas, sensor toggles, etc.

module.exports = router;