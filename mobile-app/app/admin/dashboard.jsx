import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAdminStore from '../../store/adminStore';
import useThemeStore from '../../store/themeStore';

export default function AdminDashboard() {
    const router = useRouter();
    const { users, fetchUsers, deleteUser, isLoading } = useAdminStore();
    const { isDarkMode } = useThemeStore();

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = (id, name) => {
        Alert.alert(
            "Delete User",
            `Are you sure you want to delete ${name}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteUser(id) }
            ]
        );
    };

    const themeStyles = {
        container: {
            backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
        },
        header: {
            backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
            borderBottomColor: isDarkMode ? '#333' : '#eee',
        },
        text: {
            color: isDarkMode ? '#fff' : '#333',
        },
        subText: {
            color: isDarkMode ? '#aaa' : '#666',
        },
        card: {
            backgroundColor: isDarkMode ? '#1E1E1E' : '#fff',
        }
    };

    const renderUserItem = ({ item }) => (
        <View style={[styles.userCard, themeStyles.card]}>
            <View style={styles.userInfo}>
                <Text style={[styles.userName, themeStyles.text]}>{item.name}</Text>
                <Text style={[styles.userEmail, themeStyles.subText]}>{item.email}</Text>
                <View style={styles.badges}>
                    {item.isAdmin && <View style={styles.adminBadge}><Text style={styles.badgeText}>Admin</Text></View>}
                    {item.isVerified && <View style={styles.verifiedBadge}><Text style={styles.badgeText}>Verified</Text></View>}
                </View>
            </View>
            {!item.isAdmin && (
                <TouchableOpacity onPress={() => handleDelete(item._id, item.name)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={[styles.container, themeStyles.container]}>
            <View style={[styles.header, themeStyles.header]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#333'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, themeStyles.text]}>Admin Dashboard</Text>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={[styles.emptyText, themeStyles.subText]}>No users found</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        paddingTop: 50,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 15,
    },
    userCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    userEmail: {
        fontSize: 14,
        marginTop: 2,
    },
    badges: {
        flexDirection: 'row',
        marginTop: 5,
    },
    adminBadge: {
        backgroundColor: '#FF9500',
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginRight: 5,
        borderRadius: 4,
    },
    verifiedBadge: {
        backgroundColor: '#34C759',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    deleteButton: {
        padding: 10,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
    },
});
