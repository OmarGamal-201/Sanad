const mongoose = require("mongoose");
const User = require("./userModel");

const providerSchema = new mongoose.Schema({
  availability: { type: Boolean, default: true },
  rate: { type: Number, default: 0, min: 0, max: 5 },
  no_jobs: { type: Number, default: 0 },   // number of jobs completed
  job: [{
    type: String,
    enum: ["Elderly Care", "Babysitting", "Special Needs", "Nursing"],
  }],     // multi-valued: list of job types/skills
  hr_price: { type: Number, min: 0 },      // hourly price
});

const Provider = User.discriminator("provider", providerSchema);

module.exports = Provider;
