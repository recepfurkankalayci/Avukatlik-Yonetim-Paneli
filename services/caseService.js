

const generatePublicId = require('../utils/generatePublicId');
const caseRepository = require('../repositories/caseRepository');
const notificationService = require('./notificationService');
const { Case } = require('../models');


exports.createCase = async (data) => {
    try {

        const public_id = await generatePublicId(Case, 'CAS');


        const newCase = await caseRepository.create({
            public_id,
            docket_number_text: data.case_no,
            case_summary: data.title,
            court_name: data.court_name,
            docket_year: data.docket_year ? parseInt(data.docket_year, 10) : null,
            client_id: data.client_id,
            status: data.status || 'OPEN'
        });


        if (data.created_by) {
            await notificationService.createNotification({
                employee_id: data.created_by,
                type: 'GENERAL',
                title: 'Yeni Dava Eklendi',
                message: `Yeni dava oluşturuldu: ${data.case_no}`,
                is_read: false
            });
        }

        return newCase;
    } catch (error) {
        console.error('Case Create Error:', error);
        throw error;
    }
};


exports.getCaseById = async (caseId) => {
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
        const error = new Error('Dava bulunamadı.');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
    }
    return caseItem;
};


exports.getAllCases = async (filters = {}, pagination = {}) => {
    return await caseRepository.findAll(filters, pagination);
};
exports.updateCaseStatus = async (caseId, newStatus, updatedBy) => {
    const validStatuses = ['OPEN', 'CLOSED'];
    if (!validStatuses.includes(newStatus)) {
        const error = new Error('Geçersiz status değeri. OPEN veya CLOSED olmalıdır.');
        error.statusCode = 400;
        error.code = 'BAD_REQUEST';
        throw error;
    }


    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
        const error = new Error('Dava bulunamadı.');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
    }

    const updated = await caseRepository.update(caseId, { status: newStatus });


    if (updatedBy) {
        await notificationService.createNotification({
            employee_id: updatedBy,
            type: 'GENERAL',
            title: 'Dava Durumu Güncellendi',
            message: `Dava durumu değiştirildi: ${newStatus}`,
            is_read: false
        });
    }

    return updated;
};


exports.assignLawyer = async (caseId, employeeId) => {
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
        const error = new Error('Dava bulunamadı.');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
    }


    const assignment = await caseRepository.assignLawyer(caseId, employeeId);


    await notificationService.createNotification({
        employee_id: employeeId,
        type: 'CASE_ASSIGNMENT',
        title: 'Yeni Dava Ataması',
        message: `Yeni bir davaya atandınız. Dava ID: ${caseId}`,
        is_read: false
    });

    return assignment;
};


exports.removeLawyer = async (caseId, employeeId) => {
    const caseItem = await caseRepository.findById(caseId);
    if (!caseItem) {
        const error = new Error('Dava bulunamadı.');
        error.statusCode = 404;
        error.code = 'NOT_FOUND';
        throw error;
    }

    await caseRepository.removeLawyer(caseId, employeeId);
    return { message: 'Avukat davadan çıkarıldı.' };
};


exports.getAssignableEmployees = async () => {
    return await caseRepository.getAssignableEmployees();
};
