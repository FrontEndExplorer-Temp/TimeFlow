import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekday from 'dayjs/plugin/weekday';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(weekday);
import useThemeStore from '../store/themeStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_WIDTH = (SCREEN_WIDTH - 40) / 7;

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CalendarView({ tasks, selectedDate, onSelectDate }) {
    const { isDarkMode } = useThemeStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isExpanded, setIsExpanded] = useState(true);

    // Sync current month when selected date changes externally
    useEffect(() => {
        setCurrentMonth(selectedDate);
    }, [selectedDate]);

    const themeStyles = {
        text: { color: isDarkMode ? '#fff' : '#111' },
        subText: { color: isDarkMode ? '#9AA0A6' : '#666' },
        card: { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' },
        border: { borderColor: isDarkMode ? '#333' : '#eee' },
        primary: isDarkMode ? '#4A90E2' : '#007AFF',
        today: isDarkMode ? 'rgba(74, 144, 226, 0.2)' : 'rgba(0, 122, 255, 0.1)',
        handle: isDarkMode ? '#333' : '#E0E0E0'
    };

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const nextPeriod = () => {
        if (isExpanded) {
            setCurrentMonth(dayjs(currentMonth).add(1, 'month').toDate());
        } else {
            const nextWeek = dayjs(currentMonth).add(1, 'week').toDate();
            setCurrentMonth(nextWeek);
            onSelectDate(nextWeek); // Select same day next week
        }
    };

    const prevPeriod = () => {
        if (isExpanded) {
            setCurrentMonth(dayjs(currentMonth).subtract(1, 'month').toDate());
        } else {
            const prevWeek = dayjs(currentMonth).subtract(1, 'week').toDate();
            setCurrentMonth(prevWeek);
            onSelectDate(prevWeek); // Select same day prev week
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={prevPeriod} style={styles.arrowButton}>
                <Ionicons name="chevron-back" size={24} color={themeStyles.text.color} />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, themeStyles.text]}>
                {dayjs(currentMonth).format('MMMM YYYY')}
            </Text>
            <TouchableOpacity onPress={nextPeriod} style={styles.arrowButton}>
                <Ionicons name="chevron-forward" size={24} color={themeStyles.text.color} />
            </TouchableOpacity>
        </View>
    );

    const renderDaysOfWeek = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <View style={styles.daysHeader}>
                {days.map((day, index) => (
                    <Text key={index} style={[styles.dayLabel, themeStyles.subText]}>
                        {day}
                    </Text>
                ))}
            </View>
        );
    };

    const renderCells = () => {
        let startDate, endDate;

        if (isExpanded) {
            // Month View
            const monthStart = dayjs(currentMonth).startOf('month');
            const monthEnd = monthStart.endOf('month');
            startDate = monthStart.startOf('week').toDate();
            endDate = monthEnd.endOf('week').toDate();
        } else {
            // Week View
            startDate = dayjs(currentMonth).startOf('week').toDate();
            endDate = dayjs(currentMonth).endOf('week').toDate();
        }

        const rows = [];
        let days = [];
        let formattedDate = '';

        // Generate array of days
        const daysInInterval = [];
        let currentDay = dayjs(startDate);
        while (currentDay.isSameOrBefore(dayjs(endDate), 'day')) {
            daysInInterval.push(currentDay.toDate());
            currentDay = currentDay.add(1, 'day');
        }

        daysInInterval.forEach((dayItem) => {
            formattedDate = dayjs(dayItem).format('D');

            // Check if this day has tasks
            const hasTasks = tasks.some(task => {
                if (!task.dueDate) return false;
                return dayjs(task.dueDate).isSame(dayjs(dayItem), 'day');
            });

            const isSelected = dayjs(dayItem).isSame(dayjs(selectedDate), 'day');
            const isCurrentMonth = dayjs(dayItem).isSame(dayjs(currentMonth), 'month');
            const isDayToday = dayjs(dayItem).isSame(dayjs(), 'day');

            days.push(
                <TouchableOpacity
                    key={dayItem.toString()}
                    style={[
                        styles.dayCell,
                        isDayToday && { backgroundColor: themeStyles.today },
                        isSelected && { backgroundColor: themeStyles.primary, borderRadius: 12, elevation: 4 },
                        (!isCurrentMonth && isExpanded) && { opacity: 0.3 }
                    ]}
                    onPress={() => onSelectDate(dayItem)}
                >
                    <Text style={[
                        styles.dayText,
                        themeStyles.text,
                        isSelected && { color: '#fff', fontWeight: 'bold' },
                        isDayToday && !isSelected && { color: themeStyles.primary, fontWeight: 'bold' }
                    ]}>
                        {formattedDate}
                    </Text>
                    {hasTasks && (
                        <View style={[
                            styles.dot,
                            { backgroundColor: isSelected ? '#fff' : themeStyles.primary }
                        ]} />
                    )}
                </TouchableOpacity>
            );
        });

        // Group into weeks (rows)
        let cells = [];
        days.forEach((day, index) => {
            if (index % 7 !== 0) {
                cells.push(day);
            } else {
                rows.push(
                    <View key={index} style={styles.weekRow}>
                        {cells}
                    </View>
                );
                cells = [];
                cells.push(day);
            }
            if (index === days.length - 1) {
                rows.push(
                    <View key={index} style={styles.weekRow}>
                        {cells}
                    </View>
                );
            }
        });

        return <View>{rows}</View>;
    };

    return (
        <View style={[styles.container, themeStyles.card]}>
            {renderHeader()}
            {renderDaysOfWeek()}
            {renderCells()}

            <TouchableOpacity onPress={toggleExpand} style={styles.handleContainer}>
                <View style={[styles.handleBar, { backgroundColor: themeStyles.handle }]} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        borderRadius: 24,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 10,
    },
    arrowButton: {
        padding: 8,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    daysHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 12,
    },
    dayLabel: {
        width: DAY_WIDTH,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
        opacity: 0.6,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    dayCell: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginHorizontal: 2,
    },
    dayText: {
        fontSize: 15,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        position: 'absolute',
        bottom: 6,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 8,
        marginTop: 4,
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        opacity: 0.5,
    }
});
