const express = require('express');
const eventRoutes = require("./routes/event.routes");

const app = express();

app.use(express.json());
app.use("/api", eventRoutes);

app.get('/health', (req, res) => {
  res.send('Event Service is running');
});

module.exports = app;
