# AYP - Teknik Spesifikasyon Özeti

## 📋 Sistem Mimarisi

### Backend Katmanları

```
┌─────────────────────────────────────────┐
│         Routes (Routing Layer)           │ ← HTTP paths, middleware chain
├─────────────────────────────────────────┤
│      Controllers (Request/Response)      │ ← Parse, validate, call service
├─────────────────────────────────────────┤
│    Services (Business Logic Layer)       │ ← Rules, transactions, state
├─────────────────────────────────────────┤
│   Repositories (Data Access Layer)       │ ← SQL only, model operations
├─────────────────────────────────────────┤
│      Middlewares (Cross-cutting)         │ ← Auth, errors, logging
├─────────────────────────────────────────┤
│        Database (PostgreSQL)             │ ← Data persistence
└─────────────────────────────────────────┘
```

### Frontend Patterns

- **API Wrapper**: Merkezi HTTP işlemleri
- **401 Handling**: Auto logout + redirect to /login
- **Public ID**: URLs'de publicId göster (UUID değil)
- **XSS Protection**: textContent/DOMPurify kullan (innerHTML yok)

---

## ✅ Implemented Features

### 1. API Response Format ✓

**Success**:
```json
{
  "data": {...},
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

**Error**:
```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Kısa, Türkçe hata mesajı"
  }
}
```

### 2. Authentication & Authorization ✓

- **Password**: bcrypt, cost 12
- **JWT**: HS256, payload `{ sub, role, iat, exp }`
- **Token Expiry**: 1h (access), 7d (refresh)
- **Refresh Tokens**: Model var, ilk iterasyonda optional
- **Middleware**: Auth + Role (ADMIN)

### 3. State Transitions ✓

#### Case (Dava)
```
OPEN ←→ CLOSED
```
- Validation: Sadece bu iki status
- Admin: PATCH /cases/{id}/status

#### Installment (Taksit)
```
PENDING → PARTIAL → PAID
         ↗ CANCELLED
```
- Auto-transition: Collection işleminden sonra
- `paid_at` timestamp: PAID'ye geçerken set

#### Expense (Masraf)
```
UNREIMBURSED → PARTIAL → REIMBURSED
           ↗ (collection EXPENSE_REFUND ile)
```
- `reimbursed_at` timestamp: REIMBURSED'a geçerken set

### 4. Public ID Generation ✓

| Entity | Prefix | Format |
|--------|--------|--------|
| Client | CLI | CLI-{seq} |
| Case | CAS | CAS-{seq} |
| Collection | COL | COL-{seq} |
| Receipt | REC | REC-{seq} |
| Expense | EXP | EXP-{seq} |
| Employee | EMP | EMP-{seq} |
| Department | DEPT | DEPT-{seq} |
| PaymentAgreement | PAG | PAG-{seq} |

### 5. Notification Triggers ✓

| Event | Type | Alıcı |
|-------|------|-------|
| Dava Atama | CASE_ASSIGNMENT | Atanan avukat |
| Tahsilat | COLLECTION_CREATED | Davaya atanmış avukatlar |
| Taksit Ödeme | INSTALLMENT_PAID | İlgili temsilci |
| Masraf İadesi | EXPENSE_REIMBURSED | İşlem yapan kişi |

### 6. Environment Configuration ✓

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/ayp
JWT_SECRET=<min 32 chars>
JWT_ACCESS_EXPIRES_IN=1h
BCRYPT_COST=12
CORS_ORIGIN=http://localhost:5173
```

---

## 📁 Dizin Yapısı

```
AYP/
├── controllers/          # Request parsing, validation, response
│   ├── authController.js
│   ├── caseController.js
│   ├── collectionController.js
│   ├── departmentController.js
│   ├── employeeController.js
│   ├── expenseController.js
│   ├── notificationController.js
│   └── paymentAgreementController.js
│
├── services/             # Business logic, transactions, state
│   ├── caseService.js           ✅ (Example)
│   └── notificationService.js   ✅ (Example)
│
├── repositories/         # Data access, SQL only
│   └── caseRepository.js        ✅ (Example)
│
├── middlewares/
│   ├── authMiddlewares.js        ✅ (JWT verification)
│   ├── roleMiddlewares.js        ✅ (ADMIN check)
│   ├── asyncHandler.js           ✅ (Try/catch remover)
│   └── errorHandler.js           ✅ (Central error handling)
│
├── routes/
│   ├── authRoutes.js
│   ├── caseRoutes.js
│   ├── clientRouters.js
│   ├── collectionRoutes.js
│   ├── departmentRouters.js
│   ├── employee.js
│   ├── expenseRoutes.js
│   ├── notificationRoutes.js
│   └── paymentAgreementRoutes.js
│
├── models/
│   ├── cases.js
│   ├── clients.js
│   ├── employees.js
│   ├── installments.js           ✅ (paid_at)
│   ├── expenses.js               ✅ (reimbursed_at, reimbursement_status)
│   ├── auth_refresh_tokens.js
│   └── ...
│
├── utils/
│   └── generatePublicId.js
│
├── docs/
│   ├── TECHNICAL_SPEC.md         ✅ (State transitions, notifications)
│   └── FRONTEND_RULES.md         ✅ (API wrapper, XSS protection)
│
├── .env                           ✅ (Updated)
└── server.js
```

