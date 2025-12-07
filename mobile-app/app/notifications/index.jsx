import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../../store/themeStore';
import useNotificationStore from '../../store/notificationStore';

export default function NotificationsScreen() {
    const router = useRouter();
    const { theme, isDarkMode } = useThemeStore();
    const {
        isEnabled,
        taskNotifications,
        habitNotifications,
        timerNotifications,
        streakNotifications,
        dailySummary,
        weeklyReview,
        breakReminders,
        permissionsGranted,
        toggleNotifications,
        toggleTaskNotifications,
        toggleHabitNotifications,
        toggleTimerNotifications,
        toggleStreakNotifications,
        toggleDailySummary,
        toggleWeeklyReview,
        toggleBreakReminders,
        sendTestNotification,
        requestPermissions,
    } = useNotificationStore();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!permissionsGranted) {
            Alert.alert(
                'Notification Permissions',
                'Please enable notifications to receive reminders and alerts.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Enable', onPress: handleRequestPermissions }
                ]
            );
        }
    }, []);

    const handleRequestPermissions = async () => {
        setLoading(true);
        const granted = await requestPermissions();
        setLoading(false);

        if (!granted) {
            Alert.alert(
                'Permissions Denied',
                'Please enable notifications in your device settings to use this feature.'
            );
        }
    };

    const handleTestNotification = async () => {
        if (!permissionsGranted) {
            Alert.alert('Error', 'Please enable notification permissions first');
            return;
        }
        await sendTestNotification();
        Alert.alert('Success', 'Test notification sent!');
    };

    const themeStyles = {
        container: { backgroundColor: isDarkMode ? '#0B0B0B' : '#f7f8fb' },
        header: { backgroundColor: isDarkMode ? '#121212' : '#fff' },
        card: { backgroundColor: isDarkMode ? '#121212' : '#fff' },
        text: { color: isDarkMode ? '#fff' : '#111' },
        subText: { color: isDarkMode ? '#9AA0A6' : '#666' },
        border: { borderColor: isDarkMode ? '#333' : '#eee' },
    };

    const SettingItem = ({ icon, title, subtitle, value, onValueChange, color = theme.colors.primary }) => (
        <View style={[styles.settingItem, themeStyles.border]}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon} size={22} color={color} />
                </View>
                <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingTitle, themeStyles.text]}>{title}</Text>
                    {subtitle && <Text style={[styles.settingSubtitle, themeStyles.subText]}>{subtitle}</Text>}
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: isDarkMode ? '#333' : '#ddd', true: color + '80' }}
                thumbColor={value ? color : isDarkMode ? '#666' : '#f4f3f4'}
                ios_backgroundColor={isDarkMode ? '#333' : '#ddd'}
            />
        </View>
    );

    const SectionHeader = ({ title }) => (
        <Text style={[styles.sectionHeader, themeStyles.subText]}>{title}</Text>
    );

    return (
        <View style={[styles.container, themeStyles.container]}>
            {/* Header */}
            <View style={[styles.header, themeStyles.header]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeStyles.text.color} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, themeStyles.text]}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Permission Status */}
                {!permissionsGranted && (
                    <View style={[styles.warningCard, { backgroundColor: '#FF950015', borderColor: '#FF9500' }]}>
                        <Ionicons name="warning-outline" size={24} color="#FF9500" />
                        <View style={styles.warningText}>
                            <Text style={[styles.warningTitle, { color: '#FF9500' }]}>Permissions Required</Text>
                            <Text style={[styles.warningSubtitle, themeStyles.subText]}>
                                Enable notifications to receive reminders
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.enableButton, { backgroundColor: '#FF9500' }]}
                            onPress={handleRequestPermissions}
                            disabled={loading}
                        >
                            <Text style={styles.enableButtonText}>Enable</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Master Toggle */}
                <View style={styles.section}>
                    <View style={[styles.card, themeStyles.card]}>
                        <SettingItem
                            icon="notifications"
                            title="Enable Notifications"
                            subtitle="Master switch for all notifications"
                            value={isEnabled}
                            onValueChange={toggleNotifications}
                        />
                    </View>
                </View>

                {/* Task & Habit Notifications */}
                <SectionHeader title="REMINDERS" />
                <View style={[styles.card, themeStyles.card]}>
                    <SettingItem
                        icon="checkmark-circle-outline"
                        title="Task Reminders"
                        subtitle="Get notified before tasks are due"
                        value={taskNotifications}
                        onValueChange={toggleTaskNotifications}
                        color="#34C759"
                    />
                    <SettingItem
                        icon="leaf-outline"
                        title="Habit Reminders"
                        subtitle="Daily reminders for your habits"
                        value={habitNotifications}
                        onValueChange={toggleHabitNotifications}
                        color="#FF9500"
                    />
                    <SettingItem
                        icon="time-outline"
                        title="Timer Alerts"
                        subtitle="Notify when timers complete"
                        value={timerNotifications}
                        onValueChange={toggleTimerNotifications}
                        color="#4A90E2"
                    />
                </View>

                {/* Achievements */}
                <SectionHeader title="ACHIEVEMENTS" />
                <View style={[styles.card, themeStyles.card]}>
                    <SettingItem
                        icon="flame-outline"
                        title="Streak Milestones"
                        subtitle="Celebrate your achievements"
                        value={streakNotifications}
                        onValueChange={toggleStreakNotifications}
                        color="#FF3B30"
                    />
                </View>

                {/* AI-Powered Insights */}
                <SectionHeader title="AI-POWERED INSIGHTS" />
                <View style={[styles.card, themeStyles.card]}>
                    <SettingItem
                        icon="stats-chart-outline"
                        title="Daily Summary"
                        subtitle="Daily productivity insights at 8 PM"
                        value={dailySummary}
                        onValueChange={toggleDailySummary}
                        color="#5856D6"
                    />
                    <SettingItem
                        icon="calendar-outline"
                        title="Weekly Review"
                        subtitle="Weekly progress review on Sundays"
                        value={weeklyReview}
                        onValueChange={toggleWeeklyReview}
                        color="#AF52DE"
                    />
                </View>

                {/* Wellness */}
                <SectionHeader title="WELLNESS" />
                <View style={[styles.card, themeStyles.card]}>
                    <SettingItem
                        icon="cafe-outline"
                        title="Break Reminders"
                        subtitle="Remind you to take breaks (every 25 min)"
                        value={breakReminders}
                        onValueChange={toggleBreakReminders}
                        color="#00C7BE"
                    />
                </View>

                {/* Test Notification */}
                <TouchableOpacity
                    style={[styles.testButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleTestNotification}
                    disabled={!permissionsGranted}
                >
                    <Ionicons name="send-outline" size={20} color="#fff" />
                    <Text style={styles.testButtonText}>Send Test Notification</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
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
    warningCard: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    warningText: {
        flex: 1,
        marginLeft: 12,
    },
    warningTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    warningSubtitle: {
        fontSize: 13,
    },
    enableButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    enableButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 24,
        marginBottom: 8,
        marginLeft: 20,
        letterSpacing: 0.5,
    },
    card: {
        marginHorizontal: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingTextContainer: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 13,
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    testButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
