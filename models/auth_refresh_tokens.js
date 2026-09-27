const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuthRefreshToken = sequelize.define('AuthRefreshToken', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    employee_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    token_hash: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    user_agent: { type: DataTypes.STRING, allowNull: true },
    ip_address: { type: DataTypes.STRING, allowNull: true },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    revoked_at: { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'auth_refresh_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = AuthRefreshToken;