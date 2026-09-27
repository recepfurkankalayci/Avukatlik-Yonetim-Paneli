const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CaseLawyer = sequelize.define('CaseLawyer', {
    case_id: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    employee_id: {
        type: DataTypes.UUID,
        primaryKey: true,
    },
    assigned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'case_lawyers',
    timestamps: false,
});

module.exports = CaseLawyer;