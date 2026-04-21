const Admin = require('../model/adminModel');

// ─── GET /api/admins ─────────────────────────────────────────────────────────
exports.getAllAdmins = async (req, res) => {
    try {
        // Admin.find() automatically uses the discriminator to get ONLY admins
        const admins = await Admin.find()
            .select('-password') // Always exclude password
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, count: admins.length, admins });
    } catch (err) {
        console.error('GET ALL ADMINS ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── GET /api/admins/:id ─────────────────────────────────────────────────────
exports.getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id).select('-password');

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        return res.status(200).json({ success: true, admin });
    } catch (err) {
        console.error('GET ADMIN BY ID ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── PUT /api/admins/:id (Super Admin Only) ──────────────────────────────────
exports.updateAdmin = async (req, res) => {
    try {
        // Allowed fields for an Admin to be updated manually
        // Note: 'last_login' is omitted because it updates automatically upon login
        const allowedFields = ['name', 'phone', 'photo', 'id_pic'];

        const updates = {};

        // 1. Update direct fields
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        // 2. Handle nested address fields properly (Dot Notation)
        if (req.body.address) {
            if (req.body.address.city) updates['address.city'] = req.body.address.city;
            if (req.body.address.street) updates['address.street'] = req.body.address.street;
            if (req.body.address.governrate) updates['address.governrate'] = req.body.address.governrate;
        }

        const admin = await Admin.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        return res.status(200).json({ success: true, admin });
    } catch (err) {
        console.error('UPDATE ADMIN ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── DELETE /api/admins/:id (Super Admin Only) ───────────────────────────────
exports.deleteAdmin = async (req, res) => {
    try {
        // Optional: Prevent deleting the main/super admin
        // if (req.params.id === process.env.SUPER_ADMIN_ID) { ... }

        const admin = await Admin.findById(req.params.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        await admin.deleteOne();

        return res.status(200).json({ success: true, message: 'Admin deleted successfully' });
    } catch (err) {
        console.error('DELETE ADMIN ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};