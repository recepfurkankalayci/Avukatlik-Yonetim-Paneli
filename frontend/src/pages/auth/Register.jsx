import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Briefcase, Lock, Mail, User, Phone, Shield } from 'lucide-react';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        phone: '',
        role: ''
    });
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        
        try {
            await register(formData);
            setSuccess('Kayıt başarılı! Lütfen giriş yapınız.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Kayıt sırasında bir hata oluştu.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper animate-fade-in">
            <div className="auth-container" style={{ padding: '2rem 0' }}>
                <div className="auth-card glass-panel" style={{ maxWidth: '500px' }}>
                    <div className="auth-header mb-3">
                        <div className="auth-logo d-flex justify-content-center align-items-center gap-2 mb-2">
                            <Briefcase size={32} />
                            AYP
                        </div>
                        <p className="text-muted" style={{ fontSize: '1.05rem' }}>Yeni Hesap Oluşturun</p>
                    </div>
                
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Ad Soyad</label>
                        <div className="d-flex align-items-center" style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                            <input 
                                type="text" 
                                name="fullname"
                                className="form-control" 
                                placeholder="Örn: Ahmet Yılmaz"
                                style={{ paddingLeft: '40px' }}
                                value={formData.fullname}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">E-posta Adresi</label>
                        <div className="d-flex align-items-center" style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                            <input 
                                type="email" 
                                name="email"
                                className="form-control" 
                                placeholder="ornek@ayp.com"
                                style={{ paddingLeft: '40px' }}
                                value={formData.email}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Telefon</label>
                        <div className="d-flex align-items-center" style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                            <input 
                                type="tel" 
                                name="phone"
                                className="form-control" 
                                placeholder="0555 555 5555"
                                style={{ paddingLeft: '40px' }}
                                value={formData.phone}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Rol</label>
                        <div className="d-flex align-items-center" style={{ position: 'relative' }}>
                            <Shield size={18} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                            <select 
                                name="role"
                                className="form-control" 
                                style={{ paddingLeft: '40px', appearance: 'none' }}
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>Rol Seçiniz</option>
                                <option value="LAWYER">Avukat</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-group mb-4">
                        <label className="form-label">Şifre</label>
                        <div className="d-flex align-items-center" style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                            <input 
                                type="password" 
                                name="password"
                                className="form-control" 
                                placeholder="••••••••"
                                style={{ paddingLeft: '40px' }}
                                value={formData.password}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
                    </button>
                </form>
                
                <div className="text-center mt-4">
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                        Zaten hesabınız var mı? <a href="/login" className="text-primary" style={{ fontWeight: 600 }}>Giriş Yap</a>
                    </p>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Register;
