import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import useThemeStore from '../store/themeStore';

const { width: screenWidth } = Dimensions.get('window');

const FinanceChart = ({ monthlyStats }) => {
    const { theme, isDarkMode } = useThemeStore();

    const chartData = {
        labels: ['Income', 'Expense'],
        datasets: [
            {
                data: [
                    monthlyStats?.totalIncome || 0,
                    monthlyStats?.totalExpense || 0,
                ],
            },
        ],
    };

    const chartConfig = {
        backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
        backgroundGradientFrom: isDarkMode ? '#1F2937' : '#ffffff',
        backgroundGradientTo: isDarkMode ? '#1F2937' : '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => isDarkMode ? `rgba(59, 130, 246, ${opacity})` : `rgba(37, 99, 235, ${opacity})`,
        labelColor: (opacity = 1) => isDarkMode ? `rgba(156, 163, 175, ${opacity})` : `rgba(75, 85, 99, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: isDarkMode ? '#374151' : '#e5e7eb',
            strokeWidth: 1,
        },
        barPercentage: 0.6,
    };

    const themeStyles = {
        container: {
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

    return (
        <View style={[styles.container, themeStyles.container]}>
            <Text style={[styles.title, themeStyles.text]}>Monthly Overview</Text>
            <View style={styles.chartWrapper}>
                <BarChart
                    data={chartData}
                    width={screenWidth - 64}
                    height={220}
                    chartConfig={chartConfig}
                    style={styles.chart}
                    showValuesOnTopOfBars={true}
                    fromZero={true}
                    yAxisLabel="$"
                    yAxisSuffix=""
                />
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                    <Text style={[styles.legendText, themeStyles.subText]}>
                        Income: ${(monthlyStats?.totalIncome || 0).toFixed(2)}
                    </Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={[styles.legendText, themeStyles.subText]}>
                        Expense: ${(monthlyStats?.totalExpense || 0).toFixed(2)}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        padding: 16,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    chartWrapper: {
        alignItems: 'center',
        marginBottom: 12,
    },
    chart: {
        borderRadius: 16,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default FinanceChart;
