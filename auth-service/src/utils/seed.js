// Run once: node src/utils/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const User     = require("../models/user.model");

(async () => {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/flowpay_auth");

  const existing = await User.findOne({ email: "admin@flowpay.io" });
  if (existing) {
    await User.updateOne({ _id: existing._id }, { role: "admin" });
    console.log("✅ Promoted existing user to admin");
  } else {
    await User.create({
      name:     "Admin",
      email:    "admin@flowpay.io",
      password: "Admin123!",
      role:     "admin",
    });
    console.log("✅ Admin user created — email: admin@flowpay.io  password: Admin123!");
  }

  await mongoose.connection.close();
})();