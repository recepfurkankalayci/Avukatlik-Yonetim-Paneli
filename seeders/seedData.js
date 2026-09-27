require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, Employee, Department, Client, Case } = require('../models');

const seedDatabase = async () => {
    try {
        const seedUserPassword = process.env.SEED_USER_PASSWORD;
        if (!seedUserPassword || seedUserPassword.length < 12) {
            throw new Error('SEED_USER_PASSWORD .env içinde en az 12 karakter olmalıdır.');
        }

        const hashedSeedPassword = await bcrypt.hash(seedUserPassword, 12);
        await sequelize.authenticate();
        console.log('✓ Veritabanı bağlantısı sağlandı');

        // 1. EMPLOYEE (Çalışan) EKLEMe
        const employees = await Employee.bulkCreate([
            {
                fullname: 'Ahmet Yılmaz',
                email: 'ahmet@ayp.com',
                password_hash: hashedSeedPassword,
                phone: '5551234567',
                role: 'ADMIN',
                is_active: true,
            },
            {
                fullname: 'Fatma Kaya',
                email: 'fatma@ayp.com',
                password_hash: hashedSeedPassword,
                phone: '5559876543',
                role: 'LAWYER',
                is_active: true,
            },
            {
                fullname: 'Mehmet Özdemir',
                email: 'mehmet@ayp.com',
                password_hash: hashedSeedPassword,
                phone: '5552223333',
                role: 'LAWYER',
                is_active: true,
            }
        ], { ignoreDuplicates: true });
        console.log('✓ 3 Çalışan eklendi');

        const departments = await Department.bulkCreate([
            { name: 'Medeni Hukuk' },
            { name: 'Ceza Hukuku' },
            { name: 'İcra ve İflas' },
        ], { ignoreDuplicates: true });
        console.log('✓ 3 Bölüm eklendi');


        const clients = await Client.bulkCreate([
            {
                public_id: 'CLT001',
                display_name: 'ABC İnşaat Ltd. Şti.',
                client_type: 'CORPORATE',
                tax_number: '1234567890',
                phone: '5551112222',
                email: 'info@abcinsaat.com',
            },
            {
                public_id: 'CLT002',
                display_name: 'Ali Demir',
                client_type: 'INDIVIDUAL',
                national_id: '12345678901',
                phone: '5553334444',
                email: 'ali.demir@email.com',
            },
            {
                public_id: 'CLT003',
                display_name: 'XYZ Ticaret A.Ş.',
                client_type: 'CORPORATE',
                tax_number: '0987654321',
                phone: '5555556666',
                email: 'contact@xyzticaret.com',
            }
        ], { ignoreDuplicates: true });
        console.log('✓ 3 Müşteri eklendi');

        // 4. CASE (Dava) EKLEME
        const cases = await Case.bulkCreate([
            {
                client_id: clients[0].id,
                case_number: '2024/123',
                case_type: 'CIVIL',
                status: 'OPEN',
                subject: 'Bina niteliğinde taşınmazın satış davası',
                description: 'Müşteri ABC İnşaat tarafından haklandığını iddia etmektedir.',
                opened_at: new Date('2024-01-15'),
            },
            {
                client_id: clients[1].id,
                case_number: '2024/456',
                case_type: 'CRIMINAL',
                status: 'CLOSED',
                subject: 'İş kazası davası',
                description: 'İş kazasında yaralanan taraf davacı olarak yer almıştır.',
                opened_at: new Date('2024-02-20'),
                closed_at: new Date('2024-05-10'),
            }
        ], { ignoreDuplicates: true });
        console.log('✓ 2 Dava eklendi');

        console.log('\n✅ Seed verisi başarıyla eklendi!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Hata oluştu:', error.message);
        process.exit(1);
    }
};

seedDatabase();
