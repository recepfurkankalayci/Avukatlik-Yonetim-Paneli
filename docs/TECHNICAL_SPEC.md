# Teknik Spesifikasyon - AYP

## 3.8 State Transitions

### 3.8.1 Case (Dava) States
```
OPEN ←→ CLOSED
```
- **OPEN**: Dava açık durumdadır, işlemler devam ediyor
- **CLOSED**: Dava kapalıdır, yalnızca admin tarafından değiştirilebilir
- **Transition**: `PATCH /cases/{id}/status` (admin only)

**Implementation**:
```javascript
// caseController.js - updateStatus
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        // Sadece OPEN veya CLOSED değerleri kabul edilir
        if (!['OPEN', 'CLOSED'].includes(status)) {
            return res.status(400).json({ 
                error: { code: 'BAD_REQUEST', message: 'Geçersiz status değeri.' } 
            });
        }
        
        const caseItem = await Case.findByPk(req.params.id);
        if (!caseItem) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Dava bulunamadı.' } });

        await caseItem.update({ status });
        res.status(200).json({ data: { message: 'Durum güncellendi.', status: caseItem.status } });
    } catch (error) {
        res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Dava durumu güncellenirken bir hata oluştu.' } });
    }
};
```

### 3.8.2 Installment (Taksit) States
Taksit durumu, tahsilat işleminden sonra **otomatik** güncellenir:

```
PENDING (paid_amount == 0)
    ↓
PARTIAL (0 < paid_amount < amount)
    ↓
PAID (paid_amount >= amount) → [paid_at timestamp set]
```

**Özel State**:
- **CANCELLED**: Admin tarafından veya iş kuralı tarafından iptal

**Implementation (Collection sırasında)**:
```javascript
// collectionController.js - createCollection içinde
if (source_type === 'INSTALLMENT' && installment_id) {
    const installment = await Installment.findByPk(installment_id);
    
    // Ödenen miktarı artır
    const newPaidAmount = Number(installment.paid_amount) + Number(amount);
    installment.paid_amount = newPaidAmount;

    // Durumu güncelle
    if (newPaidAmount >= Number(installment.amount)) {
        installment.status = 'PAID';
        installment.paid_at = new Date(); // paid_at timestamp set
    } else if (newPaidAmount > 0) {
        installment.status = 'PARTIAL';
    }
    // PENDING: newPaidAmount == 0 zaten varsa değişmez
    
    await installment.save();
}
```

### 3.8.3 Expense Reimbursement States
Masraf iadesi (collection EXPENSE_REFUND ile):

```
UNREIMBURSED (reimbursed_amount == 0)
    ↓
PARTIAL (0 < reimbursed_amount < amount)
    ↓
REIMBURSED (reimbursed_amount >= amount) → [reimbursed_at timestamp set]
```

**Implementation (Collection sırasında)**:
```javascript
// collectionController.js - createCollection içinde
if (source_type === 'EXPENSE_REFUND' && expense_id) {
    const expense = await Expense.findByPk(expense_id);
    if (!expense) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Masraf bulunamadı.' } });

    // İade edilen miktarı artır
    const newReimbursedAmount = Number(expense.reimbursed_amount || 0) + Number(amount);
    expense.reimbursed_amount = newReimbursedAmount;

    // Durumu güncelle
    if (newReimbursedAmount >= Number(expense.amount)) {
        expense.reimbursement_status = 'REIMBURSED';
        expense.reimbursed_at = new Date();
    } else if (newReimbursedAmount > 0) {
        expense.reimbursement_status = 'PARTIAL';
    } else {
        expense.reimbursement_status = 'UNREIMBURSED';
    }
    
    await expense.save();
}
```

---

## 3.9 Bildirim Tetikleri (Notification Triggers)

| Event | Koşul | Bildirim Türü | Alıcı |
|-------|-------|---|---|
| **Case Atama** | Avukat davaya atandı | `CASE_ASSIGNMENT` | Atanan avukat (employee_id) |
| **Tahsilat Oluşturma** | Davaya tahsilat eklendi | `COLLECTION_CREATED` | Davaya atanmış tüm avukatlar |
| **Taksit Ödeme** | Taksit durumu PARTIAL→PAID | `INSTALLMENT_PAID` | İlgili müvekkil temsilcisi |
| **Masraf İadesi** | Masraf UNREIMBURSED→REIMBURSED | `EXPENSE_REIMBURSED` | İşlemi yapan müdür/admin |

