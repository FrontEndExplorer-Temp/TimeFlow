import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useThemeStore from '../store/themeStore';

const TaskStats = ({ tasks }) => {
    const { theme, isDarkMode } = useThemeStore();

    const stats = {
        total: tasks.length,
        backlog: tasks.filter(t => t.status === 'Backlog').length,
        today: tasks.filter(t => t.status === 'Today').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        completed: tasks.filter(t => t.status === 'Completed').length,
    };

    const completionRate = stats.total > 0
        ? Math.round((stats.completed / stats.total) * 100)
        : 0;

    const themeStyles = {
        card: {
            backgroundColor: theme.colors.card,
            shadowColor: isDarkMode ? '#000' : '#888',
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: theme.colors.border,
        },
        text: {
            color: theme.colors.text,
        },
        subText: {
            color: theme.colors.subText,
        },
    };

    const statCards = [
        { label: 'Total', value: stats.total, color: '#6366F1', icon: '📋' },
        { label: 'Today', value: stats.today, color: '#8B5CF6', icon: '⭐' },
        { label: 'In Progress', value: stats.inProgress, color: '#F59E0B', icon: '⚡' },
        { label: 'Completed', value: stats.completed, color: '#10B981', icon: '✅' },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {statCards.map((stat, index) => (
                    <View
                        key={index}
                        style={[styles.statCard, themeStyles.card]}
                    >
                        <View style={styles.statHeader}>
                            <Text style={styles.icon}>{stat.icon}</Text>
                            <View style={[styles.badge, { backgroundColor: stat.color + '20' }]}>
                                <Text style={[styles.badgeText, { color: stat.color }]}>
                                    {stat.value}
                                </Text>
                            </View>
                        </View>
                        <Text style={[styles.statLabel, themeStyles.subText]}>
                            {stat.label}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Completion Progress */}
            <View style={[styles.progressCard, themeStyles.card]}>
                <View style={styles.progressHeader}>
                    <Text style={[styles.progressTitle, themeStyles.text]}>
                        Completion Rate
                    </Text>
                    <Text style={[styles.progressPercent, { color: theme.colors.success }]}>
                        {completionRate}%
                    </Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${completionRate}%`, backgroundColor: theme.colors.success }
                        ]}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    statCard: {
        flex: 1,
        minWidth: '47%',
        padding: 10,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        elevation: 2,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    icon: {
        fontSize: 18,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    progressCard: {
        padding: 12,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        elevation: 2,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressTitle: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressPercent: {
        fontSize: 16,
        fontWeight: '700',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
});

export default TaskStats;
