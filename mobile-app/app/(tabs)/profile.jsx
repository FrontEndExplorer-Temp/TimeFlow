import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import api from '../../services/api';
import Badges from '../../components/Badges';
import AIKeyManager from '../../components/AIKeyManager';

const ProfileSkeleton = () => {
    const { isDarkMode } = useThemeStore();
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ])
        ).start();
    }, []);

    const opacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View style={{ opacity, backgroundColor: isDarkMode ? '#1E1E1E' : '#f0f0f0', borderRadius: 16, padding: 24, marginHorizontal: 16, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <View style={{ backgroundColor: '#ccc', width: 44, height: 44, borderRadius: 22, marginBottom: 8 }} />
                    <View style={{ backgroundColor: '#ccc', width: 40, height: 20, borderRadius: 4, marginBottom: 4 }} />
                    <View style={{ backgroundColor: '#ccc', width: 50, height: 14, borderRadius: 4 }} />
                </View>
                <View style={{ width: 1, backgroundColor: '#ccc', marginHorizontal: 8 }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <View style={{ backgroundColor: '#ccc', width: 44, height: 44, borderRadius: 22, marginBottom: 8 }} />
                    <View style={{ backgroundColor: '#ccc', width: 40, height: 20, borderRadius: 4, marginBottom: 4 }} />
                    <View style={{ backgroundColor: '#ccc', width: 50, height: 14, borderRadius: 4 }} />
                </View>
                <View style={{ width: 1, backgroundColor: '#ccc', marginHorizontal: 8 }} />
                <View style={{ alignItems: 'center', flex: 1 }}>
                    <View style={{ backgroundColor: '#ccc', width: 44, height: 44, borderRadius: 22, marginBottom: 8 }} />
                    <View style={{ backgroundColor: '#ccc', width: 40, height: 20, borderRadius: 4, marginBottom: 4 }} />
                    <View style={{ backgroundColor: '#ccc', width: 50, height: 14, borderRadius: 4 }} />
                </View>
            </View>
        </Animated.View>
    );
};

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout, refreshUser } = useAuthStore();
    const { isDarkMode } = useThemeStore();

    const [stats, setStats] = useState({
        totalHours: 0,
        completedTasks: 0,
        streak: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isKeyManagerVisible, setKeyManagerVisible] = useState(false);

    useEffect(() => {
        fetchStats();
        refreshUser(); // Sync user data (badges, xp)
    }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/users/stats');
            setStats(response.data);
        } catch (error) {
            // Silent fail
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        const confirmed = typeof window !== 'undefined' && window.confirm
            ? window.confirm('Are you sure you want to logout?')
            : await new Promise((resolve) => {
                Alert.alert(
                    "Logout",
                    "Are you sure you want to logout?",
                    [
                        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                        {
                            text: "Logout",
                            style: "destructive",
                            onPress: () => resolve(true)
                        }
                    ]
                );
            });

        if (confirmed) {
            try {
                await logout();
            } catch (error) {
                // Silent fail
            }
        }
    };

    const MenuOption = ({ icon, title, subtitle, onPress, color }) => (
        <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: isDarkMode ? '#1E1E1E' : '#fff' }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: isDarkMode ? '#fff' : '#111' }]}>{title}</Text>
                {subtitle && <Text style={[styles.menuSubtitle, { color: isDarkMode ? '#9AA0A6' : '#666' }]}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#666' : '#ccc'} />
        </TouchableOpacity>
    );

    const themeStyles = {
        container: { backgroundColor: isDarkMode ? '#0B0B0B' : '#f7f8fb' },
        header: { backgroundColor: isDarkMode ? '#0B0B0B' : '#f7f8fb' },
        text: { color: isDarkMode ? '#fff' : '#111' },
        subText: { color: isDarkMode ? '#9AA0A6' : '#666' },
        card: { backgroundColor: isDarkMode ? '#121212' : '#fff' },
    };

    return (
        <View style={[styles.container, themeStyles.container]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={[styles.header, themeStyles.header]}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{
                                uri: user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/png?seed=${user?.name || 'User'}&size=200&backgroundColor=${user?.gender === 'female' ? 'ffd5dc' : 'b6e3f4'}`
                            }}
                            style={styles.avatarImage}
                        />
                    </View>
                    <Text style={[styles.userName, themeStyles.text]}>{user?.name || 'User Name'}</Text>
                    <Text style={[styles.userEmail, themeStyles.subText]}>{user?.email || 'user@example.com'}</Text>

                    <View style={styles.levelContainer}>
                        <Text style={[styles.levelText, { color: themeStyles.text.color }]}>Level {user?.level || 1}</Text>
                        <View style={styles.xpBarContainer}>
                            <View style={[styles.xpBarFill, { width: `${(user?.xp || 0) % 100}%` }]} />
                        </View>
                        <Text style={[styles.xpText, { color: themeStyles.subText.color }]}>{(user?.xp || 0) % 100} / 100 XP</Text>
                    </View>
                </View>

                {/* Stats Section */}
                {isLoading ? (
                    <ProfileSkeleton />
                ) : (
                    <View style={[styles.statsContainer, themeStyles.card]}>
                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#4A90E215' }]}>
                                <Ionicons name="time-outline" size={24} color="#4A90E2" />
                            </View>
                            <Text style={[styles.statNumber, themeStyles.text]}>{stats.totalHours}</Text>
                            <Text style={[styles.statLabel, themeStyles.subText]}>Hours</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: isDarkMode ? '#333' : '#eee' }]} />
                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#34C75915' }]}>
                                <Ionicons name="checkmark-circle-outline" size={24} color="#34C759" />
                            </View>
                            <Text style={[styles.statNumber, themeStyles.text]}>{stats.completedTasks}</Text>
                            <Text style={[styles.statLabel, themeStyles.subText]}>Tasks</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: isDarkMode ? '#333' : '#eee' }]} />
                        <View style={styles.statItem}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#FF950015' }]}>
                                <Ionicons name="flame-outline" size={24} color="#FF9500" />
                            </View>
                            <Text style={[styles.statNumber, themeStyles.text]}>{stats.streak}</Text>
                            <Text style={[styles.statLabel, themeStyles.subText]}>Streak</Text>
                        </View>
                    </View>
                )}

                <Badges userBadges={user?.badges} />

                {/* Dashboard Section */}
                <View style={styles.menuContainer}>
                    <Text style={[styles.sectionTitle, themeStyles.subText]}>Activity</Text>

                    <MenuOption
                        icon="stats-chart-outline"
                        title="Dashboard"
                        subtitle="View your activity history"
                        onPress={() => router.push('/profile/dashboard')}
                        color="#4A90E2"
                    />
                </View>

                {/* Menu Section */}
                <View style={styles.menuContainer}>
                    <Text style={[styles.sectionTitle, themeStyles.subText]}>Settings</Text>

                    <MenuOption
                        icon="person-outline"
                        title="Edit Profile"
                        subtitle="Update your personal information"
                        onPress={() => router.push('/profile/edit')}
                        color="#5856D6"
                    />

                    <MenuOption
                        icon="notifications-outline"
                        title="Notifications"
                        subtitle="Manage app notifications"
                        onPress={() => router.push('/notifications')}
                        color="#FF9500"
                    />

                    <MenuOption
                        icon={isDarkMode ? "sunny-outline" : "moon-outline"}
                        title={isDarkMode ? "Light Mode" : "Dark Mode"}
                        subtitle="Toggle app theme"
                        onPress={() => useThemeStore.getState().toggleTheme()}
                        color="#AF52DE"
                    />

                    <MenuOption
                        icon="key-outline"
                        title="AI Configuration"
                        subtitle="Manage API keys"
                        onPress={() => setKeyManagerVisible(true)}
                        color="#34C759"
                    />

                    {user?.isAdmin && (
                        <MenuOption
                            icon="shield-checkmark-outline"
                            title="Admin Dashboard"
                            subtitle="Manage users and content"
                            onPress={() => router.push('/admin/dashboard')}
                            color="#FF3B30"
                        />
                    )}

                    <Text style={[styles.sectionTitle, { marginTop: 20 }, themeStyles.subText]}>Account</Text>

                    <MenuOption
                        icon="log-out-outline"
                        title="Logout"
                        onPress={handleLogout}
                        color="#FF3B30"
                    />
                </View>

                <Text style={[styles.versionText, themeStyles.subText]}>Version 1.3.0</Text>
            </ScrollView>

            <AIKeyManager visible={isKeyManagerVisible} onClose={() => setKeyManagerVisible(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '700',
        color: '#fff',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    userName: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    userEmail: {
        fontSize: 15,
        fontSize: 15,
        fontWeight: '500',
    },
    levelContainer: {
        marginTop: 15,
        width: '100%',
        alignItems: 'center',
    },
    levelText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    xpBarContainer: {
        width: 150,
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 5,
    },
    xpBarFill: {
        height: '100%',
        backgroundColor: '#4A90E2',
    },
    xpText: {
        fontSize: 12,
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 20,
        paddingVertical: 24,
        paddingHorizontal: 12,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        marginHorizontal: 8,
    },
    menuContainer: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 13,
        fontWeight: '400',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        marginVertical: 30,
        fontWeight: '500',
    },
});
