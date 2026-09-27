const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Case = sequelize.define('Case', {
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
    status: {
        type: DataTypes.ENUM('OPEN', 'CLOSED'),
        allowNull: false,
        defaultValue: 'OPEN',
    },
    plaintiff: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    defendant: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    court_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    docket_year: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    docket_number_text: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    case_summary: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: 'cases',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Case;