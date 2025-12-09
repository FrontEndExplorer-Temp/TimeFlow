import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import useThemeStore from '../../store/themeStore';
import useNotificationStore from '../../store/notificationStore';
import useAuthStore from '../../store/authStore';

export default function TabLayout() {
    const { theme } = useThemeStore();
    const { initialize, hasInitialized } = useNotificationStore();
    const { user } = useAuthStore();

    useEffect(() => {
        // Only initialize notifications once per session and only if user is authenticated
        if (user && !hasInitialized) {
            initialize();
        }
    }, [user, hasInitialized]);

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarStyle: {
                    backgroundColor: theme.colors.tabBar,
                    borderTopColor: theme.colors.border,
                },
                headerStyle: {
                    backgroundColor: theme.colors.header,
                },
                headerTintColor: theme.colors.text,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="tasks"
                options={{
                    title: 'Tasks',
                    tabBarIcon: ({ color }) => <Ionicons name="checkbox-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="jobs"
                options={{
                    title: 'Jobs',
                    tabBarIcon: ({ color }) => <Ionicons name="briefcase-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="notes"
                options={{
                    title: 'Notes',
                    tabBarIcon: ({ color }) => <Ionicons name="create-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="finance"
                options={{
                    title: 'Finance',
                    tabBarIcon: ({ color }) => <Ionicons name="cash-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="ai/index"
                options={{
                    title: 'AI',
                    tabBarIcon: ({ color }) => <Ionicons name="flash-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="habits"
                options={{
                    title: 'Habits',
                    tabBarIcon: ({ color }) => <Ionicons name="repeat-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="timer"
                options={{
                    title: 'Timer',
                    tabBarIcon: ({ color }) => <Ionicons name="timer-outline" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
