import React, { useEffect, useState } from 'react';
import { Plus, Flame, Check, Edit2, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import useHabitStore from '../store/habitStore';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { cn } from '../utils/cn';

const COLORS = ['#007AFF', '#34C759', '#FF3B30', '#FF9500', '#AF52DE', '#5856D6', '#FF2D55', '#5AC8FA'];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HabitCard = ({ habit, onToggle, onEdit, onDelete }) => {
    // Generate dates for the current week (Mon-Sun)
    const weekDates = (() => {
        const today = new Date();
        const day = today.getDay(); // 0 Sun - 6 Sat
        const diffToMonday = (day + 6) % 7; // days since Monday
        const monday = new Date(today);
        monday.setDate(today.getDate() - diffToMonday);
        monday.setHours(0, 0, 0, 0);

        const arr = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            arr.push(d);
        }
        return arr;
    })();

    const isCompletedOnDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return (habit.completions || []).some(d => d.startsWith(dateStr));
    };

    const isTargetDay = (date) => {
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
        // If no targetDays defined (legacy), assume daily (all days target)
        if (!habit.targetDays || habit.targetDays.length === 0) return true;
        return habit.targetDays.includes(dayName);
    };

    const isToday = (date) => {
        const today = new Date().toISOString().split('T')[0];
        return date.toISOString().split('T')[0] === today;
    };

    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex flex-col h-full group hover:shadow-md transition-shadow"
            style={{ borderLeft: `4px solid ${habit.color || COLORS[0]}` }}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{habit.name}</h3>
                    {habit.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-0.5">{habit.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEdit(habit)}
                        className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(habit._id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center text-xs font-medium text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">
                    <Flame className="w-3 h-3 mr-1" />
                    {habit.currentStreak || 0} streak
                </div>
                {(habit.targetDays && habit.targetDays.length > 0) && (
                    <div className="text-xs text-gray-400">
                        {habit.targetDays.length === 7 ? 'Daily' : habit.targetDays.join(', ')}
                    </div>
                )}
            </div>

            {/* Weekly Calendar */}
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                {weekDates.map((date, i) => {
                    const completed = isCompletedOnDate(date);
                    const isTarget = isTargetDay(date);
                    const today = isToday(date);
                    const dayLabel = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i];

                    return (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <span
                                className={cn(
                                    "text-[10px] font-medium",
                                    today ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                                )}
                            >
                                {dayLabel}
                            </span>
                            <button
                                onClick={() => onToggle(habit._id, date.toISOString())}
                                disabled={!isTarget && !completed} // Optional: discourage clicking non-target days unless already done? actually users might want to do extra
                                className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all border",
                                    completed
                                        ? "bg-opacity-100 text-white border-transparent"
                                        : "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700",
                                    !completed && isTarget && "border-gray-300 dark:border-gray-600",
                                    !completed && !isTarget && "border-transparent opacity-30 cursor-default",

                                    // Apply dynamic color for completion
                                    completed && `shadow-sm`
                                )}
                                style={{
                                    backgroundColor: completed ? (habit.color || COLORS[0]) : undefined,
                                    borderColor: (!completed && isTarget) ? (habit.color || COLORS[0]) : undefined
                                }}
                            >
                                {completed && <Check className="w-4 h-4" />}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const HabitSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex flex-col h-full animate-pulse">
        <div className="flex justify-between items-start mb-3">
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="flex gap-1">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        </div>
        <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between">
            {[...Array(7)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-4 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
            ))}
        </div>
    </div>
);

const Habits = () => {
    const { habits, fetchHabits, addHabit, updateHabit, toggleCompletion, deleteHabit, isLoading } = useHabitStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [selectedDays, setSelectedDays] = useState([]);

    const { register, handleSubmit, reset, setValue } = useForm();

    useEffect(() => {
        fetchHabits();
    }, [fetchHabits]);

    const handleOpenModal = (habit = null) => {
        if (habit) {
            setEditingHabit(habit);
            setValue('name', habit.name);
            setValue('description', habit.description);
            setSelectedColor(habit.color || COLORS[0]);
            setSelectedDays(habit.targetDays || []);
        } else {
            setEditingHabit(null);
            reset();
            setSelectedColor(COLORS[0]);
            setSelectedDays([]); // Empty means "Daily" usually? logic in mobile was 0 is Custom? 
            // Mobile app logic: "If formData.targetDays && length > 0 && length < 7 { freq = Custom } else Daily"
            // So if empty, let's treat it as user hasn't selected anything yet.
            // But for UI, maybe we should pre-select all for Daily?
            // Let's start empty.
        }
        setIsModalOpen(true);
    };

    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const onSubmit = async (data) => {
        let freq = 'Daily';
        if (selectedDays.length > 0 && selectedDays.length < 7) {
            freq = 'Custom';
        }

        const habitData = {
            ...data,
            color: selectedColor,
            targetDays: selectedDays,
            frequency: freq
        };

        if (editingHabit) {
            await updateHabit(editingHabit._id, habitData);
        } else {
            await addHabit(habitData);
        }
        setIsModalOpen(false);
        reset();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Habits</h1>
                    <p className="text-gray-500 dark:text-gray-400">Build better habits, one day at a time</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="w-5 h-5 mr-2" />
                    New Habit
                </Button>
            </div>

            {/* Habits List */}
            {isLoading && !habits.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <HabitSkeleton key={i} />
                    ))}
                </div>
            ) : habits.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No habits found. Start building one!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {habits.map((habit) => (
                        <HabitCard
                            key={habit._id}
                            habit={habit}
                            onToggle={toggleCompletion}
                            onEdit={handleOpenModal}
                            onDelete={deleteHabit}
                        />
                    ))}
                </div>
            )}

            {/* Add/Edit Habit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingHabit ? "Edit Habit" : "Create New Habit"}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <Input
                        label="Habit Name"
                        placeholder="e.g., Read 30 mins"
                        {...register('name', { required: 'Name is required' })}
                    />

                    <Input
                        label="Description (Optional)"
                        placeholder="Why do you want to build this habit?"
                        {...register('description')}
                    />

                    {/* Target Days */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Days</label>
                        <div className="flex justify-between gap-1">
                            {WEEK_DAYS.map(day => {
                                const isSelected = selectedDays.includes(day);
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleDay(day)}
                                        className={cn(
                                            "w-9 h-9 rounded-full text-xs font-semibold transition-all",
                                            isSelected
                                                ? "text-white"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200"
                                        )}
                                        style={{ backgroundColor: isSelected ? selectedColor : undefined }}
                                    >
                                        {day.charAt(0)}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            {selectedDays.length === 0
                                ? "No days selected (will count as Daily)"
                                : selectedDays.length === 7
                                    ? "Every day"
                                    : "Custom schedule"}
                        </p>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                        <div className="flex gap-3 flex-wrap">
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={cn(
                                        "w-8 h-8 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110",
                                    )}
                                    style={{
                                        backgroundColor: color,
                                        transform: selectedColor === color ? 'scale(1.2)' : 'scale(1)',
                                        borderWidth: selectedColor === color ? '2px' : '0px',
                                        borderColor: '#333'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            {editingHabit ? 'Update Habit' : 'Create Habit'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Habits;
