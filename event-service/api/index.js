const connectDB = require("../config/database");
const app       = require("../app");
let ready = false;
module.exports = async (req, res) => {
  if (!ready) { await connectDB(); ready = true; }
  return app(req, res);
};
