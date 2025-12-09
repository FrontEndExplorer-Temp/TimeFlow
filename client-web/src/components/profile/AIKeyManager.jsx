import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Trash2, Plus, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { cn } from '../../utils/cn';
import useAuthStore from '../../store/authStore';

const AIKeyManager = ({ isOpen, onClose }) => {
    const [keys, setKeys] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const { user } = useAuthStore();

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    useEffect(() => {
        if (isOpen) {
            fetchKeys();
        }
    }, [isOpen]);

    const fetchKeys = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/ai-keys');
            setKeys(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load keys');
        } finally {
            setIsLoading(false);
        }
    };

    const onAddKey = async (data) => {
        try {
            await api.post('/ai-keys', data);
            toast.success('Key added & validated successfully');
            reset();
            setIsAdding(false);
            fetchKeys();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add key. Ensure it is valid.');
        }
    };

    const onDeleteKey = async (id) => {
        if (!window.confirm('Are you sure? This action cannot be undone.')) return;
        try {
            await api.delete(`/ai-keys/${id}`);
            toast.success('Key removed');
            fetchKeys();
        } catch (error) {
            toast.error('Failed to remove key');
        }
    };

    const onResetKey = async (id) => {
        try {
            await api.put(`/ai-keys/${id}/reset`);
            toast.success('Key quota reset');
            fetchKeys();
        } catch (error) {
            toast.error('Failed to reset key');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Key className="w-5 h-5 text-blue-500" />
                            AI Key Management
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Manage API keys for the AI service pool.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Key List */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center py-8 text-gray-500">Loading keys...</div>
                        ) : keys.length === 0 && !isAdding ? (
                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <Key className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500 dark:text-gray-400">No active keys found. Add one to enable AI features.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {keys.map((key) => (
                                    <div key={key._id} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between hover:border-blue-200 dark:hover:border-blue-800 transition-colors shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                                                key.status === 'active' ? "bg-green-100 text-green-600 dark:bg-green-900/20" :
                                                    key.status === 'quota_exceeded' ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20" :
                                                        "bg-red-100 text-red-600 dark:bg-red-900/20"
                                            )}>
                                                {key.status === 'active' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {key.label}
                                                    <span className={cn(
                                                        "text-[10px] uppercase px-2 py-0.5 rounded-full font-bold",
                                                        key.status === 'active' ? "bg-green-100 text-green-700" :
                                                            key.status === 'quota_exceeded' ? "bg-orange-100 text-orange-700" :
                                                                "bg-red-100 text-red-700"
                                                    )}>
                                                        {key.status.replace('_', ' ')}
                                                    </span>
                                                    {/* Global Badge */}
                                                    <span className={cn(
                                                        "text-[10px] uppercase px-2 py-0.5 rounded-full font-bold",
                                                        key.isGlobal ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                                    )}>
                                                        {key.isGlobal ? 'GLOBAL' : 'PERSONAL'}
                                                    </span>
                                                </h4>
                                                <p className="text-xs text-gray-500 font-mono mt-1">
                                                    Usage: {key.usageCount} &bull; Errors: {key.errorCount}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {key.status !== 'active' && (
                                                <button
                                                    onClick={() => onResetKey(key._id)}
                                                    title="Reset Status"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onDeleteKey(key._id)}
                                                title="Remove Key"
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add Key Form */}
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700"
                        >
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Add New API Key</h4>
                            <form onSubmit={handleSubmit(onAddKey)} className="space-y-4">
                                <Input
                                    label="Label (Friendly Name)"
                                    placeholder="e.g. Pro Account 1"
                                    {...register('label', { required: 'Label is required' })}
                                    error={errors.label}
                                />
                                <Input
                                    label="API Key"
                                    placeholder="AI..."
                                    type="password"
                                    {...register('key', { required: 'API Key is required' })}
                                    error={errors.key}
                                />
                                <p className="text-xs text-gray-500">We will validate this key immediately by making a test request.</p>

                                {/* Admin Global Toggle */}
                                {user?.isAdmin && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isGlobal"
                                            {...register('isGlobal')}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                        />
                                        <label htmlFor="isGlobal" className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                                            Make this a <strong>Global Key</strong> (Shared with all users)
                                        </label>
                                    </div>
                                )}
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => { setIsAdding(false); reset(); }}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" size="sm" isLoading={isSubmitting}>
                                        Verify & Add Key
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                        {keys.length} active keys in pool
                    </p>
                    {!isAdding && (
                        <Button onClick={() => setIsAdding(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Key
                        </Button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AIKeyManager;
