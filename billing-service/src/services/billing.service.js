const { v4: uuid } = require('uuid');
const Invoice = require('../models/invoice.model');

async function createInvoice(data) {
  const id = uuid();

  const result = await Invoice.query(
    `INSERT INTO invoices
     (id, user_id, subscription_id, amount, idempotency_key)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [
      id,
      data.userId,
      data.subscriptionId,
      data.amount,
      data.idempotencyKey
    ]
  );

  return result.rows[0];
}

async function updateStatus(id, status) {
  await Invoice.query(
    'UPDATE invoices SET status=$1, updated_at=NOW() WHERE id=$2',
    [status, id]
  );
}

async function fetchFailedInvoices() {
  const result = await Invoice.query(
    `SELECT * FROM invoices
     WHERE status='FAILED' AND retry_count < 3`
  );
  return result.rows;
}

async function incrementRetry(id) {
  await Invoice.query(
    'UPDATE invoices SET retry_count = retry_count + 1 WHERE id=$1',
    [id]
  );
}

module.exports = {
  createInvoice,
  updateStatus,
  fetchFailedInvoices,
  incrementRetry
};
