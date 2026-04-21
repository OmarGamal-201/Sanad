const mongoose = require("mongoose");
const User = require("./userModel");

const clientSchema = new mongoose.Schema({
    no_jobs: { type: Number, default: 0 },   // number of jobs requested
    rate: { type: Number, default: 0, min: 0, max: 5 },
});

const Client = User.discriminator("client", clientSchema);

module.exports = Client;
