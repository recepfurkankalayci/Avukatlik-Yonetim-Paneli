const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Installment = sequelize.define('Installment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    agreement_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    installment_no: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    due_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
    },
    paid_amount: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'PARTIAL', 'PAID', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING',
    },
    paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    tableName: 'installments',
    timestamps: false,
});

module.exports = Installment;