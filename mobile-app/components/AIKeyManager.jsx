import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../store/themeStore';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const AIKeyManager = ({ visible, onClose }) => {
    const { theme, isDarkMode } = useThemeStore();
    const { user } = useAuthStore();
    const [keys, setKeys] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newKey, setNewKey] = useState({ label: '', key: '', isGlobal: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchKeys();
        }
    }, [visible]);

    const fetchKeys = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/ai-keys');
            setKeys(res.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load keys');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddKey = async () => {
        if (!newKey.label || !newKey.key) {
            Alert.alert('Error', 'Label and API Key are required');
            return;
        }
        setIsSubmitting(true);
        try {
            await api.post('/ai-keys', newKey);
            Alert.alert('Success', 'Key added successfully');
            setNewKey({ label: '', key: '' });
            setIsAdding(false);
            fetchKeys();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add key');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteKey = (id) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to remove this key?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/ai-keys/${id}`);
                            fetchKeys();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete key');
                        }
                    }
                }
            ]
        );
    };

    const handleResetKey = async (id) => {
        try {
            await api.put(`/ai-keys/${id}/reset`);
            Alert.alert('Success', 'Key status reset to Active');
            fetchKeys();
        } catch (error) {
            Alert.alert('Error', 'Failed to reset key');
        }
    };

    const renderKeyItem = ({ item }) => (
        <View style={[styles.keyItem, { backgroundColor: isDarkMode ? '#2C2C2E' : '#f9f9f9', borderColor: isDarkMode ? '#333' : '#e0e0e0' }]}>
            <View style={styles.keyInfo}>
                <View style={styles.keyHeader}>
                    <Text style={[styles.keyLabel, { color: theme.colors.text }]}>{item.label}</Text>

                    {/* Status Badge */}
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.status === 'active' ? '#4CAF5020' : '#FF572220', marginRight: 6 }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: item.status === 'active' ? '#4CAF50' : '#FF5722' }
                        ]}>{item.status.toUpperCase()}</Text>
                    </View>

                    {/* Global/Personal Badge */}
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.isGlobal ? '#5856D620' : '#FF950020' }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: item.isGlobal ? '#5856D6' : '#FF9500' }
                        ]}>{item.isGlobal ? 'GLOBAL' : 'PERSONAL'}</Text>
                    </View>
                </View>
                <Text style={[styles.keyStats, { color: theme.colors.subText }]}>
                    Usage: {item.usageCount} • Errors: {item.errorCount}
                </Text>
            </View>

            <View style={styles.keyActions}>
                {item.status !== 'active' && (
                    <TouchableOpacity onPress={() => handleResetKey(item._id)} style={styles.actionButton}>
                        <Ionicons name="refresh" size={20} color="#4A90E2" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDeleteKey(item._id)} style={styles.actionButton}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={[styles.modalOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.colors.text }]}>AI Configuration</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={theme.colors.subText} />
                        </TouchableOpacity>
                    </View>

                    {isAdding ? (
                        <View style={styles.formContainer}>
                            <Text style={[styles.subtitle, { color: theme.colors.text }]}>Add New Key</Text>
                            <TextInput
                                style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: isDarkMode ? '#1C1C1E' : '#F2F2F7' }]}
                                placeholder="Label (e.g. Pro Key 1)"
                                placeholderTextColor={theme.colors.subText}
                                value={newKey.label}
                                onChangeText={(text) => setNewKey({ ...newKey, label: text })}
                            />
                            <TextInput
                                style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: isDarkMode ? '#1C1C1E' : '#F2F2F7' }]}
                                placeholder="API Key"
                                placeholderTextColor={theme.colors.subText}
                                value={newKey.key}
                                onChangeText={(text) => setNewKey({ ...newKey, key: text })}
                                secureTextEntry
                            />

                            {/* Global Toggle (Visible to all for now, validated on backend) */}
                            <View style={styles.switchContainer}>
                                <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Make Global Key</Text>
                                <View style={styles.switchWrapper}>
                                    <TouchableOpacity
                                        style={[styles.switch, newKey.isGlobal ? styles.switchActive : styles.switchInactive]}
                                        onPress={() => setNewKey({ ...newKey, isGlobal: !newKey.isGlobal })}
                                    >
                                        <View style={[styles.switchThumb, newKey.isGlobal ? styles.switchThumbActive : styles.switchThumbInactive]} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={[styles.hint, { color: theme.colors.subText }]}>Key will be validated immediately.</Text>

                            <View style={styles.formActions}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
                                    onPress={() => setIsAdding(false)}
                                >
                                    <Text style={{ color: theme.colors.text }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.submitButton, { backgroundColor: theme.colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
                                    onPress={handleAddKey}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Verify & Save</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <>
                            {isLoading ? (
                                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
                            ) : keys.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="key-outline" size={48} color={theme.colors.border} />
                                    <Text style={[styles.emptyText, { color: theme.colors.subText }]}>No active keys found</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={keys}
                                    renderItem={renderKeyItem}
                                    keyExtractor={item => item._id}
                                    contentContainerStyle={styles.listContent}
                                />
                            )}

                            <TouchableOpacity
                                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                                onPress={() => setIsAdding(true)}
                            >
                                <Ionicons name="add" size={24} color="#fff" />
                                <Text style={styles.fabText}>Add Key</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '85%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    listContent: {
        paddingBottom: 80,
    },
    keyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    keyInfo: {
        flex: 1,
    },
    keyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    keyLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    keyStats: {
        fontSize: 12,
    },
    keyActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        padding: 8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 12,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    fabText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    formContainer: {
        flex: 1,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
    },
    input: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        fontSize: 16,
    },
    hint: {
        fontSize: 12,
        marginBottom: 24,
    },
    formActions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    submitButton: {
        // backgroundColor set inline
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    switchWrapper: {
        // Wrapper if needed
    },
    switch: {
        width: 50,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        padding: 2,
    },
    switchActive: {
        backgroundColor: '#34C759',
    },
    switchInactive: {
        backgroundColor: '#E5E5EA',
    },
    switchThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    switchThumbActive: {
        alignSelf: 'flex-end',
    },
    switchThumbInactive: {
        alignSelf: 'flex-start',
    }
});

export default AIKeyManager;
