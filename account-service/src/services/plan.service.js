const db = require('../models/plan.model');

exports.createPlan = async (data) => {
  const { name, price, duration_days } = data;

  const result = await db.query(
    `INSERT INTO plans (name, price, duration_days)
     VALUES ($1, $2, $3) RETURNING *`,
    [name, price, duration_days]
  );

  return result.rows[0];
};

exports.getPlans = async () => {
  const result = await db.query(`SELECT * FROM plans`);
  return result.rows;
};
