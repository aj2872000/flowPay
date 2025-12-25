const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./routes/payment.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/simulate', paymentRoutes);

app.get('/health', (req, res) => {
  res.send('Payment-simulator Service is running');
});

module.exports = app;
