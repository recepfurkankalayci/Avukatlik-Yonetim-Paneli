const sequelize = require('../config/database');

const Employee = require('./employees');
const AuthRefreshToken = require('./auth_refresh_tokens');
const Department = require('./department');
const EmployeeDepartment = require('./employee_departments');
const Client = require('./clients');
const Case = require('./cases');
const CaseLawyer = require('./case_lawyers');
const PaymentAgreement = require('./payment_agreements');
const Installment = require('./installments');
const Collection = require('./collections');
const Receipt = require('./receipts');
const Expense = require('./expenses');
const Notification = require('./notifications');


Employee.hasMany(AuthRefreshToken, { foreignKey: 'employee_id' });
AuthRefreshToken.belongsTo(Employee, { foreignKey: 'employee_id' });


Employee.belongsToMany(Department, { through: EmployeeDepartment, foreignKey: 'employee_id', timestamps: false });
Department.belongsToMany(Employee, { through: EmployeeDepartment, foreignKey: 'department_id', timestamps: false });

Client.hasMany(Case, { foreignKey: 'client_id' });
Case.belongsTo(Client, { foreignKey: 'client_id' });


Case.belongsToMany(Employee, { through: CaseLawyer, foreignKey: 'case_id', timestamps: false });
Employee.belongsToMany(Case, { through: CaseLawyer, foreignKey: 'employee_id', timestamps: false });


Client.hasMany(PaymentAgreement, { foreignKey: 'client_id' });
PaymentAgreement.belongsTo(Client, { foreignKey: 'client_id' });

Case.hasMany(PaymentAgreement, { foreignKey: 'case_id' });
PaymentAgreement.belongsTo(Case, { foreignKey: 'case_id' });

PaymentAgreement.hasMany(Installment, { foreignKey: 'agreement_id' });
Installment.belongsTo(PaymentAgreement, { foreignKey: 'agreement_id' });


Client.hasMany(Collection, { foreignKey: 'client_id' });
Collection.belongsTo(Client, { foreignKey: 'client_id' });

Case.hasMany(Collection, { foreignKey: 'case_id' });
Collection.belongsTo(Case, { foreignKey: 'case_id' });

PaymentAgreement.hasMany(Collection, { foreignKey: 'agreement_id' });
Collection.belongsTo(PaymentAgreement, { foreignKey: 'agreement_id' });

Installment.hasMany(Collection, { foreignKey: 'installment_id' });
Collection.belongsTo(Installment, { foreignKey: 'installment_id' });

Employee.hasMany(Collection, { foreignKey: 'received_by_employee_id' });
Collection.belongsTo(Employee, { foreignKey: 'received_by_employee_id' });

Collection.hasOne(Receipt, { foreignKey: 'collection_id' });
Receipt.belongsTo(Collection, { foreignKey: 'collection_id' });

Client.hasMany(Expense, { foreignKey: 'client_id' });
Expense.belongsTo(Client, { foreignKey: 'client_id' });

Case.hasMany(Expense, { foreignKey: 'case_id' });
Expense.belongsTo(Case, { foreignKey: 'case_id' });

Employee.hasMany(Expense, { foreignKey: 'paid_by_employee_id' });
Expense.belongsTo(Employee, { foreignKey: 'paid_by_employee_id' });

Expense.hasMany(Collection, { foreignKey: 'expense_id' }); // Masraf iadesi tahsilatı için
Collection.belongsTo(Expense, { foreignKey: 'expense_id' });


Employee.hasMany(Notification, { foreignKey: 'employee_id' });
Notification.belongsTo(Employee, { foreignKey: 'employee_id' });


module.exports = {
    sequelize,
    Employee,
    AuthRefreshToken,
    Department,
    EmployeeDepartment,
    Client,
    Case,
    CaseLawyer,
    PaymentAgreement,
    Installment,
    Collection,
    Receipt,
    Expense,
    Notification
};