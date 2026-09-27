import React, { createContext, useState, useEffect } from 'react';
import { axiosPrivate } from '../api/axios';
import axios from '../api/axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        localStorage.removeItem('token');
        setAuth(null);
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await axios.post('/auth/login', { email, password });
        const token = response.data?.data?.token;
        if (token) {
            localStorage.setItem('token', token);
            // After login, we fetch user info. Wait, backend login might return user. 
            // We can just fetch it again or decode token. For now, fetch /me
            const userResponse = await axios.get('/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAuth({ user: userResponse.data?.data || userResponse.data, token: token });
            return true;
        }
        return false;
    };

    const register = async (userData) => {
        const response = await axios.post('/auth/register', userData);
        return response.data;
    };

    const logout = async () => {
        try {
            await axiosPrivate.post('/auth/logout');
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            localStorage.removeItem('token');
            setAuth(null);
        }
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
