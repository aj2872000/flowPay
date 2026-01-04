const { pool } = require('./init-db'); // reuse same pool

const createEvent = async (event) => {
  const query = `
    INSERT INTO events (id, event_type, source, payload)
    VALUES ($1, $2, $3, $4)
  `;
  await pool.query(query, [
    event.id,
    event.event_type,
    event.source,
    event.payload
  ]);
};

const eventExists = async (id) => {
  const result = await pool.query(
    "SELECT 1 FROM events WHERE id = $1",
    [id]
  );
  return result.rowCount > 0;
};

const markProcessed = async (id, status) => {
  await pool.query(
    "UPDATE events SET event_type = $1 WHERE id = $2",
    [status,id]
  );
};

module.exports = {
  createEvent,
  eventExists,
  markProcessed
};
