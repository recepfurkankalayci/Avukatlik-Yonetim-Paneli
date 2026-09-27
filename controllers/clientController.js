const { Op } = require('sequelize');
const { Client } = require('../models');
const generatePublicId = require('../utils/generatePublicId');
const asyncHandler = require('express-async-handler');

exports.getClients = asyncHandler(async (req, res) => {
    let { search, clientType, isActive, page = 1, limit = 20 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    if (limit > 100) limit = 100;
    const offset = (page - 1) * limit;

    let whereClause = {};

    if (isActive !== undefined) {
        whereClause.is_active = isActive === 'true';
    }
    if (clientType) {
        whereClause.client_type = clientType;
    }
    if (search) {
        whereClause[Op.or] = [
            { display_name: { [Op.iLike]: `%${search}%` } },
            { phone: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
            { national_id: { [Op.iLike]: `%${search}%` } },
            { tax_number: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await Client.findAndCountAll({
        where: whereClause,
        limit: limit,
        offset: offset,
        order: [['created_at', 'DESC']]
    });

    const mappedRows = rows.map(client => {
        const clientObj = client.toJSON();
        clientObj.full_name = clientObj.display_name;
        clientObj.tc_no = clientObj.national_id;
        return clientObj;
    });

    res.status(200).json({
        data: mappedRows,
        meta: {
            total: count,
            page: page,
            limit: limit
        }
    });
});

// 2. Müvekkil Detayı (Madde 3.6 UUID Kontrolü)
exports.getClientById = asyncHandler(async (req, res) => {
    const param = req.params.id;

    // UUID formatını doğrulayan Standart Regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(param);

    // Gelen parametre UUID ise 'id' sütununda, değilse 'public_id' sütununda ara
    const whereClause = isUUID ? { id: param } : { public_id: param };

    const client = await Client.findOne({ where: whereClause });

    if (!client) {
        return res.status(404).json({
            error: {
                code: 'NOT_FOUND',
                message: 'Müvekkil bulunamadı.'
            }
        });
    }
    const clientObj = client.toJSON();
    clientObj.full_name = clientObj.display_name;
    clientObj.tc_no = clientObj.national_id;

    res.status(200).json({
        data: clientObj
    });
});


exports.createClient = asyncHandler(async (req, res) => {
    const { full_name, client_type, email, phone, tc_no, tax_number } = req.body;

    const public_id = await generatePublicId(Client, 'CLI');

    const newClient = await Client.create({
        public_id,
        display_name: full_name,
        client_type,
        email,
        phone,
        national_id: tc_no,
        tax_number
    });

    const clientObj = newClient.toJSON();
    clientObj.full_name = clientObj.display_name;
    clientObj.tc_no = clientObj.national_id;

    res.status(201).json({
        data: clientObj
    });
});

