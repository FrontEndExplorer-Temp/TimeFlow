import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Animated } from 'react-native';
import useThemeStore from '../../store/themeStore';
import useNoteStore from '../../store/noteStore';
import AINoteSummary from '../../components/AI/AINoteSummary';

const COLORS = ['#ffffff', '#ffebee', '#e8f5e9', '#e3f2fd', '#fff3e0', '#f3e5f5'];
const DARK_COLORS = ['#2C2C2E', '#451e1e', '#1e3b24', '#1e2f45', '#452f1e', '#361e45'];

const NoteSkeleton = () => {
    const { isDarkMode } = useThemeStore();
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View style={{ opacity, backgroundColor: isDarkMode ? '#1E1E1E' : '#f0f0f0', borderRadius: 12, padding: 16, marginBottom: 12, minHeight: 120 }}>
            <View style={{ backgroundColor: '#ccc', width: '60%', height: 18, borderRadius: 4, marginBottom: 12 }} />
            <View style={{ backgroundColor: '#ccc', width: '100%', height: 14, borderRadius: 4, marginBottom: 8 }} />
            <View style={{ backgroundColor: '#ccc', width: '80%', height: 14, borderRadius: 4 }} />
        </Animated.View>
    );
};

export default function NotesScreen() {
    const { notes, fetchNotes, addNote, updateNote, deleteNote, isLoading } = useNoteStore();
    const { theme, isDarkMode } = useThemeStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        color: '#ffffff',
        tags: [],
        isPinned: false
    });
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleSaveNote = async () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            Alert.alert('Error', 'Please enter a title and content for the note');
            return;
        }

        // Ensure we store the "base" color (Light Mode version) if possible, 
        // or just store what is selected. 
        // For simplicity, we store the selected color. 
        // The adaptation logic will handle display.

        if (editingNote) {
            await updateNote(editingNote._id, formData);
            setEditingNote(null);
        } else {
            await addNote(formData);
        }

        resetForm();
        setModalVisible(false);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            color: isDarkMode ? DARK_COLORS[0] : COLORS[0],
            tags: [],
            isPinned: false
        });
        setTagInput('');
    };

    const handleEditNote = (note) => {
        setEditingNote(note);
        setFormData({
            title: note.title,
            content: note.content,
            color: note.color,
            tags: note.tags || [],
            isPinned: note.isPinned || false
        });
        setModalVisible(true);
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
    };

    const handlePinToggle = (note) => {
        updateNote(note._id, { isPinned: !note.isPinned });
    };

    // Helper to adapt colors for Light/Dark mode
    const getNoteTheme = (color) => {
        let backgroundColor = color;
        let textColor = '#333333';
        let subTextColor = '#666666';

        if (isDarkMode) {
            // Try to find if it's a known light color and map to dark
            const lightIndex = COLORS.indexOf(color);
            if (lightIndex !== -1) {
                backgroundColor = DARK_COLORS[lightIndex];
            }
            // If it's already a dark color (from creation in dark mode), it stays.
            // If it's unknown, we leave it (or could force a default).

            textColor = '#FFFFFF';
            subTextColor = '#AAAAAA';
        } else {
            // Light Mode
            // Try to find if it's a known dark color and map to light
            const darkIndex = DARK_COLORS.indexOf(color);
            if (darkIndex !== -1) {
                backgroundColor = COLORS[darkIndex];
            }
            textColor = '#333333';
            subTextColor = '#666666';
        }

        return { backgroundColor, textColor, subTextColor };
    };

    const themeStyles = {
        container: {
            backgroundColor: theme.colors.background,
        },
        text: {
            color: theme.colors.text,
        },
        subText: {
            color: theme.colors.subText,
        },
        modalContent: {
            backgroundColor: theme.colors.card,
        },
        input: {
            borderColor: theme.colors.border,
            color: theme.colors.text,
            backgroundColor: theme.colors.input,
        },
        chip: {
            backgroundColor: theme.colors.chip,
        }
    };

    const renderNoteItem = ({ item }) => {
        const { backgroundColor, textColor, subTextColor } = getNoteTheme(item.color);

        return (
            <TouchableOpacity
                style={[styles.noteCard, { backgroundColor }]}
                onPress={() => handleEditNote(item)}
            >
                <View style={styles.noteHeader}>
                    <Text style={[styles.noteTitle, { color: textColor }]} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.noteActions}>
                        <TouchableOpacity onPress={() => handlePinToggle(item)}>
                            <Text style={[styles.pinIcon, { color: textColor }]}>{item.isPinned ? '📌' : '📍'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteNote(item._id)}>
                            <Text style={[styles.deleteText, { color: textColor, opacity: 0.6 }]}>×</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={[styles.noteContent, { color: subTextColor }]} numberOfLines={4}>{item.content}</Text>
                {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {item.tags.slice(0, 3).map((tag, index) => (
                            <View key={index} style={[styles.tagChip, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                <Text style={[styles.tagText, { color: textColor, opacity: 0.8 }]}>#{tag}</Text>
                            </View>
                        ))}
                        {item.tags.length > 3 && (
                            <Text style={[styles.moreTagsText, { color: subTextColor }]}>+{item.tags.length - 3}</Text>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const currentColors = isDarkMode ? DARK_COLORS : COLORS;

    return (
        <View style={[styles.container, themeStyles.container]}>
            {isLoading && notes.length === 0 ? (
                <View style={styles.listContent}>
                    <View style={styles.row}>
                        <NoteSkeleton />
                        <NoteSkeleton />
                    </View>
                    <View style={styles.row}>
                        <NoteSkeleton />
                        <NoteSkeleton />
                    </View>
                </View>
            ) : (
                <FlatList
                    data={notes}
                    renderItem={renderNoteItem}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.row}
                    ListEmptyComponent={<Text style={[styles.emptyText, themeStyles.subText]}>No notes yet</Text>}
                    extraData={isDarkMode}
                />
            )}


            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                    resetForm();
                    setModalVisible(true);
                }}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalScrollContent}>
                        <View style={[styles.modalContent, themeStyles.modalContent]}>
                            <Text style={[styles.modalTitle, themeStyles.text]}>{editingNote ? 'Edit Note' : 'New Note'}</Text>

                            <TextInput
                                style={[styles.input, themeStyles.input]}
                                placeholder="Title"
                                placeholderTextColor={theme.colors.subText}
                                value={formData.title}
                                onChangeText={(text) => setFormData({ ...formData, title: text })}
                            />

                            <TextInput
                                style={[styles.input, styles.contentInput, themeStyles.input]}
                                placeholder="Content"
                                placeholderTextColor={theme.colors.subText}
                                value={formData.content}
                                onChangeText={(text) => setFormData({ ...formData, content: text })}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                            />

                            <AINoteSummary noteContent={formData.content} />

                            {/* Tags Input */}
                            <Text style={[styles.label, themeStyles.text]}>Tags:</Text>
                            <View style={styles.tagInputContainer}>
                                <TextInput
                                    style={[styles.input, styles.tagInput, themeStyles.input]}
                                    placeholder="Add tag..."
                                    placeholderTextColor={theme.colors.subText}
                                    value={tagInput}
                                    onChangeText={setTagInput}
                                    onSubmitEditing={handleAddTag}
                                />
                                <TouchableOpacity style={[styles.addTagButton, { backgroundColor: theme.colors.primary }]} onPress={handleAddTag}>
                                    <Text style={styles.addTagText}>+</Text>
                                </TouchableOpacity>
                            </View>
                            {formData.tags.length > 0 && (
                                <View style={styles.tagsEditContainer}>
                                    {formData.tags.map((tag, index) => (
                                        <View key={index} style={[styles.tagChipEdit, { backgroundColor: theme.colors.primary }]}>
                                            <Text style={styles.tagTextEdit}>#{tag}</Text>
                                            <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                                                <Text style={styles.removeTagText}>×</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <Text style={[styles.label, themeStyles.text]}>Color:</Text>
                            <View style={styles.colorPicker}>
                                {currentColors.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorOption,
                                            { backgroundColor: color },
                                            formData.color === color && { borderColor: theme.colors.primary, borderWidth: 3 }
                                        ]}
                                        onPress={() => setFormData({ ...formData, color })}
                                    />
                                ))}
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.cancelButton, { backgroundColor: theme.colors.danger }]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setEditingNote(null);
                                    }}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.colors.primary }]} onPress={handleSaveNote}>
                                    <Text style={styles.buttonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
    },
    listContent: {
        padding: 12,
    },
    row: {
        justifyContent: 'space-between',
    },
    noteCard: {
        flex: 1,
        margin: 6,
        padding: 16,
        borderRadius: 16,
        minHeight: 140,
        maxWidth: '47%', // Ensure 2 columns fit with margins
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    noteActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pinIcon: {
        fontSize: 14,
        marginRight: 8,
    },
    deleteText: {
        fontWeight: 'bold',
        fontSize: 18,
        lineHeight: 18,
    },
    noteContent: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    fabText: {
        color: '#fff',
        fontSize: 32,
        marginTop: -4,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modalScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    modalContent: {
        padding: 24,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    contentInput: {
        minHeight: 120,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 10,
    },
    colorPicker: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    colorOption: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        marginRight: 12,
        marginBottom: 12,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    saveButton: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 'auto',
    },
    tagChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 4,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
    },
    moreTagsText: {
        fontSize: 11,
        marginLeft: 4,
        alignSelf: 'center',
    },
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    tagInput: {
        flex: 1,
        marginBottom: 0,
        marginRight: 10,
    },
    addTagButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addTagText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    tagsEditContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    tagChipEdit: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    tagTextEdit: {
        fontSize: 13,
        color: '#fff',
        marginRight: 6,
        fontWeight: '600',
    },
    removeTagText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
