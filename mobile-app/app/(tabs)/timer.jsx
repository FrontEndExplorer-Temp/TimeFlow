import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTimerStore from '../../store/timerStore';
import useThemeStore from '../../store/themeStore';

export default function TimerScreen() {
    const {
        activeTimer,
        elapsedTime,
        dailyStats,
        syncActiveTimer,
        syncDailyStats,
        startTimer,
        stopTimer,
        pauseTimer,
        resumeTimer,
        isLoading
    } = useTimerStore();

    const { theme, isDarkMode } = useThemeStore();
    const [description, setDescription] = useState('');

    useEffect(() => {
        syncActiveTimer();
        syncDailyStats();
        return () => useTimerStore.getState().stopTicker();
    }, []);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        if (description.trim()) {
            startTimer(description, []);
            setDescription('');
        } else {
            Alert.alert('Required', 'Please enter what you are working on.');
        }
    };

    const themeStyles = {
        container: { backgroundColor: theme.colors.background },
        text: { color: theme.colors.text },
        subText: { color: theme.colors.subText },
        card: { backgroundColor: theme.colors.card },
        border: { borderColor: theme.colors.border },
    };

    return (
        <ScrollView style={[styles.container, themeStyles.container]} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, themeStyles.text]}>Focus Timer</Text>
                <Text style={[styles.headerSubtitle, themeStyles.subText]}>
                    Stay focused and track your productivity
                </Text>
            </View>

            {/* Timer Display */}
            <View style={[styles.card, themeStyles.card, isDarkMode && styles.cardBorder]}>
                <Text style={[styles.timerText, themeStyles.text]}>
                    {formatTime(elapsedTime)}
                </Text>

                <View style={styles.controlsContainer}>
                    {!activeTimer ? (
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[styles.input, themeStyles.text, { borderColor: theme.colors.border }]}
                                placeholder="What are you working on?"
                                placeholderTextColor={theme.colors.subText}
                                value={description}
                                onChangeText={setDescription}
                            />
                            <TouchableOpacity
                                style={[styles.mainButton, { backgroundColor: theme.colors.primary }]}
                                onPress={handleStart}
                                disabled={isLoading}
                            >
                                <Ionicons name="play" size={24} color="#fff" />
                                <Text style={styles.buttonText}>Start Focus</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.activeControls}>
                            {activeTimer.status === 'running' ? (
                                <TouchableOpacity
                                    style={[styles.roundButton, { backgroundColor: theme.colors.secondary || '#5856D6' }]}
                                    onPress={pauseTimer}
                                >
                                    <Ionicons name="pause" size={32} color="#fff" />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.roundButton, { backgroundColor: theme.colors.primary }]}
                                    onPress={resumeTimer}
                                >
                                    <Ionicons name="play" size={32} color="#fff" />
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={[styles.roundButton, { backgroundColor: theme.colors.danger || '#FF3B30' }]}
                                onPress={stopTimer}
                            >
                                <Ionicons name="square" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {activeTimer && (
                    <Text style={[styles.workingOn, themeStyles.subText]}>
                        Working on: <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>{activeTimer.description}</Text>
                    </Text>
                )}
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, themeStyles.card, isDarkMode && styles.cardBorder]}>
                    <Ionicons name="time-outline" size={24} color="#007AFF" style={styles.statIcon} />
                    <Text style={[styles.statLabel, themeStyles.subText]}>Focus Time</Text>
                    <Text style={[styles.statValue, themeStyles.text]}>
                        {formatTime(dailyStats?.totalWorkSeconds || 0)}
                    </Text>
                </View>

                <View style={[styles.statCard, themeStyles.card, isDarkMode && styles.cardBorder]}>
                    <Ionicons name="cafe-outline" size={24} color="#FF9500" style={styles.statIcon} />
                    <Text style={[styles.statLabel, themeStyles.subText]}>Break Time</Text>
                    <Text style={[styles.statValue, themeStyles.text]}>
                        {formatTime(dailyStats?.totalBreakSeconds || 0)}
                    </Text>
                </View>

                <View style={[styles.statCard, themeStyles.card, isDarkMode && styles.cardBorder]}>
                    <View style={[styles.scoreBadge, { borderColor: '#AF52DE' }]}>
                        <Text style={[styles.scoreText, { color: '#AF52DE' }]}>
                            {dailyStats?.productivityScore || 0}
                        </Text>
                    </View>
                    <Text style={[styles.statLabel, themeStyles.subText]}>Prod. Score</Text>
                    <Text style={[styles.statValue, themeStyles.text]}>
                        {dailyStats?.productivityScore || 0}%
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    card: {
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 30,
    },
    cardBorder: {
        borderWidth: 1,
        borderColor: '#333',
    },
    timerText: {
        fontSize: 64,
        fontWeight: 'bold',
        fontVariant: ['tabular-nums'],
        marginBottom: 30,
        letterSpacing: 2,
    },
    controlsContainer: {
        width: '100%',
        alignItems: 'center',
    },
    inputContainer: {
        width: '100%',
        gap: 16,
    },
    input: {
        borderWidth: 1,
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        textAlign: 'center',
        width: '100%',
    },
    mainButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 50,
        gap: 8,
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    activeControls: {
        flexDirection: 'row',
        gap: 24,
    },
    roundButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    workingOn: {
        marginTop: 20,
        fontSize: 14,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statIcon: {
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 12,
        marginBottom: 4,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    scoreBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    scoreText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});
