const express = require('express');
const invoiceRoutes = require('./routes/invoice.routes');

const app = express();

app.use(express.json());
app.use('/api/invoices', invoiceRoutes);

app.get('/health', (req, res) => {
  res.send('Billing Service is running');
});

module.exports = app;
