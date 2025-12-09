import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useThemeStore from '../store/themeStore';

const JobStats = ({ jobs }) => {
    const { theme, isDarkMode } = useThemeStore();

    const stats = {
        total: jobs.length,
        wishlist: jobs.filter(j => j.status === 'Wishlist').length,
        applied: jobs.filter(j => j.status === 'Applied').length,
        interview: jobs.filter(j => j.status === 'Interview').length,
        offer: jobs.filter(j => j.status === 'Offer').length,
        rejected: jobs.filter(j => j.status === 'Rejected').length,
    };

    const responseRate = stats.applied > 0
        ? Math.round(((stats.interview + stats.offer) / stats.applied) * 100)
        : 0;

    const successRate = stats.total > 0
        ? Math.round((stats.offer / stats.total) * 100)
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
        { label: 'Total Apps', value: stats.total, color: '#6366F1', icon: '📝' },
        { label: 'Applied', value: stats.applied, color: '#3B82F6', icon: '📤' },
        { label: 'Interviews', value: stats.interview, color: '#F59E0B', icon: '💼' },
        { label: 'Offers', value: stats.offer, color: '#10B981', icon: '🎉' },
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

            {/* Rate Cards */}
            <View style={styles.rateGrid}>
                <View style={[styles.rateCard, themeStyles.card]}>
                    <Text style={[styles.rateValue, { color: '#3B82F6' }]}>
                        {responseRate}%
                    </Text>
                    <Text style={[styles.rateLabel, themeStyles.subText]}>
                        Response Rate
                    </Text>
                </View>
                <View style={[styles.rateCard, themeStyles.card]}>
                    <Text style={[styles.rateValue, { color: '#10B981' }]}>
                        {successRate}%
                    </Text>
                    <Text style={[styles.rateLabel, themeStyles.subText]}>
                        Success Rate
                    </Text>
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
    rateGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    rateCard: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        elevation: 2,
    },
    rateValue: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    rateLabel: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
});

export default JobStats;
