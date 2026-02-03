// socket.js
const { io } = require('../server'); // import from server.js

// Broadcast helper (call this when ESP32 sends new data)
function broadcastUpdate(data) {
  io.emit('statusUpdate', data);
}

module.exports = { broadcastUpdate };