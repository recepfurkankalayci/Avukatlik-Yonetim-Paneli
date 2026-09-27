# Frontend Kuralları ve Patterns

## API Fetch Wrapper

Tüm HTTP istekleri tek bir fetch wrapper üzerinden yapılır. Bu sayede:
- 401 hataları otomatik işlenir (logout + redirect)
- Tüm isteklere auth header eklenir
- Request/response intercepting yapılabilir
- Error handling standardlaştırılır

### utils/api.js

```javascript
/**
 * API Wrapper - Tüm HTTP istekleri için merkezi nokta
 * 401: auto logout + redirect to /login
 * Tüm isteklere Authorization header eklenir
 */

class ApiError extends Error {
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * API isteği yap
 * @param {string} endpoint - API endpoint (e.g., '/cases', '/users/123')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} - Response data
 */
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    let response;

    try {
        response = await fetch(url, {
            ...options,
            headers
        });
    } catch (err) {
        console.error('Network error:', err);
        throw new ApiError(0, 'NETWORK_ERROR', 'Ağ hatası. Lütfen bağlantınızı kontrol edin.');
    }

    // Response JSON'ı parse et
    let data;
    try {
        data = await response.json();
    } catch (err) {
        console.error('Invalid JSON response:', err);
        throw new ApiError(response.status, 'INVALID_RESPONSE', 'Sunucudan geçersiz yanıt alındı.');
    }

    // 401 Unauthorized: Token geçersiz/süresi dolmuş
    if (response.status === 401) {
        console.warn('401 Unauthorized - Logging out user');
        
        // Token'ları sil
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        // Login page'e yönlendir
        window.location.href = '/login';

        throw new ApiError(401, 'UNAUTHORIZED', 'Oturum süresi dolmuş. Lütfen giriş yapın.');
    }

    // Error response
    if (!response.ok) {
        const errorCode = data?.error?.code || 'UNKNOWN_ERROR';
        const errorMessage = data?.error?.message || `HTTP ${response.status} hatası`;
        throw new ApiError(response.status, errorCode, errorMessage);
    }

    return data;
}

/**
 * GET request
 */
export async function apiGet(endpoint, options = {}) {
    return apiCall(endpoint, { ...options, method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost(endpoint, body, options = {}) {
    return apiCall(endpoint, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body)
    });
}

/**
 * PUT request
 */
export async function apiPut(endpoint, body, options = {}) {
    return apiCall(endpoint, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body)
    });
}

/**
 * PATCH request
 */
export async function apiPatch(endpoint, body, options = {}) {
    return apiCall(endpoint, {
        ...options,
        method: 'PATCH',
        body: JSON.stringify(body)
    });
}

/**
 * DELETE request
 */
export async function apiDelete(endpoint, options = {}) {
    return apiCall(endpoint, { ...options, method: 'DELETE' });
}

export { ApiError };
```

### Kullanım Örnekleri

```javascript
// GET: Davalar listesi
try {
    const response = await apiGet('/cases?page=1&limit=20');
    const cases = response.data;
    const meta = response.meta; // { total, page, limit }
} catch (error) {
    if (error.code === 'UNAUTHORIZED') {
        // Zaten logout oldu, redirect yapıldı
    } else {
        console.error(error.message);
    }
}

// POST: Yeni dava oluştur
try {
    const response = await apiPost('/cases', {
        case_no: 'CAS-2026-001',
        title: 'İcra Davası',
        client_id: 'cli-123'
    });
    const newCase = response.data;
} catch (error) {
    // Error handling
}

// PATCH: Dava durumunu güncelle
try {
    await apiPatch(`/cases/${casePublicId}/status`, { status: 'CLOSED' });
} catch (error) {
    // Error handling
}

// DELETE: Bildirim sil
try {
    await apiDelete(`/notifications/${notificationId}`);
} catch (error) {
    // Error handling
}
```

---

