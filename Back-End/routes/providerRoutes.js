const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// البحث عن فنيين (ممكن نخليها متاحة للكل بدون توكن لو حابب، بس الأفضل protect)
router.get('/', protect, providerController.getAllProviders); // Done
router.get('/:id', protect, providerController.getProviderById); // Done

// تعديل أو حذف بيانات الفنيين (للإدمن فقط، الفني بيعدل بياناته من /api/auth/me)
router.put('/:id', protect, authorize('admin'), providerController.updateProvider);
router.delete('/:id', protect, authorize('admin'), providerController.deleteProvider);

module.exports = router;