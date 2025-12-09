import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Unlock } from 'lucide-react';
import { cn } from '../utils/cn';

const BADGES_DATA = [
    { id: 'FIRST_STEP', name: 'First Step', description: 'Complete your first task', icon: '👣' },
    { id: 'TASK_SLAYER', name: 'Task Slayer', description: 'Complete 50 tasks', icon: '⚔️' },
    { id: 'EARLY_BIRD', name: 'Early Bird', description: 'Complete a task before 8 AM', icon: '🌅' },
    { id: 'NIGHT_OWL', name: 'Night Owl', description: 'Complete a task after 10 PM', icon: '🦉' },
    { id: 'WEEKEND_WARRIOR', name: 'Weekend Warrior', description: 'Complete a task on Saturday or Sunday', icon: '🛡️' },
    { id: 'HABIT_STARTER', name: 'Habit Starter', description: 'Maintain a 3-day habit streak', icon: '🌱' },
    { id: 'STREAK_MASTER', name: 'Streak Master', description: 'Maintain a 7-day habit streak', icon: '🔥' },
    { id: 'HABIT_HERO', name: 'Habit Hero', description: 'Maintain a 30-day habit streak', icon: '🦸' },
    { id: 'NOTE_TAKER', name: 'Note Taker', description: 'Create 10 notes', icon: '📝' },
    { id: 'JOB_HUNTER', name: 'Job Hunter', description: 'Apply to 5 jobs', icon: '💼' },
    { id: 'FOCUS_MASTER', name: 'Focus Master', description: 'Accumulate 10 hours of focus time', icon: '🧘' },
    { id: 'MONEY_MANAGER', name: 'Money Manager', description: 'Add 10 transactions', icon: '💰' },
];

const Badges = ({ userBadges = [] }) => {
    const [selectedBadge, setSelectedBadge] = useState(null);
    const unlockedIds = userBadges.map(b => b.id);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Achievements</h3>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {BADGES_DATA.map((badge) => {
                    const isUnlocked = unlockedIds.includes(badge.id);
                    return (
                        <div
                            key={badge.id}
                            onClick={() => setSelectedBadge({ ...badge, isUnlocked })}
                            className={cn(
                                "aspect-square rounded-xl border flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-200 hover:scale-105",
                                isUnlocked
                                    ? "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-100 shadow-sm"
                                    : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-50 grayscale"
                            )}
                        >
                            <span className="text-3xl mb-1">{badge.icon}</span>
                            <span className="text-[10px] font-semibold text-center text-gray-700 dark:text-gray-300 leading-tight">
                                {badge.name}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Badge Details Modal */}
            <AnimatePresence>
                {selectedBadge && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedBadge(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl border border-gray-200 dark:border-gray-700 relative"
                        >
                            <button
                                onClick={() => setSelectedBadge(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="text-6xl mb-4">{selectedBadge.icon}</div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedBadge.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">{selectedBadge.description}</p>

                                <div className={cn(
                                    "px-4 py-2 rounded-full flex items-center gap-2 font-medium text-sm",
                                    selectedBadge.isUnlocked
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                )}>
                                    {selectedBadge.isUnlocked ? (
                                        <>
                                            <Unlock className="w-4 h-4" /> Unlocked
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" /> Locked
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Badges;
