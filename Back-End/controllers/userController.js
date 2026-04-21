const User = require('../model/userModel');
const Admin = require('../model/adminModel');
const Provider = require('../model/providerModel');
const Client = require('../model/clientModel'); // بافتراض إنه موجود زي ما ظهر في authController

// ─── Helpers ────────────────────────────────────────────────────────────────
function getModelByRole(role) {
    const map = { admin: Admin, client: Client, provider: Provider };
    return map[role] || null;
}

// ─── POST /api/users (Admin Only) ────────────────────────────────────────────
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, phone, photo, id_pic, address, role } = req.body;

        if (!['admin', 'client', 'provider'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role provided' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // استخدام الموديل الصحيح بناءً على الـ Role
        const Model = getModelByRole(role);
        const newUser = await Model.create({
            name,
            email,
            password,
            phone,
            photo,
            id_pic,
            address,
            role
        });

        // إخفاء الباسورد قبل الرد
        newUser.password = undefined;

        return res.status(201).json({ success: true, user: newUser });
    } catch (err) {
        console.error('CREATE USER ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── GET /api/users ──────────────────────────────────────────────────────────
// Query params (optional): ?role=client&city=Cairo
exports.getAllUsers = async (req, res) => {
    try {
        const query = {};

        // الفلترة بالـ Role
        if (req.query.role) {
            query.role = req.query.role;
        }

        // الفلترة بالعنوان
        if (req.query.city) {
            query['address.city'] = req.query.city;
        }
        if (req.query.governrate) {
            query['address.governrate'] = req.query.governrate;
        }

        // Mongoose هيجيب كل الـ Users (بما فيهم الـ Admins و Providers) وهيرجع الحقول الخاصة بيهم زي last_login
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, count: users.length, users });
    } catch (err) {
        console.error('GET ALL USERS ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── GET /api/users/:id ──────────────────────────────────────────────────────
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ success: true, user });
    } catch (err) {
        console.error('GET USER BY ID ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── PUT /api/users/:id (Admin Only) ─────────────────────────────────────────
exports.updateUser = async (req, res) => {
    try {
        const allowedFields = ['name', 'phone', 'photo', 'id_pic'];
        const updates = {};

        // 1. Update direct fields
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        // 2. Handle nested address
        if (req.body.address) {
            if (req.body.address.city) updates['address.city'] = req.body.address.city;
            if (req.body.address.street) updates['address.street'] = req.body.address.street;
            if (req.body.address.governrate) updates['address.governrate'] = req.body.address.governrate;
        }

        // User.findByIdAndUpdate هتقدر تعدل على أي نوع (Admin, Client, Provider) عادي
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ success: true, user });
    } catch (err) {
        console.error('UPDATE USER ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── DELETE /api/users/:id (Admin Only) ──────────────────────────────────────
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();

        return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        console.error('DELETE USER ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};