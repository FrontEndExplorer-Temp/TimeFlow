import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Animated } from 'react-native';
import useThemeStore from '../../store/themeStore';
import useHabitStore from '../../store/habitStore';

const COLORS = ['#007AFF', '#34C759', '#FF3B30', '#FF9500', '#AF52DE', '#5856D6', '#FF2D55', '#5AC8FA'];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HabitSkeleton = () => {
    const { isDarkMode } = useThemeStore();
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View style={{ opacity, backgroundColor: isDarkMode ? '#1E1E1E' : '#f0f0f0', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ backgroundColor: '#ccc', width: '70%', height: 20, borderRadius: 4 }} />
                <View style={{ backgroundColor: '#ccc', width: 60, height: 20, borderRadius: 4 }} />
            </View>
            <View style={{ backgroundColor: '#ccc', width: '90%', height: 14, borderRadius: 4, marginBottom: 8 }} />
            <View style={{ backgroundColor: '#ccc', width: '60%', height: 14, borderRadius: 4 }} />
        </Animated.View>
    );
};

export default function HabitsScreen() {
    const { habits, fetchHabits, addHabit, updateHabit, toggleCompletion, deleteHabit, isLoading } = useHabitStore();
    const { theme, isDarkMode } = useThemeStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: COLORS[0],
        targetDays: [],
        frequency: 'Daily'
    });

    useEffect(() => {
        fetchHabits();
    }, []);

    // Generate dates for the current week (Mon-Sun)
    const getWeekDates = () => {
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
    };

    const isCompletedOnDate = (habit, date) => {
        const dateStr = date.toISOString().split('T')[0];
        return (habit.completions || []).some(d => d.startsWith(dateStr));
    };

    const isTargetDay = (habit, date) => {
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
        // If no targetDays defined (legacy), assume daily (all days target)
        if (!habit.targetDays || habit.targetDays.length === 0) return true;
        return habit.targetDays.includes(dayName);
    };

    const isToday = (date) => {
        const today = new Date().toISOString().split('T')[0];
        return date.toISOString().split('T')[0] === today;
    };

    const handleOpenModal = (habit = null) => {
        if (habit) {
            setEditingHabit(habit);
            setFormData({
                name: habit.name,
                description: habit.description || '',
                color: habit.color || COLORS[0],
                targetDays: habit.targetDays || [],
                frequency: habit.frequency || 'Daily'
            });
        } else {
            setEditingHabit(null);
            setFormData({
                name: '',
                description: '',
                color: COLORS[0],
                targetDays: [],
                frequency: 'Daily'
            });
        }
        setModalVisible(true);
    };

    const toggleDay = (day) => {
        const newDays = formData.targetDays.includes(day)
            ? formData.targetDays.filter(d => d !== day)
            : [...formData.targetDays, day];

        let freq = 'Daily';
        if (newDays.length > 0 && newDays.length < 7) {
            freq = 'Custom';
        }

        setFormData({ ...formData, targetDays: newDays, frequency: freq });
    };

    const handleSaveHabit = async () => {
        if (!formData.name.trim()) return;

        const habitData = {
            ...formData,
            frequency: formData.targetDays.length > 0 && formData.targetDays.length < 7 ? 'Custom' : 'Daily'
        };

        if (editingHabit) {
            await updateHabit(editingHabit._id, habitData);
        } else {
            await addHabit(habitData);
        }
        setModalVisible(false);
    };

    const renderHabitCard = ({ item }) => {
        const weekDates = getWeekDates();

        return (
            <View
                style={[
                    styles.habitCard,
                    { backgroundColor: theme.colors.card, borderLeftColor: item.color || COLORS[0] },
                    isDarkMode && { borderWidth: 1, borderColor: theme.colors.border }
                ]}
            >
                <View style={styles.habitHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.habitName, { color: theme.colors.text }]} numberOfLines={1}>
                            {item.name}
                        </Text>
                        {item.description && (
                            <Text style={[styles.habitDescription, { color: theme.colors.subText }]} numberOfLines={1}>
                                {item.description}
                            </Text>
                        )}
                    </View>
                    <View style={styles.habitActions}>
                        <TouchableOpacity onPress={() => handleOpenModal(item)} style={styles.actionButton}>
                            <Text style={{ color: '#007AFF', fontSize: 16 }}>✎</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteHabit(item._id)} style={styles.actionButton}>
                            <Text style={{ color: '#FF3B30', fontSize: 18 }}>×</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Streak Badge */}
                <View style={styles.streakContainer}>
                    <View style={[styles.streakBadge, { backgroundColor: '#FF9500' + '20' }]}>
                        <Text style={{ fontSize: 12 }}>🔥</Text>
                        <Text style={[styles.streakText, { color: '#FF9500' }]}>
                            {item.currentStreak || 0} streak
                        </Text>
                    </View>
                    {item.targetDays && item.targetDays.length > 0 && (
                        <Text style={[styles.frequencyText, { color: theme.colors.subText }]}>
                            {item.targetDays.length === 7 ? 'Daily' : item.targetDays.join(', ')}
                        </Text>
                    )}
                </View>

                {/* Weekly Calendar */}
                <View style={styles.weeklyCalendar}>
                    {weekDates.map((date, i) => {
                        const completed = isCompletedOnDate(item, date);
                        const isTarget = isTargetDay(item, date);
                        const today = isToday(date);
                        const dayLabel = ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i];

                        return (
                            <View key={i} style={styles.dayColumn}>
                                <Text style={[styles.dayLabel, today && { color: '#007AFF' }]}>
                                    {dayLabel}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => toggleCompletion(item._id, date.toISOString())}
                                    disabled={!isTarget && !completed}
                                    style={[
                                        styles.dayCircle,
                                        completed && { backgroundColor: item.color || COLORS[0] },
                                        !completed && isTarget && { borderColor: item.color || COLORS[0], borderWidth: 2 },
                                        !completed && !isTarget && { opacity: 0.3 }
                                    ]}
                                >
                                    {completed && <Text style={styles.checkmark}>✓</Text>}
                                </TouchableOpacity>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    const themeStyles = {
        container: {
            backgroundColor: theme.colors.background,
        },
        text: {
            color: theme.colors.text,
        },
        subText: {
            color: theme.colors.subText,
        },
        modalContent: {
            backgroundColor: theme.colors.card,
        },
        input: {
            borderColor: theme.colors.border,
            color: theme.colors.text,
            backgroundColor: theme.colors.input,
        },
    };

    return (
        <View style={[styles.container, themeStyles.container]}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.headerTitle, themeStyles.text]}>Habits</Text>
                    <Text style={[styles.headerSubtitle, themeStyles.subText]}>
                        Build better habits, one day at a time
                    </Text>
                </View>
            </View>

            {/* Habits List */}
            {isLoading && habits.length === 0 ? (
                <View style={styles.listContent}>
                    <HabitSkeleton />
                    <HabitSkeleton />
                    <HabitSkeleton />
                </View>
            ) : habits.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, themeStyles.subText]}>
                        No habits found. Start building one!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={habits}
                    renderItem={renderHabitCard}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {/* Add Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleOpenModal()}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* Add/Edit Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, themeStyles.modalContent]}>
                        <Text style={[styles.modalTitle, themeStyles.text]}>
                            {editingHabit ? 'Edit Habit' : 'Create New Habit'}
                        </Text>

                        {/* Name Input */}
                        <Text style={[styles.label, themeStyles.text]}>Habit Name</Text>
                        <TextInput
                            style={[styles.input, themeStyles.input]}
                            placeholder="e.g., Read 30 mins"
                            placeholderTextColor={theme.colors.subText}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />

                        {/* Description Input */}
                        <Text style={[styles.label, themeStyles.text]}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.input, themeStyles.input]}
                            placeholder="Why do you want to build this habit?"
                            placeholderTextColor={theme.colors.subText}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                        />

                        {/* Target Days */}
                        <Text style={[styles.label, themeStyles.text]}>Target Days</Text>
                        <View style={styles.daysContainer}>
                            {WEEK_DAYS.map(day => {
                                const isSelected = formData.targetDays.includes(day);
                                return (
                                    <TouchableOpacity
                                        key={day}
                                        onPress={() => toggleDay(day)}
                                        style={[
                                            styles.dayButton,
                                            isSelected && { backgroundColor: formData.color }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.dayButtonText,
                                            { color: isSelected ? '#fff' : theme.colors.subText }
                                        ]}>
                                            {day.charAt(0)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <Text style={[styles.helperText, themeStyles.subText]}>
                            {formData.targetDays.length === 0
                                ? 'No days selected (will count as Daily)'
                                : formData.targetDays.length === 7
                                    ? 'Every day'
                                    : 'Custom schedule'}
                        </Text>

                        {/* Color Picker */}
                        <Text style={[styles.label, themeStyles.text]}>Color</Text>
                        <View style={styles.colorsContainer}>
                            {COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => setFormData({ ...formData, color })}
                                    style={[
                                        styles.colorButton,
                                        { backgroundColor: color },
                                        formData.color === color && { borderWidth: 3, borderColor: '#333' }
                                    ]}
                                />
                            ))}
                        </View>

                        {/* Buttons */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { backgroundColor: theme.colors.danger }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                                onPress={handleSaveHabit}
                            >
                                <Text style={styles.buttonText}>
                                    {editingHabit ? 'Update Habit' : 'Create Habit'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    habitCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    habitHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    habitName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    habitDescription: {
        fontSize: 14,
        marginTop: 4,
    },
    habitActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 4,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    streakText: {
        fontSize: 12,
        fontWeight: '600',
    },
    frequencyText: {
        fontSize: 11,
    },
    weeklyCalendar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    dayColumn: {
        alignItems: 'center',
        gap: 4,
    },
    dayLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#999',
    },
    dayCircle: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    checkmark: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    fabText: {
        color: '#fff',
        fontSize: 32,
        marginTop: -4,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        padding: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        padding: 14,
        borderRadius: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dayButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayButtonText: {
        fontSize: 12,
        fontWeight: '600',
    },
    helperText: {
        fontSize: 12,
        marginBottom: 20,
    },
    colorsContainer: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    colorButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    saveButton: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
