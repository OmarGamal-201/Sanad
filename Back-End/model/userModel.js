const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const disposable = require("disposable-email-domains");
const { number } = require("joi");
const { Schema } = mongoose;

const addressSchema = new Schema(
    {
        city: { type: String },
        street: { type: String },
        governrate: { type: String },
    },
    { _id: false }
);

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Username is required"],
            unique: [true, "Username is already used"],
            trim: true,
            minLength: [3, "Username must be at least 3 characters long"],
            maxLength: [30, "Username cannot exceed 30 characters"],
            match: [
                /^[a-zA-Z0-9_-]+$/,
                "Username can only contain letters, numbers, spaces, underscores and hyphens",
            ],

            validate: {
                validator: function (v) {
                    const prohibited = ["admin", "root", "system", "moderator"];
                    return !prohibited.includes(v.toLowerCase());
                },
                message: "This username is not allowed",
            },
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
            validate: {
                validator: function (email) {
                    const domain = email.split("@")[1];
                    return !disposable.includes(domain); // returns true if NOT disposable
                },
                message: "Disposable email addresses are not allowed",
            },
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minLength: [8, "Password must be at least 8 characters long"],
            validate: {
                validator: function (v) {
                    // Must contain at least one uppercase, one lowercase, one number, one special char
                    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
                        v
                    );
                },
                message:
                    "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
            },
        },
        phone: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    // Accept:
                    // +2010XXXXXXXX
                    // 010XXXXXXXX
                    return /^(\+20|0)?1[0-2,5]\d{8}$/.test(v);
                },
                message: "Invalid phone number",
            },
        },
        photo: {
            type: String,
            // required: [true, "Photo is required"],
        },       // URL or file path
        id_pic: {
            type: String,
            // required: [true, "ID picture is required"],
        },      // URL or file path for ID picture
        address: { type: addressSchema },
        role: {
            type: String,
            enum: ["admin", "client", "provider"],
            required: true,
        },
    },
    { timestamps: true, discriminatorKey: "role" }
);
userSchema.index({ role: 1 }); // For filtering by role
userSchema.index({ createdAt: -1 }); // For sorting by creation date

// Hash password before save if modified/new

    // Hash password before save if modified/new
    userSchema.pre("save", async function () {
        if (!this.isModified("password")) return;

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    });


// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
