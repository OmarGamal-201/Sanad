const Provider = require('../model/providerModel');

// ─── GET /api/providers ──────────────────────────────────────────────────────
// Query params (optional): ?job=Nursing&availability=true&city=Cairo
exports.getAllProviders = async (req, res) => {
    try {
        const query = {};
        
        // Filters based on provider fields
        if (req.query.job) {
            query.job = req.query.job; // Returns providers who have this job
        }
        if (req.query.availability !== undefined) {
            query.availability = req.query.availability === 'true';
        }
        
        // Filters based on base User fields (Address)
        if (req.query.city) {
            query['address.city'] = req.query.city;
        }
        if (req.query.governrate) {
            query['address.governrate'] = req.query.governrate;
        }

        const providers = await Provider.find(query)
            .select('-password -id_pic') // Exclude password and sensitive ID picture from public search
            .sort({ rate: -1 }); // Sort by highest rating

        return res.status(200).json({ success: true, count: providers.length, providers });
    } catch (err) {
        console.error('GET ALL PROVIDERS ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── GET /api/providers/:id ──────────────────────────────────────────────────
exports.getProviderById = async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id).select('-password');

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        return res.status(200).json({ success: true, provider });
    } catch (err) {
        console.error('GET PROVIDER BY ID ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── PUT /api/providers/:id ──────────────────────────────────────────────────
// Note: Can be used by Admin to manage providers, or internally for specific updates
exports.updateProvider = async (req, res) => {
    try {
        // Base user fields + Provider specific fields
        const allowedFields = ['name', 'phone', 'photo', 'id_pic', 'availability', 'hr_price', 'job'];
        
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

        // 3. Security logic: 'rate' and 'no_jobs' usually update automatically after a service completes.
        // We only allow an Admin to manually override them.
        if (req.user && req.user.role === 'admin') {
            if (req.body.rate !== undefined) updates.rate = req.body.rate;
            if (req.body.no_jobs !== undefined) updates.no_jobs = req.body.no_jobs;
        }

        const provider = await Provider.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true } // runValidators ensures base Schema rules apply
        ).select('-password');

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        return res.status(200).json({ success: true, provider });
    } catch (err) {
        console.error('UPDATE PROVIDER ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── DELETE /api/providers/:id ───────────────────────────────────────────────
exports.deleteProvider = async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id);

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        await provider.deleteOne();

        return res.status(200).json({ success: true, message: 'Provider deleted successfully' });
    } catch (err) {
        console.error('DELETE PROVIDER ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};