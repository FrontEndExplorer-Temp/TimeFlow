import { create } from 'zustand';
import secureStorage from '../services/secureStorage';
import api from '../services/api';
import { router } from 'expo-router';

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false, // For actions like login/signup
    isAppLoading: true, // For initial app load
    error: null,
    isAuthenticated: false,

    loadUser: async () => {
        try {
            const token = await secureStorage.getItem('userToken');
            const userInfo = await secureStorage.getItem('userInfo');

            if (token && userInfo) {
                set({ token, user: JSON.parse(userInfo), isAppLoading: false, isAuthenticated: true });
            } else {
                set({ token: null, user: null, isAppLoading: false, isAuthenticated: false });
            }
        } catch (e) {
            console.error('Failed to load user', e);
            set({ isAppLoading: false, isAuthenticated: false });
        }
    },

    refreshUser: async () => {
        try {
            const response = await api.get('/users/profile');
            const remoteUser = response.data;

            // Smart Merge: specific logic for onboardingCompleted
            // If local says true, and remote says false, keep it true (and maybe sync)
            set((state) => {
                const localUser = state.user;
                let mergedUser = { ...remoteUser };

                if (localUser?.onboardingCompleted && !remoteUser.onboardingCompleted) {
                    // Difference detected: Local is ahead. Keep local truth.
                    mergedUser.onboardingCompleted = true;
                    mergedUser.profilePicture = localUser.profilePicture || remoteUser.profilePicture; // Also try to keep avatar if we have one locally

                    // Self-healing: Try to update backend again in background
                    api.put('/users/profile', {
                        onboardingCompleted: true,
                        profilePicture: mergedUser.profilePicture
                    }).catch(err => console.log('Background sync failed', err));
                }

                secureStorage.setItem('userInfo', JSON.stringify(mergedUser));
                return { user: mergedUser };
            });
        } catch (error) {
            console.error('Failed to refresh user', error);
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/users/login', { email, password });
            const { token, ...user } = response.data;

            await secureStorage.setItem('userToken', token);
            await secureStorage.setItem('userInfo', JSON.stringify(user));

            set({ token, user, isLoading: false, isAuthenticated: true });
            // Navigation handled by _layout.js to prevent race conditions
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

            // CRITICAL: Force merge to ensure fields like onboardingCompleted are preserved
            // Get current user state to prevent data loss
            const currentUser = useAuthStore.getState().user;
            const updatedUser = { ...currentUser, ...user, ...userData };

            await secureStorage.setItem('userToken', token);
            await secureStorage.setItem('userInfo', JSON.stringify(updatedUser));

            set({ token, user: updatedUser, isLoading: false });
            return true;
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Update failed'
            });
            return false;
        }
    },

    completeOnboardingLocally: async (updates = {}) => {
        set((state) => {
            if (!state.user) return state;
            const updatedUser = { ...state.user, ...updates, onboardingCompleted: true };
            secureStorage.setItem('userInfo', JSON.stringify(updatedUser)); // Persist locally
            return { user: updatedUser };
        });
    },

    verifyEmail: async (token) => {
        set({ isLoading: true, error: null });
        try {
            await api.get(`/users/verify/${token}`);
            set({ isLoading: false });
            return true;
        } catch (error) {
            set({ isLoading: false, error: error.response?.data?.message || 'Verification failed' });
            return false;
        }
    },

    checkVerificationStatus: async (email) => {
        try {
            const response = await api.get(`/users/check-verification/${email}`);
            if (response.data.isVerified) {
                const { token, user } = response.data;
                await secureStorage.setItem('userToken', token);
                await secureStorage.setItem('userInfo', JSON.stringify(user));
                set({ token, user, isLoading: false, isAuthenticated: true });
                // Navigation will be handled by _layout.js based on profilePicture
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/users/forgot-password', { email });
            set({ isLoading: false });
            return true;
        } catch (error) {
            set({ isLoading: false, error: error.response?.data?.message || 'Failed to send reset email' });
            return false;
        }
    },

    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            await api.post('/users/reset-password', { token, password });
            set({ isLoading: false });
            return true;
        } catch (error) {
            set({ isLoading: false, error: error.response?.data?.message || 'Password reset failed' });
            return false;
        }
    },

    oauthLogin: async (token) => {
        set({ isLoading: true, error: null });
        try {
            await secureStorage.setItem('userToken', token);
            const response = await api.get('/users/profile');
            const user = response.data;

            await secureStorage.setItem('userInfo', JSON.stringify(user));
            set({ token, user, isLoading: false, isAuthenticated: true });
            // Navigation handled by _layout.js to ensure proper onboarding flow
        } catch (error) {
            console.error('OAuth login error:', error);
            set({ isLoading: false, error: 'OAuth login failed', isAuthenticated: false });
        }
    },

    logout: async () => {
        try {
            await secureStorage.removeItem('userToken');
            await secureStorage.removeItem('userInfo');
            set({ user: null, token: null, isAuthenticated: false, error: null });
            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Logout error:', error);
            set({ user: null, token: null, isAuthenticated: false, error: null });
            router.replace('/(auth)/login');
        }
    },

    updateGamification: (xpResult, newBadges) => {
        set((state) => {
            if (!state.user) return state;
            const updatedUser = { ...state.user };

            if (xpResult) {
                updatedUser.xp = xpResult.xp;
                updatedUser.level = xpResult.level;
            }

            if (newBadges && newBadges.length > 0) {
                const newBadgeEntries = newBadges.map(b => ({ id: b.id, date: new Date() }));
                updatedUser.badges = [...(updatedUser.badges || []), ...newBadgeEntries];
            }

            secureStorage.setItem('userInfo', JSON.stringify(updatedUser));
            return { user: updatedUser };
        });
    },
}));

export default useAuthStore;