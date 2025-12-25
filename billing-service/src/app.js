const express = require('express');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.send('Billing Service is running');
});

module.exports = app;
