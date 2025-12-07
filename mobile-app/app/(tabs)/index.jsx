import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, RefreshControl, Dimensions } from 'react-native';
import useTimerStore from '../../store/timerStore';
import useAuthStore from '../../store/authStore';
import useSummaryStore from '../../store/summaryStore';
import useTaskStore from '../../store/taskStore';
import useThemeStore from '../../store/themeStore';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

export default function HomeScreen() {
    const { user } = useAuthStore();
    const { theme, isDarkMode } = useThemeStore();
    const {
        activeTimer,
        dailyStats,
        elapsedTime,
        isLoading,
        syncActiveTimer,
        syncDailyStats,
        startTimer,
        stopTimer,
        pauseTimer,
        resumeTimer
    } = useTimerStore();
    const { todaySummary, fetchTodaySummary, isLoading: summaryLoading } = useSummaryStore();
    const { tasks, fetchTasks } = useTaskStore();
    const [refreshing, setRefreshing] = React.useState(false);

    useEffect(() => {
        syncActiveTimer();
        syncDailyStats();
        fetchTodaySummary();
        fetchTasks(); // Fetch tasks on mount
    }, []);

    // Refresh stats when timer stops
    useEffect(() => {
        if (!activeTimer) {
            syncDailyStats();
            fetchTodaySummary();
        }
    }, [activeTimer]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            syncActiveTimer(),
            syncDailyStats(),
            fetchTodaySummary()
        ]);
        setRefreshing(false);
    };

    // Refresh today's summary when tasks or timer change
    useEffect(() => {
        fetchTodaySummary();
    }, [tasks, activeTimer]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
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
        card: {
            backgroundColor: theme.colors.card,
            shadowColor: isDarkMode ? '#000' : '#888',
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: theme.colors.border,
        },
        timerDisplay: {
            color: theme.colors.text,
        },
        summaryItem: {
            backgroundColor: isDarkMode ? theme.colors.input : '#f8f9fa',
        }
    };

    return (
        <ScrollView
            contentContainerStyle={[styles.container, themeStyles.container]}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
            }
        >
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greetingSub, themeStyles.subText]}>Welcome back,</Text>
                    <Text style={[styles.greeting, themeStyles.text]}>{user?.name}</Text>
                </View>
                {/* Placeholder for potential profile image or settings icon */}
            </View>

            {activeTimer && (
                <View style={[styles.statusBadge, { backgroundColor: activeTimer.status === 'running' ? theme.colors.success + '20' : theme.colors.warning + '20' }]}>
                    <Text style={{ color: activeTimer.status === 'running' ? theme.colors.success : theme.colors.warning, fontWeight: '600' }}>
                        {activeTimer.status === 'running' ? '● Running' : '● Paused'} {activeTimer.description || ''}
                    </Text>
                </View>
            )}

            {/* Today's Progress Summary */}
            <View style={[styles.summaryCard, themeStyles.card]}>
                <Text style={[styles.summaryTitle, themeStyles.text]}>Today's Summary</Text>
                <View style={styles.summaryGrid}>
                    <View style={[styles.summaryItem, themeStyles.summaryItem]}>
                        <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                            {todaySummary?.completedTasksCount ?? 0}
                        </Text>
                        <Text style={[styles.summaryLabel, themeStyles.subText]}>Tasks Done</Text>
                    </View>
                    <View style={[styles.summaryItem, themeStyles.summaryItem]}>
                        <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                            {formatDuration(todaySummary.totalWorkSeconds || 0)}
                        </Text>
                        <Text style={[styles.summaryLabel, themeStyles.subText]}>Work Time</Text>
                    </View>
                    <View style={[styles.summaryItem, themeStyles.summaryItem]}>
                        <Text style={[styles.summaryValue, { color: theme.colors.warning }]}>
                            {formatDuration(todaySummary.totalBreakSeconds || 0)}
                        </Text>
                        <Text style={[styles.summaryLabel, themeStyles.subText]}>Break Time</Text>
                    </View>
                    <View style={[styles.summaryItem, themeStyles.summaryItem]}>
                        <Text style={[styles.summaryValue, { color: theme.colors.info }]}>
                            {todaySummary.productivityScore || 0}%
                        </Text>
                        <Text style={[styles.summaryLabel, themeStyles.subText]}>Productivity</Text>
                    </View>
                </View>
                <Text style={[styles.summaryHint, themeStyles.subText]}>
                    Last updated: {todaySummary.updatedAt ? new Date(todaySummary.updatedAt).toLocaleTimeString() : 'Just now'}
                </Text>
            </View>

            <View style={[styles.timerCard, themeStyles.card]}>
                <Text style={[styles.timerTitle, themeStyles.subText]}>
                    {activeTimer ? (activeTimer.description || 'Focus Session') : 'Ready to Focus?'}
                </Text>

                <Text style={[styles.timerDisplay, themeStyles.timerDisplay]}>{formatTime(elapsedTime)}</Text>

                <View style={styles.controls}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    ) : !activeTimer ? (
                        <TouchableOpacity style={[styles.startButton, { backgroundColor: theme.colors.primary }]} onPress={() => startTimer('Focus Session', [])}>
                            <Text style={styles.buttonText}>Start Focus</Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            {activeTimer.status === 'running' ? (
                                <TouchableOpacity style={[styles.controlButton, { backgroundColor: theme.colors.warning }]} onPress={pauseTimer}>
                                    <Text style={styles.buttonText}>Pause</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={[styles.controlButton, { backgroundColor: theme.colors.success }]} onPress={resumeTimer}>
                                    <Text style={styles.buttonText}>Resume</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity style={[styles.controlButton, { backgroundColor: theme.colors.danger }]} onPress={stopTimer}>
                                <Text style={styles.buttonText}>Stop</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 60, // Added top padding for status bar
    },
    header: {
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greetingSub: {
        fontSize: 14,
        marginBottom: 4,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 20,
    },
    summaryCard: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 24,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 5,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    summaryItem: {
        width: isSmallScreen ? '47%' : '48%',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    summaryHint: {
        fontSize: 12,
        textAlign: 'right',
        marginTop: 16,
        fontStyle: 'italic',
        opacity: 0.6,
    },
    timerCard: {
        padding: 32,
        borderRadius: 24,
        alignItems: 'center',
        width: '100%',
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 8,
    },
    timerTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    timerDisplay: {
        fontSize: 56,
        fontWeight: 'bold',
        marginBottom: 32,
        fontVariant: ['tabular-nums'],
    },
    controls: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
    },
    startButton: {
        paddingVertical: 18,
        paddingHorizontal: 48,
        borderRadius: 32,
        width: '100%',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    controlButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