**Implementation Pattern**:
```javascript
// Bildirim oluşturma
await Notification.create({
    employee_id: targetEmployeeId,
    type: 'EVENT_TYPE',
    message: 'Olay açıklaması...',
    is_read: false,
    created_at: new Date()
});

// Toplu bildirim
await Notification.bulkCreate(
    caseAttorneys.map(attorney => ({
        employee_id: attorney.employee_id,
        type: 'COLLECTION_CREATED',
        message: `Dava (ID: ${case_id}) için ${amount} tutarında yeni tahsilat eklendi.`,
        is_read: false
    }))
);
```

---

## 3.10 Frontend Kuralları

### HTTP İstekleri
- **Fetch Wrapper Kullanımı**: Tüm API çağrıları tek bir wrapper üzerinden yapılır
- **401 Handling**: Token geçersiz/süresi dolmuş ise:
  - Token localStorage'dan silinir
  - User login page'e yönlendirilir
  - Error toast gösterilir

**Frontend örnek (React)**:
```javascript
// utils/api.js
const apiCall = async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (response.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return;
    }

    return await response.json();
};
```

### URL Kuralları
- **Detay sayfalarında UUID gösterme**: Geçersiz/karmaşık
- **Public ID Kullanımı**: `publicId` alanını URL'de göster
  - Örnek: `/cases/CAS-2026-000001` (UUID değil)
  - Model: `GET /cases/{publicId}` → Backend `public_id` veya `id` kabul eder

**Frontend örnek**:
```javascript
// Detay linkine public_id kullan
<Link to={`/cases/${caseItem.public_id}`}>
    {caseItem.case_no}
</Link>
```

### XSS Koruması
- **Kullanıcı metni asla innerHTML ile basılmaz**
- **Güvenli seçenekler**:
  - `textContent`: Metin olarak göster
  - `dangerouslySetInnerHTML` (React): Yalnızca trusted content
  - DOMPurify kütüphanesi: HTML sanitize et

**Yanlış (XSS zaaf)**:
```javascript
// ❌ XSS zaafiyeti
<div innerHTML={userData.description} />
```

**Doğru**:
```javascript
// ✅ Güvenli
<div>{userData.description}</div>  // React otomatik escape eder

// ✅ Sanitize için
import DOMPurify from 'dompurify';
<div>{DOMPurify.sanitize(userData.description)}</div>
```

---

## 3.11 Backend Katman Kuralları

### Katman Yapısı
```
routes/     → HTTP yol tanımları + middleware zinciri
    ↓
controller/ → parse, validate, service çağırı, response döndürme
    ↓
service/    → İş kuralları, transaction yönetimi
    ↓
repository/ → Yalnızca SQL/DB sorguları
```

### 3.11.1 Routes Katmanı
**Sorumluluk**: HTTP path, method, middleware zinciri

```javascript
// routes/caseRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddlewares');
const { isAdmin } = require('../middlewares/roleMiddlewares');
const caseController = require('../controllers/caseController');

// GET: Davalar listesi
router.get('/', verifyToken, caseController.getCases);

// POST: Yeni dava oluştur (admin)
router.post('/', verifyToken, isAdmin, caseController.createCase);

// GET: Dava detayı
router.get('/:id', verifyToken, caseController.getCaseById);

// PATCH: Dava durumu güncelle (admin)
router.patch('/:id/status', verifyToken, isAdmin, caseController.updateStatus);

module.exports = router;
```

**Kurallar**:
- Yalnızca yol + middleware
- Controller çağrısı
- SQL yok!

### 3.11.2 Controller Katmanı
**Sorumluluk**: Request parse, validation, service çağırı, response

```javascript
// controllers/caseController.js
exports.createCase = async (req, res) => {
    try {
        // 1. Parse & Validate
        const { case_no, title, description, client_id } = req.body;
        if (!case_no || !title || !client_id) {
            return res.status(400).json({ 
                error: { code: 'BAD_REQUEST', message: 'Gerekli alanlar eksik.' } 
            });
        }

        // 2. Service çağırı (iş kuralları)
        const newCase = await caseService.createCase({
            case_no,
            title,
            description,
            client_id,
            created_by: req.user.id
        });

        // 3. Response
        res.status(201).json({ data: newCase });
    } catch (error) {
        // Merkezi error handler'a devret
        next(error);
    }
};
```

