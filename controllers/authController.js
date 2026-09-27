const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Employee } = require("../models");
const generatePublicId = require('../utils/generatePublicId');


exports.register = async (req, res) => {
    try {
        const { fullname, email, password, phone, role } = req.body;

        if (!fullname || !email || !password || !phone || !role) {
            return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Lütfen tüm alanları doldurunuz' } });
        }


        const existingEmployee = await Employee.findOne({ where: { email } });
        if (existingEmployee) {
            return res.status(409).json({ error: { code: 'CONFLICT', message: 'Bu email adresi zaten kayıtlı' } });
        }


        const hashedPassword = await bcrypt.hash(password, 12);

        const public_id = await generatePublicId(Employee, 'EMP');

        const employee = await Employee.create({
            public_id,
            fullname,
            email,
            password_hash: hashedPassword,
            phone,
            role,
            is_active: true
        });

        return res.status(201).json({
            data: {
                id: employee.id,
                fullname: employee.fullname,
                email: employee.email,
                role: employee.role
            }
        });
    } catch (error) {
        console.error('Register Hatası:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Çalışan kaydedilirken bir hata oluştu.' } });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'E-posta ve şifre gereklidir.' } });
        }

        const employee = await Employee.findOne({ where: { email } });

        if (!employee) {
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Geçersiz e-posta veya şifre.' } });
        }
        if (!employee.is_active) {
            return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Hesabınız pasif duruma getirilmiş. Lütfen yönetici ile iletişime geçin.' } });
        }
        const isPasswordValid = await bcrypt.compare(password, employee.password_hash)

        if (!isPasswordValid) {
            return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Geçersiz e-posta veya şifre.' } })
        }

        // JWT Token oluştur: HS256 algorithm, payload: { sub, role, iat, exp }
        const now = Math.floor(Date.now() / 1000);
        const token = jwt.sign(
            {
                sub: employee.id,
                role: employee.role,
                iat: now
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h', algorithm: 'HS256' }
        )

        return res.status(200).json({
            data: {
                token: token,
                user: {
                    id: employee.id,
                    fullname: employee.fullname,
                    email: employee.email,
                    role: employee.role
                }
            }
        });

    } catch (error) {
        console.error('Login Hatası:', error);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Giriş işlemi sırasında bir hata oluştu.' } });
    }

}
exports.logout = (req, res) => {
    return res.status(200).json({ data: { message: 'Başarıyla çıkış yapıldı.' } });
};

exports.getMe = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.user.id, {
            attributes: ['id', 'fullname', 'email', 'role', 'phone']
        });

        if (!employee) {
            return res.status(401).json({ message: "Çalışan bulunamadı" });
        }

        res.status(200).json({
            data: {
                id: employee.id,
                fullname: employee.fullname,
                email: employee.email,
                role: employee.role,
                phone: employee.phone
            }
        });

    } catch (err) {
        console.error("getMe hatası:", err);
        return res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Çalışan bilgileri alınırken bir hata oluştu.' } });
    }
};