const Service = require('../model/serviceModel');

// ─── POST /api/services ──────────────────────────────────────────────────────
// Body: { description, category, price, date_time }
// Note: Assumes req.user is set by auth middleware (the logged-in Client)
exports.createService = async (req, res) => {
    try {
        const { description, category, price, date_time } = req.body;

        // Ensure category is valid (Mongoose will also check this, but good to validate early)
        const validCategories = ["Elderly Care", "Babysitting", "Special Needs", "Nursing"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: 'Invalid service category' });
        }

        const newService = await Service.create({
            client: req.user.id, // Taking client ID from the authenticated user
            description,
            category,
            price,
            date_time
        });

        return res.status(201).json({
            success: true,
            service: newService
        });
    } catch (err) {
        console.error('CREATE SERVICE ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── GET /api/services ───────────────────────────────────────────────────────
// Query params (optional): ?status=pending&category=Nursing
exports.getAllServices = async (req, res) => {
    try {
        // Build query based on optional filters
        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.category) query.category = req.query.category;

        // You might want to filter by user role here (e.g., if Client, only show their services)
        if (req.user.role === 'client') {
            query.client = req.user.id;
        } else if (req.user.role === 'provider') {
            // Providers might only see 'pending' services or services assigned to them
            // query.$or = [{ status: 'pending' }, { provider: req.user.id }];
        }

        const services = await Service.find(query)
            .populate('client', 'name phone address')
            .populate('provider', 'name phone rate')
            .sort({ created_at: -1 }); // Newest first

        return res.status(200).json({ success: true, count: services.length, services });
    } catch (err) {
        console.error('GET ALL SERVICES ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── GET /api/services/:id ───────────────────────────────────────────────────
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('client', 'name phone address')
            .populate('provider', 'name phone rate job');

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        return res.status(200).json({ success: true, service });
    } catch (err) {
        console.error('GET SERVICE BY ID ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── PUT /api/services/:id ───────────────────────────────────────────────────
// Body: any allowed fields to update (e.g., status, provider, price)
exports.updateService = async (req, res) => {
    try {
        const allowedFields = ['description', 'category', 'status', 'price', 'date_time', 'provider'];

        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        // Specific logic: if a provider accepts the service, assign their ID
        if (req.body.status === 'accepted' && req.user.role === 'provider') {
            updates.provider = req.user.id;
        }

        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        )
            .populate('client', 'name phone')
            .populate('provider', 'name phone');

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        return res.status(200).json({ success: true, service });
    } catch (err) {
        console.error('UPDATE SERVICE ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── DELETE /api/services/:id ────────────────────────────────────────────────
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Optional: Ensure only the creator (Client) or Admin can delete it
        if (req.user.role === 'client' && service.client.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this service' });
        }

        await service.deleteOne();

        return res.status(200).json({ success: true, message: 'Service deleted successfully' });
    } catch (err) {
        console.error('DELETE SERVICE ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};