## URL ve Public ID Kullanımı

### ❌ Yanlış (UUID gösterme)
```javascript
// Frontend route: /cases/:id
const caseId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
<Link to={`/cases/${caseId}`}>Açık</Link>  // URL çok uzun ve karmaşık
```

### ✅ Doğru (Public ID kullanımı)
```javascript
// Frontend route: /cases/:publicId
// Backend: GET /cases/:id veya public_id kabul eder
const casePublicId = 'CAS-2026-000001';
<Link to={`/cases/${casePublicId}`}>Açık</Link>

// Backend route handler
router.get('/:id', verifyToken, async (req, res) => {
    const param = req.params.id;
    // UUID veya public_id ayrımı yap
    const caseItem = (param.startsWith('CAS-') || isNaN(param))
        ? await Case.findOne({ where: { public_id: param } })
        : await Case.findByPk(param);
});
```

---

## XSS Koruması

### ❌ Yanlış: innerHTML ile XSS zaafiyeti
```javascript
// Kullanıcı girdisini direkt HTML olarak basma
const userData = {
    name: 'John',
    description: '<img src=x onerror="alert(\'XSS\')">'
};

// XSS zaafiyeti!
<div innerHTML={userData.description} />
```

### ✅ Doğru: textContent (React otomatik escape)
```javascript
// 1. React'te otomatik escape (en güvenli)
<div>{userData.description}</div>

// 2. Metin olarak göster
<div className="description">
    {userData.description}
</div>

// 3. DOMPurify ile HTML sanitize et
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userData.description);
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />

// 4. Trusted content için marked + sanitize
import marked from 'marked';
import DOMPurify from 'dompurify';

const markdownText = '**Bold** text';
const htmlFromMarkdown = marked(markdownText);
const sanitized = DOMPurify.sanitize(htmlFromMarkdown);
<div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

### XSS Yordamı
1. **Hiçbir zaman innerHTML ile kullanıcı girdisi basma**
2. **React otomatik escape eder** - `{userData.text}` güvenli
3. **HTML gerekiyorsa DOMPurify kullan**
4. **trusted content kaynaklarını doğrula**

---

## Error Handling Pattern

```javascript
// components/hooks/useFetch.js
import { useState, useEffect } from 'react';
import { apiGet, ApiError } from '../../utils/api';

export function useFetch(endpoint) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const response = await apiGet(endpoint);
                if (isMounted) {
                    setData(response.data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted && err.status !== 401) { // 401 zaten handle ediliyor
                    setError(err.message);
                    // Toast göster
                    showErrorToast(err.message);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [endpoint]);

    return { data, loading, error };
}
```

---

## Toast/Notification Pattern

```javascript
// utils/toast.js
export function showSuccessToast(message) {
    // Örn: react-hot-toast
    toast.success(message, {
        duration: 3000,
        position: 'top-right'
    });
}

export function showErrorToast(message) {
    toast.error(message, {
        duration: 4000,
        position: 'top-right'
    });
}

export function showWarningToast(message) {
    toast.custom(message, {
        duration: 3000,
        position: 'top-right'
    });
}

// Kullanım
try {
    await apiPost('/cases', data);
    showSuccessToast('Dava başarıyla oluşturuldu');
} catch (error) {
    showErrorToast(error.message);
}
```

---

## Form Validation Pattern

```javascript
// utils/validation.js
export const validateCaseForm = (data) => {
    const errors = {};

    if (!data.case_no || data.case_no.trim() === '') {
        errors.case_no = 'Dava numarası gereklidir';
    }

    if (!data.title || data.title.trim() === '') {
        errors.title = 'Başlık gereklidir';
    }

    if (!data.client_id) {
        errors.client_id = 'Müvekkil seçiniz';
    }

    return errors;
};

// Kullanım
const errors = validateCaseForm(formData);
if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
}

// Submit
await apiPost('/cases', formData);
```
