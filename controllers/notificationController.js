const { Notification } = require('../models');
const generatePublicId = require('../utils/generatePublicId');
const asyncHandler = require('express-async-handler');

exports.getNotifications = asyncHandler(async (req, res) => {
    const employeeId = req.user.id;

    const notifications = await Notification.findAll({
        where: { employee_id: employeeId },
        order: [['created_at', 'DESC']]
    });

    // is_read değeri false olanların sayısını bul
    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Meta veri ile dön
    res.status(200).json({
        data: notifications,
        meta: { unreadCount }
    });
});

// 2. Tüm Bildirimleri Okundu İşaretleme (Madde 2)
exports.markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.update(
        { is_read: true },
        { where: { employee_id: req.user.id, is_read: false } }
    );

    res.status(200).json({ data: { message: 'Tüm bildirimler okundu olarak işaretlendi.' } });
});

// 3. Tekil Bildirimi Okundu İşaretleme (Madde 2)
exports.markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
        where: { id: req.params.id, employee_id: req.user.id }
    });

    if (!notification) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Bildirim bulunamadı veya yetkiniz yok.' } });

    notification.is_read = true;
    await notification.save();

    res.status(200).json({ data: { message: 'Bildirim okundu.' } });
});