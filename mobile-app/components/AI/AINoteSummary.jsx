import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../../store/themeStore';
import useNoteStore from '../../store/noteStore';

const AINoteSummary = ({ noteContent }) => {
    const { isDarkMode } = useThemeStore();
    const { summarizeNote } = useNoteStore();
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);

    const handleSummarize = async () => {
        if (!noteContent) return;
        setLoading(true);
        const result = await summarizeNote(noteContent);
        setSummary(result);
        setLoading(false);
    };

    const theme = {
        bg: isDarkMode ? '#2d2d2d' : '#fff9e6',
        text: isDarkMode ? '#ffffff' : '#000000',
        secondaryText: isDarkMode ? '#a0a0a0' : '#666666',
        primary: '#FFB700',
        border: isDarkMode ? '#404040' : '#ffe082',
    };

    if (!noteContent || noteContent.length < 50) return null;

    return (
        <View style={[styles.container, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <View style={[styles.header, { marginBottom: summary ? 10 : 0 }]}>
                <View style={styles.titleRow}>
                    <Ionicons name="bulb" size={20} color={theme.primary} />
                    <Text style={[styles.title, { color: theme.text }]}>AI Summary</Text>
                </View>
                {!summary && (
                    <TouchableOpacity onPress={handleSummarize} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator size="small" color={theme.primary} />
                        ) : (
                            <Text style={[styles.link, { color: theme.primary }]}>Summarize</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {summary && (
                <View style={styles.content}>
                    <Text style={[styles.text, { color: theme.text }]}>{summary}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 0,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    link: {
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        marginTop: 5,
    },
    text: {
        fontSize: 14,
        lineHeight: 20,
    },
});

export default AINoteSummary;
