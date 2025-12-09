import React, { useEffect, useState } from 'react';
import { User, Bell, Shield, LogOut, Loader2, Clock, CheckCircle, Flame, Edit3, X, Check } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badges from '../components/Badges';
import api from '../services/api';
import toast from 'react-hot-toast';
import AIKeyManager from '../components/profile/AIKeyManager';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';

const AVATAR_OPTIONS = [
    { style: 'avataaars', seed: 'Felix', name: 'Happy' },
    { style: 'avataaars', seed: 'Aneka', name: 'Cheerful' },
    { style: 'avataaars', seed: 'Bella', name: 'Friendly' },
    { style: 'avataaars', seed: 'Charlie', name: 'Cool' },
    { style: 'bottts', seed: 'Robot1', name: 'Bot Blue' },
    { style: 'bottts', seed: 'Robot2', name: 'Bot Green' },
    { style: 'personas', seed: 'Emma', name: 'Professional' },
    { style: 'personas', seed: 'Oliver', name: 'Business' },
];

const Profile = () => {
    const { user, logout, loadUser, updateProfile } = useAuthStore();
    const { toggleTheme, theme } = useThemeStore();
    const [stats, setStats] = useState({
        totalHours: 0,
        completedTasks: 0,
        streak: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isKeyManagerOpen, setIsKeyManagerOpen] = useState(false);

    // Edit Profile State
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm();

    useEffect(() => {
        fetchStats();
        loadUser(); // Refresh user to get latest XP/Badges
    }, []);

    // Initialize form when modal opens
    useEffect(() => {
        if (isEditProfileOpen && user) {
            setValue('name', user.name);
            setValue('email', user.email);
            setValue('gender', user.gender || 'male');
            setSelectedAvatar(user.profilePicture);
        }
    }, [isEditProfileOpen, user, setValue]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/users/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            // Silent fail or toast
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to sign out?')) {
            logout();
        }
    };

    const onUpdateProfile = async (data) => {
        try {
            const updateData = {
                name: data.name,
                email: data.email,
                gender: data.gender,
                profilePicture: selectedAvatar
            };

            if (data.password) {
                updateData.password = data.password;
            }

            await updateProfile(updateData);
            toast.success('Profile updated successfully');
            setIsEditProfileOpen(false);
            reset({ password: '', confirmPassword: '' }); // Clear password fields
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        }
    };

    const getAvatarUrl = (style, seed) => {
        return `https://api.dicebear.com/7.x/${style}/png?seed=${seed}&size=200&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
                <p className="text-gray-500 dark:text-gray-400">View your progress and manage settings</p>
            </div>

            {/* Header / Gamification Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                {/* Edit Button (Top Right) */}
                <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    title="Edit Profile"
                >
                    <Edit3 className="w-5 h-5" />
                </button>

                {/* Avatar */}
                <div className="relative group">
                    <img
                        src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/png?seed=${user?.name || 'User'}&size=200&backgroundColor=${user?.gender === 'female' ? 'ffd5dc' : 'b6e3f4'}`}
                        alt="Avatar"
                        className="w-32 h-32 rounded-full border-4 border-blue-100 dark:border-blue-900 shadow-lg object-cover"
                    />
                    <button
                        onClick={() => setIsEditProfileOpen(true)}
                        className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                </div>

                {/* User Info & XP */}
                <div className="flex-1 text-center md:text-left w-full">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{user?.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{user?.email}</p>

                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">Level {user?.level || 1}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{(user?.xp || 0) % 100} / 100 XP</span>
                        </div>
                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${(user?.xp || 0) % 100}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Keep completing tasks to level up!</p>
                    </div>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{isLoading ? '-' : stats.totalHours}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Focus Hours</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{isLoading ? '-' : stats.completedTasks}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tasks Done</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                        <Flame className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{isLoading ? '-' : stats.streak}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Day Streak</p>
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            <Badges userBadges={user?.badges} />

            {/* Preferences / Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Preferences</h3>

                {/* Theme Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            {theme === 'dark' ? <User className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Toggle between light and dark mode</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </div>

                {/* AI Configuration */}
                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">AI Configuration</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Manage API keys and quotas</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsKeyManagerOpen(true)}>
                        Manage Keys
                    </Button>
                </div>
            </div>

            {/* Logout Button */}
            <div className="flex justify-end">
                <Button variant="danger" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>

            {/* AI Key Manager Modal */}
            <AIKeyManager isOpen={isKeyManagerOpen} onClose={() => setIsKeyManagerOpen(false)} />

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditProfileOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                                <button onClick={() => setIsEditProfileOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-6">
                                    <Input
                                        label="Full Name"
                                        {...register('name', { required: 'Name is required' })}
                                        placeholder="Enter your name"
                                    />

                                    <Input
                                        label="Email"
                                        type="email"
                                        {...register('email', { required: 'Email is required' })}
                                        placeholder="Enter your email"
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Gender
                                        </label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="male"
                                                    {...register('gender')}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">Male</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="female"
                                                    {...register('gender')}
                                                    className="w-4 h-4 text-pink-600"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">Female</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Change Password (Optional)</h3>
                                        <div className="space-y-4">
                                            <Input
                                                label="New Password"
                                                type="password"
                                                {...register('password', { minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                                                placeholder="Leave blank to keep current"
                                            />
                                            <Input
                                                label="Confirm New Password"
                                                type="password"
                                                {...register('confirmPassword', {
                                                    validate: (val, formValues) => {
                                                        if (formValues.password && val !== formValues.password) {
                                                            return 'Passwords do not match';
                                                        }
                                                        return true;
                                                    }
                                                })}
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Choose Avatar
                                        </label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {AVATAR_OPTIONS.map((avatar, idx) => {
                                                const url = getAvatarUrl(avatar.style, avatar.seed);
                                                const isSelected = selectedAvatar === url;
                                                return (
                                                    <div
                                                        key={idx}
                                                        onClick={() => setSelectedAvatar(url)}
                                                        className={`relative cursor-pointer rounded-xl p-2 border-2 transition-all ${isSelected
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={avatar.name}
                                                            className="w-full h-auto rounded-full"
                                                        />
                                                        {isSelected && (
                                                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5">
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                        <p className="text-[10px] text-center mt-1 text-gray-500 dark:text-gray-400 font-medium truncate">
                                                            {avatar.name}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button type="button" variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" isLoading={isSubmitting}>
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
