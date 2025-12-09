import { create } from 'zustand';
import api from '../services/api';
import safeStorage from '../utils/safeStorage';

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,

    loadUser: async () => {
        try {
            const token = safeStorage.getItem('userToken');
            const userInfo = safeStorage.getItem('userInfo');

            if (token && userInfo) {
                // Set the token in the API headers for future requests
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                set({ token, user: JSON.parse(userInfo), isLoading: false, isAuthenticated: true });
            } else {
                set({ token: null, user: null, isLoading: false, isAuthenticated: false });
            }
        } catch (e) {
            console.error('Failed to load user', e);
            set({ isLoading: false, isAuthenticated: false });
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/users/login', { email, password });
            const { token, ...user } = response.data;

            safeStorage.setItem('userToken', token);
            safeStorage.setItem('userInfo', JSON.stringify(user));

            // Set the token in the API headers
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            set({ token, user, isLoading: false, isAuthenticated: true });
            return true;
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Login failed',
                isAuthenticated: false
            });
            throw error;
        }
    },

    register: async (name, email, password, gender) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/users', { name, email, password, gender });
            set({ isLoading: false });
            return true;
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Registration failed',
                isAuthenticated: false
            });
            throw error;
        }
    },

    updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.put('/users/profile', userData);
            const { token, ...user } = response.data;

            // Update local storage
            safeStorage.setItem('userInfo', JSON.stringify(user));
            // Token usually doesn't change on profile update, but if it does:
            if (token) {
                safeStorage.setItem('userToken', token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            set({ user, isLoading: false });
            return true;
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Update failed'
            });
            throw error;
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/users/forgot-password', { email });
            set({ isLoading: false });
            return res.data;
        } catch (error) {
            set({ isLoading: false, error: error.response?.data?.message || 'Request failed' });
            throw error;
        }
    },

    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post('/users/reset-password', { token, password });
            set({ isLoading: false });
            return res.data;
        } catch (error) {
            set({ isLoading: false, error: error.response?.data?.message || 'Reset failed' });
            throw error;
        }
    },

    logout: () => {
        safeStorage.removeItem('userToken');
        safeStorage.removeItem('userInfo');
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false, error: null });
    },
}));

export default useAuthStore;
