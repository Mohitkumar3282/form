const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// SPA fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Frontend Web Server
app.listen(PORT, () => {
  console.log(`🌐 Frontend Web UI running on http://localhost:${PORT}`);
});
