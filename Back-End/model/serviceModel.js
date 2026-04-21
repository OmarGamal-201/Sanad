const mongoose = require("mongoose");
const { Schema } = mongoose;

const serviceSchema = new Schema(
    {
        client: {
            type: Schema.Types.ObjectId,
            ref: "User",          // references a Client (role: "client")
            required: true,
        },
        provider: {
            type: Schema.Types.ObjectId,
            ref: "User",          // references a Setter (role: "setter")
        },
        description: { type: String, trim: true },
        category: {
            type: String,
            enum: ["Elderly Care", "Babysitting", "Special Needs", "Nursing"],
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
            default: "pending",
        },
        price: { type: Number, min: 0 },
        date_time: { type: Date },              // scheduled date & time
        created_at: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
