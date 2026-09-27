

const { Notification } = require('../models');


exports.createNotification = async (data) => {
    try {
        return await Notification.create({
            employee_id: data.employee_id,
            type: data.type || 'GENERAL',
            title: data.title || 'Sistem Bildirimi',
            message: data.message,
            is_read: data.is_read || false
        });
    } catch (error) {
        console.error('Notification Create Error:', error);

        return null;
    }
};


exports.createNotifications = async (notificationsList) => {
    try {
        return await Notification.bulkCreate(
            notificationsList.map(n => ({
                employee_id: n.employee_id,
                type: n.type || 'GENERAL',
                title: n.title || 'Sistem Bildirimi',
                message: n.message,
                is_read: false
            }))
        );
    } catch (error) {
        console.error('Notifications BulkCreate Error:', error);
        return [];
    }
};


exports.getNotifications = async (employeeId, filters = {}) => {
    try {
        const where = { employee_id: employeeId };

        if (filters.is_read !== undefined) {
            where.is_read = filters.is_read;
        }
        if (filters.type) {
            where.type = filters.type;
        }

        const notifications = await Notification.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });

        const unreadCount = await Notification.count({
            where: { employee_id: employeeId, is_read: false }
        });

        return { notifications, unreadCount };
    } catch (error) {
        console.error('Notifications Get Error:', error);
        throw error;
    }
};


exports.markAsRead = async (notificationId, employeeId) => {
    try {
        const notification = await Notification.findOne({
            where: { id: notificationId, employee_id: employeeId }
        });

        if (!notification) {
            const error = new Error('Bildirim bulunamadı veya erişim yok.');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        return await notification.update({ is_read: true });
    } catch (error) {
        console.error('Notification MarkAsRead Error:', error);
        throw error;
    }
};


exports.markAllAsRead = async (employeeId) => {
    try {
        return await Notification.update(
            { is_read: true },
            { where: { employee_id: employeeId, is_read: false } }
        );
    } catch (error) {
        console.error('Notifications MarkAllAsRead Error:', error);
        throw error;
    }
};
