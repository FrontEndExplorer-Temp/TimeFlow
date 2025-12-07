import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
    Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../../store/themeStore';
import api from '../../services/api';

export default function DashboardScreen() {
    const router = useRouter();
    const { isDarkMode } = useThemeStore();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [calendarExpanded, setCalendarExpanded] = useState(true);
    const [loading, setLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);

    const animatedHeight = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        fetchDashboardData(selectedDate);
    }, [selectedDate]);

    const fetchDashboardData = async (date) => {
        setLoading(true);
        try {
            const dateStr = date.toISOString().split('T')[0];
            const response = await api.get(`/users/dashboard/${dateStr}`);
            setDashboardData(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setDashboardData(null);
        } finally {
            setLoading(false);
        }
    };

    const toggleCalendar = () => {
        const toValue = calendarExpanded ? 0 : 1;
        Animated.timing(animatedHeight, {
            toValue,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
        setCalendarExpanded(!calendarExpanded);
    };

    const generateMonthDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const startingDayOfWeek = firstDay.getDay();

        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        const today = new Date();
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);

        const days = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            if (date >= ninetyDaysAgo && date <= today) {
                days.push(date);
            } else {
                days.push(null);
            }
        }

        return days;
    };

    const changeMonth = (direction) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + direction);

        const today = new Date();
        const ninetyDaysAgo = new Date(today);
        ninetyDaysAgo.setDate(today.getDate() - 90);

        if (newMonth <= today && newMonth >= ninetyDaysAgo) {
            setCurrentMonth(newMonth);
        }
    };

    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSelected = (date) => {
        if (!date) return false;
        return date.toDateString() === selectedDate.toDateString();
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const themeStyles = {
        container: { backgroundColor: isDarkMode ? '#0B0B0B' : '#f7f8fb' },
        card: { backgroundColor: isDarkMode ? '#121212' : '#fff' },
        text: { color: isDarkMode ? '#fff' : '#111' },
        subText: { color: isDarkMode ? '#9AA0A6' : '#666' },
        border: { borderColor: isDarkMode ? '#333' : '#eee' },
    };

    const DataCard = ({ icon, title, count, color, items }) => {
        const [expanded, setExpanded] = useState(false);

        if (count === 0) return null;

        return (
            <View style={[styles.dataCard, themeStyles.card]}>
                <TouchableOpacity
                    style={styles.dataCardHeader}
                    onPress={() => setExpanded(!expanded)}
                    activeOpacity={0.7}
                >
                    <View style={styles.dataCardLeft}>
                        <View style={[styles.dataCardIcon, { backgroundColor: color + '15' }]}>
                            <Ionicons name={icon} size={20} color={color} />
                        </View>
                        <View>
                            <Text style={[styles.dataCardTitle, themeStyles.text]}>{title}</Text>
                            <Text style={[styles.dataCardCount, themeStyles.subText]}>
                                {count} {count === 1 ? 'item' : 'items'}
                            </Text>
                        </View>
                    </View>
                    <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={themeStyles.subText.color}
                    />
                </TouchableOpacity>

                {expanded && items && items.length > 0 && (
                    <View style={[styles.dataCardContent, themeStyles.border]}>
                        {items.map((item, index) => (
                            <View key={index} style={styles.dataItem}>
                                <Text style={[styles.dataItemText, themeStyles.text]} numberOfLines={1}>
                                    {item.title || item.name || item.description || 'Item'}
                                </Text>
                                {item.status && (
                                    <Text style={[styles.dataItemBadge, { color }]}>
                                        {item.status}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    const calendarHeight = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 380],
    });

    const monthDays = generateMonthDays();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <View style={[styles.container, themeStyles.container]}>
            {/* Header */}
            <View style={[styles.header, themeStyles.card]}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeStyles.text.color} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, themeStyles.text]}>Activity Dashboard</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Calendar Section */}
                <View style={[styles.calendarSection, themeStyles.card]}>
                    <TouchableOpacity
                        style={styles.calendarHeader}
                        onPress={toggleCalendar}
                        activeOpacity={0.7}
                    >
                        <View style={styles.calendarHeaderLeft}>
                            <Ionicons name="calendar-outline" size={22} color="#4A90E2" />
                            <Text style={[styles.calendarHeaderTitle, themeStyles.text]}>
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </Text>
                        </View>
                        <Ionicons
                            name={calendarExpanded ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={themeStyles.subText.color}
                        />
                    </TouchableOpacity>

                    <Animated.View style={{ height: calendarHeight, overflow: 'hidden' }}>
                        {/* Month Navigation */}
                        <View style={styles.monthNavigation}>
                            <TouchableOpacity
                                onPress={() => changeMonth(-1)}
                                style={styles.monthNavButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="chevron-back" size={20} color={themeStyles.text.color} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => changeMonth(1)}
                                style={styles.monthNavButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="chevron-forward" size={20} color={themeStyles.text.color} />
                            </TouchableOpacity>
                        </View>

                        {/* Week Day Headers */}
                        <View style={styles.weekDaysRow}>
                            {weekDays.map((day, index) => (
                                <View key={index} style={styles.weekDayCell}>
                                    <Text style={[styles.weekDayText, themeStyles.subText]}>{day}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Calendar Grid */}
                        <View style={styles.calendarGrid}>
                            {monthDays.map((date, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.calendarCell,
                                        !date && styles.calendarCellEmpty,
                                        date && styles.calendarCellEnabled,
                                        isSelected(date) && styles.calendarCellSelected,
                                        isToday(date) && styles.calendarCellToday,
                                    ]}
                                    onPress={() => date && setSelectedDate(date)}
                                    activeOpacity={date ? 0.7 : 1}
                                    disabled={!date}
                                >
                                    {date && (
                                        <Text
                                            style={[
                                                styles.calendarCellText,
                                                { color: isDarkMode ? '#fff' : '#111' },
                                                isSelected(date) && styles.calendarCellTextSelected,
                                            ]}
                                        >
                                            {date.getDate()}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                </View>

                {/* Selected Date */}
                <View style={styles.selectedDateContainer}>
                    <Text style={[styles.selectedDateText, themeStyles.text]}>
                        {formatDate(selectedDate)}
                    </Text>
                </View>

                {/* Data Section */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4A90E2" />
                        <Text style={[styles.loadingText, themeStyles.subText]}>Loading data...</Text>
                    </View>
                ) : dashboardData ? (
                    <View style={styles.dataContainer}>
                        <DataCard
                            icon="checkmark-circle-outline"
                            title="Tasks Completed"
                            count={dashboardData.tasks?.length || 0}
                            color="#34C759"
                            items={dashboardData.tasks}
                        />
                        <DataCard
                            icon="time-outline"
                            title="Time Tracked"
                            count={dashboardData.timers?.length || 0}
                            color="#4A90E2"
                            items={dashboardData.timers}
                        />
                        <DataCard
                            icon="leaf-outline"
                            title="Habits Completed"
                            count={dashboardData.habits?.length || 0}
                            color="#FF9500"
                            items={dashboardData.habits}
                        />
                        <DataCard
                            icon="cash-outline"
                            title="Transactions"
                            count={dashboardData.transactions?.length || 0}
                            color="#5856D6"
                            items={dashboardData.transactions}
                        />
                        <DataCard
                            icon="document-text-outline"
                            title="Notes Created"
                            count={dashboardData.notes?.length || 0}
                            color="#AF52DE"
                            items={dashboardData.notes}
                        />

                        {(!dashboardData.tasks?.length &&
                            !dashboardData.timers?.length &&
                            !dashboardData.habits?.length &&
                            !dashboardData.transactions?.length &&
                            !dashboardData.notes?.length) && (
                                <View style={styles.emptyState}>
                                    <Ionicons name="calendar-outline" size={64} color={themeStyles.subText.color} />
                                    <Text style={[styles.emptyStateText, themeStyles.text]}>
                                        No activity on this day
                                    </Text>
                                    <Text style={[styles.emptyStateSubtext, themeStyles.subText]}>
                                        Select another date to view your activity
                                    </Text>
                                </View>
                            )}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="alert-circle-outline" size={64} color={themeStyles.subText.color} />
                        <Text style={[styles.emptyStateText, themeStyles.text]}>
                            Failed to load data
                        </Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => fetchDashboardData(selectedDate)}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    calendarSection: {
        margin: 16,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    calendarHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    calendarHeaderTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    monthNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    monthNavButton: {
        padding: 8,
    },
    weekDaysRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekDayCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    weekDayText: {
        fontSize: 12,
        fontWeight: '600',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    calendarCellEmpty: {
        opacity: 0,
    },
    calendarCellEnabled: {
        backgroundColor: 'rgba(74, 144, 226, 0.05)',
        borderRadius: 8,
    },
    calendarCellSelected: {
        backgroundColor: '#4A90E2',
        borderRadius: 8,
    },
    calendarCellToday: {
        borderWidth: 2,
        borderColor: '#4A90E2',
        borderRadius: 8,
    },
    calendarCellText: {
        fontSize: 14,
        fontWeight: '500',
    },
    calendarCellTextSelected: {
        color: '#fff',
        fontWeight: '700',
    },
    selectedDateContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    selectedDateText: {
        fontSize: 15,
        fontWeight: '600',
    },
    dataContainer: {
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    dataCard: {
        borderRadius: 14,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    dataCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    dataCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    dataCardIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dataCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    dataCardCount: {
        fontSize: 13,
        fontWeight: '500',
    },
    dataCardContent: {
        borderTopWidth: 1,
        paddingTop: 12,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    dataItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    dataItemText: {
        fontSize: 14,
        flex: 1,
        marginRight: 8,
    },
    dataItemBadge: {
        fontSize: 12,
        fontWeight: '600',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 24,
        backgroundColor: '#4A90E2',
        borderRadius: 20,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
