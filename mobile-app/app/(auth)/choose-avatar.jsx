import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../../store/themeStore';
import useAuthStore from '../../store/authStore';

// DiceBear avatar options
const AVATAR_OPTIONS = [
    { style: 'avataaars', seed: 'Felix', name: 'Happy' },
    { style: 'avataaars', seed: 'Aneka', name: 'Cheerful' },
    { style: 'avataaars', seed: 'Bella', name: 'Friendly' },
    { style: 'avataaars', seed: 'Charlie', name: 'Cool' },
    { style: 'bottts', seed: 'Robot1', name: 'Bot Blue' },
    { style: 'bottts', seed: 'Robot2', name: 'Bot Green' },
    { style: 'personas', seed: 'Emma', name: 'Professional' },
    { style: 'personas', seed: 'Oliver', name: 'Business' },
];

export default function ChooseAvatarScreen() {
    const router = useRouter();
    const { theme, isDarkMode } = useThemeStore();
    const { updateProfile } = useAuthStore();
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const getAvatarUrl = (avatarStyle, seed) => {
        return `https://api.dicebear.com/7.x/${avatarStyle}/png?seed=${seed}&size=200&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    };

    const handleContinue = async () => {
        if (!selectedAvatar) {
            return;
        }

        setIsLoading(true);
        try {
            const success = await updateProfile({
                profilePicture: selectedAvatar,
                onboardingCompleted: true
            });

            if (success) {
                router.replace('/(tabs)');
            } else {
                // Fallback: Backend failed, save locally so user can proceed
                const { completeOnboardingLocally } = useAuthStore.getState();
                await completeOnboardingLocally({ profilePicture: selectedAvatar });

                // Optional: Show toast or small alert that we are in offline mode? 
                // For now, just let them in to avoid friction.
                router.replace('/(tabs)');
            }
        } catch (error) {
            console.error('Failed to update avatar:', error);
            // Fallback
            const { completeOnboardingLocally } = useAuthStore.getState();
            await completeOnboardingLocally({ profilePicture: selectedAvatar });
            router.replace('/(tabs)');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = async () => {
        try {
            const success = await updateProfile({ onboardingCompleted: true });
            if (success) {
                router.replace('/(tabs)');
            } else {
                // Fallback: If network fails, allow local bypass to not block user
                const { completeOnboardingLocally } = useAuthStore.getState();
                await completeOnboardingLocally();
                router.replace('/(tabs)');
            }
        } catch (error) {
            console.error('Failed to skip avatar:', error);
            // Fallback
            const { completeOnboardingLocally } = useAuthStore.getState();
            await completeOnboardingLocally();
            router.replace('/(tabs)');
        }
    };

    const styles = getStyles(theme, isDarkMode);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Choose Your Avatar</Text>
                <Text style={styles.subtitle}>Pick an avatar that represents you</Text>
            </View>

            <ScrollView contentContainerStyle={styles.avatarGrid}>
                {AVATAR_OPTIONS.map((avatar, index) => {
                    const avatarUrl = getAvatarUrl(avatar.style, avatar.seed);
                    const isSelected = selectedAvatar === avatarUrl;

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.avatarItem,
                                isSelected && styles.avatarItemSelected
                            ]}
                            onPress={() => setSelectedAvatar(avatarUrl)}
                        >
                            <Image
                                source={{ uri: avatarUrl }}
                                style={styles.avatarImage}
                            />
                            <Text style={styles.avatarName}>{avatar.name}</Text>
                            {isSelected && (
                                <View style={styles.checkmark}>
                                    <Ionicons name="checkmark-circle" size={28} color={theme.colors.primary} />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueButton, !selectedAvatar && styles.disabledButton]}
                    onPress={handleContinue}
                    disabled={!selectedAvatar || isLoading}
                >
                    <Text style={styles.continueButtonText}>
                        {isLoading ? 'Saving...' : 'Continue'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipButtonText}>Skip for now</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingBottom: 20,
        justifyContent: 'center',
    },
    avatarItem: {
        width: '45%',
        alignItems: 'center',
        marginBottom: 24,
        padding: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        margin: '2.5%',
    },
    avatarItemSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
    },
    avatarName: {
        fontSize: 14,
        color: theme.colors.text,
        textAlign: 'center',
        fontWeight: '500',
    },
    checkmark: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 12,
    },
    continueButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    disabledButton: {
        opacity: 0.5,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    skipButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    skipButtonText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
    },
});
