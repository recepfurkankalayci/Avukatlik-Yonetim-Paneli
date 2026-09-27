const { PaymentAgreement, Installment, Client, Case } = require('../models');
const generatePublicId = require('../utils/generatePublicId');
const asyncHandler = require('express-async-handler');

// 1. Liste: Global, ?clientId= veya ?caseId=
exports.getAgreements = asyncHandler(async (req, res) => {
    const { clientId, caseId } = req.query;
    let whereClause = {};

    if (clientId) whereClause.client_id = clientId;
    if (caseId) whereClause.case_id = caseId;

    let { page = 1, limit = 20 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    if (limit > 100) limit = 100;
    const offset = (page - 1) * limit;

    const { count, rows } = await PaymentAgreement.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'public_id', 'total_amount', 'currency'], 
        include: [
            { model: Client, attributes: ['display_name'] } 
        ],
        limit: limit,
        offset: offset,
        order: [['created_at', 'DESC']]
    });

    res.status(200).json({
        data: rows,
        meta: {
            total: count,
            page: page,
            limit: limit
        }
    });
});

// 2. Anlaşma Oluştur ve Otomatik Taksit Üret (ESKI - DuplicateRemoved)
exports.createAgreement_old = async (req, res) => {
    // Bu fonksiyon çıkarıldı - aşağıdaki 2. createAgreement kullanılır
};

// 3. Detay Görünümü: Anlaşma ve Taksitleri Birlikte Çek
exports.getAgreementById = asyncHandler(async (req, res) => {
    const param = req.params.id;

    // UUID veya public_id (PA-) ayrımı
    const whereClause = param.startsWith('PA-') 
        ? { public_id: param } 
        : { id: param };

    const agreement = await PaymentAgreement.findOne({
        where: whereClause,
        include: [
            { model: Client, attributes: ['id', 'display_name'] },
            { model: Case, attributes: ['id', 'docket_number_text', 'case_summary'] },
            { model: Installment } // Taksit kartları için
        ],
        order: [
            [Installment, 'installment_no', 'ASC'] // Taksitleri numarasına göre sırala
        ]
    });

    if (!agreement) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Anlaşma bulunamadı.' } });

    res.status(200).json({ data: agreement });
});

exports.createAgreement = asyncHandler(async (req, res) => {
    const { 
        client_id, 
        case_id, 
        total_amount, 
        initial_down_payment_amount = 0, 
        currency = 'TRY', 
        description, 
        installment_count, 
        first_due_date 
    } = req.body;

    // 1. Yeni Public ID'yi üret (Örn: PAG-2026-000001)
    const public_id = await generatePublicId(PaymentAgreement, 'PAG');

    // 2. Anlaşmayı veritabanına kaydet
    const agreement = await PaymentAgreement.create({
        public_id,
        client_id,
        case_id,
        currency,
        total_amount,
        initial_down_payment_amount,
        description
    });

    // 3. Taksitleri hesapla (Peşinatı düşerek)
    const remainingAmount = total_amount - initial_down_payment_amount;

    if (installment_count > 0 && remainingAmount > 0) {
        const installmentAmount = (remainingAmount / installment_count).toFixed(2);
        let currentDate = new Date(first_due_date);
        let installmentsArray = [];

        for (let i = 0; i < installment_count; i++) {
            installmentsArray.push({
                agreement_id: agreement.id,
                installment_no: i + 1,
                amount: installmentAmount,
                paid_amount: 0,
                due_date: new Date(currentDate),
                status: 'PENDING'
            });
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        // 4. Taksitleri topluca yaz
        await Installment.bulkCreate(installmentsArray);
    }

    // 5. Başarılı İşlem Yanıtı (Geliştirici Dokümanı Formatı)
    res.status(201).json({
        data: {
            message: 'Anlaşma ve taksitler oluşturuldu.',
            public_id: agreement.public_id,
            id: agreement.id
        }
    });
});
