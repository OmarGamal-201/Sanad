const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // كل مسارات الخدمات بتحتاج يوزر مسجل الدخول

// العملاء بس هم اللي يقدروا يطلبوا خدمة جديدة
router.post('/', authorize('client'), serviceController.createService);

// الكل يقدر يشوف الخدمات (مع اختلاف الفلاتر في الكنترولر)
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// التعديل (العميل يعدل طلبه، الفني يقبل الطلب، الإدمن يدير)
router.put('/:id', serviceController.updateService);

// الحذف (للعميل أو الإدمن)
router.delete('/:id', authorize('client', 'admin'), serviceController.deleteService);

module.exports = router;