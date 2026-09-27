const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmployeeDepartment = sequelize.define('EmployeeDepartment', {
    employee_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: 'employees',
            key: 'id'
        }
    },
    department_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: 'departments',
            key: 'id'
        }
    }
}, {
    tableName: 'employee_departments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = EmployeeDepartment;