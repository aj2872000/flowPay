const express = require('express');

const app = express();

app.get('/health', (req, res) => {
  res.send('Auth Service is running');
});

module.exports = app;
