import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../../store/themeStore';
import useTaskStore from '../../store/taskStore';

const AIBreakdownModal = ({ visible, onClose, taskTitle, taskDescription, onAddSubtasks }) => {
    const { isDarkMode } = useThemeStore();
    const { generateSubtasks } = useTaskStore();
    const [loading, setLoading] = useState(false);
    const [subtasks, setSubtasks] = useState([]);
    const [generated, setGenerated] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        const result = await generateSubtasks(taskTitle, taskDescription);
        setSubtasks(result);
        setGenerated(true);
        setLoading(false);
    };

    const handleAdd = () => {
        onAddSubtasks(subtasks);
        onClose();
        // Reset state
        setSubtasks([]);
        setGenerated(false);
    };

    const theme = {
        bg: isDarkMode ? '#1a1a1a' : '#ffffff',
        text: isDarkMode ? '#ffffff' : '#000000',
        secondaryText: isDarkMode ? '#a0a0a0' : '#666666',
        card: isDarkMode ? '#2d2d2d' : '#f5f5f5',
        primary: '#4A90E2',
        border: isDarkMode ? '#404040' : '#e0e0e0',
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.container, { backgroundColor: theme.bg }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>AI Task Breakdown ✨</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        {!generated ? (
                            <View style={styles.startView}>
                                <Text style={[styles.description, { color: theme.secondaryText }]}>
                                    Let AI break down "{taskTitle}" into actionable subtasks for you.
                                </Text>
                                <TouchableOpacity
                                    style={[styles.generateButton, { backgroundColor: theme.primary }]}
                                    onPress={handleGenerate}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="flash" size={20} color="#fff" style={{ marginRight: 8 }} />
                                            <Text style={styles.buttonText}>Generate Subtasks</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.subtitle, { color: theme.text }]}>Suggested Subtasks:</Text>
                                <ScrollView style={styles.list}>
                                    {subtasks.map((task, index) => (
                                        <View key={index} style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                            <Text style={[styles.itemText, { color: theme.text }]}>{index + 1}. {task}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={[styles.secondaryButton, { borderColor: theme.border }]}
                                        onPress={() => setGenerated(false)}
                                    >
                                        <Text style={[styles.secondaryButtonText, { color: theme.text }]}>Try Again</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                                        onPress={handleAdd}
                                    >
                                        <Text style={styles.buttonText}>Add All</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '60%',
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
    content: {
        flex: 1,
    },
    startView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    generateButton: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    list: {
        flex: 1,
        marginBottom: 20,
    },
    item: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
    },
    itemText: {
        fontSize: 14,
    },
    actions: {
        flexDirection: 'row',
    },
    primaryButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginRight: 10,
    },
    secondaryButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
    },
    secondaryButtonText: {
        fontWeight: '600',
        fontSize: 16,
    },
});

export default AIBreakdownModal;
