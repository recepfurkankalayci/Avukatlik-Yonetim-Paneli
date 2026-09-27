require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const models = require('./models');
const errorHandler = require('./middlewares/errorHandler');



const app = express();

// CORS Ayarları - Daha esnek
app.use(cors({
    origin: '*', // Tüm originlere izin ver (test için)
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


const path = require('path'); // Dosyanın en üstüne eklenecek

// Diğer middleware'lerin altına eklenecek:
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));



app.get('/api/health', (req, res) => {
    res.json({ message: 'Server çalışıyor', timestamp: new Date() });
});

app.use('/api/v1/auth', require('./routes/authRoutes'));


const startServer = async () => {
    try {

        if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
            throw new Error('JWT_SECRET .env içinde en az 32 karakter olmalıdır.');
        }

        await sequelize.authenticate();
        console.log(' Veritabanı bağlantısı başarıyla sağlandı.');


        await sequelize.sync({ alter: true });
        console.log(' Tüm veritabanı tabloları senkronize edildi (Oluşturuldu).');


        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`  Sunucu ${PORT} portunda aktif.`);
        });

    } catch (error) {
        console.error('Sunucu veya Veritabanı başlatılırken hata oluştu:', error);
    }
};
app.use('/api/v1/employees', require('./routes/employee'));

app.use('/api/v1/cases', require('./routes/caseRoutes'));
app.use('/api/v1/clients', require('./routes/clientRouters'));
app.use('/api/v1/payment-agreements', require('./routes/paymentAgreementRoutes'));
app.use('/api/v1/collections', require('./routes/collectionRoutes'));
app.use('/api/v1/expenses', require('./routes/expenseRoutes'));
app.use('/api/v1/notifications', require('./routes/notificationRoutes'));
app.use(errorHandler);
app.get(/.*/, (req, res) => {
    // Gelen istek /api/ ile başlamıyorsa, React uygulamasına yönlendir
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
    }
});

startServer();