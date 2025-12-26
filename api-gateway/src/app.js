const express = require('express');
const cors = require('cors');
const proxyRoutes = require('./routes/proxy.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', proxyRoutes);

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('Gateway Error:', err.message);

  res.status(500).json({
    error: 'Internal Gateway Error'
  });
});

app.get('/health', (req, res) => {
  res.send('Api gateway Service is running');
});

module.exports = app;
