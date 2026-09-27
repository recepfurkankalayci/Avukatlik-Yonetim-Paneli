import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Briefcase, Lock, Mail } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const success = await login(email, password);
            if (success) {
                navigate(from, { replace: true });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper animate-fade-in">
            <div className="auth-container">
                <div className="auth-card glass-panel">
                    <div className="auth-header">
                        <div className="auth-logo d-flex justify-content-center align-items-center gap-2 mb-2">
                            <Briefcase size={32} />
                            AYP
                        </div>
                        <p className="text-muted" style={{ fontSize: '1.05rem' }}>Hukuk Otomasyon Sistemine Hoş Geldiniz</p>
                    </div>
                
                {error && <div className="alert alert-danger">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">E-posta Adresi</label>
                        <div className="d-flex align-items-center" style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                            <input 
                                type="email" 
                                className="form-control" 
                                placeholder="ornek@ayp.com"
                                style={{ paddingLeft: '40px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                    </div>
                    
                    <div className="form-group mb-4">
                        <label className="form-label">Şifre</label>
                        <div className="d-flex align-items-center" style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                            <input 
                                type="password" 
                                className="form-control" 
                                placeholder="••••••••"
                                style={{ paddingLeft: '40px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>
                
                <div className="text-center mt-4">
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                        Hesabınız yok mu? <a href="/register" className="text-primary" style={{ fontWeight: 600 }}>Hemen Kayıt Olun</a>
                    </p>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Login;
