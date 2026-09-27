const { Case, Employee, Client, CaseLawyer } = require('../models');
const { Op } = require('sequelize');

exports.create = async (data) => {
    try {
        return await Case.create(data);
    } catch (error) {
        console.error('Case Create DB Error:', error);
        throw error;
    }
};

exports.findById = async (id) => {
    try {
        return await Case.findByPk(id, {
            include: [
                { model: Client, attributes: ['id', 'display_name', 'email'] },
                { model: Employee, through: { attributes: [] }, attributes: ['id', 'fullname', 'email'] }
            ]
        });
    } catch (error) {
        console.error('Case FindById DB Error:', error);
        throw error;
    }
}
exports.findByPublicId = async (publicId) => {
    try {
        return await Case.findOne({
            where: { public_id: publicId },
            include: [
                { model: Client, attributes: ['id', 'display_name', 'email'] },
                { model: Employee, through: { attributes: [] }, attributes: ['id', 'fullname', 'email'] }
            ]
        });
    } catch (error) {
        console.error('Case FindByPublicId DB Error:', error);
        throw error;
    }
};
exports.findAll = async (filters = {}, pagination = {}) => {
    try {
        const where = {};

        if (filters.status) where.status = filters.status;
        if (filters.client_id) where.client_id = filters.client_id;
        if (filters.docketYear) where.docket_year = filters.docketYear;
        if (filters.search) {
            where[Op.or] = [
                { docket_number_text: { [Op.iLike]: `%${filters.search}%` } },
                { case_summary: { [Op.iLike]: `%${filters.search}%` } }
            ];
        }

        let employeeIncludeOptions = {
            model: Employee,
            through: { attributes: [] },
            attributes: ['id', 'fullname']
        };

        if (filters.userRole !== 'ADMIN' || filters.mine === 'true') {
            employeeIncludeOptions.where = { id: filters.userId };
            employeeIncludeOptions.required = true;
        }


        const limit = pagination.limit || 20;
        const offset = pagination.offset || 0;

        const { count, rows } = await Case.findAndCountAll({
            where,
            include: [
                { model: Client, attributes: ['id', 'display_name'] },
                employeeIncludeOptions
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        return { count, rows };
    } catch (error) {
        console.error('Case FindAll DB Error:', error);
        throw error;
    }
};


exports.update = async (id, data) => {
    try {
        const caseItem = await Case.findByPk(id);
        if (!caseItem) throw new Error('Case not found');

        return await caseItem.update(data);
    } catch (error) {
        console.error('Case Update DB Error:', error);
        throw error;
    }
};


exports.assignLawyer = async (caseId, employeeId) => {
    try {
        return await CaseLawyer.create({
            case_id: caseId,
            employee_id: employeeId
        });
    } catch (error) {
        console.error('Case AssignLawyer DB Error:', error);
        throw error;
    }
};


exports.removeLawyer = async (caseId, employeeId) => {
    try {
        return await CaseLawyer.destroy({
            where: { case_id: caseId, employee_id: employeeId }
        });
    } catch (error) {
        console.error('Case RemoveLawyer DB Error:', error);
        throw error;
    }
};


exports.getAssignedLawyers = async (caseId) => {
    try {
        return await CaseLawyer.findAll({
            where: { case_id: caseId },
            include: [{ model: Employee, attributes: ['id', 'fullname', 'email', 'role'] }]
        });
    } catch (error) {
        console.error('Case GetAssignedLawyers DB Error:', error);
        throw error;
    }
};


exports.getAssignableEmployees = async () => {
    try {
        return await Employee.findAll({ attributes: ['id', 'fullname', 'role'] });
    } catch (error) {
        console.error('Employee GetAssignable DB Error:', error);
        throw error;
    }
};
