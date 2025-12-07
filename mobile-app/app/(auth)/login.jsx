import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { Link, useRouter } from 'expo-router';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import api, { API_URL } from '../../services/api'; // To get baseURL if needed

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        try {
            await login(email, password);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Login failed. Please try again.';
            Alert.alert('Login Failed', errorMsg);
        }
    };

    const handleOAuthLogin = (provider) => {
        // Use configured API URL
        Linking.openURL(`${API_URL}/users/auth/${provider}`);
    };

    const themeStyles = {
        container: { backgroundColor: isDarkMode ? '#121212' : '#fff' },
        text: { color: isDarkMode ? '#fff' : '#000' },
        input: {
            backgroundColor: isDarkMode ? '#1E1E1E' : '#f5f5f5',
            color: isDarkMode ? '#fff' : '#000',
            borderColor: isDarkMode ? '#333' : '#e0e0e0'
        },
        placeholder: isDarkMode ? '#888' : '#999'
    };

    return (
        <View style={[styles.container, themeStyles.container]}>
            <Text style={[styles.title, themeStyles.text]}>Welcome Back</Text>

            <TextInput
                style={[styles.input, themeStyles.input]}
                placeholder="Email"
                placeholderTextColor={themeStyles.placeholder}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <View style={[styles.passwordContainer, { borderColor: themeStyles.input.borderColor, backgroundColor: themeStyles.input.backgroundColor }]}>
                <TextInput
                    style={[styles.passwordInput, { color: themeStyles.input.color }]}
                    placeholder="Password"
                    placeholderTextColor={themeStyles.placeholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={themeStyles.placeholder} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                style={styles.forgotPassword}
            >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
                <Text style={styles.buttonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={[styles.dividerText, { color: themeStyles.placeholder }]}>OR</Text>
                <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
                style={[styles.oauthButton, { backgroundColor: '#DB4437' }]}
                onPress={() => handleOAuthLogin('google')}
            >
                <Ionicons name="logo-google" size={20} color="#fff" style={styles.oauthIcon} />
                <Text style={styles.oauthButtonText}>Sign in with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.oauthButton, { backgroundColor: '#333' }]}
                onPress={() => handleOAuthLogin('github')}
            >
                <Ionicons name="logo-github" size={20} color="#fff" style={styles.oauthIcon} />
                <Text style={styles.oauthButtonText}>Sign in with GitHub</Text>
            </TouchableOpacity>

            <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                    <Text style={styles.linkText}>Don't have an account? Sign up</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
    },
    eyeIcon: {
        marginLeft: 10,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#007AFF',
        fontSize: 14,
    },
    resetTokenLink: {
        alignSelf: 'flex-end',
        marginBottom: 10,
        marginTop: 0,
    },
    resetTokenText: {
        color: '#666',
        fontSize: 12,
    },
    linkText: {
        color: '#007AFF',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 10,
        fontSize: 14,
    },
    oauthButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    oauthIcon: {
        marginRight: 10,
    },
    oauthButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
