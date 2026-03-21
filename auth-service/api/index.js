const connectDB = require("../config/database");
const app       = require("../app");

// connectDB is called on every cold start and cached after that
let ready = false;
module.exports = async (req, res) => {
  if (!ready) { await connectDB(); ready = true; }
  return app(req, res);
};
