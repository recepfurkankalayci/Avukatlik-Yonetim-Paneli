const caseService = require('../services/caseService');
const asyncHandler = require('express-async-handler');

exports.getCases = asyncHandler(async (req, res) => {
    const { search, status, docketYear, mine, page = 1, limit = 20 } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    const filters = {
        search,
        status,
        docketYear,
        mine,
        userRole,
        userId
    };

    let parsedPage = parseInt(page);
    let parsedLimit = parseInt(limit);
    if (parsedLimit > 100) parsedLimit = 100;
    const offset = (parsedPage - 1) * parsedLimit;

    const pagination = {
        limit: parsedLimit,
        offset: offset
    };

    const { count, rows } = await caseService.getAllCases(filters, pagination);

    res.status(200).json({
        data: rows,
        meta: {
            total: count,
            page: parsedPage,
            limit: parsedLimit
        }
    });
});

exports.getCaseById = asyncHandler(async (req, res) => {
    const caseItem = await caseService.getCaseById(req.params.id);
    res.status(200).json({ data: caseItem });
});

exports.updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const updatedBy = req.user.id;
    
    const caseItem = await caseService.updateCaseStatus(req.params.id, status, updatedBy);
    res.status(200).json({ data: { message: 'Durum güncellendi.', status: caseItem.status } });
});

exports.assignLawyer = asyncHandler(async (req, res) => {
    const caseId = req.params.id;
    const { employeeId } = req.body;

    await caseService.assignLawyer(caseId, employeeId);
    res.status(200).json({ data: { message: 'Avukat başarıyla atandı ve bildirim gönderildi.' } });
});

exports.removeLawyer = asyncHandler(async (req, res) => {
    const { id: caseId, employeeId } = req.params;
    
    await caseService.removeLawyer(caseId, employeeId);
    res.status(200).json({ data: { message: 'Avukat davadan çıkarıldı.' } });
});

exports.getAssignableEmployees = asyncHandler(async (req, res) => {
    const employees = await caseService.getAssignableEmployees();
    res.status(200).json({ data: employees });
});

exports.createCase = asyncHandler(async (req, res) => {
    const data = {
        ...req.body,
        created_by: req.user.id
    };

    const newCase = await caseService.createCase(data);

    res.status(201).json({
        data: {
            id: newCase.id,
            public_id: newCase.public_id,
            case_no: newCase.docket_number_text,
            title: newCase.case_summary,
            status: newCase.status
        }
    });
});