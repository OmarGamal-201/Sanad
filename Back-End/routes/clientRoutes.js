const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // حماية الملف بالكامل

// الإدمن بس يقدر يشوف لستة العملاء كلها
router.get('/', authorize('admin'), clientController.getAllClients);

// الإدمن والفني يقدروا يشوفوا بروفايل عميل محدد (الفني هيحتاج يشوف بيانات العميل اللي طلب منه الخدمة)
router.get('/:id', authorize('admin', 'provider'), clientController.getClientById);

// الإدمن بس هو اللي يقدر يعدل أو يمسح العميل من هنا (العميل نفسه بيعدل بياناته من راوت /api/auth/me)
router.put('/:id', authorize('admin'), clientController.updateClient);
router.delete('/:id', authorize('admin'), clientController.deleteClient);

module.exports = router;