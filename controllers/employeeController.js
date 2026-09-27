const bcrypt = require('bcrypt');
const { Employee, Department, Case, Client } = require('../models');
const generatePublicId = require('../utils/generatePublicId');
const asyncHandler = require('express-async-handler');

// 1. Yeni Çalışan Ekleme (Sadece ADMIN - Madde 5)
exports.createEmployee = asyncHandler(async (req, res) => {
    const { full_name, email, password, role } = req.body;
    
    const existing = await Employee.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: { code: 'CONFLICT', message: 'Bu e-posta adresi zaten kullanımda.' } });

    // Public ID üret (EMP prefix ile)
    const public_id = await generatePublicId(Employee, 'EMP');

    const hashedPassword = await bcrypt.hash(password, 12);
    const newEmployee = await Employee.create({
        public_id,
        fullname: full_name,
        email,
        password: hashedPassword,
        role: role || 'LAWYER'
    });

    res.status(201).json({ data: { id: newEmployee.id, public_id: newEmployee.public_id, full_name: newEmployee.fullname, email: newEmployee.email, role: newEmployee.role } });
});

// 2. Tüm Çalışanları Listeleme (Sadece ADMIN - Madde 1 ve 5)
exports.getAllEmployees = asyncHandler(async (req, res) => {
    let { page = 1, limit = 20 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    if (limit > 100) limit = 100;
    const offset = (page - 1) * limit;

    const { count, rows } = await Employee.findAndCountAll({
        attributes: { exclude: ['password'] },
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

// 3. Tek Çalışan Detayı (Madde 2 ve Madde 7)
exports.getEmployeeById = asyncHandler(async (req, res) => {
    const requestedId = parseInt(req.params.id);
    
            
    if (req.user.role !== 'ADMIN' && req.user.id !== requestedId) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Sadece kendi profilinizi görebilirsiniz.' } });
    }

    const employee = await Employee.findByPk(requestedId, {
        attributes: { exclude: ['password'] },
        include: [
            {
                model: Department,
                through: { attributes: [] }
            },
            {
                model: Case,
                through: { attributes: [] },
                include: [{ model: Client }]
            }
        ]
    });

    if (!employee) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Çalışan bulunamadı.' } });

    res.status(200).json({ data: employee });
});

// 4. Çalışan Güncelleme (Sadece ADMIN - Madde 5)
exports.updateEmployee = asyncHandler(async (req, res) => {
    const { full_name, email, role } = req.body;
    const employee = await Employee.findByPk(req.params.id);

    if (!employee) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Çalışan bulunamadı.' } });

    await employee.update({ fullname: full_name, email, role });
    res.status(200).json({ data: { message: 'Çalışan güncellendi.' } });
});

// 5. Çalışanı Pasife Alma (Sadece ADMIN - Madde 5)
exports.deactivateEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Çalışan bulunamadı.' } });

    // Veritabanından tamamen silmek yerine durumu güncellenir veya destroy (soft delete) edilir
    // Şimdilik kaydı veritabanından siliyoruz (ileride is_active sütunu eklenebilir)
    await employee.destroy(); 
    res.status(200).json({ data: { message: 'Çalışan sistemden kaldırıldı.' } });
});
// 6. Çalışan Şifresini Güncelleme (Sadece ADMIN - Madde 6)
exports.updatePassword = asyncHandler(async (req, res) => {
    const { new_password } = req.body;
    
    if (!new_password) {
        return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Yeni şifre girilmelidir.' } });
    }

    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Çalışan bulunamadı.' } });

    // Şifreyi kriptola ve kaydet
    const hashedPassword = await bcrypt.hash(new_password, 12);
    await employee.update({ password: hashedPassword });

    // Not: İleride "Refresh Token" veritabanı altyapısı kurulduğunda,
    // eski oturumları kapatmak için token silme kodları buraya eklenecek.

    res.status(200).json({ data: { message: 'Şifre başarıyla güncellendi.' } });
});