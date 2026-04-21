const Client = require('../model/clientModel');

// ─── GET /api/clients ────────────────────────────────────────────────────────
// Query params (optional): ?city=Cairo
exports.getAllClients = async (req, res) => {
    try {
        const query = {};

        // فلترة بالعنوان لو الإدمن حابب يجيب عملاء محافظة معينة
        if (req.query.city) {
            query['address.city'] = req.query.city;
        }
        if (req.query.governrate) {
            query['address.governrate'] = req.query.governrate;
        }

        // Client.find() automatically uses the discriminator to get ONLY clients
        const clients = await Client.find(query)
            .select('-password') // Always exclude password
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, count: clients.length, clients });
    } catch (err) {
        console.error('GET ALL CLIENTS ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── GET /api/clients/:id ────────────────────────────────────────────────────
exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id).select('-password');

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        return res.status(200).json({ success: true, client });
    } catch (err) {
        console.error('GET CLIENT BY ID ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── PUT /api/clients/:id (Admin Only) ───────────────────────────────────────
exports.updateClient = async (req, res) => {
    try {
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

        const client = await Client.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        return res.status(200).json({ success: true, client });
    } catch (err) {
        console.error('UPDATE CLIENT ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── DELETE /api/clients/:id (Admin Only) ────────────────────────────────────
exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Optional: Delete all services related to this client before deleting the client
        // await Service.deleteMany({ client: client._id });

        await client.deleteOne();

        return res.status(200).json({ success: true, message: 'Client deleted successfully' });
    } catch (err) {
        console.error('DELETE CLIENT ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};