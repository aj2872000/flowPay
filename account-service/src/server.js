require('dotenv').config();
const app = require('./app');
const { initDB } = require('./models/init-db')

const PORT = process.env.PORT || 4002;

const startServer = async () => {
  await initDB(); // initialize tables
  app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
  });
};

startServer();
