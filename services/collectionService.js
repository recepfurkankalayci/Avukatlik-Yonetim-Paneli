const collectionRepository = require('../repositories/collectionRepository');
const notificationService = require('./notificationService');
const generatePublicId = require('../utils/generatePublicId');
const { Collection, Receipt } = require('../models');
const { Model } = require('sequelize');
const { Router } = require('express');

exports.getCollections = async (filters, pagination) => {
    let whereClause = {};
    if (filters.clientId) whereClause.client_id = filters.clientId;
    if (filters.caseId) whereClause.case_id = filters.caseId;
    if (filters.installmentId) whereClause.installment_id = filters.installmentId;
    if (filters.sourceType) whereClause.source_type = filters.sourceType;

    return await collectionRepository.findAll(whereClause, pagination.limit, pagination.offset);
};

exports.createCollection = async (data, employeeId) => {
    const {
        client_id, case_id, agreement_id, installment_id, expense_id,
        amount, source_type, payment_method, currency = 'TRY'
    } = data;


    const public_id = await generatePublicId(Collection, 'COL');


    if (source_type === 'INSTALLMENT' && installment_id) {
        const installment = await collectionRepository.findInstallmentById(installment_id);
        if (!installment) {
            const error = new Error('Taksit bulunamadı.');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        const newPaidAmount = Number(installment.paid_amount) + Number(amount);
        installment.paid_amount = newPaidAmount;

        if (newPaidAmount >= Number(installment.amount)) {
            installment.status = 'PAID';
            installment.paid_at = new Date();
        } else if (newPaidAmount > 0) {
            installment.status = 'PARTIAL';
        }
        await installment.save();
    }


    if (source_type === 'EXPENSE_REFUND' && expense_id) {
        const expense = await collectionRepository.findExpenseById(expense_id);
        if (!expense) {
            const error = new Error('Masraf bulunamadı.');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        const newReimbursedAmount = Number(expense.reimbursed_amount || 0) + Number(amount);
        expense.reimbursed_amount = newReimbursedAmount;

        if (newReimbursedAmount >= Number(expense.amount)) {
            expense.reimbursement_status = 'REIMBURSED';
            expense.reimbursed_at = new Date();
        } else if (newReimbursedAmount > 0) {
            expense.reimbursement_status = 'PARTIAL';
        } else {
            expense.reimbursement_status = 'UNREIMBURSED';
        }
        await expense.save();
    }

    const newCollection = await collectionRepository.create({
        public_id,
        client_id, case_id, agreement_id, installment_id, expense_id,
        received_by_employee_id: employeeId,
        amount, source_type, method: payment_method, currency
    });

    if (case_id) {
        const lawyers = await collectionRepository.getLawyersByCaseId(case_id);

        if (lawyers.length > 0) {
            const notifications = lawyers.map(lawyer => ({
                employee_id: lawyer.employee_id,
                type: 'COLLECTION_CREATED',
                message: `Dava (ID: ${case_id}) için ${amount} tutarında yeni tahsilat eklendi.`,
                is_read: false
            }));

            for (let notif of notifications) {
                await notificationService.createNotification(notif);
            }
        }
    }

    return newCollection;
};

exports.getCollectionById = async (id) => {
    const collection = await collectionRepository.findById(id);
    if (!collection) {
        const error = new Error('Tahsilat bulunamadı.');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
    }
    return collection;
};

exports.createReceipt = async (collectionId, receipt_no) => {
    const collection = await collectionRepository.findById(collectionId);
    if (!collection) {
        const error = new Error('Tahsilat bulunamadı.');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
    }

    const existingReceipt = await collectionRepository.findReceiptByNo(receipt_no);
    if (existingReceipt) {
        const error = new Error('Bu makbuz numarası zaten kullanılmış.');
        error.statusCode = 409;
        error.code = 'CONFLICT';
        throw error;
    }

    const public_id = await generatePublicId(Receipt, 'REC');

    const newReceipt = await collectionRepository.createReceipt({
        public_id,
        collection_id: collectionId,
        receipt_no: receipt_no
    });

    return newReceipt;
};




