const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const Admin = require('../model/adminModel');
const Client = require('../model/clientModel');
const Provider = require('../model/providerModel');
// const Wallet = require('../models/Wallet');

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateToken(user) {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
}

function getModelByRole(role) {
    const map = { admin: Admin, client: Client, provider: Provider };
    return map[role] || null;
}

// ─── POST /api/auth/register ─────────────────────────────────────────────────
// Body: { name, email, phone, password, role: "client" | "provider" }
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, photo, id_pic, role } = req.body;

        if (!['client', 'provider'].includes(role)) {
            return res.status(400).json({ message: 'Role must be either client or provider' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const Model = getModelByRole(role);
        const user = await Model.create({ name, email, phone, password, photo, id_pic, role });

        // Auto-create a wallet for every new user
        // await Wallet.create({ user: user._id, balance: 0 });

        const token = generateToken(user);
        return res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error('REGISTER ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── POST /api/auth/login ────────────────────────────────────────────────────
// Body: { email, password }
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            console.log(password)
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Update last_login for admins
        if (user.role === 'admin') {
            await Admin.findByIdAndUpdate(user._id, { last_login: new Date() });
        }

        const token = generateToken(user);
        return res.status(200).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error('LOGIN ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── GET /api/auth/me (protected) ───────────────────────────────────────────
exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.status(200).json({ success: true, user });
    } catch (err) {
        console.error('ME ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── PUT /api/auth/me (protected) ───────────────────────────────────────────
// Body: any allowed profile fields
exports.updateMe = async (req, res) => {
    try {
        const allowedFields = ['name', 'phone', 'photo', 'id_pic', 'address'];

        // Role-specific extra fields
        if (req.user.role === 'provider') {
            allowedFields.push('availability', 'hr_price', 'job');
        }

        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.status(200).json({ success: true, user });
    } catch (err) {
        console.error('UPDATE ME ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── POST /api/auth/change-password (protected) ─────────────────────────────
// Body: { currentPassword, newPassword }
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        console.error('CHANGE PASSWORD ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};