import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import secureStorage from './secureStorage';

const getBaseUrl = () => {
    // 1. Check for production API URL from environment variable
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // 2. For web, localhost is fine
    if (Platform.OS === 'web') return 'http://localhost:5000/api';

    // 3. For physical devices, we need the local IP
    // Constants.expoConfig.hostUri contains the IP of the Expo server (e.g., 192.168.1.5:8081)
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;

    if (hostUri) {
        const ip = hostUri.split(':')[0];
        // Assuming backend runs on port 5000
        return `http://${ip}:5000/api`;
    }

    // 4. Fallback for emulators if hostUri is missing
    if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api';

    return 'http://localhost:5000/api';
};

const API_URL = getBaseUrl();
console.log('API URL configured as:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await secureStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization =`Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export { API_URL };
export default api