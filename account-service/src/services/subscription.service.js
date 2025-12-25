const db = require('../models/subscription.model');

exports.createSubscription = async (userId, planId) => {
  const result = await db.query(
    `INSERT INTO subscriptions (user_id, plan_id)
     VALUES ($1, $2) RETURNING *`,
    [userId, planId]
  );

  return result.rows[0];
};

exports.cancelSubscription = async (id) => {
  const result = await db.query(
    `UPDATE subscriptions
     SET status = 'CANCELLED'
     WHERE id = $1 RETURNING *`,
    [id]
  );

  return result.rows[0];
};

exports.getUserSubscriptions = async (userId) => {
  const result = await db.query(
    `SELECT * FROM subscriptions WHERE user_id = $1`,
    [userId]
  );

  return result.rows;
};
