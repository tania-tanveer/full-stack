import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_FALLBACK_BASE = 'http://localhost:3002';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await axios.post('/api/auth/login', { email, password });
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        setToken(token);
        return user;
    };

    const register = async (name, email, password) => {
        const response = await axios.post('/api/auth/register', { name, email, password });
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        setToken(token);
        return user;
    };

    const forgotPassword = async (email) => {
        try {
            const response = await axios.post('/api/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            if (error?.response?.status === 404) {
                const fallbackResponse = await axios.post(
                    `${API_FALLBACK_BASE}/api/auth/forgot-password`,
                    { email }
                );
                return fallbackResponse.data;
            }
            throw error;
        }
    };

    const resetPassword = async (token, newPassword) => {
        const response = await axios.post('/api/auth/reset-password', { token, newPassword });
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, forgotPassword, resetPassword, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
