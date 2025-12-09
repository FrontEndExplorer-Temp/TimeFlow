import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import notificationService from '../services/notificationService';

const STORAGE_KEY = '@notification_settings';

const useNotificationStore = create((set, get) => ({
    // Backend notifications
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    // Local notification settings
    isEnabled: true,
    taskNotifications: true,
    habitNotifications: true,
    timerNotifications: true,
    streakNotifications: true,
    dailySummary: true,
    weeklyReview: true,
    breakReminders: false,
    habitReminderTime: { hour: 9, minute: 0 },
    breakReminderInterval: 25,
    scheduledNotifications: {},
    permissionsGranted: false,
    hasInitialized: false,

    // Initialize
    initialize: async () => {
        // Only initialize once per app session
        if (get().hasInitialized) {
            return;
        }
        set({ hasInitialized: true });
        // Skip notification initialization on web
        if (Platform.OS === 'web') {
            console.log('Notifications not supported on web');
            return;
        }

        try {
            const savedSettings = await AsyncStorage.getItem(STORAGE_KEY);
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                set(settings);
            }

            const granted = await notificationService.requestPermissions();
            set({ permissionsGranted: granted });

            notificationService.setupListeners(
                get().handleNotificationReceived,
                get().handleNotificationResponse
            );

            // Sync with actual native scheduled notifications
            // This prevents duplicates and recovers state if app data was cleared
            const nativeScheduled = await notificationService.getAllScheduledNotifications();
            const scheduledMap = { ...get().scheduledNotifications };

            nativeScheduled.forEach(n => {
                const type = n.content.data?.type;
                if (type === 'daily-summary') scheduledMap.dailySummary = n.identifier;
                else if (type === 'weekly-review') scheduledMap.weeklyReview = n.identifier;
                else if (type === 'task') scheduledMap[`task_${n.content.data.taskId}`] = n.identifier;
                else if (type === 'habit') scheduledMap[`habit_${n.content.data.habitId}`] = n.identifier;
            });

            set({ scheduledNotifications: scheduledMap });

            // Only schedule if enabled and not already scheduled
            if (get().isEnabled) {
                if (get().dailySummary && !scheduledMap.dailySummary) {
                    await get().scheduleDailySummary();
                }
                if (get().weeklyReview && !scheduledMap.weeklyReview) {
                    await get().scheduleWeeklyReview();
                }
            }
        } catch (error) {
            console.error('Error initializing notifications:', error);
        }
    },

    saveSettings: async () => {
        try {
            const { isEnabled, taskNotifications, habitNotifications, timerNotifications, streakNotifications, dailySummary, weeklyReview, breakReminders, habitReminderTime, breakReminderInterval } = get();
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ isEnabled, taskNotifications, habitNotifications, timerNotifications, streakNotifications, dailySummary, weeklyReview, breakReminders, habitReminderTime, breakReminderInterval }));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    },

    toggleNotifications: async (enabled) => {
        set({ isEnabled: enabled });
        await get().saveSettings();
        if (!enabled) {
            await notificationService.cancelAllNotifications();
            set({ scheduledNotifications: {} });
        }
    },

    toggleTaskNotifications: async (enabled) => {
        set({ taskNotifications: enabled });
        await get().saveSettings();
    },

    toggleHabitNotifications: async (enabled) => {
        set({ habitNotifications: enabled });
        await get().saveSettings();
    },

    toggleTimerNotifications: async (enabled) => {
        set({ timerNotifications: enabled });
        await get().saveSettings();
    },

    toggleStreakNotifications: async (enabled) => {
        set({ streakNotifications: enabled });
        await get().saveSettings();
    },

    toggleDailySummary: async (enabled) => {
        set({ dailySummary: enabled });
        await get().saveSettings();
        if (enabled) await get().scheduleDailySummary();
        else if (get().scheduledNotifications.dailySummary) {
            await notificationService.cancelNotification(get().scheduledNotifications.dailySummary);
        }
    },

    toggleWeeklyReview: async (enabled) => {
        set({ weeklyReview: enabled });
        await get().saveSettings();
        if (enabled) await get().scheduleWeeklyReview();
        else if (get().scheduledNotifications.weeklyReview) {
            await notificationService.cancelNotification(get().scheduledNotifications.weeklyReview);
        }
    },

    toggleBreakReminders: async (enabled) => {
        set({ breakReminders: enabled });
        await get().saveSettings();
    },

    setHabitReminderTime: async (time) => {
        set({ habitReminderTime: time });
        await get().saveSettings();
    },

    setBreakReminderInterval: async (minutes) => {
        set({ breakReminderInterval: minutes });
        await get().saveSettings();
    },

    scheduleTaskNotification: async (task) => {
        const { isEnabled, taskNotifications } = get();
        if (!isEnabled || !taskNotifications) return;
        const notificationId = await notificationService.scheduleTaskReminder(task);
        if (notificationId) {
            set(state => ({ scheduledNotifications: { ...state.scheduledNotifications, [`task_${task._id}`]: notificationId } }));
        }
    },

    cancelTaskNotification: async (taskId) => {
        const { scheduledNotifications } = get();
        const key = `task_${taskId}`;
        if (scheduledNotifications[key]) {
            await notificationService.cancelNotification(scheduledNotifications[key]);
            const updated = { ...scheduledNotifications };
            delete updated[key];
            set({ scheduledNotifications: updated });
        }
    },

    scheduleHabitNotification: async (habit) => {
        const { isEnabled, habitNotifications, habitReminderTime } = get();
        if (!isEnabled || !habitNotifications) return;
        const notificationId = await notificationService.scheduleHabitReminder(habit, habitReminderTime);
        if (notificationId) {
            set(state => ({ scheduledNotifications: { ...state.scheduledNotifications, [`habit_${habit._id}`]: notificationId } }));
        }
    },

    cancelHabitNotification: async (habitId) => {
        const { scheduledNotifications } = get();
        const key = `habit_${habitId}`;
        if (scheduledNotifications[key]) {
            await notificationService.cancelNotification(scheduledNotifications[key]);
            const updated = { ...scheduledNotifications };
            delete updated[key];
            set({ scheduledNotifications: updated });
        }
    },

    scheduleTimerNotification: async (title, seconds) => {
        const { isEnabled, timerNotifications } = get();
        if (!isEnabled || !timerNotifications) return;
        return await notificationService.scheduleTimerNotification(title, seconds);
    },

    sendStreakNotification: async (habitName, streakCount) => {
        const { isEnabled, streakNotifications } = get();
        if (!isEnabled || !streakNotifications) return;
        if ([3, 7, 14, 30, 60, 90, 100].includes(streakCount)) {
            await notificationService.scheduleStreakNotification(habitName, streakCount);
        }
    },

    scheduleDailySummary: async () => {
        const { scheduledNotifications } = get();
        if (scheduledNotifications.dailySummary) return; // Already scheduled

        // Check if notification was already sent today
        try {
            const lastSent = await AsyncStorage.getItem('lastDailySummary');
            const today = new Date().toDateString();
            if (lastSent === today) {
                console.log('Daily summary already sent today, skipping');
                return;
            }

            const notificationId = await notificationService.scheduleSmartNotification('daily-summary', { summary: 'Check out your productivity for today!' });
            if (notificationId) {
                set(state => ({ scheduledNotifications: { ...state.scheduledNotifications, dailySummary: notificationId } }));
                await AsyncStorage.setItem('lastDailySummary', today);
            }
        } catch (error) {
            console.error('Error scheduling daily summary:', error);
        }
    },

    scheduleWeeklyReview: async () => {
        const { scheduledNotifications } = get();
        if (scheduledNotifications.weeklyReview) return; // Already scheduled

        // Check if notification was already sent this week
        try {
            const lastSent = await AsyncStorage.getItem('lastWeeklyReview');
            const currentWeek = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
            const lastSentDate = lastSent ? new Date(lastSent) : null;

            // Check if last sent was within the past 6 days
            if (lastSentDate && (new Date() - lastSentDate) < 6 * 24 * 60 * 60 * 1000) {
                console.log('Weekly review already sent this week, skipping');
                return;
            }

            const notificationId = await notificationService.scheduleSmartNotification('weekly-review', { summary: 'Review your week and plan ahead!' });
            if (notificationId) {
                set(state => ({ scheduledNotifications: { ...state.scheduledNotifications, weeklyReview: notificationId } }));
                await AsyncStorage.setItem('lastWeeklyReview', currentWeek);
            }
        } catch (error) {
            console.error('Error scheduling weekly review:', error);
        }
    },

    scheduleBreakReminder: async () => {
        const { isEnabled, breakReminders, breakReminderInterval } = get();
        if (!isEnabled || !breakReminders) return;
        return await notificationService.scheduleSmartNotification('break-reminder', { minutes: breakReminderInterval });
    },

    handleNotificationReceived: (notification) => {
        console.log('Notification received:', notification);
    },

    handleNotificationResponse: (response) => {
        console.log('Notification response:', response);
    },

    sendTestNotification: async () => {
        await notificationService.sendImmediateNotification('🔔 Test Notification', 'Notifications are working perfectly!', { type: 'test' });
    },

    getScheduledNotifications: async () => {
        return await notificationService.getAllScheduledNotifications();
    },

    requestPermissions: async () => {
        const granted = await notificationService.requestPermissions();
        set({ permissionsGranted: granted });
        return granted;
    },

    // Backend notifications
    fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/notifications');
            const notifications = response.data;
            const unreadCount = notifications.filter(n => !n.isRead).length;
            set({ notifications, unreadCount, isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: error.message });
        }
    },

    markAsRead: async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            const notifications = get().notifications.map(n => n._id === id ? { ...n, isRead: true } : n);
            const unreadCount = notifications.filter(n => !n.isRead).length;
            set({ notifications, unreadCount });
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    },

    markAllAsRead: async () => {
        try {
            await api.put('/notifications/read-all');
            const notifications = get().notifications.map(n => ({ ...n, isRead: true }));
            set({ notifications, unreadCount: 0 });
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    },

    reset: () => set({ notifications: [], unreadCount: 0, isLoading: false, error: null }),
}));

export default useNotificationStore;
