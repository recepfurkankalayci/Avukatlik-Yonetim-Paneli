import React from 'react';
import { Users, Briefcase, DollarSign, TrendingUp } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Dashboard = () => {
    const { auth } = useAuth();
    
    return (
        <div>
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h2>Hoş Geldiniz, {auth?.user?.fullname || 'Kullanıcı'}</h2>
                    <p className="text-muted">AYP Sistemine Genel Bakış</p>
                </div>
                <button className="btn btn-primary">Yeni Dava Ekle</button>
            </div>
            
            <div className="dashboard-grid">
                <div className="card stat-card">
                    <div className="stat-icon primary">
                        <Briefcase size={28} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Aktif Davalar</span>
                        <span className="stat-value">24</span>
                    </div>
                </div>
                
                <div className="card stat-card">
                    <div className="stat-icon success">
                        <Users size={28} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Toplam Müvekkil</span>
                        <span className="stat-value">86</span>
                    </div>
                </div>
                
                <div className="card stat-card">
                    <div className="stat-icon warning">
                        <DollarSign size={28} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Bekleyen Ödemeler</span>
                        <span className="stat-value">5</span>
                    </div>
                </div>
                
                <div className="card stat-card">
                    <div className="stat-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                        <TrendingUp size={28} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Aylık Tahsilat</span>
                        <span className="stat-value">₺45,000</span>
                    </div>
                </div>
            </div>
            
            <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Son Eklenen Davalar</h3>
                    </div>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Dava No</th>
                                    <th>Müvekkil</th>
                                    <th>Durum</th>
                                    <th>Tarih</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>2026/104</td>
                                    <td>Ahmet Yılmaz</td>
                                    <td><span className="badge badge-warning">Açık</span></td>
                                    <td>12 Tem 2026</td>
                                </tr>
                                <tr>
                                    <td>2026/098</td>
                                    <td>ABC Limited Şti.</td>
                                    <td><span className="badge badge-success">Karara Çıktı</span></td>
                                    <td>05 Tem 2026</td>
                                </tr>
                                <tr>
                                    <td>2026/045</td>
                                    <td>Mehmet Kaya</td>
                                    <td><span className="badge badge-danger">Temyiz</span></td>
                                    <td>20 Haz 2026</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Son Bildirimler</h3>
                    </div>
                    <div className="card-body">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></div>
                            <div>
                                <p className="mb-1" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Yeni ödeme sözleşmesi eklendi</p>
                                <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>10 dakika önce</p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></div>
                            <div>
                                <p className="mb-1" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Tahsilat gerçekleştirildi (₺5000)</p>
                                <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>2 saat önce</p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }}></div>
                            <div>
                                <p className="mb-1" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Dava duruşması yaklaşıyor</p>
                                <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>1 gün önce</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
