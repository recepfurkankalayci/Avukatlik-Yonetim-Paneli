import React, { useState, useEffect } from 'react';
import { axiosPrivate } from '../../api/axios';
import { Briefcase, Search, Plus, X, Edit, Eye } from 'lucide-react';

const Cases = () => {
    const [cases, setCases] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [formData, setFormData] = useState({
        client_id: '',
        case_no: '',
        title: '',
        court_name: '',
        docket_year: new Date().getFullYear().toString(),
        base_number: '',
        status: 'OPEN'
    });

    const fetchCases = async () => {
        setLoading(true);
        try {
            const response = await axiosPrivate.get('/cases');
            setCases(response.data.data || []);
        } catch (error) {
            console.error("Davalar yüklenirken hata oluştu", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await axiosPrivate.get('/clients');
            setClients(response.data.data || []);
        } catch (error) {
            console.error("Müvekkiller yüklenirken hata oluştu", error);
        }
    };

    useEffect(() => {
        fetchCases();
        fetchClients();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosPrivate.post('/cases', formData);
            setShowForm(false);
            setFormData({
                client_id: '', case_no: '', title: '', court_name: '', docket_year: new Date().getFullYear().toString(), base_number: '', status: 'OPEN'
            });
            fetchCases();
        } catch (error) {
            alert('Dava eklenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'OPEN': return <span className="badge badge-success">Açık</span>;
            case 'CLOSED': return <span className="badge badge-danger">Kapalı</span>;
            case 'APPEAL': return <span className="badge badge-warning">Temyizde</span>;
            case 'DECIDED': return <span className="badge badge-success" style={{backgroundColor: '#e0e7ff', color: '#4338ca'}}>Karara Çıktı</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    return (
        <div>
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h2>Davalar</h2>
                    <p className="text-muted">Müvekkil davalarını ve durumlarını takip edin</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={18} />
                        Yeni Dava Ekle
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card mb-4 animate-fade-in">
                    <div className="card-header">
                        <h3 className="card-title">Yeni Dava Ekle</h3>
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
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>{client.display_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Dava No</label>
                                    <input type="text" className="form-control" name="case_no" value={formData.case_no} onChange={handleInputChange} placeholder="Örn: 2026/123" required />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Dava Başlığı / Konusu</label>
                                    <input type="text" className="form-control" name="title" value={formData.title} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mahkeme Adı</label>
                                    <input type="text" className="form-control" name="court_name" value={formData.court_name} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Durum</label>
                                    <select className="form-control" name="status" value={formData.status} onChange={handleInputChange}>
                                        <option value="OPEN">Açık</option>
                                        <option value="CLOSED">Kapalı</option>
                                        <option value="APPEAL">Temyizde</option>
                                        <option value="DECIDED">Karara Çıktı</option>
                                    </select>
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
                    <h3 className="card-title">Dava Listesi</h3>
                    <div className="d-flex align-items-center" style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                        <input type="text" className="form-control" placeholder="Ara..." style={{ paddingLeft: '40px' }} />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Dava No</th>
                                <th>Başlık</th>
                                <th>Mahkeme</th>
                                <th>Durum</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center">Yükleniyor...</td>
                                </tr>
                            ) : cases.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center">Henüz dava bulunmamaktadır.</td>
                                </tr>
                            ) : (
                                cases.map(caseItem => (
                                    <tr key={caseItem.id}>
                                        <td style={{ fontWeight: 500 }}>{caseItem.docket_number_text}</td>
                                        <td>{caseItem.case_summary}</td>
                                        <td>{caseItem.court_name || '-'}</td>
                                        <td>{getStatusBadge(caseItem.status)}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button className="btn-icon" title="Detay Görüntüle"><Eye size={18} /></button>
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

export default Cases;
