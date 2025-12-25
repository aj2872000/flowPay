const Invoice = require('../models/invoice.model');

async function checkIdempotency(key) {
  const result = await Invoice.query(
    'SELECT * FROM invoices WHERE idempotency_key = $1',
    [key]
  );
  return result.rows[0];
}

module.exports = { checkIdempotency };
