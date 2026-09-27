const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    employee_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('CASE_ASSIGNMENT', 'PAYMENT_DUE', 'COLLECTION_CREATED', 'EXPENSE_CREATED', 'GENERAL'),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: { type: DataTypes.TEXT, allowNull: true },
    related_entity: {
        type: DataTypes.ENUM('CASE', 'CLIENT', 'PAYMENT_AGREEMENT', 'INSTALLMENT', 'COLLECTION', 'EXPENSE'),
        allowNull: true,
    },
    related_id: { type: DataTypes.UUID, allowNull: true },
    related_public_id: { type: DataTypes.STRING, allowNull: true },
    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    read_at: { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Notification;