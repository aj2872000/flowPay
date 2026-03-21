require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 4010;

app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
});
