import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [gender, setGender] = useState(''); // 'male' or 'female'
    const { register, isLoading } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const router = useRouter();

    const handleSignup = async () => {
        if (!name || !email || !password || !confirmPassword || !gender) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        try {
            await register(name, email, password, gender);
            router.replace(`/(auth)/verify-email?email=${email}`);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Signup failed. Please try again.';
            Alert.alert('Signup Failed', errorMsg);
        }
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
        <ScrollView style={[styles.container, themeStyles.container]} contentContainerStyle={styles.content}>
            <Text style={[styles.title, themeStyles.text]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: isDarkMode ? '#aaa' : '#666' }]}>
                Sign up to get started
            </Text>

            <TextInput
                style={[styles.input, themeStyles.input]}
                placeholder="Full Name"
                placeholderTextColor={themeStyles.placeholder}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
            />

            <TextInput
                style={[styles.input, themeStyles.input]}
                placeholder="Email"
                placeholderTextColor={themeStyles.placeholder}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            {/* Gender Selection */}
            <Text style={[styles.label, themeStyles.text]}>Gender</Text>
            <View style={styles.genderContainer}>
                <TouchableOpacity
                    style={[
                        styles.genderButton,
                        gender === 'male' && styles.genderButtonActive,
                        { borderColor: isDarkMode ? '#333' : '#e0e0e0' }
                    ]}
                    onPress={() => setGender('male')}
                >
                    <Ionicons
                        name="male"
                        size={24}
                        color={gender === 'male' ? '#4A90E2' : (isDarkMode ? '#888' : '#999')}
                        style={styles.genderIcon}
                    />
                    <Text style={[
                        styles.genderText,
                        { color: gender === 'male' ? '#4A90E2' : (isDarkMode ? '#888' : '#999') }
                    ]}>
                        Male
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.genderButton,
                        gender === 'female' && styles.genderButtonActive,
                        { borderColor: isDarkMode ? '#333' : '#e0e0e0' }
                    ]}
                    onPress={() => setGender('female')}
                >
                    <Ionicons
                        name="female"
                        size={24}
                        color={gender === 'female' ? '#FF69B4' : (isDarkMode ? '#888' : '#999')}
                        style={styles.genderIcon}
                    />
                    <Text style={[
                        styles.genderText,
                        { color: gender === 'female' ? '#FF69B4' : (isDarkMode ? '#888' : '#999') }
                    ]}>
                        Female
                    </Text>
                </TouchableOpacity>
            </View>

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

            <View style={[styles.passwordContainer, { borderColor: themeStyles.input.borderColor, backgroundColor: themeStyles.input.backgroundColor }]}>
                <TextInput
                    style={[styles.passwordInput, { color: themeStyles.input.color }]}
                    placeholder="Confirm Password"
                    placeholderTextColor={themeStyles.placeholder}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color={themeStyles.placeholder} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>{isLoading ? 'Creating Account...' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.loginLink}>
                <Text style={[styles.loginLinkText, { color: isDarkMode ? '#aaa' : '#666' }]}>
                    Already have an account? <Text style={styles.loginLinkBold}>Login</Text>
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
    },
    eyeIcon: {
        marginLeft: 10,
    },
    genderContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    genderButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
    },
    genderIcon: {
        marginRight: 8,
    },
    genderButtonActive: {
        borderColor: '#4A90E2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
    },
    genderText: {
        fontSize: 16,
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#4A90E2',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginLinkText: {
        fontSize: 16,
    },
    loginLinkBold: {
        color: '#4A90E2',
        fontWeight: 'bold',
    },
});
