const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
    service: {
        type: Schema.Types.ObjectId,
        ref: "Service",
        required: true,
    },
    reviewer: {
        type: Schema.Types.ObjectId,
        ref: "User",          // the client who wrote the review
        required: true,
    },
    reviewee: {
        type: Schema.Types.ObjectId,
        ref: "User",          // the setter being reviewed
        required: true,
    },
    rate: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    description: { type: String, trim: true },
    created_at: { type: Date, default: Date.now },
});

// One review per service
reviewSchema.index({ service: 1, reviewer: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
