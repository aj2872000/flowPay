const axios = require('axios');

const httpClient = axios.create({
  timeout: 5000
});

module.exports = httpClient;
