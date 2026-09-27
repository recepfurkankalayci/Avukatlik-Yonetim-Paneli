# AYP - Avukatlık Yönetim Paneli

**Not:** Bu proje şu an aktif geliştirme aşamasındadır (Work in Progress).
Avukatlık bürolarının müvekkil, dava, çalışan ve finans süreçlerini yönetmesi için geliştirilen web uygulaması.

**GitHub:** [Avukatlik-Yonetim-Paneli](https://github.com/recepfurkankalayci/Avukatlik-Yonetim-Paneli)

## Özellikler

- Kullanıcı kaydı, giriş ve oturum yönetimi
- Genel bakış paneli
- Müvekkil ve dava yönetimi
- Çalışan yönetimi ve dava avukatı atama
- Ödeme anlaşmaları ve tahsilat takibi
- Gider ve bildirim modülleri

## Teknolojiler

- Backend: Node.js, Express 5
- Frontend: React 19, Vite, React Router
- Veritabanı: PostgreSQL
- Çalışma zamanı ORM'i: Sequelize

Backend şu anda Sequelize modellerini kullanır. Repodaki Prisma şema dosyaları uygulama başlatılırken kullanılmaz.

## Gereksinimler

- Node.js 20.19+ veya 22.12+
- npm
- PostgreSQL

## Kurulum

Önce repoyu indirip bağımlılıkları kurun:

```powershell
git clone https://github.com/recepfurkankalayci/Avukatlik-Yonetim-Paneli.git
cd Avukatlik-Yonetim-Paneli
npm install
npm install --prefix frontend
```

PostgreSQL'de `ayp` adında bir veritabanı oluşturun. Örneğin `psql` içinde:

```sql
CREATE DATABASE ayp;
```

Proje kökünde `.env` dosyası oluşturun:

```env
DB_NAME=ayp
DB_USER=postgres
DB_PASSWORD=POSTGRES_PAROLANIZ
DB_HOST=localhost
DB_PORT=5432
PORT=3000
JWT_SECRET=UZUN_VE_RASTGELE_BIR_GIZLI_DEGER
```

Gerçek parola ve gizli anahtarları kaynak koda veya Git deposuna eklemeyin. `.env` dosyası kişisel makinenizde kalmalıdır.
`JWT_SECRET` için en az 32 karakter kullanın; yerel olarak güvenli bir değer üretmek için `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` komutunu çalıştırabilirsiniz.

İsteğe bağlı örnek verileri eklemek için `.env` içine en az 12 karakterli, yerel ve benzersiz bir `SEED_USER_PASSWORD` tanımlayın ve `node seeders/seedData.js` komutunu çalıştırın. Seed çalışanlarının tümü bu parolayı kullanır; gerçek kullanıcı parolası olarak kullanmayın.

## Geliştirme

Backend'i proje kökünde başlatın:

```powershell
npm run dev
```

Ayrı bir terminalde frontend geliştirme sunucusunu başlatın:

```powershell
npm run dev --prefix frontend
```

Vite adresi terminalde gösterilir (genellikle `http://localhost:5173`). API adresi `http://localhost:3000/api/v1`, sağlık kontrolü ise `http://localhost:3000/api/health` şeklindedir.

## Production Build

Frontend'i derleyin ve Express sunucusunu çalıştırın:

```powershell
npm run build --prefix frontend
npm start
```

Uygulama `http://localhost:3000` adresinde açılır. Server başladığında Sequelize veritabanına bağlanır ve mevcut modellerle tabloları senkronize eder (`sequelize.sync({ alter: true })`). Canlı veritabanında şema değişikliklerinden önce yedek alın.

## Temel API Yolları

API temel yolu: `/api/v1`

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`
- `/employees`
- `/clients`
- `/cases`
- `/payment-agreements`
- `/collections`
- `/expenses`
- `/notifications`

Kimlik doğrulaması gereken uç noktalar Bearer token ister. Sağlık kontrolü: `GET /api/health`.

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm start` | Backend'i başlatır |
| `npm run dev` | Backend'i nodemon ile başlatır |
| `npm run dev --prefix frontend` | Vite geliştirme sunucusunu başlatır |
| `npm run build --prefix frontend` | Frontend production build'i oluşturur |
| `npm run lint --prefix frontend` | Frontend lint kontrolünü çalıştırır |

Kök `npm test` script'i şu anda gerçek testleri çalıştırmayan bir placeholder'dır.
