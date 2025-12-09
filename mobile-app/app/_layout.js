// Suppress React Native Web deprecation warnings
if (typeof window !== 'undefined') {
    const originalWarn = console.warn;
    console.warn = (...args) => {
        const message = args[0];
        if (
            typeof message === 'string' &&
            (message.includes('shadow*') ||
                message.includes('pointerEvents') ||
                message.includes('Cannot record touch'))
        ) {
            return;
        }
        originalWarn.apply(console, args);
    };
}

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useSyncStore from '../store/syncStore';
import * as SplashScreen from 'expo-splash-screen';

import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import useThemeStore from '../store/themeStore';
import ErrorBoundary from '../components/ErrorBoundary';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Layout() {
    const { user, isLoading, isAppLoading, loadUser } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const { initialize: initializeSync } = useSyncStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        async function prepare() {
            try {
                await loadUser();
                // Initialize sync for auto-sync and offline support
                await initializeSync();
            } catch (e) {
                console.warn(e);
            } finally {
                // Hide splash screen after initialization
                await SplashScreen.hideAsync();
            }
        }
        prepare();
    }, []);

    useEffect(() => {
        if (isAppLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const isChoosingAvatar = segments[1] === 'choose-avatar';

        if (!user && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup && !isChoosingAvatar) {
            // If user hasn't completed onboarding, send them to avatar selection
            // FIX: Also check if they already have a profile picture to prevent loops
            if (!user.onboardingCompleted && !user.profilePicture) {
                router.replace('/(auth)/choose-avatar');
            } else {
                router.replace('/(tabs)');
            }
        } else if (user && !inAuthGroup && !user.onboardingCompleted && !user.profilePicture) {
            // If authenticated user is in tabs but hasn't completed onboarding, redirect to avatar selection
            router.replace('/(auth)/choose-avatar');
        }
    }, [user, segments, isAppLoading]);

    if (isAppLoading) return null;

    return (
        <ErrorBoundary>
            <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
                    <Stack.Screen name="notifications/index" options={{ headerShown: false }} />
                </Stack>
            </ThemeProvider>
        </ErrorBoundary>
    );
}