---

## 🚀 Next Steps (Backlog)

### Phase 2: Service/Repository Layer Migration

- [ ] Case işlemleri: Controller → Service → Repository
- [ ] Collection işlemleri: Controller → Service → Repository
- [ ] Async handler kullanımı: Controller'larda try/catch yok
- [ ] Merkezi error handling: middleware'de tüm hatalar

### Phase 3: Frontend Implementation

- [ ] API wrapper (utils/api.js)
- [ ] 401 auto-logout + redirect
- [ ] Public ID URL'lerde
- [ ] XSS koruması (DOMPurify)
- [ ] Form validation patterns

### Phase 4: Advanced Features

- [ ] Refresh token flow
- [ ] Pagination utilities
- [ ] Search/filtering standardization
- [ ] Real-time notifications (WebSocket)
- [ ] Audit logging

---

## 🔒 Security Checklist

- [x] Password: bcrypt, cost 12
- [x] JWT: HS256, token expiry
- [x] Auth middleware: Token validation
- [x] Role middleware: Authorization checks
- [x] Error messages: Türkçe, açıklayıcı
- [x] .env: Sensitive data not in repo
- [x] CORS: Frontend origin configured
- [ ] HTTPS: Production only
- [ ] Helmet: Security headers
- [ ] Rate limiting: Attack protection
- [ ] Input validation: All endpoints
- [ ] SQL injection: Sequelize ORM prevents
- [ ] XSS: Frontend textContent/DOMPurify

---

## 📝 API Endpoints Reference

### Authentication
```
POST   /auth/register       - Çalışan kaydı
POST   /auth/login          - Giriş (JWT)
POST   /auth/logout         - Çıkış
GET    /auth/me             - Profil getir
```

### Cases
```
GET    /cases                      - Liste (sayfalama)
POST   /cases                      - Oluştur
GET    /cases/:publicId            - Detay
PATCH  /cases/:publicId/status     - Status güncelle
POST   /cases/:publicId/lawyers    - Avukat atama
DELETE /cases/:publicId/lawyers/:employeeId
GET    /cases/assignable-employees - Atanabilir avukatlar
```

### Collections
```
GET    /collections                    - Liste (sayfalama)
POST   /collections                    - Tahsilat oluştur
GET    /collections/:publicId          - Detay
POST   /collections/:id/receipt        - Makbuz oluştur
```

### Expenses
```
GET    /expenses                      - Liste (sayfalama)
POST   /expenses                      - Masraf oluştur
GET    /expenses/:publicId            - Detay
```

### Notifications
```
GET    /notifications                 - Listele (meta: unreadCount)
PATCH  /notifications/:id             - Okundu işaretle
PATCH  /notifications/mark-all-read   - Tümünü okundu işaretle
```

---

## 🧪 Testing

```bash
# Backend tests (to be created)
npm test

# Frontend tests (to be created)
npm run test:frontend

# Lint
npm run lint
```

---

## 📚 Documentation Files

- [TECHNICAL_SPEC.md](./docs/TECHNICAL_SPEC.md) - State transitions, notifications, layers
- [FRONTEND_RULES.md](./docs/FRONTEND_RULES.md) - API wrapper, XSS protection, patterns

---

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run migrations (if using Sequelize)
npx sequelize-cli db:migrate

# Run seeders
npx sequelize-cli db:seed:all
```

---

## 📞 Support

For technical questions or clarifications, refer to:
1. TECHNICAL_SPEC.md - Architecture and state machines
2. FRONTEND_RULES.md - UI/UX patterns and security
3. Individual controller comments - Implementation details
