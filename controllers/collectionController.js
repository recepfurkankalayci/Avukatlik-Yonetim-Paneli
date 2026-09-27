const collectionService = require('../services/collectionService');
const asyncHandler = require('express-async-handler');

// 1. Liste ve Filtreleme (Madde 1 ve 2)
exports.getCollections = asyncHandler(async (req, res) => {
    const { clientId, caseId, installmentId, sourceType, page = 1, limit = 20 } = req.query;

    const filters = {
        clientId,
        caseId,
        installmentId,
        sourceType
    };

    let parsedPage = parseInt(page);
    let parsedLimit = parseInt(limit);
    if (parsedLimit > 100) parsedLimit = 100;
    const offset = (parsedPage - 1) * parsedLimit;

    const pagination = {
        limit: parsedLimit,
        offset: offset
    };

    const { count, rows } = await collectionService.getCollections(filters, pagination);

    res.status(200).json({
        data: rows,
        meta: {
            total: count,
            page: parsedPage,
            limit: parsedLimit
        }
    });
});

// 2. Tahsilat Ekleme ve Yan Etkiler (Madde 3 ve 5)
exports.createCollection = asyncHandler(async (req, res) => {
    const employeeId = req.user.id; // İşlemi yapan çalışan
    
    const newCollection = await collectionService.createCollection(req.body, employeeId);

    res.status(201).json({ data: { message: 'Tahsilat oluşturuldu.', id: newCollection.id } });
});

// 3. Tahsilat Detayı (Madde 4)
exports.getCollectionById = asyncHandler(async (req, res) => {
    const collection = await collectionService.getCollectionById(req.params.id);
    res.status(200).json({ data: collection });
});

// 4. Makbuz (Receipt) Oluşturma (Madde 4)
exports.createReceipt = asyncHandler(async (req, res) => {
    const collectionId = req.params.id;
    const { receipt_no } = req.body;

    const newReceipt = await collectionService.createReceipt(collectionId, receipt_no);

    res.status(201).json({ data: { message: 'Makbuz kaydedildi.', receipt: newReceipt } });
});