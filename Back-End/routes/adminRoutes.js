const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// حماية كاملة للملف ده، محدش يدخله غير الإدمن 
// (أو الـ Super Admin لو ضفت Role جديد اسمه super_admin في المستقبل)
router.use(protect);
router.use(authorize('admin')); 

router.get('/', adminController.getAllAdmins);
router.get('/:id', adminController.getAdminById);
router.put('/:id', adminController.updateAdmin);
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;