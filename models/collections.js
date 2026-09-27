const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Collection = sequelize.define('Collection', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    public_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    client_id: { type: DataTypes.UUID, allowNull: true },
    case_id: { type: DataTypes.UUID, allowNull: true },
    agreement_id: { type: DataTypes.UUID, allowNull: true },
    installment_id: { type: DataTypes.UUID, allowNull: true },
    expense_id: { type: DataTypes.UUID, allowNull: true },
    source_type: {
        type: DataTypes.ENUM('DOWN_PAYMENT', 'INSTALLMENT', 'CONSULTING', 'EXPENSE_REFUND', 'OTHER'),
        allowNull: false,
    },
    method: {
        type: DataTypes.ENUM('CASH', 'EFT', 'WIRE_TRANSFER', 'CREDIT_CARD', 'CHECK', 'OTHER'),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
    },
    currency: {
        type: DataTypes.ENUM('TRY', 'USD', 'EUR'),
        allowNull: false,
    },
    received_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    received_by_employee_id: { type: DataTypes.UUID, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true }
}, {
    tableName: 'collections',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = Collection;