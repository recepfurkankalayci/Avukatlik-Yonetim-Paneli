const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Receipt = sequelize.define('Receipt', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    collection_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
    },
    receipt_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    issued_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'receipts',
    timestamps: false
});

module.exports = Receipt;