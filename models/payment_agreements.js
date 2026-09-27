const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentAgreement = sequelize.define('PaymentAgreement', {
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
    client_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    case_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    currency: {
        type: DataTypes.ENUM('TRY', 'USD', 'EUR'),
        allowNull: false,
    },
    total_amount: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
    },
    initial_down_payment_amount: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: 'payment_agreements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = PaymentAgreement;