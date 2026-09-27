# Modül Tamamlanma Kontrol Listesi

**Proje**: AYP  
**Tarih**: 2026-06-24  
**Versiyon**: 1.0  

---

## 📋 Genel Kontroller

### 1. Migration Uygulandı, Tablolar Oluştu
- [ ] **PostgreSQL veritabanı bağlantısı test edildi**
  - Komut: `npm run db:connect` veya `psql -U postgres -d ayp`
  - Beklenen: Bağlantı başarılı

- [ ] **Tüm migration dosyaları uygulandı**
  - Komut: `npx sequelize-cli db:migrate`
  - Kontrol: `\dt` (psql'de tüm tablolar görünmeli)

- [ ] **Tablolar doğru şemaya sahip**
  - Kontrol edilecek tablolar:
    - [ ] `employees` - public_id, password_hash, is_active
    - [ ] `cases` - public_id, status (OPEN|CLOSED)
    - [ ] `installments` - paid_at, status (PENDING|PARTIAL|PAID|CANCELLED)
    - [ ] `expenses` - public_id, reimbursed_at, reimbursement_status
    - [ ] `collections` - public_id, source_type
    - [ ] `receipts` - public_id
    - [ ] `notifications` - type, is_read
    - [ ] `auth_refresh_tokens` - token_hash, expires_at

**Notlar**: 
```bash
# Tablo yapısını kontrol etme
\d employees
\d cases
\d installments
\d expenses
```

**Başarılı Kriterium**: Tüm tablolar, tüm gerekli kolonlar ile oluştu

---

### 2. Katman Ayrımı (Route → Controller → Service → Repository)
- [ ] **Routes katmanı: Sadece path + middleware**
  - Dosyalar: `routes/*.js`
  - Kontrol:
    ```javascript
    router.get('/', verifyToken, caseController.getCases);
    // ❌ SQL yok
    // ❌ business logic yok
    // ✅ Yalnızca method ve middleware
    ```

- [ ] **Controller katmanı: Parse, validate, service çağırı**
  - Dosyalar: `controllers/*.js`
  - Kontrol:
    ```javascript
    exports.getCases = async (req, res) => {
        // ✅ Parse: req.query
        // ✅ Validate: if (!status)
        // ✅ Service çağırı: await caseService.getCases(...)
        // ✅ Response: res.json({ data, meta })
        // ❌ SQL yok
        // ❌ İş kuralı yok
    };
    ```

- [ ] **Service katmanı: İş kuralları, transaction, state machine**
  - Dosyalar: `services/caseService.js`, `services/notificationService.js`
  - Kontrol:
    ```javascript
    exports.updateCaseStatus = async (caseId, newStatus) => {
        // ✅ Status validation
        // ✅ Public ID üretimi
        // ✅ Notification tetikleme
        // ✅ Repository çağırı
        // ❌ req/res yok
    };
    ```

- [ ] **Repository katmanı: SQL only**
  - Dosyalar: `repositories/caseRepository.js`
  - Kontrol:
    ```javascript
    exports.findById = async (id) => {
        return await Case.findByPk(id);
    };
    // ✅ Yalnızca DB sorgular
    // ❌ req/res, İş kuralı yok
    ```

**Notlar**: 
- Mevcut durum: Controllers service/repository ufak oranda kullanıyor
- Migration planı: Controllers → Services → Repositories
- Örnek dosyalar: caseService.js, caseRepository.js, notificationService.js

**Başarılı Kriterium**: Route → Controller → Service → Repository zinciri açık ve takip edilebilir

---

### 3. Hatalı Body 400 + error.code
- [ ] **Gerekli alanlar eksik → 400**
  - Test endpoint: `POST /auth/register`
  - İstek: `{ email: "test@example.com" }` (fullname, password eksik)
  - Beklenen yanıt:
    ```json
    {
      "error": {
        "code": "BAD_REQUEST",
        "message": "Lütfen tüm alanları doldurunuz"
      }
    }
    ```

- [ ] **Geçersiz data type → 400**
  - Test endpoint: `POST /cases`
  - İstek: `{ case_no: "CAS-001", title: 123, client_id: "invalid-uuid" }`
  - Beklenen: 400, `error.code: "BAD_REQUEST"`

- [ ] **Enum değeri dışında → 400**
  - Test endpoint: `PATCH /cases/{id}/status`
  - İstek: `{ status: "INVALID_STATUS" }`
  - Beklenen: 400, `error.code: "BAD_REQUEST"`

- [ ] **Duplicate unique field → 409**
  - Test endpoint: `POST /employees` (aynı email ile ikinci kez)
  - Beklenen: 409, `error.code: "CONFLICT"`

**Kontrol Listesi**:
```bash
# 1. Register - eksik alanlar
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'
# → 400 BAD_REQUEST

# 2. Case status - geçersiz status
curl -X PATCH http://localhost:3000/api/cases/cas-123/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"INVALID"}'
# → 400 BAD_REQUEST
```

**Başarılı Kriterium**: Tüm validation hataları 400 + açıklayıcı error.code ve message

---

### 4. Rol Kontrolü 403
- [ ] **Non-admin, admin işlem yapıyor → 403**
  - Test: LAWYER rolü ile `POST /employees` (sadece ADMIN)
  - Beklenen:
    ```json
    {
      "error": {
        "code": "FORBIDDEN",
        "message": "Bu işlem için ADMIN yetkisi gereklidir."
      }
    }
    ```

- [ ] **Middleware işliyor**
  - Kontrol: `roleMiddlewares.js`
  - `isAdmin` middleware'i tüm protected routes'ta çalışmalı

- [ ] **ADMIN işlemleri:**
  - `POST /employees` - Çalışan oluştur
  - `PUT /employees/{id}` - Güncelle
  - `DELETE /employees/{id}` - Sil
  - `PATCH /cases/{id}/status` - Dava durumu değiştir
  - `POST /departments` - Departman oluştur

**Postman Testi**:
```
1. LAWYER token ile login
2. POST /employees (admin işlem)
3. → 403 FORBIDDEN beklenir
```

**Başarılı Kriterium**: ADMIN olmayan kullanıcılar admin işlemlere 403 alıyor

---

### 5. Liste: Pagination + Meta
- [ ] **GET /cases - Pagination çalışıyor**
  - URL: `GET /cases?page=1&limit=10`
  - Beklenen yanıt:
    ```json
    {
      "data": [...],
      "meta": {
        "total": 42,
        "page": 1,
        "limit": 10
      }
    }
    ```

- [ ] **Limit max 100**
  - URL: `GET /cases?limit=200`
  - Beklenen: limit 100'e set edilir, meta.limit: 100

- [ ] **Offset hesaplaması**
  - page=2, limit=10 → offset=10
  - page=3, limit=20 → offset=40

- [ ] **Tüm liste endpoint'leri pagination'ı destekliyor**
  - `GET /employees?page=1&limit=20` ✓
  - `GET /expenses?page=1&limit=20` ✓
  - `GET /collections?page=1&limit=20` ✓
  - `GET /notifications?page=1&limit=20` ✓
  - `GET /cases?page=1&limit=20` ✓

**Postman Testi**:
```
GET /cases?page=2&limit=5

Response:
{
  "data": [... 5 item],
  "meta": {
    "total": 42,
    "page": 2,
    "limit": 5
  }
}
```

**Başarılı Kriterium**: Tüm listeler pagination + meta ile dönüş yapıyor, limit max 100

---

### 6. Detay: UUID ve PublicId ile Erişim
- [ ] **UUID ile erişim (internal)**
  - Endpoint: `GET /cases/f47ac10b-58cc-4372-a567-0e02b2c3d479`
  - Beklenen: Dava detayı döner

- [ ] **PublicId ile erişim (user-facing)**
  - Endpoint: `GET /cases/CAS-2026-000001`
  - Beklenen: Dava detayı döner (UUID ile aynı sonuç)

- [ ] **Detay endpoint'leri UUID/PublicId'yi destekliyor**
  - `GET /cases/{id|publicId}` ✓
  - `GET /expenses/{id|publicId}` ✓
  - `GET /collections/{id|publicId}` ✓
  - `GET /payment-agreements/{id|publicId}` ✓

- [ ] **Hatalı ID → 404**
  - Endpoint: `GET /cases/nonexistent-id`
  - Beklenen:
    ```json
    {
      "error": {
        "code": "NOT_FOUND",
        "message": "Dava bulunamadı."
      }
    }
    ```

**Controller Kontrol**:
```javascript
const param = req.params.id;
const whereClause = (param.startsWith('CAS-') || isNaN(param))
    ? { public_id: param }
    : { id: parseInt(param) };
const caseItem = await Case.findOne({ where: whereClause });
```

**Postman Testi**:
```
# UUID ile
GET /cases/f47ac10b-58cc-4372-a567-0e02b2c3d479
→ Success

# PublicId ile
GET /cases/CAS-2026-000001
→ Success (aynı sonuç)

# Nonexistent
GET /cases/invalid-id
→ 404 NOT_FOUND
```

**Başarılı Kriterium**: Detay endpoint'leri UUID ve PublicId'yi destekliyor, hatalı ID'ye 404 dönüyor

---

### 7. Bildirim: Oluştu & GET /notifications'ta Görünüyor
- [ ] **Case atama → Bildirim oluştur**
  - İşlem: `POST /cases/{id}/lawyers` (avukat atama)
  - Bildirim türü: `CASE_ASSIGNMENT`
  - Alıcı: Atanan avukat (employee_id)
  - Kontrol:
    ```sql
    SELECT * FROM notifications 
    WHERE type = 'CASE_ASSIGNMENT' 
    AND employee_id = '{avukat_id}';
    ```

- [ ] **Tahsilat oluşturma → Bildirim oluştur**
  - İşlem: `POST /collections` (tahsilat oluştur)
  - Bildirim türü: `COLLECTION_CREATED`
  - Alıcı: Davaya atanmış tüm avukatlar
  - Kontrol: Multiple notifications oluşmalı

- [ ] **GET /notifications - Bildirim listesi**
  - Beklenen:
    ```json
    {
      "data": [...],
      "meta": {
        "unreadCount": 3
      }
    }
    ```

- [ ] **Bildirim alanları:**
  - `id` - UUID
  - `employee_id` - Alıcı
  - `type` - Bildirim türü (CASE_ASSIGNMENT, COLLECTION_CREATED, vb.)
  - `message` - Açıklama (Türkçe)
  - `is_read` - false (yeni bildirim)
  - `createdAt` - Timestamp

**Postman Testi**:
```
1. GET /notifications (başlangıç - boş veya mevcut)
2. POST /cases/{id}/lawyers (avukat atama)
3. GET /notifications (yeni bildirim görünmeli)
4. Check: type = "CASE_ASSIGNMENT", message = "Yeni bir davaya atandınız..."
```

**Başarılı Kriterium**: İşlem sonrası bildirim oluşuyor ve GET /notifications'ta görünüyor

---

### 8. Postman Testi: Happy Path + Negatif Senaryo

#### Happy Path (Başarılı Akış)

**Scenario: Yeni Dava Oluştur → Tahsilat Ekle → Bildirim Kontrol**

```postman
1. Register ve Login
   POST /auth/register
   {
     "fullname": "Ahmet Avukat",
    "email": "ahmet@ayp.com",
     "password": "SecurePass123",
     "phone": "5001234567",
     "role": "LAWYER"
   }
   → Token al

2. Müvekkil Oluştur
   POST /clients
   {
     "full_name": "Kerem Müvekkil",
     "email": "kerem@example.com",
     "phone": "5009876543",
     "client_type": "INDIVIDUAL"
   }
   → Client ID al (client_id)

3. Dava Oluştur
   POST /cases
   {
     "case_no": "CAS-2026-001",
     "title": "İcra Davası",
     "description": "Alacak takibi",
     "client_id": "{client_id}",
     "docket_year": 2026
   }
   → Case ID ve public_id al

4. Dava Detayı - PublicId ile
   GET /cases/{public_id}
   → Başarılı dönüş

5. Tahsilat Oluştur
   POST /collections
   {
     "client_id": "{client_id}",
     "case_id": "{case_id}",
     "amount": 50000,
     "source_type": "DIRECT_PAYMENT",
     "payment_method": "BANK_TRANSFER"
   }
   → Collection ID al

6. Bildirimleri Kontrol
   GET /notifications
   → Tahsilat bildirimini görüntüle
   {
     "type": "COLLECTION_CREATED",
     "message": "...tahsilat eklendi..."
   }

7. Bildirim Okundu İşaretle
   PATCH /notifications/{notification_id}
   → is_read: true
```

**Beklenen Sonuç**: Tüm işlemler 201/200 kodları ile başarılı

---

#### Negatif Senaryo (Hata Durumları)

**Test 1: Auth Hataları**
```postman
1. Yanlış şifre ile login
   POST /auth/login
   {
    "email": "ahmet@ayp.com",
     "password": "WrongPassword"
   }
   → 401 UNAUTHORIZED

2. Token olmadan işlem
   GET /cases
   (Authorization header yok)
   → 401 UNAUTHORIZED

3. Geçerli olmayan token
   GET /cases
   Authorization: Bearer invalid.token.here
   → 401 UNAUTHORIZED
```

**Test 2: Permission Hataları**
```postman
1. LAWYER olarak employee oluşturmaya çalış
   POST /employees
   {
     "full_name": "Yeni Çalışan",
    "email": "new@ayp.com",
     "password": "Pass123",
     "role": "LAWYER"
   }
   → 403 FORBIDDEN ("Bu işlem için ADMIN yetkisi...")
```

**Test 3: Validation Hataları**
```postman
1. Case oluştur - eksik alanlar
   POST /cases
   { "case_no": "CAS-001" }
   → 400 BAD_REQUEST

2. Case durumu - geçersiz status
   PATCH /cases/{case_id}/status
   { "status": "INVALID_STATUS" }
   → 400 BAD_REQUEST

3. Duplicate email - register
   POST /auth/register
   {
     "fullname": "Ali",
     "email": "existing@email.com",
     "password": "Pass123",
     "phone": "5005555555",
     "role": "LAWYER"
   }
   → 409 CONFLICT ("Bu email adresi zaten kayıtlı")
```

**Test 4: Not Found Hataları**
```postman
1. Nonexistent case
   GET /cases/nonexistent-id
   → 404 NOT_FOUND

2. Nonexistent client
   POST /collections
   { "client_id": "invalid-uuid", ... }
   → 404 NOT_FOUND
```

**Test 5: Business Logic Hataları**
```postman
1. Davaya olmayan avukatı atama
   POST /cases/{case_id}/lawyers
   { "employeeId": "invalid-employee-id" }
   → 404 NOT_FOUND

2. Tahsilat - olmayan taksit
   POST /collections
   {
     "source_type": "INSTALLMENT",
     "installment_id": "invalid-id",
     "amount": 5000
   }
   → 404 NOT_FOUND
```

---

## 📊 Kontrol Özeti Tablosu

| # | Madde | Status | Notlar | Kontrol Tarihi |
|---|-------|--------|--------|---|
| 1 | Migration + Tablolar | ⚠️ Pending | `npm run db:migrate` çalıştırılmalı | - |
| 2 | Katman Ayrımı (R/C/S/R) | ✅ Partial | Services/Repos kısmen implemente | - |
| 3 | 400 + error.code | ✅ Done | Tüm controllers'da | - |
| 4 | Rol Kontrolü 403 | ✅ Done | roleMiddlewares.js | - |
| 5 | Pagination + Meta | ✅ Done | Tüm liste endpoints | - |
| 6 | UUID & PublicId | ✅ Done | getCaseById vb. | - |
| 7 | Bildirim Trigger | ✅ Done | Case/Collection işlemleri | - |
| 8 | Postman Tests | ⚠️ Pending | Senaryolar yazıldı | - |

---

## 🚀 Sonraki Adımlar

### Hemen Yapılacak (CRITICAL)
- [ ] Database migrations uygulanıp tablolar oluştur
- [ ] Postman collection'ı oluştur ve happy path testini çalıştır
- [ ] Hata senaryolarını test et

### Kısa Vadeli (1-2 gün)
- [ ] Service layer migration'unu tamamla (tüm controllers)
- [ ] Repository layer'ı tamamla
- [ ] Async handler middleware'ini implement et

### Orta Vadeli (1 hafta)
- [ ] Frontend API wrapper'ını implement et
- [ ] 401 auto-logout + redirect
- [ ] Unit tests yaz (Jest)
- [ ] Integration tests yaz

### Uzun Vadeli (2 hafta+)
- [ ] Refresh token flow
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced search/filtering
- [ ] Audit logging

---

## 📝 Notlar

**Tamamlanan İş:**
- ✅ API response format (data + meta)
- ✅ Error standardı (error.code + message)
- ✅ Auth: JWT HS256, bcrypt cost 12
- ✅ State transitions (Case, Installment, Expense)
- ✅ Public ID generation
- ✅ Notification tetikleri (4 event type)
- ✅ Pagination, UUID/PublicId access
- ✅ Role-based access control

**Todo:**
- ⚠️ Database migrations apply
- ⚠️ Service/Repository layer migration
- ⚠️ Postman test collection
- ⚠️ Frontend implementation

**Resmi Dokümantasyon:**
- 📄 TECHNICAL_SPEC.md - State transitions, notifications
- 📄 FRONTEND_RULES.md - API wrapper, XSS protection
- 📄 README_TECHNICAL.md - Architecture overview

---

**Kontrol Listesi Güncellenme Tarihi**: 2026-06-24  
**Durum**: ACTIVE - Günlük olarak güncellenecek
