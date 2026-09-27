import React, { useState, useEffect } from 'react';
import { axiosPrivate } from '../../api/axios';
import { Users, Search, Plus, X, Edit, Trash2 } from 'lucide-react';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        client_type: 'INDIVIDUAL',
        email: '',
        phone: '',
        tc_no: '',
        tax_number: ''
    });

    const fetchClients = async () => {
        setLoading(true);
        try {
            const response = await axiosPrivate.get('/clients');
            setClients(response.data.data || []);
        } catch (error) {
            console.error("Müvekkiller yüklenirken hata oluştu", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosPrivate.post('/clients', formData);
            setShowForm(false);
            setFormData({
                full_name: '', client_type: 'INDIVIDUAL', email: '', phone: '', tc_no: ''
            });
            fetchClients();
        } catch (error) {
            alert('Müvekkil eklenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div>
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h2>Müvekkiller</h2>
                    <p className="text-muted">Sistemdeki tüm müvekkilleri yönetin</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={18} />
                        Yeni Müvekkil Ekle
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card mb-4 animate-fade-in">
                    <div className="card-header">
                        <h3 className="card-title">Yeni Müvekkil Ekle</h3>
                        <button className="btn-icon" onClick={() => setShowForm(false)}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="dashboard-grid">
                                <div className="form-group">
                                    <label className="form-label">Ad Soyad / Unvan</label>
                                    <input type="text" className="form-control" name="full_name" value={formData.full_name} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Müvekkil Tipi</label>
                                    <select className="form-control" name="client_type" value={formData.client_type} onChange={handleInputChange} required>
                                        <option value="INDIVIDUAL">Bireysel</option>
                                        <option value="CORPORATE">Kurumsal</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">E-posta</label>
                                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Telefon</label>
                                    <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleInputChange} />
                                </div>
                                {formData.client_type === 'INDIVIDUAL' ? (
                                    <div className="form-group">
                                        <label className="form-label">TC Kimlik No</label>
                                        <input type="text" className="form-control" name="tc_no" value={formData.tc_no} onChange={handleInputChange} />
                                    </div>
                                ) : (
                                    <div className="form-group">
                                        <label className="form-label">Vergi No</label>
                                        <input type="text" className="form-control" name="tax_number" value={formData.tax_number} onChange={handleInputChange} />
                                    </div>
                                )}
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
                    <h3 className="card-title">Müvekkil Listesi</h3>
                    <div className="d-flex align-items-center" style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                        <input type="text" className="form-control" placeholder="Ara..." style={{ paddingLeft: '40px' }} />
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Ad Soyad / Unvan</th>
                                <th>Tip</th>
                                <th>Telefon</th>
                                <th>E-posta</th>
                                <th>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center">Yükleniyor...</td>
                                </tr>
                            ) : clients.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center">Henüz müvekkil bulunmamaktadır.</td>
                                </tr>
                            ) : (
                                clients.map(client => (
                                    <tr key={client.id}>
                                        <td>{client.public_id}</td>
                                        <td style={{ fontWeight: 500 }}>{client.full_name}</td>
                                        <td>
                                            <span className={`badge ${client.client_type === 'CORPORATE' ? 'badge-warning' : 'badge-success'}`}>
                                                {client.client_type === 'CORPORATE' ? 'Kurumsal' : 'Bireysel'}
                                            </span>
                                        </td>
                                        <td>{client.phone || '-'}</td>
                                        <td>{client.email || '-'}</td>
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

export default Clients;
