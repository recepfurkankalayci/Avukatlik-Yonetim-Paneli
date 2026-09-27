import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Clients from './pages/clients/Clients';
import Cases from './pages/cases/Cases';
import Finance from './pages/finance/Finance';
import useAuth from './hooks/useAuth';

// Placeholder components for other routes
const Notifications = () => <div className="card card-body"><h2>Bildirimler Modülü</h2><p>Yapım aşamasında...</p></div>;

const App = () => {
    const { loading } = useAuth();

    if (loading) {
        return <div className="auth-container"><h2>Yükleniyor...</h2></div>;
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes inside Layout */}
            <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="cases" element={<Cases />} />
                <Route path="finance" element={<Finance />} />
                <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;
