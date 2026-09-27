const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
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
    display_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    client_type: {
        type: DataTypes.ENUM('INDIVIDUAL', 'CORPORATE'),
        allowNull: false,
    },
    national_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tax_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        }
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    }
}, {
    tableName: 'clients',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Client;