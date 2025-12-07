import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationService {
    constructor() {
        this.expoPushToken = null;
        this.notificationListener = null;
        this.responseListener = null;
    }

    // Request notification permissions
    async requestPermissions() {
        try {
            if (!Device.isDevice) {
                console.log('Must use physical device for Push Notifications');
                return false;
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return false;
            }

            // Get push token for push notifications
            const token = await this.registerForPushNotifications();
            this.expoPushToken = token;

            // Set up notification channel for Android
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#4A90E2',
                });

                await Notifications.setNotificationChannelAsync('tasks', {
                    name: 'Task Reminders',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#34C759',
                });

                await Notifications.setNotificationChannelAsync('habits', {
                    name: 'Habit Reminders',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF9500',
                });

                await Notifications.setNotificationChannelAsync('timers', {
                    name: 'Timer Alerts',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 500, 250, 500],
                    lightColor: '#4A90E2',
                });
            }

            return true;
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
            return false;
        }
    }

    // Register for push notifications
    async registerForPushNotifications() {
        try {
            // Simplified version without dependencies that cause issues
            const token = await Notifications.getExpoPushTokenAsync();
            return token.data;
        } catch (error) {
            console.log('Push token not available:', error.message);
            return null;
        }
    }

    // Schedule a task reminder notification
    async scheduleTaskReminder(task) {
        try {
            if (!task.dueDate) return null;

            const dueDate = new Date(task.dueDate);
            const now = new Date();

            // Schedule notification 1 hour before due date
            let notificationTime = new Date(dueDate.getTime() - 60 * 60 * 1000);

            if (notificationTime <= now) {
                // If due date is less than 1 hour away, schedule for 5 minutes before
                notificationTime = new Date(dueDate.getTime() - 5 * 60 * 1000);
            }

            if (notificationTime <= now) return null; // Don't schedule past notifications

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '⏰ Task Reminder',
                    body: `"${task.title}" is due soon!`,
                    data: { taskId: task._id, type: 'task' },
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: {
                    date: notificationTime,
                    channelId: 'tasks',
                },
            });

            return notificationId;
        } catch (error) {
            console.error('Error scheduling task reminder:', error);
            return null;
        }
    }

    // Schedule a habit reminder notification
    async scheduleHabitReminder(habit, time = { hour: 9, minute: 0 }) {
        try {
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🌟 Habit Reminder',
                    body: `Time to complete: ${habit.name}`,
                    data: { habitId: habit._id, type: 'habit' },
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: {
                    hour: time.hour,
                    minute: time.minute,
                    repeats: true,
                    channelId: 'habits',
                },
            });

            return notificationId;
        } catch (error) {
            console.error('Error scheduling habit reminder:', error);
            return null;
        }
    }

    // Schedule timer completion notification
    async scheduleTimerNotification(title, seconds) {
        try {
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '⏱️ Timer Complete!',
                    body: title || 'Your timer has finished',
                    data: { type: 'timer' },
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.MAX,
                },
                trigger: {
                    seconds: seconds,
                    channelId: 'timers',
                },
            });

            return notificationId;
        } catch (error) {
            console.error('Error scheduling timer notification:', error);
            return null;
        }
    }

    // Schedule streak milestone notification
    async scheduleStreakNotification(habitName, streakCount) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🔥 Streak Milestone!',
                    body: `${streakCount} day streak for "${habitName}"! Keep it up!`,
                    data: { type: 'streak' },
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: null, // Send immediately
            });
        } catch (error) {
            console.error('Error scheduling streak notification:', error);
        }
    }

    // AI-powered smart notification scheduling
    // Notifications are scheduled for when the app is likely not in use
    async scheduleSmartNotification(type, data) {
        try {
            let trigger;
            let content;

            switch (type) {
                case 'daily-summary':
                    // Schedule for 8 PM (20:00) daily - a typical time when users check their app
                    trigger = {
                        hour: 20,
                        minute: 0,
                        repeats: true,
                    };
                    content = {
                        title: '📊 Daily Summary',
                        body: data.summary || 'Check out your productivity for today!',
                        data: { type: 'daily-summary' },
                    };
                    break;

                case 'weekly-review':
                    // Schedule for Monday 7 PM - a good time to reflect on the week
                    trigger = {
                        weekday: 1,
                        hour: 19,
                        minute: 0,
                        repeats: true,
                    };
                    content = {
                        title: '📈 Weekly Review',
                        body: data.summary || 'Review your week and plan ahead!',
                        data: { type: 'weekly-review' },
                    };
                    break;

                case 'break-reminder':
                    // Pomodoro-style break reminder
                    trigger = {
                        seconds: (data.minutes || 25) * 60,
                    };
                    content = {
                        title: '☕ Time for a Break',
                        body: 'You\'ve been working hard. Take a short break!',
                        data: { type: 'break-reminder' },
                    };
                    break;

                default:
                    return null;
            }

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    ...content,
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.DEFAULT,
                },
                trigger,
            });

            return notificationId;
        } catch (error) {
            console.error('Error scheduling smart notification:', error);
            return null;
        }
    }

    // Cancel a scheduled notification
    async cancelNotification(notificationId) {
        try {
            if (notificationId) {
                await Notifications.cancelScheduledNotificationAsync(notificationId);
            }
        } catch (error) {
            console.error('Error canceling notification:', error);
        }
    }

    // Cancel all notifications
    async cancelAllNotifications() {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (error) {
            console.error('Error canceling all notifications:', error);
        }
    }

    // Get all scheduled notifications
    async getAllScheduledNotifications() {
        try {
            const notifications = await Notifications.getAllScheduledNotificationsAsync();
            return notifications;
        } catch (error) {
            console.error('Error getting scheduled notifications:', error);
            return [];
        }
    }

    // Set up notification listeners
    setupListeners(onNotificationReceived, onNotificationResponse) {
        this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
            if (onNotificationReceived) {
                onNotificationReceived(notification);
            }
        });

        this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            if (onNotificationResponse) {
                onNotificationResponse(response);
            }
        });
    }

    // Remove notification listeners
    removeListeners() {
        if (this.notificationListener) {
            Notifications.removeNotificationSubscription(this.notificationListener);
        }
        if (this.responseListener) {
            Notifications.removeNotificationSubscription(this.responseListener);
        }
    }

    // Send immediate notification
    async sendImmediateNotification(title, body, data = {}) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: true,
                },
                trigger: null,
            });
        } catch (error) {
            console.error('Error sending immediate notification:', error);
        }
    }
}

export default new NotificationService();
