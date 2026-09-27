const { Collection, Client, Installment, Expense, Receipt, CaseLawyer } = require('../models');

exports.findAll = async (whereClause, limit, offset) => {
    return await Collection.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'source_type', 'amount', 'method', 'received_at'],
        include: [
            { model: Client, attributes: ['display_name'] }
        ],
        limit: limit,
        offset: offset,
        order: [['received_at', 'DESC']]
    });
};

exports.create = async (data) => {
    return await Collection.create(data);
};

exports.findById = async (id) => {
    return await Collection.findByPk(id, {
        include: [
            { model: Client, attributes: ['display_name', 'national_id'] },
            { model: Receipt } // Varsa makbuzu getir
        ]
    });
};

exports.findInstallmentById = async (id) => {
    return await Installment.findByPk(id);
};

exports.findExpenseById = async (id) => {
    return await Expense.findByPk(id);
};

exports.getLawyersByCaseId = async (caseId) => {
    return await CaseLawyer.findAll({ where: { case_id: caseId } });
};

exports.findReceiptByNo = async (receiptNo) => {
    return await Receipt.findOne({ where: { receipt_no: receiptNo } });
};

exports.createReceipt = async (data) => {
    return await Receipt.create(data);
};
