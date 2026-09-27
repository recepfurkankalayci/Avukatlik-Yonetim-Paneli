const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const verifyToken = require('../middlewares/authMiddlewares');

router.get('/', verifyToken, notificationController.getNotifications);
router.patch('/read-all', verifyToken, notificationController.markAllAsRead);
router.patch('/:id/read', verifyToken, notificationController.markAsRead);

module.exports = router;
