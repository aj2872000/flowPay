const axios = require('axios');

const BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL;

exports.createInvoice = async (data, authHeader, idempotencyKey) => {
  return axios.post(
    `${BILLING_SERVICE_URL}/api/invoices/generate`,
    data,
    {
      headers: {
        Authorization: authHeader,
        "Idempotency-Key": idempotencyKey
      }
    }
  );
};
