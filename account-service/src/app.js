const express = require('express');
const planRoutes = require('./routes/plan.routes');
const subscriptionRoutes = require('./routes/subscription.routes');

const app = express();

app.use(express.json());
app.use('/plans', planRoutes);
app.use('/subscriptions', subscriptionRoutes);

app.get('/health', (req, res) => {
  res.send('Account Service is running');
});

module.exports = app;
