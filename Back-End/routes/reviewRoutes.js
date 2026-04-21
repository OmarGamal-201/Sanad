const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

// أي حد مسجل يقدر يشوف التقييمات
router.get('/', protect, reviewController.getAllReviews);
router.get('/:id', protect, reviewController.getReviewById);

// العملاء بس هم اللي يضيفوا تقييم
router.post('/', protect, authorize('client'), reviewController.createReview);

// العميل يقدر يعدل ويمسح، والإدمن يقدر يمسح
router.put('/:id', protect, authorize('client'), reviewController.updateReview);
router.delete('/:id', protect, authorize('client', 'admin'), reviewController.deleteReview);

module.exports = router;