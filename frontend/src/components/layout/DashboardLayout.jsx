import { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { LayoutDashboard, Users, Briefcase, DollarSign, Bell, LogOut, Menu } from 'lucide-react';

const DashboardLayout = () => {
    const { auth, logout } = useAuth();
    const location = useLocation();

    if (!auth?.token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const handleLogout = async () => {
        await logout();
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Müvekkiller', path: '/clients', icon: <Users size={20} /> },
        { name: 'Davalar', path: '/cases', icon: <Briefcase size={20} /> },
        { name: 'Finansal İşlemler', path: '/finance', icon: <DollarSign size={20} /> },
        { name: 'Bildirimler', path: '/notifications', icon: <Bell size={20} /> },
    ];

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar glass-panel">
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <Briefcase size={28} className="text-primary" />
                        AYP
                    </div>
                </div>
                
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    ))}
                </nav>
                
                <div className="sidebar-footer">
                    <button className="nav-item btn-block" onClick={handleLogout} style={{ color: 'var(--color-danger)' }}>
                        <LogOut size={20} />
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Topbar */}
                <header className="topbar glass-panel">
                    <div className="topbar-left">
                        <button className="btn-icon">
                            <Menu size={24} />
                        </button>
                    </div>
                    <div className="topbar-right">
                        <button className="btn-icon">
                            <Bell size={20} />
                        </button>
                        <div className="user-profile">
                            <div className="avatar">
                                {auth.user?.fullname ? auth.user.fullname.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="user-info">
                                <span className="user-name">{auth.user?.fullname || 'Kullanıcı'}</span>
                                <span className="user-role">{auth.user?.role || 'Personel'}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="page-content animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
