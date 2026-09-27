const { Expense, Client, Case } = require('../models');
const generatePublicId = require('../utils/generatePublicId');
const asyncHandler = require('express-async-handler');

// 1. Liste ve Meta Veriler (Madde 1 ve 2)
exports.getExpenses = asyncHandler(async (req, res) => {
    const { category, clientId, caseId, page = 1, limit = 20 } = req.query;
    let whereClause = {};
    let pageNum = parseInt(page);
    let limitNum = parseInt(limit);
    if (limitNum > 100) limitNum = 100;
    const offset = (pageNum - 1) * limitNum;

    if (category) whereClause.category = category;
    if (clientId) whereClause.client_id = clientId;
    if (caseId) whereClause.case_id = caseId;

    const { count, rows } = await Expense.findAndCountAll({
        where: whereClause,
        attributes: ['id', 'category', 'expense_date', 'amount', 'description'],
        limit: limitNum,
        offset: offset,
        order: [['expense_date', 'DESC']]
    });

    // Enum değerlerini modelden çekiyoruz
    const availableCategories = Expense.rawAttributes.category.values;

    // Meta data ile birlikte yanıt dönülüyor
    res.status(200).json({
        data: rows,
        meta: { 
            total: count,
            page: pageNum,
            limit: limitNum,
            availableCategories 
        }
    });
});

// 2. Masraf Oluşturma (Madde 3)
exports.createExpense = asyncHandler(async (req, res) => {
    let { client_id, case_id, amount, category, expense_date, description, currency = 'TRY' } = req.body;
    const employeeId = req.user.id;

    // Madde 3: case_id var ama client_id yoksa, client_id'yi davadan türet
    if (case_id && !client_id) {
        const relatedCase = await Case.findByPk(case_id);
        if (!relatedCase) return res.status(404).json({ message: 'Belirtilen dava bulunamadı.' });
        
        client_id = relatedCase.client_id;
    }

    if (!client_id) {
        return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Müvekkil (client_id) zorunludur.' } });
    }

    // Public ID üret (EXP prefix ile)
    const public_id = await generatePublicId(Expense, 'EXP');

    const newExpense = await Expense.create({
        public_id,
        client_id,
        case_id,
        paid_by_employee_id: employeeId,
        amount,
        category,
        currency,
        expense_date,
        description
    });

    res.status(201).json({ data: newExpense });
});

// 3. Masraf Detayı (Madde 4: Dosya/Müvekkil linkleri için veriler)
exports.getExpenseById = asyncHandler(async (req, res) => {
    const expense = await Expense.findByPk(req.params.id, {
        include: [
            { model: Client, attributes: ['id', 'display_name'] },
            { model: Case, attributes: ['id', 'docket_number_text', 'case_summary'] }
        ]
    });

    if (!expense) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Masraf bulunamadı.' } });

    res.status(200).json({ data: expense });
});