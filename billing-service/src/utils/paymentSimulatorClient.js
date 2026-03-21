const axios = require('axios');

const PAYMENT_SIMULATOR_SERVICE_URL = process.env.PAYMENT_SIMULATOR_SERVICE_URL;

exports.simulatePayment = async (data, authHeader) => {
  return axios.post(
    `${PAYMENT_SIMULATOR_SERVICE_URL}/simulate/payment`,
    data,
    {
      headers: {
        Authorization: authHeader,
      }
    }
  );
};