**Kurallar**:
- SQL yok (repository/service kullan)
- try/catch her function'da (veya async handler middleware)
- İş kuralları service'de

### 3.11.3 Service Katmanı
**Sorumluluk**: İş kuralları, validation, transaction, notification

```javascript
// services/caseService.js
exports.createCase = async (data) => {
    // 1. Public ID üret
    const public_id = await generatePublicId(Case, 'CAS');

    // 2. Veritabanı işlemi
    const newCase = await caseRepository.create({
        public_id,
        case_no: data.case_no,
        title: data.title,
        description: data.description,
        client_id: data.client_id,
        created_by: data.created_by,
        status: 'OPEN'
    });

    // 3. Notification tetikleme
    await notificationService.createNotification({
        employee_id: data.created_by,
        type: 'CASE_CREATED',
        message: `Yeni dava oluşturuldu: ${data.case_no}`
    });

    return newCase;
};

exports.updateCaseStatus = async (caseId, newStatus) => {
    // 1. Durum geçişi doğrulaması
    if (!['OPEN', 'CLOSED'].includes(newStatus)) {
        throw new Error('Geçersiz status değeri');
    }

    // 2. Update
    const updated = await caseRepository.update(caseId, { status: newStatus });

    // 3. Notification
    await notificationService.createNotification({
        type: 'CASE_STATUS_CHANGED',
        message: `Dava durumu: ${newStatus}`
    });

    return updated;
};
```

**Kurallar**:
- req/res yok
- Iş kuralları (state machine, validation)
- Transaction yönetimi
- Service → repository çağırısı

### 3.11.4 Repository Katmanı
**Sorumluluk**: Yalnızca SQL/veritabanı işlemleri

```javascript
// repositories/caseRepository.js
exports.create = async (data) => {
    return await Case.create(data);
};

exports.findById = async (id) => {
    return await Case.findByPk(id);
};

exports.findByPublicId = async (publicId) => {
    return await Case.findOne({ where: { public_id: publicId } });
};

exports.update = async (id, data) => {
    const caseItem = await Case.findByPk(id);
    if (!caseItem) throw new Error('Case not found');
    return await caseItem.update(data);
};

exports.findAll = async (filters = {}) => {
    return await Case.findAll({ where: filters });
};
```

**Kurallar**:
- Yalnızca Sequelize/SQL
- req/res yok
- controller/service çağırısı yok

### 3.11.5 Async Handler Middleware
**Try/catch yığınını önlemek**:

```javascript
// middlewares/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Kullanım
exports.createCase = asyncHandler(async (req, res) => {
    const newCase = await caseService.createCase(req.body);
    res.status(201).json({ data: newCase });
});
```

### 3.11.6 Merkezi Error Middleware
```javascript
// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err);

    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    const message = err.message || 'Bir hata oluştu';

    res.status(statusCode).json({
        error: { code, message }
    });
};

// app.js
app.use(errorHandler);
```

---

## 3.12 Environment Variables (.env)

```bash
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ayp

# JWT
JWT_SECRET=your_jwt_secret_key_at_least_32_characters_long_change_this_in_production
JWT_ACCESS_SECRET=your_access_token_secret_at_least_32_characters_long_change_this
JWT_REFRESH_SECRET=your_refresh_token_secret_at_least_32_characters_long_change_this
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_COST=12
CORS_ORIGIN=http://localhost:5173
```

**Production İçin**:
- `JWT_SECRET`: En az 32 karakter, açık metin değil
- `DATABASE_URL`: SSL bağlantısı
- `NODE_ENV=production`
- Tüm secrets environment provider'dan yükle (AWS Secrets, Vault, vb.)

---

## 3.13 Implementation Checklist

- [ ] Case state transitions (OPEN ↔ CLOSED)
- [ ] Installment auto-status (PENDING → PARTIAL → PAID)
- [ ] Expense reimbursement auto-status
- [ ] Notification triggers (4 event type)
- [ ] Frontend fetch wrapper + 401 handling
- [ ] Public ID kullanımı detay URL'lerinde
- [ ] XSS koruması (textContent/sanitize)
- [ ] Service katmanı oluşturma
- [ ] Repository katmanı oluşturma
- [ ] Async handler middleware
- [ ] Error handler middleware
- [ ] .env konfigürasyonu
