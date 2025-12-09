import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Platform-aware secure storage
 * Uses SecureStore for native (iOS/Android) and AsyncStorage/localStorage for web
 */

// Check if localStorage is available (for web)
const isLocalStorageAvailable = () => {
    if (Platform.OS !== 'web') return false;
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
};

export const secureStorage = {
    async getItem(key) {
        if (Platform.OS === 'web') {
            try {
                // Try AsyncStorage first
                const value = await AsyncStorage.getItem(key);
                return value;
            } catch (error) {
                // Fallback to localStorage
                if (isLocalStorageAvailable()) {
                    return localStorage.getItem(key);
                }
                console.warn('Storage access denied:', error);
                return null;
            }
        }
        return await SecureStore.getItemAsync(key);
    },

    async setItem(key, value) {
        if (Platform.OS === 'web') {
            try {
                // Try AsyncStorage first
                await AsyncStorage.setItem(key, value);
            } catch (error) {
                // Fallback to localStorage
                if (isLocalStorageAvailable()) {
                    localStorage.setItem(key, value);
                } else {
                    console.warn('Storage access denied:', error);
                }
            }
            return;
        }
        return await SecureStore.setItemAsync(key, value);
    },

    async removeItem(key) {
        if (Platform.OS === 'web') {
            try {
                // Try AsyncStorage first
                await AsyncStorage.removeItem(key);
            } catch (error) {
                // Fallback to localStorage
                if (isLocalStorageAvailable()) {
                    localStorage.removeItem(key);
                } else {
                    console.warn('Storage access denied:', error);
                }
            }
            return;
        }
        return await SecureStore.deleteItemAsync(key);
    },
};

export default secureStorage;
