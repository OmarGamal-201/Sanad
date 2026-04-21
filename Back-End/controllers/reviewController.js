const Review = require('../model/reviewModel');
const Service = require('../model/serviceModel');
const Provider = require('../model/providerModel');
const mongoose = require('mongoose');

// ─── Helpers ────────────────────────────────────────────────────────────────
// دالة مساعدة لحساب متوسط التقييمات للفني وتحديث الـ Profile بتاعه
async function updateProviderRating(providerId) {
    try {
        const stats = await Review.aggregate([
            { $match: { reviewee: new mongoose.Types.ObjectId(providerId) } },
            { 
                $group: { 
                    _id: '$reviewee', 
                    avgRating: { $avg: '$rate' }, 
                    numReviews: { $sum: 1 } 
                } 
            }
        ]);

        // لو فيه تقييمات، بنقرب الرقم لعشر واحد (مثلاً 4.5)، لو مفيش بنرجعه صفر
        const newRate = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
        
        await Provider.findByIdAndUpdate(providerId, { rate: newRate });
    } catch (err) {
        console.error('UPDATE PROVIDER RATING ERROR:', err);
    }
}

// ─── POST /api/reviews ───────────────────────────────────────────────────────
// Body: { serviceId, rate, description }
exports.createReview = async (req, res) => {
    try {
        const { serviceId, rate, description } = req.body;

        // 1. التأكد إن الخدمة موجودة
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // 2. التأكد إن اللي بيعمل التقييم هو العميل صاحب الخدمة
        if (service.client.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to review this service' });
        }

        // 3. (اختياري) يفضل التأكد إن الخدمة اكتملت قبل التقييم
        if (service.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed services' });
        }

        // 4. إنشاء التقييم
        const review = await Review.create({
            service: serviceId,
            reviewer: req.user.id,
            reviewee: service.provider, // بناخد الـ ID بتاع الفني من الخدمة نفسها
            rate,
            description
        });

        // 5. تحديث متوسط تقييم الفني
        await updateProviderRating(service.provider);

        return res.status(201).json({ success: true, review });
    } catch (err) {
        // التعامل مع الخطأ لو العميل حاول يقيم نفس الخدمة مرتين (بسبب الـ unique index)
        if (err.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this service' });
        }
        console.error('CREATE REVIEW ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── GET /api/reviews ────────────────────────────────────────────────────────
// Query params (optional): ?reviewee=PROVIDER_ID&reviewer=CLIENT_ID
exports.getAllReviews = async (req, res) => {
    try {
        const query = {};

        // فلترة عشان نجيب تقييمات فني معين (هتتعرض في بروفايله)
        if (req.query.reviewee) {
            query.reviewee = req.query.reviewee;
        }

        // فلترة عشان نجيب التقييمات اللي عميل معين عملها
        if (req.query.reviewer) {
            query.reviewer = req.query.reviewer;
        }

        const reviews = await Review.find(query)
            .populate('reviewer', 'name photo') // محتاجين اسم وصورة العميل بس للواجهة
            .populate('service', 'category date_time')
            .sort({ created_at: -1 });

        return res.status(200).json({ success: true, count: reviews.length, reviews });
    } catch (err) {
        console.error('GET ALL REVIEWS ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── GET /api/reviews/:id ────────────────────────────────────────────────────
exports.getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('reviewer', 'name photo')
            .populate('reviewee', 'name')
            .populate('service', 'category status');

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        return res.status(200).json({ success: true, review });
    } catch (err) {
        console.error('GET REVIEW BY ID ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── PUT /api/reviews/:id ────────────────────────────────────────────────────
// Body: { rate, description }
exports.updateReview = async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // التأكد إن العميل صاحب التقييم هو اللي بيعدله
        if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        // تحديث الحقول المسموحة فقط
        if (req.body.rate !== undefined) review.rate = req.body.rate;
        if (req.body.description !== undefined) review.description = req.body.description;

        await review.save();

        // تحديث متوسط تقييم الفني بعد التعديل
        await updateProviderRating(review.reviewee);

        return res.status(200).json({ success: true, review });
    } catch (err) {
        console.error('UPDATE REVIEW ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── DELETE /api/reviews/:id ─────────────────────────────────────────────────
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // التأكد إن العميل صاحب التقييم أو الأدمن هو اللي بيمسحه
        if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        const providerId = review.reviewee;

        await review.deleteOne();

        // تحديث متوسط تقييم الفني بعد الحذف
        await updateProviderRating(providerId);

        return res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (err) {
        console.error('DELETE REVIEW ERROR:', err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
};