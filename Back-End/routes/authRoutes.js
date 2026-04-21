const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', authController.register); // Done
router.post('/login', authController.login);       // Done

// Protected routes (Require login)
router.use(protect); // أي راوت تحت السطر ده هيحتاج توكن
router.get('/me', authController.me);  // Done
router.put('/me', authController.updateMe);  // Done
router.post('/change-password', authController.changePassword); // Done

module.exports = router;