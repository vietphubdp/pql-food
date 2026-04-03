require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@pqlfood.vn").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: "Quản trị viên",
      email: adminEmail,
      password: hash,
      role: "admin",
    });
    console.log("Created admin:", adminEmail);
  } else {
    admin.role = "admin";
    if (process.env.RESET_ADMIN_PASSWORD === "1") {
      admin.password = await bcrypt.hash(adminPassword, 10);
      console.log("Reset admin password for:", adminEmail);
    }
    await admin.save();
    console.log("Admin ready:", adminEmail);
  }
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
