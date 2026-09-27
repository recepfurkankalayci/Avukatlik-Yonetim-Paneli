import React, { useState, useEffect } from 'react';
import { axiosPrivate } from '../../api/axios';
import { DollarSign, Search, Plus, X, Edit, Trash2 } from 'lucide-react';

const Finance = () => {
    const [expenses, setExpenses] = useState([]);
    const [clients, setClients] = useState([]);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        client_id: '',
        case_id: '',
        amount: '',
        category: 'COURT_FEE',
        expense_date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [expRes, clientRes, caseRes] = await Promise.all([
                axiosPrivate.get('/expenses'),
                axiosPrivate.get('/clients'),
                axiosPrivate.get('/cases')
            ]);
            setExpenses(expRes.data.data || []);
            setClients(clientRes.data.data || []);
            setCases(caseRes.data.data || []);
        } catch (error) {
            console.error("Veriler yüklenirken hata oluştu", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Case ID can be empty string in select, set to null
            const payload = { ...formData };
            if (payload.case_id === '') delete payload.case_id;

            await axiosPrivate.post('/expenses', payload);
            setShowForm(false);
            setFormData({
                client_id: '', case_id: '', amount: '', category: 'COURT_FEE', expense_date: new Date().toISOString().split('T')[0], description: ''
            });
            fetchData();
        } catch (error) {
            alert('Masraf eklenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
        }
    };

    const getCategoryName = (category) => {
        const categories = {
            'COURT_FEE': 'Mahkeme Harcı',
            'TRAVEL': 'Seyahat',
            'NOTARY': 'Noter',
            'EXPERT': 'Bilirkişi',
            'OTHER': 'Diğer'
        };
        return categories[category] || category;
    };

    return (
        <div>
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h2>Finansal İşlemler (Masraflar)</h2>
                    <p className="text-muted">Müvekkil ve dava masraflarını takip edin</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={18} />
                        Yeni Masraf Ekle
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card mb-4 animate-fade-in">
                    <div className="card-header">
                        <h3 className="card-title">Yeni Masraf Ekle</h3>
                        <button className="btn-icon" onClick={() => setShowForm(false)}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="dashboard-grid">
                                <div className="form-group">
                                    <label className="form-label">Müvekkil</label>
                                    <select className="form-control" name="client_id" value={formData.client_id} onChange={handleInputChange} required>
                                        <option value="" disabled>Müvekkil Seçiniz</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">İlgili Dava (Opsiyonel)</label>
                                    <select className="form-control" name="case_id" value={formData.case_id} onChange={handleInputChange}>
                                        <option value="">Dava Bağımsız</option>
                                        {cases.map(c => (
                                            <option key={c.id} value={c.id}>{c.case_no} - {c.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tutar (₺)</label>
                                    <input type="number" step="0.01" className="form-control" name="amount" value={formData.amount} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Kategori</label>
                                    <select className="form-control" name="category" value={formData.category} onChange={handleInputChange} required>
                                        <option value="COURT_FEE">Mahkeme Harcı</option>
                                        <option value="TRAVEL">Seyahat</option>
                                        <option value="NOTARY">Noter</option>
                                        <option value="EXPERT">Bilirkişi</option>
                                        <option value="OTHER">Diğer</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Tarih</label>
                                    <input type="date" className="form-control" name="expense_date" value={formData.expense_date} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Açıklama</label>
                                    <input type="text" className="form-control" name="description" value={formData.description} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="d-flex justify-content-end gap-2 mt-3">
                                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title">Masraf Listesi</h3>
                    <div className="d-flex align-items-center" style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                        <input type="text" className="form-control" placeholder="Ara..." style={{ paddingLeft: '40px' }} />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Tarih</th>
                                <th>Kategori</th>
                                <th>Açıklama</th>
                                <th>Tutar (₺)</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center">Yükleniyor...</td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center">Henüz masraf bulunmamaktadır.</td>
                                </tr>
                            ) : (
                                expenses.map(expense => (
                                    <tr key={expense.id}>
                                        <td>{new Date(expense.expense_date).toLocaleDateString('tr-TR')}</td>
                                        <td><span className="badge badge-warning">{getCategoryName(expense.category)}</span></td>
                                        <td>{expense.description || '-'}</td>
                                        <td style={{ fontWeight: 600 }}>{parseFloat(expense.amount).toFixed(2)} ₺</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button className="btn-icon" title="Düzenle"><Edit size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Finance;
