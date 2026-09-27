const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
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
    category: {
        type: DataTypes.ENUM('COURT_FEE', 'SERVICE_OF_PROCESS', 'EXPERT_WITNESS', 'TRAVEL_EXPENSE', 'ACCOMMODATION', 'POST_COURIER', 'NOTARY', 'RENT', 'ELECTRICITY', 'INTERNET', 'PHONE', 'STATIONERY', 'OTHER'),
        allowNull: false,
    },
    expense_date: {
        type: DataTypes.DATEONLY,
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
    description: { type: DataTypes.TEXT, allowNull: true },
    paid_by_employee_id: { type: DataTypes.UUID, allowNull: true },
    client_id: { type: DataTypes.UUID, allowNull: true },
    case_id: { type: DataTypes.UUID, allowNull: true },
    reimbursed_amount: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0,
    },
    reimbursement_status: {
        type: DataTypes.ENUM('UNREIMBURSED', 'PARTIAL', 'REIMBURSED'),
        allowNull: false,
        defaultValue: 'UNREIMBURSED',
    },
    reimbursed_at: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    tableName: 'expenses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Expense;