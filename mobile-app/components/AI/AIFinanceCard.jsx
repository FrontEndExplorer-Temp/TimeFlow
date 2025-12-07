import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../../store/themeStore';
import useFinanceStore from '../../store/financeStore';

const AIFinanceCard = () => {
    const { isDarkMode } = useThemeStore();
    const { fetchInsights } = useFinanceStore();
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState(null);

    const handleGetInsights = async () => {
        setLoading(true);
        const result = await fetchInsights();
        setInsights(result);
        setLoading(false);
    };

    const theme = {
        bg: isDarkMode ? '#2d2d2d' : '#f0f8ff',
        text: isDarkMode ? '#ffffff' : '#000000',
        secondaryText: isDarkMode ? '#a0a0a0' : '#666666',
        primary: '#4A90E2',
        border: isDarkMode ? '#404040' : '#d0e0ff',
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg, borderColor: theme.border }]}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Ionicons name="sparkles" size={20} color={theme.primary} />
                    <Text style={[styles.title, { color: theme.text }]}>AI Financial Insights</Text>
                </View>
                {!insights && (
                    <TouchableOpacity onPress={handleGetInsights} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator size="small" color={theme.primary} />
                        ) : (
                            <Text style={[styles.link, { color: theme.primary }]}>Analyze</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {insights ? (
                <View style={styles.content}>
                    <Text style={[styles.text, { color: theme.text }]}>{insights}</Text>
                    <TouchableOpacity style={styles.refresh} onPress={handleGetInsights}>
                        <Ionicons name="refresh" size={16} color={theme.secondaryText} />
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={[styles.placeholder, { color: theme.secondaryText }]}>
                    Get personalized spending trends and saving tips based on your recent transactions.
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
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
    placeholder: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    refresh: {
        alignSelf: 'flex-end',
        marginTop: 10,
    },
});

export default AIFinanceCard;
