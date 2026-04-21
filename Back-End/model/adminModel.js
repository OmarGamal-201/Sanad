const mongoose = require("mongoose");
const User = require("./userModel");

const adminSchema = new mongoose.Schema({
  last_login: { type: Date },
});

const Admin = User.discriminator("admin", adminSchema);

module.exports = Admin;
