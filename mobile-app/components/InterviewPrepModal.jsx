import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import useThemeStore from '../store/themeStore';

const InterviewPrepModal = ({ visible, onClose, prepData, loading }) => {
    const { theme, isDarkMode } = useThemeStore();

    const themeStyles = {
        modal: {
            backgroundColor: theme.colors.background,
        },
        container: {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
        },
        text: {
            color: theme.colors.text,
        },
        subText: {
            color: theme.colors.subText,
        },
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, themeStyles.container]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, themeStyles.text]}>Interview Prep</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={[styles.closeText, themeStyles.text]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={[styles.loadingText, themeStyles.subText]}>
                                Generating interview questions...
                            </Text>
                        </View>
                    ) : prepData ? (
                        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                            {/* Technical Questions */}
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: '#8B5CF6' }]}>
                                    💻 Technical Questions
                                </Text>
                                {prepData.technical?.map((question, index) => (
                                    <View key={index} style={styles.questionItem}>
                                        <Text style={[styles.questionNumber, themeStyles.subText]}>
                                            {index + 1}.
                                        </Text>
                                        <Text style={[styles.questionText, themeStyles.text]}>
                                            {question}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Behavioral Questions */}
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: '#3B82F6' }]}>
                                    🤝 Behavioral Questions
                                </Text>
                                {prepData.behavioral?.map((question, index) => (
                                    <View key={index} style={styles.questionItem}>
                                        <Text style={[styles.questionNumber, themeStyles.subText]}>
                                            {index + 1}.
                                        </Text>
                                        <Text style={[styles.questionText, themeStyles.text]}>
                                            {question}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Questions to Ask */}
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: '#10B981' }]}>
                                    ❓ Questions to Ask
                                </Text>
                                {prepData.questionsToAsk?.map((question, index) => (
                                    <View key={index} style={styles.questionItem}>
                                        <Text style={[styles.questionNumber, themeStyles.subText]}>
                                            {index + 1}.
                                        </Text>
                                        <Text style={[styles.questionText, themeStyles.text]}>
                                            {question}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    ) : (
                        <View style={styles.errorContainer}>
                            <Text style={[styles.errorText, themeStyles.subText]}>
                                No prep data available
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.closeButtonBottom, { backgroundColor: theme.colors.primary }]}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContainer: {
        borderRadius: 20,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        borderWidth: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    closeText: {
        fontSize: 24,
        fontWeight: '300',
    },
    contentScroll: {
        padding: 20,
        maxHeight: 500,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    questionItem: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingLeft: 4,
    },
    questionNumber: {
        fontSize: 14,
        marginRight: 8,
        fontWeight: '600',
    },
    questionText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
    },
    errorContainer: {
        padding: 40,
        alignItems: 'center',
    },
    errorText: {
        fontSize: 14,
    },
    closeButtonBottom: {
        margin: 20,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default InterviewPrepModal;
